CREATE OR ALTER TRIGGER trg_LenhDat_Validate
ON LENHDAT
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaCP NCHAR(10), @LoaiGD CHAR(1), @SoLuong INT, @Gia FLOAT, @MaTK NCHAR(20), @LoaiLenh NCHAR(5);
    DECLARE @GiaStr NVARCHAR(50), @GiaSanStr NVARCHAR(50), @GiaTranStr NVARCHAR(50);

    SELECT @MaCP = MaCP, @LoaiGD = LoaiGD, @SoLuong = SoLuong, @Gia = Gia, @MaTK = MaTK, @LoaiLenh = LoaiLenh FROM inserted;

    -- Chỉ kiểm tra giá với LO, ATO/ATC không kiểm tra giá
    IF @LoaiLenh = 'LO'
    BEGIN
        DECLARE @GiaTran FLOAT, @GiaSan FLOAT;
        SELECT @GiaTran = GiaTran, @GiaSan = GiaSan FROM BANGGIATRUCTUYEN WHERE MaCP = @MaCP;
        IF @Gia < @GiaSan OR @Gia > @GiaTran
        BEGIN
            SET @GiaStr = CONVERT(nvarchar(50), @Gia);
            SET @GiaSanStr = CONVERT(nvarchar(50), @GiaSan);
            SET @GiaTranStr = CONVERT(nvarchar(50), @GiaTran);
            RAISERROR(N'Lỗi: Giá đặt (%s) nằm ngoài biên độ [%s, %s]', 16, 1, @GiaStr, @GiaSanStr, @GiaTranStr);
            ROLLBACK TRANSACTION; RETURN;
        END
        IF CAST(@Gia AS INT) % 100 != 0
        BEGIN
            SET @GiaStr = CONVERT(nvarchar(50), @Gia);
            RAISERROR(N'Lỗi: Giá đặt (%s) phải là bội số của 100', 16, 1, @GiaStr);
            ROLLBACK TRANSACTION; RETURN;
        END
    END
    IF @SoLuong % 100 != 0
    BEGIN
        RAISERROR(N'Lỗi: Số lượng (%d) phải là bội số của 100', 16, 1, @SoLuong);
        ROLLBACK TRANSACTION; RETURN;
    END
END;
GO

CREATE OR ALTER TRIGGER trg_LenhDat_UpdateBangGia
ON LENHDAT
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaCP NCHAR(10);
    SELECT TOP 1 @MaCP = MaCP FROM inserted;
    IF @MaCP IS NULL SELECT TOP 1 @MaCP = MaCP FROM deleted;

    -- Lấy 3 mức giá mua/bán tốt nhất
    WITH GiaMua AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong, ROW_NUMBER() OVER (ORDER BY Gia DESC) AS rn
        FROM LENHDAT WHERE MaCP = @MaCP AND LoaiGD = 'M' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0 GROUP BY Gia
    ),
    GiaBan AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong, ROW_NUMBER() OVER (ORDER BY Gia ASC) AS rn
        FROM LENHDAT WHERE MaCP = @MaCP AND LoaiGD = 'B' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0 GROUP BY Gia
    )
    UPDATE bg
    SET GiaMua1 = gm1.Gia, SoLuongMua1 = gm1.TongSoLuong,
        GiaMua2 = gm2.Gia, SoLuongMua2 = gm2.TongSoLuong,
        GiaMua3 = gm3.Gia, SoLuongMua3 = gm3.TongSoLuong,
        GiaBan1 = gb1.Gia, SoLuongBan1 = gb1.TongSoLuong,
        GiaBan2 = gb2.Gia, SoLuongBan2 = gb2.TongSoLuong,
        GiaBan3 = gb3.Gia, SoLuongBan3 = gb3.TongSoLuong
    FROM BANGGIATRUCTUYEN bg
    LEFT JOIN GiaMua gm1 ON gm1.rn = 1
    LEFT JOIN GiaMua gm2 ON gm2.rn = 2
    LEFT JOIN GiaMua gm3 ON gm3.rn = 3
    LEFT JOIN GiaBan gb1 ON gb1.rn = 1
    LEFT JOIN GiaBan gb2 ON gb2.rn = 2
    LEFT JOIN GiaBan gb3 ON gb3.rn = 3
    WHERE bg.MaCP = @MaCP;
