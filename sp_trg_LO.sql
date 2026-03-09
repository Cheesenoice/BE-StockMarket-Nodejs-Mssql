-- =================================================================
-- PHẦN 1: STORED PROCEDURE HELPER - XỬ LÝ GIAO DỊCH KHỚP (Bản cuối)
-- Nhiệm vụ: Cập nhật toàn bộ thông tin tài khoản, sở hữu, và
-- lịch sử (với đầy đủ số dư trước/sau) cho một giao dịch đã khớp.
-- =================================================================
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
    DECLARE @SoDuTruoc FLOAT, @SoDuSau FLOAT; -- Biến để ghi lịch sử

    -- Lấy thông tin tài khoản của hai bên
    SELECT @MaTK_Mua = MaTK FROM LENHDAT WHERE MaGD = @MaGD_Mua;
    SELECT @MaTK_Ban = MaTK FROM LENHDAT WHERE MaGD = @MaGD_Ban;
    SELECT @MaNDT_Mua = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Mua;
    SELECT @MaNDT_Ban = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Ban;

    -- 2. Cập nhật cho BÊN MUA
    -- Lấy số dư trước, tính số dư sau
    SELECT @SoDuTruoc = SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Mua;
    SET @SoDuSau = @SoDuTruoc - @SoTienPhatSinh;
    -- Cập nhật tài khoản
    UPDATE TAIKHOAN_NGANHANG SET SoTien = @SoDuSau WHERE MaTK = @MaTK_Mua;
    -- Ghi lịch sử tiền đầy đủ
    INSERT INTO LICHSU_TIEN (MaTK, MaGD, SoDuTruoc, SoTienPhatSinh, LyDo, SoDuSau) 
    VALUES (@MaTK_Mua, @MaGD_Mua, @SoDuTruoc, -@SoTienPhatSinh, N'Khớp lệnh Mua ' + @MaCP, @SoDuSau);
    -- Cập nhật sở hữu
    IF EXISTS (SELECT 1 FROM SOHUU WHERE MaNDT = @MaNDT_Mua AND MaCP = @MaCP)
        UPDATE SOHUU SET SoLuong = SoLuong + @SoLuongKhop WHERE MaNDT = @MaNDT_Mua AND MaCP = @MaCP;
    ELSE
        INSERT INTO SOHUU (MaNDT, MaCP, SoLuong) VALUES (@MaNDT_Mua, @MaCP, @SoLuongKhop);

    -- 3. Cập nhật cho BÊN BÁN
    -- Lấy số dư trước, tính số dư sau
    SELECT @SoDuTruoc = SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @MaTK_Ban;
    SET @SoDuSau = @SoDuTruoc + @SoTienPhatSinh;
    -- Cập nhật tài khoản
    UPDATE TAIKHOAN_NGANHANG SET SoTien = @SoDuSau WHERE MaTK = @MaTK_Ban;
    -- Ghi lịch sử tiền đầy đủ
    INSERT INTO LICHSU_TIEN (MaTK, MaGD, SoDuTruoc, SoTienPhatSinh, LyDo, SoDuSau) 
    VALUES (@MaTK_Ban, @MaGD_Ban, @SoDuTruoc, @SoTienPhatSinh, N'Khớp lệnh Bán ' + @MaCP, @SoDuSau);
    -- Cập nhật sở hữu
    UPDATE SOHUU SET SoLuong = SoLuong - @SoLuongKhop WHERE MaNDT = @MaNDT_Ban AND MaCP = @MaCP;

    -- 4. Cập nhật thông tin khớp lệnh trên Bảng Giá
    UPDATE BANGGIATRUCTUYEN
    SET GiaKhop = @GiaKhop,
        SoLuongKhop = ISNULL(SoLuongKhop, 0) + @SoLuongKhop
    WHERE MaCP = @MaCP;
