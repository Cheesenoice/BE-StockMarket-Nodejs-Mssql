const { sql, connectDB } = require("../../config/db");
const fs = require("fs");
const path = require("path");

const listDatabases = async (user) => {
  const pool = await connectDB(user.username, user.password);
  const result = await pool
    .request()
    .query(`SELECT name FROM sys.databases WHERE database_id > 4`);
  return result.recordset.map((row) => row.name);
};

const createDevice = async (user, dbName) => {
  const pool = await connectDB(user.username, user.password);
  const deviceName = `DEVICE_${dbName}`;
  const filePath = `C:/backup/${dbName}.bak`;
  const sqlStr = `USE master; IF NOT EXISTS (SELECT * FROM sys.backup_devices WHERE name = '${deviceName}') BEGIN EXEC sp_addumpdevice 'disk', '${deviceName}', '${filePath}' END`;
  await pool.request().query(sqlStr);
  return { success: true, message: `Đã tạo device backup cho ${dbName}` };
};

const backupDatabase = async (user, dbName, overwrite, note, deleteOld) => {
  const pool = await connectDB(user.username, user.password);
  const deviceName = `DEVICE_${dbName}`;
  let sqlStr = "";
  if (deleteOld) {
    sqlStr = `BACKUP DATABASE [${dbName}] TO [${deviceName}] WITH INIT, NAME = N'${
      note || "Backup"
    }'`;
  } else {
    sqlStr = `BACKUP DATABASE [${dbName}] TO [${deviceName}] WITH NOINIT, NAME = N'${
      note || "Backup"
    }'`;
  }
  await pool.request().query(sqlStr);
  return { success: true, message: `Đã backup database ${dbName}` };
};

const backupLog = async (user, dbName) => {
  const pool = await connectDB(user.username, user.password);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const logPath = `C:/backup/${dbName}_Log_${timestamp}.trn`;
  const sqlStr = `BACKUP LOG [${dbName}] TO DISK = N'${logPath}' WITH INIT, NAME = N'Log Backup at ${new Date().toISOString()}'`;
  await pool.request().query(sqlStr);
  return { success: true, message: `Đã backup log cho ${dbName}` };
};

const listBackups = async (user, dbName) => {
  const pool = await connectDB(user.username, user.password);
  const sqlStr = `
    SELECT
       bs.position,
      bs.backup_start_date,
       bs.backup_finish_date,
       bs.name,
       bs.type,                   -- D = full, L = log, I = diff
       bs.backup_size,
       bmf.physical_device_name   AS physical_device_name
   FROM msdb.dbo.backupset bs
   JOIN msdb.dbo.backupmediafamily bmf
        ON bs.media_set_id = bmf.media_set_id
   WHERE bs.database_name = @dbName
   ORDER BY bs.backup_start_date DESC;
 `;
  const result = await pool
    .request()
    .input("dbName", sql.NVarChar, dbName)
    .query(sqlStr);

  return result.recordset; // → đã có thêm physical_device_name
};

const restoreDatabase = async (user, dbName, fileIndex) => {
  const pool = await connectDB(user.username, user.password);
  const deviceName = `DEVICE_${dbName}`;
  const sqlStr = `USE master; ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE [${dbName}] FROM [${deviceName}] WITH FILE = ${fileIndex}, REPLACE; ALTER DATABASE [${dbName}] SET MULTI_USER;`;
  await pool.request().batch(sqlStr);
  return {
    success: true,
    message: `Đã phục hồi database ${dbName} về bản backup thứ ${fileIndex}`,
  };
};