END;
GO

CREATE OR ALTER TRIGGER trg_LenhDat_UpdateBangGia
ON LENHDAT
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaCP NCHAR(10);
    SELECT TOP 1 @MaCP = MaCP FROM inserted;
    IF @MaCP IS NULL SELECT TOP 1 @MaCP = MaCP FROM deleted;

    -- Lấy 3 mức giá mua/bán tốt nhất
    WITH GiaMua AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong, ROW_NUMBER() OVER (ORDER BY Gia DESC) AS rn
        FROM LENHDAT WHERE MaCP = @MaCP AND LoaiGD = 'M' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0 GROUP BY Gia
    ),
    GiaBan AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong, ROW_NUMBER() OVER (ORDER BY Gia ASC) AS rn
        FROM LENHDAT WHERE MaCP = @MaCP AND LoaiGD = 'B' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0 GROUP BY Gia
    )
    UPDATE bg
    SET GiaMua1 = gm1.Gia, SoLuongMua1 = gm1.TongSoLuong,
        GiaMua2 = gm2.Gia, SoLuongMua2 = gm2.TongSoLuong,
        GiaMua3 = gm3.Gia, SoLuongMua3 = gm3.TongSoLuong,
        GiaBan1 = gb1.Gia, SoLuongBan1 = gb1.TongSoLuong,
        GiaBan2 = gb2.Gia, SoLuongBan2 = gb2.TongSoLuong,
        GiaBan3 = gb3.Gia, SoLuongBan3 = gb3.TongSoLuong
    FROM BANGGIATRUCTUYEN bg
    LEFT JOIN GiaMua gm1 ON gm1.rn = 1
    LEFT JOIN GiaMua gm2 ON gm2.rn = 2
    LEFT JOIN GiaMua gm3 ON gm3.rn = 3
    LEFT JOIN GiaBan gb1 ON gb1.rn = 1
    LEFT JOIN GiaBan gb2 ON gb2.rn = 2
    LEFT JOIN GiaBan gb3 ON gb3.rn = 3
    WHERE bg.MaCP = @MaCP;
END;
GO

-- =============================
-- TỐI ƯU HÓA TRUY VẤN VÀ THÊM COMMENT CHI TIẾT
-- =============================

-- 1. Tối ưu kiểm tra điều kiện đặt lệnh
CREATE OR ALTER PROCEDURE sp_KiemTraDieuKienDatLenh
    @MaTK NCHAR(20),
    @MaCP NCHAR(10),
    @LoaiGD CHAR(1),
    @SoLuong INT,
    @Gia FLOAT = NULL,
    @LoaiLenh NCHAR(5),
    @MaNDT NCHAR(20)
