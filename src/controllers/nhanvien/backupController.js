const backupService = require("../../services/nhanvien/backupService");

const listDatabases = async (req, res) => {
  try {
    const data = await backupService.listDatabases(req.user);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createDevice = async (req, res) => {
  try {
    const { dbName } = req.body;
    const result = await backupService.createDevice(req.user, dbName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const backupDatabase = async (req, res) => {
  try {
    const { dbName, overwrite, note, deleteOld } = req.body;
    const result = await backupService.backupDatabase(
      req.user,
      dbName,
      overwrite,
      note,
      deleteOld
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const backupLog = async (req, res) => {
  try {
    const { dbName } = req.body;
    const result = await backupService.backupLog(req.user, dbName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listBackups = async (req, res) => {
  try {
    const { dbName } = req.params;
    const data = await backupService.listBackups(req.user, dbName);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const restoreDatabase = async (req, res) => {
  try {
    const { dbName, fileIndex } = req.body;
    const result = await backupService.restoreDatabase(
      req.user,
      dbName,
      fileIndex
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const restoreDatabaseToTime = async (req, res) => {
  try {
    const { dbName, fileIndex, stopAt, logFiles } = req.body;
    const result = await backupService.restoreDatabaseToTime(
      req.user,
      dbName,
      fileIndex,
      stopAt,
      logFiles
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/nhanvien/backupController.js
const listLogFiles = async (req, res) => {
  try {
    const { dbName } = req.params;
    const { fromTime, toTime } = req.query; // ?fromTime=…&toTime=…
    const data = await backupService.listLogFiles(
      req.user,
      dbName,
      fromTime,
      toTime
    );
    res.json({ success: true, data }); // ← JSON chứa bốn cột
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listDatabases,
  createDevice,
  backupDatabase,
  backupLog,
  listBackups,
  listLogFiles,
  restoreDatabase,
  restoreDatabaseToTime,
};