END;
GO
-- =================================================================
-- PHẦN 2: STORED PROCEDURE KHỚP LỆNH CHÍNH (Bản hoàn chỉnh)
-- Nhiệm vụ: Kiểm tra điều kiện, sau đó tìm lệnh đối ứng và gọi
-- sp_ProcessMatch để xử lý. Đã sửa lỗi RAISERROR với kiểu FLOAT.
-- =================================================================
CREATE OR ALTER PROCEDURE sp_KhopLenhLienTuc
    @InputMaCP NCHAR(10),
    @InputNgay DATE,
    @InputLoaiGD CHAR(1),
    @InputSoLuong INT,
    @InputGia FLOAT,
    @InputMaTK NCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- ==========================================================
    --        PHẦN KIỂM TRA ĐIỀU KIỆN GIAO DỊCH
    -- ==========================================================
    DECLARE @MaNDT NCHAR(20);
    SELECT @MaNDT = MaNDT FROM TAIKHOAN_NGANHANG WHERE MaTK = @InputMaTK;

    -- 1. Nếu là lệnh BÁN, kiểm tra số lượng cổ phiếu
    IF @InputLoaiGD = 'B'
    BEGIN
        DECLARE @SoLuongSoHuu INT = ISNULL((SELECT SoLuong FROM SOHUU WHERE MaNDT = @MaNDT AND MaCP = @InputMaCP), 0);
        IF @SoLuongSoHuu < @InputSoLuong
        BEGIN
            RAISERROR(N'Lỗi: Không đủ cổ phiếu để bán. Sở hữu: %d, Cần bán: %d', 16, 1, @SoLuongSoHuu, @InputSoLuong);
            RETURN;
        END
    END
    -- 2. Nếu là lệnh MUA, kiểm tra số dư tiền
    ELSE IF @InputLoaiGD = 'M'
    BEGIN
        DECLARE @SoTienCanThiet FLOAT = @InputSoLuong * @InputGia;
        DECLARE @SoDuHienCo FLOAT = (SELECT SoTien FROM TAIKHOAN_NGANHANG WHERE MaTK = @InputMaTK);
        IF @SoDuHienCo < @SoTienCanThiet
        BEGIN
            -- == PHẦN SỬA LỖI: Chuyển FLOAT thành NVARCHAR để RAISERROR có thể đọc ==
            DECLARE @SoDuHienCo_Str NVARCHAR(50) = FORMAT(@SoDuHienCo, 'N', 'vi-VN');
            DECLARE @SoTienCanThiet_Str NVARCHAR(50) = FORMAT(@SoTienCanThiet, 'N', 'vi-VN');

            -- Dùng %s cho kiểu chuỗi (string)
            RAISERROR(N'Lỗi: Số dư không đủ để mua. Số dư: %s, Yêu cầu: %s', 16, 1, @SoDuHienCo_Str, @SoTienCanThiet_Str);
            RETURN;
        END
    END
    -- ==========================================================
    --        KẾT THÚC PHẦN KIỂM TRA
    -- ==========================================================

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @MaGD_DatLenh INT, @SoLuongConLai INT;
        DECLARE @MaGD_DoiUng INT, @GiaKhop FLOAT, @SoLuongDoiUng INT, @SoLuongKhop INT;
        DECLARE @MaGD_Mua INT, @MaGD_Ban INT;

        INSERT INTO LENHDAT (NgayGD, LoaiLenh, LoaiGD, SoLuong, MaCP, Gia, MaTK, TrangThai)
        VALUES (GETDATE(), 'LO', @InputLoaiGD, @InputSoLuong, @InputMaCP, @InputGia, @InputMaTK, 'Cho');
        
        SET @MaGD_DatLenh = SCOPE_IDENTITY();
        SET @SoLuongConLai = @InputSoLuong;

        WHILE @SoLuongConLai > 0
        BEGIN
            SET @MaGD_DoiUng = NULL;

            IF @InputLoaiGD = 'M'
                SELECT TOP 1 @MaGD_DoiUng = MaGD, @GiaKhop = Gia, @SoLuongDoiUng = SoLuong FROM LENHDAT
                WHERE MaCP = @InputMaCP AND LoaiGD = 'B' AND TrangThai IN ('Cho', 'MotPhan') AND Gia <= @InputGia AND SoLuong > 0
                ORDER BY Gia ASC, NgayGD ASC;
            ELSE
                SELECT TOP 1 @MaGD_DoiUng = MaGD, @GiaKhop = Gia, @SoLuongDoiUng = SoLuong FROM LENHDAT
                WHERE MaCP = @InputMaCP AND LoaiGD = 'M' AND TrangThai IN ('Cho', 'MotPhan') AND Gia >= @InputGia AND SoLuong > 0
                ORDER BY Gia DESC, NgayGD ASC;

            IF @MaGD_DoiUng IS NULL BREAK;

            SET @SoLuongKhop = IIF(@SoLuongConLai > @SoLuongDoiUng, @SoLuongDoiUng, @SoLuongConLai);
            
            IF @InputLoaiGD = 'M' BEGIN SET @MaGD_Mua = @MaGD_DatLenh; SET @MaGD_Ban = @MaGD_DoiUng; END
            ELSE BEGIN SET @MaGD_Mua = @MaGD_DoiUng; SET @MaGD_Ban = @MaGD_DatLenh; END

            EXEC sp_ProcessMatch @MaGD_Mua, @MaGD_Ban, @InputMaCP, @SoLuongKhop, @GiaKhop;

            INSERT INTO LENHKHOP (MaGD, NgayGioKhop, SoLuongKhop, GiaKhop, KieuKhop)
            VALUES (@MaGD_DatLenh, GETDATE(), @SoLuongKhop, @GiaKhop, IIF(@SoLuongKhop = @SoLuongConLai, 'KhopHet', 'KhopMotPhan'));
            INSERT INTO LENHKHOP (MaGD, NgayGioKhop, SoLuongKhop, GiaKhop, KieuKhop)
            VALUES (@MaGD_DoiUng, GETDATE(), @SoLuongKhop, @GiaKhop, IIF(@SoLuongKhop = @SoLuongDoiUng, 'KhopHet', 'KhopMotPhan'));

            SET @SoLuongConLai = @SoLuongConLai - @SoLuongKhop;
            UPDATE LENHDAT SET SoLuong = SoLuong - @SoLuongKhop WHERE MaGD = @MaGD_DoiUng;
        END

        UPDATE LENHDAT SET TrangThai = IIF(SoLuong > 0, 'MotPhan', 'Het') WHERE MaGD = @MaGD_DoiUng;
        UPDATE LENHDAT SET SoLuong = @SoLuongConLai, TrangThai = IIF(@SoLuongConLai = 0, 'Het', IIF(@SoLuongConLai < @InputSoLuong, 'MotPhan', 'Cho')) WHERE MaGD = @MaGD_DatLenh;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