AS
BEGIN
    -- Kiểm tra MaTK có thuộc về MaNDT không
    IF NOT EXISTS (SELECT 1 FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK AND MaNDT = @MaNDT)
    BEGIN
        RAISERROR(N'Tài khoản không thuộc về nhà đầu tư này!', 16, 1);
        RETURN;
    END
    -- Kiểm tra số dư hoặc số cổ phiếu
    DECLARE @MaNDT_DB NCHAR(20);
    -- Chọn trước, kết sau (lấy MaNDT từ TAIKHOAN_NGANHANG)
    SELECT @MaNDT_DB = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK;
    IF @LoaiGD = 'B'
    BEGIN
        -- Chỉ lấy SoLuong sở hữu cần thiết, không join
        DECLARE @SoLuongSoHuu INT = ISNULL((SELECT SoLuong FROM SOHUU WHERE MaNDT = @MaNDT_DB AND MaCP = @MaCP), 0);
        DECLARE @SoLuongBanCho INT = ISNULL((
            SELECT SUM(SoLuong) FROM LENHDAT ld
            WHERE ld.MaCP = @MaCP AND ld.LoaiGD = 'B' AND ld.MaTK = @MaTK
              AND ld.TrangThai IN ('Cho', 'MotPhan')
        ), 0);
        IF @SoLuongSoHuu - @SoLuongBanCho < @SoLuong
        BEGIN
            RAISERROR(N'Lỗi: Không đủ cổ phiếu để bán. Sở hữu: %d, Đã đặt bán chờ: %d, Cần bán thêm: %d', 16, 1, @SoLuongSoHuu, @SoLuongBanCho, @SoLuong);
            RETURN;
        END
    END
    ELSE IF @LoaiGD = 'M' AND @LoaiLenh = 'LO'
    BEGIN
        -- Kiểm tra số dư trước, phép chọn trước
        DECLARE @SoTienCanThiet FLOAT = @SoLuong * @Gia;
        DECLARE @SoDuHienCo FLOAT = (SELECT SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK);
        IF @SoDuHienCo < @SoTienCanThiet
        BEGIN
            DECLARE @SoDuHienCo_Str NVARCHAR(50) = FORMAT(@SoDuHienCo, 'N', 'vi-VN');
            DECLARE @SoTienCanThiet_Str NVARCHAR(50) = FORMAT(@SoTienCanThiet, 'N', 'vi-VN');
            RAISERROR(N'Lỗi: Số dư không đủ để mua. Số dư: %s, Yêu cầu: %s', 16, 1, @SoDuHienCo_Str, @SoTienCanThiet_Str);
            RETURN;
        END
    END
END;
GO

-- 2. Tối ưu đặt lệnh LO
CREATE OR ALTER PROCEDURE sp_DatLenhLO
    @MaNDT NCHAR(20),
    @MaCP NCHAR(10),
    @Ngay DATETIME = NULL,
    @LoaiGD CHAR(1),
    @SoLuong INT,
    @Gia FLOAT,
    @MaTK NCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra điều kiện trước khi insert
        EXEC sp_KiemTraDieuKienDatLenh @MaTK, @MaCP, @LoaiGD, @SoLuong, @Gia, 'LO', @MaNDT;
        DECLARE @NgayGio DATETIME = ISNULL(@Ngay, GETDATE());
        INSERT INTO LENHDAT (NgayGD, LoaiLenh, LoaiGD, SoLuong, MaCP, Gia, MaTK, TrangThai)
            VALUES (@NgayGio, 'LO', @LoaiGD, @SoLuong, @MaCP, @Gia, @MaTK, 'Cho');
        DECLARE @MaGD INT = SCOPE_IDENTITY();
        DECLARE @SoLuongConLai INT = @SoLuong;
        DECLARE cur CURSOR FOR
            SELECT MaGD, SoLuong, Gia FROM LENHDAT
            WHERE MaCP = @MaCP AND LoaiGD <> @LoaiGD AND TrangThai IN ('Cho', 'MotPhan')
                AND ((@LoaiGD = 'M' AND Gia <= @Gia) OR (@LoaiGD = 'B' AND Gia >= @Gia))
                AND SoLuong > 0
            ORDER BY CASE WHEN @LoaiGD = 'M' THEN Gia END ASC, CASE WHEN @LoaiGD = 'B' THEN Gia END DESC, NgayGD ASC;
        DECLARE @MaGD_DoiUng INT, @SoLuongDoiUng INT, @GiaDoiUng FLOAT, @SoLuongKhop INT;
        OPEN cur;
        FETCH NEXT FROM cur INTO @MaGD_DoiUng, @SoLuongDoiUng, @GiaDoiUng;
        WHILE @@FETCH_STATUS = 0 AND @SoLuongConLai > 0
        BEGIN
            SET @SoLuongKhop = IIF(@SoLuongConLai < @SoLuongDoiUng, @SoLuongConLai, @SoLuongDoiUng);
            IF @LoaiGD = 'M'
                EXEC sp_ProcessMatch @MaGD, @MaGD_DoiUng, @MaCP, @SoLuongKhop, @GiaDoiUng;
            ELSE
                EXEC sp_ProcessMatch @MaGD_DoiUng, @MaGD, @MaCP, @SoLuongKhop, @GiaDoiUng;
            UPDATE LENHDAT SET SoLuong = SoLuong - @SoLuongKhop, TrangThai = CASE WHEN SoLuong - @SoLuongKhop = 0 THEN 'Het' ELSE 'MotPhan' END WHERE MaGD = @MaGD_DoiUng;
            SET @SoLuongConLai = @SoLuongConLai - @SoLuongKhop;
            FETCH NEXT FROM cur INTO @MaGD_DoiUng, @SoLuongDoiUng, @GiaDoiUng;
        END
        CLOSE cur; DEALLOCATE cur;
        UPDATE LENHDAT SET SoLuong = @SoLuongConLai, TrangThai = CASE WHEN @SoLuongConLai = 0 THEN 'Het' WHEN @SoLuongConLai < @SoLuong THEN 'MotPhan' ELSE 'Cho' END WHERE MaGD = @MaGD;
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);
        RETURN;
    END CATCH