const buildLogChain = async (pool, dbName, fullFinish, stopAt) => {
  const sqlStr = `
    SELECT
        bmf.physical_device_name,
        bs.backup_start_date,
        bs.backup_finish_date
    FROM msdb.dbo.backupset bs
    JOIN msdb.dbo.backupmediafamily bmf
         ON bs.media_set_id = bmf.media_set_id
    WHERE bs.database_name = @db
      AND bs.type = 'L'
      AND bs.backup_start_date >= @fullFinish       -- sau bản full
      AND bs.backup_finish_date <= @stopAt          -- tới thời điểm dừng
    ORDER BY bs.backup_start_date;
  `;
  const res = await pool
    .request()
    .input("db", sql.NVarChar, dbName)
    .input("fullFinish", sql.DateTime, fullFinish)
    .input("stopAt", sql.DateTime, stopAt)
    .query(sqlStr);

  // file cuối phải có backup_finish_date >= stopAt
  const ok =
    res.recordset.length &&
    new Date(res.recordset.at(-1).backup_finish_date) >= stopAt;

  if (!ok)
    throw new Error(
      "Không tìm thấy log thỏa mãn stopAt. Bạn cần backup log mới hoặc chọn thời điểm khác."
    );

  return res.recordset.map((r) => r.physical_device_name);
};

const restoreDatabaseToTime = async (
  user,
  dbName,
  fileIndex,
  stopAt,
  logFiles
) => {
  const pool = await connectDB(user.username, user.password);
  const stop = new Date(stopAt);

  // 1. Lấy thông tin bản FULL theo fileIndex
  const full = await pool
    .request()
    .input("db", sql.NVarChar, dbName)
    .input("pos", sql.Int, fileIndex).query(`
      SELECT backup_finish_date
      FROM msdb.dbo.backupset
      WHERE database_name=@db AND type='D' AND position=@pos
    `);

  if (!full.recordset.length)
    throw new Error("Không tìm thấy FULL backup với fileIndex đã cho.");

  const fullFinish = full.recordset[0].backup_finish_date;
  if (stop <= fullFinish)
    throw new Error("stopAt phải lớn hơn thời gian FULL backup.");

  // 2. Nếu logFiles chưa gửi → tự build
  if (!logFiles || !logFiles.length) {
    logFiles = await buildLogChain(pool, dbName, fullFinish, stop);
  }

  // 3. Thực hiện restore (như cũ)
  const device = `DEVICE_${dbName}`;
  let sqlStr = `
    USE master;
    ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    RESTORE DATABASE [${dbName}]
      FROM [${device}] WITH FILE = ${fileIndex}, NORECOVERY, REPLACE;
  `;
  logFiles.forEach((f, i) => {
    const last = i === logFiles.length - 1;
    sqlStr += `
      RESTORE LOG [${dbName}]
      FROM DISK = N'${f}'
      WITH ${last ? `STOPAT = '${stopAt}', RECOVERY` : "NORECOVERY"};
    `;
  });
  sqlStr += `ALTER DATABASE [${dbName}] SET MULTI_USER;`;

  await pool.request().batch(sqlStr);
  return { success: true, message: `Phục hồi thành công đến ${stopAt}` };
};

const listLogFiles = async (user, dbName, fromTime, toTime) => {
  const toDate = (val) => (val ? new Date(val) : null);
  const pool = await connectDB(user.username, user.password);
  const sqlStr = `
    SELECT
        CONVERT(VARCHAR(19), bs.backup_start_date, 120)  AS backup_start_date,
        CONVERT(VARCHAR(19), bs.backup_finish_date, 120) AS backup_finish_date,
        bmf.physical_device_name,
        bs.position
    FROM msdb.dbo.backupset bs
    JOIN msdb.dbo.backupmediafamily bmf
         ON bs.media_set_id = bmf.media_set_id
    WHERE bs.database_name = @dbName
      AND bs.type = 'L'
      AND (@fromTime IS NULL OR bs.backup_start_date >= @fromTime)
      AND (@toTime   IS NULL OR bs.backup_finish_date <= @toTime)
    ORDER BY bs.backup_start_date;
  `;
  const result = await pool
    .request()
    .input("dbName", sql.NVarChar, dbName)
    .input("fromTime", sql.DateTime, toDate(fromTime))
    .input("toTime", sql.DateTime, toDate(toTime))
    .query(sqlStr);

  return result.recordset; // Trả mảng object y như bảng trên
};

module.exports = {
  listDatabases,
  createDevice,
  backupDatabase,
  backupLog,
  listBackups,
  restoreDatabase,
  restoreDatabaseToTime,
  listLogFiles,
};