-- =================================================================
-- TRIGGER KHI CÓ LỆNH ĐẶT MỚI HOẶC CẬP NHẬT
-- Cập nhật 3 mức giá Mua/Bán tốt nhất trên Bảng giá trực tuyến.
-- =================================================================
CREATE OR ALTER TRIGGER trg_LenhDat_UpdateBangGia
ON LENHDAT
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaCP NCHAR(10);
    SELECT DISTINCT @MaCP = MaCP FROM (SELECT MaCP FROM inserted UNION SELECT MaCP FROM deleted) t;

    -- Lấy 3 mức giá mua tốt nhất (cao nhất)
    WITH GiaMua AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong,
               ROW_NUMBER() OVER (ORDER BY Gia DESC) AS rn
        FROM LENHDAT
        WHERE MaCP = @MaCP AND LoaiGD = 'M' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0
        GROUP BY Gia
    )
    -- Lấy 3 mức giá bán tốt nhất (thấp nhất)
    , GiaBan AS (
        SELECT Gia, SUM(SoLuong) AS TongSoLuong,
               ROW_NUMBER() OVER (ORDER BY Gia ASC) AS rn
        FROM LENHDAT
        WHERE MaCP = @MaCP AND LoaiGD = 'B' AND TrangThai IN ('Cho', 'MotPhan') AND SoLuong > 0
        GROUP BY Gia
    )
    -- Cập nhật vào Bảng giá trực tuyến
    UPDATE bg
    SET 
        GiaMua1 = gm1.Gia, SoLuongMua1 = gm1.TongSoLuong,
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
CREATE OR ALTER TRIGGER trg_LenhDat_ValidateRules
ON LENHDAT
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaCP NCHAR(10), @LoaiGD CHAR(1), @SoLuong INT, @Gia FLOAT, @MaTK NCHAR(20);
    DECLARE @GiaTran FLOAT, @GiaSan FLOAT;

    SELECT @MaCP = MaCP, @LoaiGD = LoaiGD, @SoLuong = SoLuong, 
           @Gia = Gia, @MaTK = MaTK
    FROM inserted;

    SELECT @GiaTran = GiaTran, @GiaSan = GiaSan 
    FROM BANGGIATRUCTUYEN 
    WHERE MaCP = @MaCP;

    IF @Gia < @GiaSan OR @Gia > @GiaTran
    BEGIN
        DECLARE @MsgGia NVARCHAR(200) = N'Lỗi: Giá đặt (' + CAST(@Gia AS NVARCHAR(20)) + 
                   N') nằm ngoài khoảng cho phép. Giá sàn: ' + CAST(@GiaSan AS NVARCHAR(20)) + 
                   N', Giá trần: ' + CAST(@GiaTran AS NVARCHAR(20));
        RAISERROR(@MsgGia, 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF CAST(@Gia AS INT) % 100 != 0
    BEGIN
        DECLARE @Gia_Str NVARCHAR(50) = CAST(@Gia AS NVARCHAR(50));
        RAISERROR(N'Lỗi: Giá đặt (%s) phải là bội số của 100', 16, 1, @Gia_Str);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    IF @LoaiGD = 'B' AND @SoLuong % 100 != 0
    BEGIN
        RAISERROR(N'Lỗi: Số lượng bán (%d) phải là bội số của 100', 16, 1, @SoLuong);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