END;
GO

-- 3. Tối ưu đặt lệnh ATO
CREATE OR ALTER PROCEDURE sp_DatLenhATO
    @MaNDT NCHAR(20),
    @MaCP NCHAR(10),
    @Ngay DATETIME = NULL,
    @LoaiGD CHAR(1),
    @SoLuong INT,
    @MaTK NCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @NgayGio DATETIME = ISNULL(@Ngay, GETDATE());
        IF NOT (
            (DATEPART(HOUR, @NgayGio) = 8 AND DATEPART(MINUTE, @NgayGio) >= 30)
            OR (DATEPART(HOUR, @NgayGio) = 9 AND DATEPART(MINUTE, @NgayGio) = 0)
        )
        BEGIN
            RAISERROR(N'Lệnh ATO chỉ được đặt trong khung giờ 08:30:00 đến 09:00:00', 16, 1);
            RETURN;
        END
        EXEC sp_KiemTraDieuKienDatLenh @MaTK, @MaCP, @LoaiGD, @SoLuong, NULL, 'ATO', @MaNDT;
        INSERT INTO LENHDAT (NgayGD, LoaiLenh, LoaiGD, SoLuong, MaCP, Gia, MaTK, TrangThai)
            VALUES (@NgayGio, 'ATO', @LoaiGD, @SoLuong, @MaCP, NULL, @MaTK, 'Cho');
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);
        RETURN;
    END CATCH
END;
GO

-- 4. Tối ưu đặt lệnh ATC
CREATE OR ALTER PROCEDURE sp_DatLenhATC
    @MaNDT NCHAR(20),
    @MaCP NCHAR(10),
    @Ngay DATETIME = NULL,
    @LoaiGD CHAR(1),
    @SoLuong INT,
    @MaTK NCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @NgayGio DATETIME = ISNULL(@Ngay, GETDATE());
        IF NOT (
            (DATEPART(HOUR, @NgayGio) = 14 AND DATEPART(MINUTE, @NgayGio) >= 30)
            OR (DATEPART(HOUR, @NgayGio) = 15 AND DATEPART(MINUTE, @NgayGio) = 0)
        )
        BEGIN
            RAISERROR(N'Lệnh ATC chỉ được đặt trong khung giờ 14:30:00 đến 15:00:00', 16, 1);
            RETURN;
        END
        EXEC sp_KiemTraDieuKienDatLenh @MaTK, @MaCP, @LoaiGD, @SoLuong, NULL, 'ATC', @MaNDT;
        INSERT INTO LENHDAT (NgayGD, LoaiLenh, LoaiGD, SoLuong, MaCP, Gia, MaTK, TrangThai)
            VALUES (@NgayGio, 'ATC', @LoaiGD, @SoLuong, @MaCP, NULL, @MaTK, 'Cho');
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);
        RETURN;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_KhopLenhDinhKy
    @MaCP NCHAR(10),
    @Ngay DATE,
    @LoaiLenh NCHAR(5) -- 'ATO' hoặc 'ATC'
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy tổng khối lượng mua/bán ATO/ATC
    DECLARE @TongMua INT = (SELECT SUM(SoLuong) FROM LENHDAT WHERE MaCP = @MaCP AND LoaiLenh = @LoaiLenh AND LoaiGD = 'M' AND TrangThai = 'Cho' AND CONVERT(DATE, NgayGD) = @Ngay);
    DECLARE @TongBan INT = (SELECT SUM(SoLuong) FROM LENHDAT WHERE MaCP = @MaCP AND LoaiLenh = @LoaiLenh AND LoaiGD = 'B' AND TrangThai = 'Cho' AND CONVERT(DATE, NgayGD) = @Ngay);

    IF @TongMua IS NULL OR @TongBan IS NULL OR @TongMua = 0 OR @TongBan = 0
    BEGIN
        -- Cập nhật trạng thái các lệnh còn lại về 'Chua'
        UPDATE LENHDAT
        SET TrangThai = 'Chua'
        WHERE MaCP = @MaCP 
          AND LoaiLenh = @LoaiLenh 
          AND CONVERT(DATE, NgayGD) = @Ngay 
          AND SoLuong > 0 
          AND TrangThai = 'Cho';
        PRINT N'Không đủ lệnh đối ứng để khớp định kỳ. Các lệnh còn lại đã chuyển sang trạng thái Chua.';
        RETURN;
    END

    -- Lấy giá khớp là giá TC (có thể thay bằng thuật toán auction chuẩn)
    DECLARE @GiaKhop FLOAT = (SELECT GiaTC FROM BANGGIATRUCTUYEN WHERE MaCP = @MaCP);

    -- ĐƯA DỮ LIỆU VÀO TABLE VARIABLE ĐỂ TRÁNH LỖI SCHEMA CHANGE
    DECLARE @Mua TABLE (MaGD INT, SoLuong INT);
    DECLARE @Ban TABLE (MaGD INT, SoLuong INT);

    INSERT INTO @Mua
    SELECT MaGD, SoLuong FROM LENHDAT WHERE MaCP = @MaCP AND LoaiLenh = @LoaiLenh AND LoaiGD = 'M' AND TrangThai = 'Cho' AND CONVERT(DATE, NgayGD) = @Ngay;

    INSERT INTO @Ban
    SELECT MaGD, SoLuong FROM LENHDAT WHERE MaCP = @MaCP AND LoaiLenh = @LoaiLenh AND LoaiGD = 'B' AND TrangThai = 'Cho' AND CONVERT(DATE, NgayGD) = @Ngay;

    -- Duyệt và khớp lệnh
    DECLARE @MaGD_Mua INT, @SoLuongMua INT, @MaGD_Ban INT, @SoLuongBan INT, @SoLuongKhop INT;

    DECLARE curMua CURSOR LOCAL FOR SELECT MaGD, SoLuong FROM @Mua;
    DECLARE curBan CURSOR LOCAL FOR SELECT MaGD, SoLuong FROM @Ban;

    OPEN curMua; OPEN curBan;
    FETCH NEXT FROM curMua INTO @MaGD_Mua, @SoLuongMua;
    FETCH NEXT FROM curBan INTO @MaGD_Ban, @SoLuongBan;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @SoLuongKhop = IIF(@SoLuongMua < @SoLuongBan, @SoLuongMua, @SoLuongBan);

        EXEC sp_ProcessMatch @MaGD_Mua, @MaGD_Ban, @MaCP, @SoLuongKhop, @GiaKhop;

        -- Cập nhật trạng thái LENHDAT
        UPDATE LENHDAT SET SoLuong = SoLuong - @SoLuongKhop, TrangThai = CASE WHEN SoLuong - @SoLuongKhop = 0 THEN 'Het' ELSE 'MotPhan' END WHERE MaGD = @MaGD_Mua;
        UPDATE LENHDAT SET SoLuong = SoLuong - @SoLuongKhop, TrangThai = CASE WHEN SoLuong - @SoLuongKhop = 0 THEN 'Het' ELSE 'MotPhan' END WHERE MaGD = @MaGD_Ban;

        -- Trừ số lượng đã khớp cho vòng lặp tiếp theo
        SET @SoLuongMua = @SoLuongMua - @SoLuongKhop;
        SET @SoLuongBan = @SoLuongBan - @SoLuongKhop;

        IF @SoLuongMua = 0
        FETCH NEXT FROM curMua INTO @MaGD_Mua, @SoLuongMua;
        IF @SoLuongBan = 0
        FETCH NEXT FROM curBan INTO @MaGD_Ban, @SoLuongBan;
    END

    CLOSE curMua; DEALLOCATE curMua;
    CLOSE curBan; DEALLOCATE curBan;

    -- Sau khi khớp xong, cập nhật trạng thái các lệnh ATO/ATC còn lại về 'Chua' nếu SoLuong > 0 (không để MotPhan cho ATO/ATC)
    UPDATE LENHDAT
    SET TrangThai = 'Chua'
    WHERE MaCP = @MaCP 
      AND LoaiLenh = @LoaiLenh 
      AND CONVERT(DATE, NgayGD) = @Ngay 
      AND SoLuong > 0;

    -- Nếu không còn lệnh chờ khớp, cập nhật giá đóng cửa luôn
    IF NOT EXISTS (SELECT 1 FROM LENHDAT WHERE MaCP = @MaCP AND CONVERT(DATE, NgayGD) = @Ngay AND TrangThai IN ('Cho', 'MotPhan'))
    BEGIN
        DECLARE @GiaKhopCuoi FLOAT = (SELECT TOP 1 GiaKhop FROM LENHKHOP WHERE MaCP = @MaCP AND NgayGioKhop >= @Ngay ORDER BY NgayGioKhop DESC);
        UPDATE GIATRI_PHIEN SET GiaDongCua = @GiaKhopCuoi WHERE MaCP = @MaCP AND Ngay = @Ngay;
    END
END;
GO

CREATE OR ALTER PROCEDURE sp_DatLenh
    @MaNDT NCHAR(20),
    @MaCP NCHAR(10),
    @Ngay DATETIME = NULL,
    @LoaiGD CHAR(1),
    @SoLuong INT,
    @Gia FLOAT = NULL,
    @MaTK NCHAR(20),
    @LoaiLenh NCHAR(5), -- 'LO', 'ATO', 'ATC'
    @MKGD NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra tài khoản có thuộc về NĐT không
        IF NOT EXISTS (SELECT 1 FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK AND MaNDT = @MaNDT)
        BEGIN
            RAISERROR(N'Tài khoản không thuộc về nhà đầu tư này!', 16, 1);
            RETURN;
        END
        -- Kiểm tra MKGD
        DECLARE @MKGD_DB NVARCHAR(50);
        SELECT @MKGD_DB = ndt.MKGD FROM TAIKHOAN_NGANHANG tkn JOIN NHADAUTU ndt ON tkn.MaNDT = ndt.MaNDT WHERE tkn.MaTK = @MaTK;
        IF @MKGD_DB IS NULL OR @MKGD != @MKGD_DB
        BEGIN
            RAISERROR(N'Lỗi: Mật khẩu giao dịch không đúng.', 16, 1);
            RETURN;
        END
        DECLARE @NgayThucTe DATETIME = @Ngay;
        IF @LoaiLenh = 'LO'
            EXEC sp_DatLenhLO @MaNDT, @MaCP, @NgayThucTe, @LoaiGD, @SoLuong, @Gia, @MaTK;
        ELSE IF @LoaiLenh = 'ATO'
            EXEC sp_DatLenhATO @MaNDT, @MaCP, @NgayThucTe, @LoaiGD, @SoLuong, @MaTK;
        ELSE IF @LoaiLenh = 'ATC'
            EXEC sp_DatLenhATC @MaNDT, @MaCP, @NgayThucTe, @LoaiGD, @SoLuong, @MaTK;
        ELSE
            RAISERROR(N'Loại lệnh không hợp lệ.', 16, 1);
    END TRY
    BEGIN CATCH
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);
        RETURN;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_ProcessMatch
    @MaGD_Mua INT,
    @MaGD_Ban INT,
    @MaCP NCHAR(10),
    @SoLuongKhop INT,
    @GiaKhop FLOAT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Khai báo biến
    DECLARE @MaTK_Mua NCHAR(20), @MaTK_Ban NCHAR(20);
    DECLARE @MaNDT_Mua NCHAR(20), @MaNDT_Ban NCHAR(20);
    DECLARE @SoTienPhatSinh FLOAT = @SoLuongKhop * @GiaKhop;
    DECLARE @SoDuTruoc FLOAT, @SoDuSau FLOAT;
    DECLARE @Ngay DATE = CAST(GETDATE() AS DATE);

    -- Lấy thông tin tài khoản của hai bên
    SELECT @MaTK_Mua = MaTK FROM LENHDAT WHERE MaGD = @MaGD_Mua;
    SELECT @MaTK_Ban = MaTK FROM LENHDAT WHERE MaGD = @MaGD_Ban;
    SELECT @MaNDT_Mua = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Mua;
    SELECT @MaNDT_Ban = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Ban;

    -- 2. Cập nhật cho BÊN MUA
    SELECT @SoDuTruoc = SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Mua;
    SET @SoDuSau = @SoDuTruoc - @SoTienPhatSinh;
    UPDATE TAIKHOAN_NGANHANG SET SoTien = @SoDuSau WHERE MaTK = @MaTK_Mua;
    INSERT INTO LICHSU_TIEN (MaTK, MaGD, SoDuTruoc, SoTienPhatSinh, LyDo, SoDuSau) 
    VALUES (@MaTK_Mua, @MaGD_Mua, @SoDuTruoc, -@SoTienPhatSinh, N'Khớp lệnh Mua ' + @MaCP, @SoDuSau);
    IF EXISTS (SELECT 1 FROM SOHUU WHERE MaNDT = @MaNDT_Mua AND MaCP = @MaCP)
        UPDATE SOHUU SET SoLuong = SoLuong + @SoLuongKhop WHERE MaNDT = @MaNDT_Mua AND MaCP = @MaCP;
    ELSE
        INSERT INTO SOHUU (MaNDT, MaCP, SoLuong) VALUES (@MaNDT_Mua, @MaCP, @SoLuongKhop);

    -- 3. Cập nhật cho BÊN BÁN
    SELECT @SoDuTruoc = SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Ban;
    SET @SoDuSau = @SoDuTruoc + @SoTienPhatSinh;
    UPDATE TAIKHOAN_NGANHANG SET SoTien = @SoDuSau WHERE MaTK = @MaTK_Ban;
    INSERT INTO LICHSU_TIEN (MaTK, MaGD, SoDuTruoc, SoTienPhatSinh, LyDo, SoDuSau) 
    VALUES (@MaTK_Ban, @MaGD_Ban, @SoDuTruoc, @SoTienPhatSinh, N'Khớp lệnh Bán ' + @MaCP, @SoDuSau);
    UPDATE SOHUU SET SoLuong = SoLuong - @SoLuongKhop WHERE MaNDT = @MaNDT_Ban AND MaCP = @MaCP;

    -- 4. Cập nhật thông tin khớp lệnh trên Bảng Giá
    UPDATE BANGGIATRUCTUYEN
    SET GiaKhop = @GiaKhop,
        SoLuongKhop = ISNULL(SoLuongKhop, 0) + @SoLuongKhop
    WHERE MaCP = @MaCP;

    -- 5. Ghi nhận vào bảng LENHKHOP (bổ sung MaCP nếu có cột này)
    INSERT INTO LENHKHOP (MaGD, NgayGioKhop, SoLuongKhop, GiaKhop, KieuKhop, MaCP)
    VALUES (@MaGD_Mua, GETDATE(), @SoLuongKhop, @GiaKhop, N'KhopHet', @MaCP);
    INSERT INTO LENHKHOP (MaGD, NgayGioKhop, SoLuongKhop, GiaKhop, KieuKhop, MaCP)
    VALUES (@MaGD_Ban, GETDATE(), @SoLuongKhop, @GiaKhop, N'KhopHet', @MaCP);

    -- 6. Cập nhật GIATRI_PHIEN (giá mở cửa/đóng cửa)
    IF NOT EXISTS (SELECT 1 FROM GIATRI_PHIEN WHERE MaCP = @MaCP AND Ngay = @Ngay)
    BEGIN
        INSERT INTO GIATRI_PHIEN (MaCP, Ngay, GiaMoCua, GiaDongCua)
        VALUES (@MaCP, @Ngay, @GiaKhop, NULL);
    END
    ELSE
    BEGIN
        UPDATE GIATRI_PHIEN SET GiaDongCua = @GiaKhop WHERE MaCP = @MaCP AND Ngay = @Ngay;
    END

    -- 7. Ghi lịch sử giá (LICHSUGIA)
    IF NOT EXISTS (SELECT 1 FROM LICHSUGIA WHERE MaCP = @MaCP AND Ngay = @Ngay)
    BEGIN
        INSERT INTO LICHSUGIA (MaCP, Ngay, GiaTran, GiaSan, GiaTC)
        SELECT @MaCP, @Ngay, GiaTran, GiaSan, GiaTC FROM BANGGIATRUCTUYEN WHERE MaCP = @MaCP;
    END
END;
GO

-- Xóa cổ phiếu: chỉ cho phép xóa nếu không có giao dịch và không có sở hữu
CREATE OR ALTER PROCEDURE sp_XoaCoPhieu
    @MaCP NCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    -- Kiểm tra có giao dịch không
    IF EXISTS (SELECT 1 FROM LENHDAT WHERE MaCP = @MaCP)
    BEGIN
        RAISERROR(N'Không thể xóa: Cổ phiếu đã có giao dịch!', 16, 1);
        RETURN;
    END
    -- Kiểm tra có sở hữu không
    IF EXISTS (SELECT 1 FROM SOHUU WHERE MaCP = @MaCP)
    BEGIN
        RAISERROR(N'Không thể xóa: Cổ phiếu đang có nhà đầu tư sở hữu!', 16, 1);
        RETURN;
    END
    -- Xóa các bảng phụ liên quan (nếu cần)
    DELETE FROM BANGGIATRUCTUYEN WHERE MaCP = @MaCP;
    DELETE FROM LICHSUGIA WHERE MaCP = @MaCP;
    DELETE FROM GIATRI_PHIEN WHERE MaCP = @MaCP;
    -- Xóa cổ phiếu
    DELETE FROM COPHIEU WHERE MaCP = @MaCP;
END;
GO
