-- =============================
-- TEST ĐA DẠNG: NHIỀU CỔ PHIẾU, NHIỀU NHÀ ĐẦU TƯ, NHIỀU LOẠI LỆNH, NHIỀU MỨC GIÁ
-- =============================

-- 1. Thêm nhà đầu tư
INSERT INTO NHADAUTU (MaNDT, HoTen, NgaySinh, MKGD, DiaChi, Phone, CMND, GioiTinh, Email)
VALUES (N'NDT01', N'Nguyễn Văn A', '1990-01-01', N'123456', N'Hà Nội', N'0123456789', N'1234567890', N'Nam', N'a@gmail.com'),
       (N'NDT02', N'Lê Thị B', '1992-02-02', N'654321', N'HCM', N'0987654321', N'0987654321', N'Nu', N'b@gmail.com'),
       (N'NDT03', N'Trần Văn C', '1988-03-03', N'111111', N'Đà Nẵng', N'0911111111', N'1111111111', N'Nam', N'c@gmail.com'),
       (N'NDT04', N'Phạm Thị D', '1995-04-04', N'222222', N'Hải Phòng', N'0922222222', N'2222222222', N'Nu', N'd@gmail.com');

-- 2. Ngân hàng
INSERT INTO NGANHANG (MaNH, TenNH, DiaChi, Phone, Email)
VALUES (N'NH01', N'Vietcombank', N'Hà Nội', N'0241234567', N'vcb@gmail.com');

-- 3. Tài khoản ngân hàng
INSERT INTO TAIKHOAN_NGANHANG (MaTK, MaNDT, SoTien, MaNH)
VALUES (N'TK01', N'NDT01', 100000000, N'NH01'),
       (N'TK02', N'NDT02', 20000000, N'NH01'),
       (N'TK03', N'NDT03', 50000000, N'NH01'),
       (N'TK04', N'NDT04', 30000000, N'NH01');

-- 4. Thêm nhiều cổ phiếu
INSERT INTO COPHIEU (MaCP, TenCty, DiaChi, SoLuongPH, IsDeleted)
VALUES (N'AAA', N'Cty AAA', N'Hà Nội', 1000000, 0),
       (N'BBB', N'Cty BBB', N'HCM', 800000, 0),
       (N'CCC', N'Cty CCC', N'Đà Nẵng', 600000, 0);

-- 5. Bảng giá trực tuyến cho từng cổ phiếu
INSERT INTO BANGGIATRUCTUYEN (MaCP, GiaTran, GiaSan, GiaTC, GiaMua1, SoLuongMua1, GiaMua2, SoLuongMua2, GiaMua3, SoLuongMua3, GiaBan1, SoLuongBan1, GiaBan2, SoLuongBan2, GiaBan3, SoLuongBan3, GiaKhop, SoLuongKhop)
VALUES (N'AAA', 30000, 10000, 20000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
       (N'BBB', 40000, 20000, 30000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
       (N'CCC', 50000, 30000, 40000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- 6. Sở hữu cổ phiếu ban đầu
INSERT INTO SOHUU (MaNDT, MaCP, SoLuong)
VALUES (N'NDT02', N'AAA', 1000),
       (N'NDT03', N'BBB', 800),
       (N'NDT04', N'CCC', 600);

-- =============================
-- ĐẶT LỆNH LO, ATO, ATC VỚI NHIỀU GIÁ, NHIỀU NHÀ ĐẦU TƯ
-- =============================

-- AAA: LO bán/mua nhiều giá
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = NULL, @LoaiGD = 'B', @SoLuong = 200, @Gia = 20000, @MaTK = N'TK02', @LoaiLenh = N'LO', @MKGD = N'654321';
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = NULL, @LoaiGD = 'B', @SoLuong = 100, @Gia = 21000, @MaTK = N'TK02', @LoaiLenh = N'LO', @MKGD = N'654321';
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = NULL, @LoaiGD = 'M', @SoLuong = 100, @Gia = 20000, @MaTK = N'TK01', @LoaiLenh = N'LO', @MKGD = N'123456';
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = NULL, @LoaiGD = 'M', @SoLuong = 200, @Gia = 21000, @MaTK = N'TK03', @LoaiLenh = N'LO', @MKGD = N'111111';

-- BBB: LO bán/mua nhiều giá
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = NULL, @LoaiGD = 'B', @SoLuong = 300, @Gia = 32000, @MaTK = N'TK03', @LoaiLenh = N'LO', @MKGD = N'111111';
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = NULL, @LoaiGD = 'M', @SoLuong = 200, @Gia = 32000, @MaTK = N'TK04', @LoaiLenh = N'LO', @MKGD = N'222222';
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = NULL, @LoaiGD = 'M', @SoLuong = 100, @Gia = 33000, @MaTK = N'TK01', @LoaiLenh = N'LO', @MKGD = N'123456';

-- CCC: LO bán/mua nhiều giá
EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = NULL, @LoaiGD = 'B', @SoLuong = 200, @Gia = 40000, @MaTK = N'TK04', @LoaiLenh = N'LO', @MKGD = N'222222';
EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = NULL, @LoaiGD = 'M', @SoLuong = 200, @Gia = 40000, @MaTK = N'TK02', @LoaiLenh = N'LO', @MKGD = N'654321';

-- AAA: ATO/ATC nhiều nhà đầu tư
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'B', @SoLuong = 300, @Gia = NULL, @MaTK = N'TK02', @LoaiLenh = N'ATO', @MKGD = N'654321';
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'M', @SoLuong = 300, @Gia = NULL, @MaTK = N'TK01', @LoaiLenh = N'ATO', @MKGD = N'123456';

EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'B', @SoLuong = 400, @Gia = NULL, @MaTK = N'TK02', @LoaiLenh = N'ATC', @MKGD = N'654321';
EXEC sp_DatLenh @MaCP = N'AAA', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'M', @SoLuong = 400, @Gia = NULL, @MaTK = N'TK03', @LoaiLenh = N'ATC', @MKGD = N'111111';

-- BBB: ATO/ATC nhiều nhà đầu tư
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'B', @SoLuong = 200, @Gia = NULL, @MaTK = N'TK03', @LoaiLenh = N'ATO', @MKGD = N'111111';
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'M', @SoLuong = 200, @Gia = NULL, @MaTK = N'TK04', @LoaiLenh = N'ATO', @MKGD = N'222222';

EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'B', @SoLuong = 300, @Gia = NULL, @MaTK = N'TK03', @LoaiLenh = N'ATC', @MKGD = N'111111';
EXEC sp_DatLenh @MaCP = N'BBB', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'M', @SoLuong = 300, @Gia = NULL, @MaTK = N'TK01', @LoaiLenh = N'ATC', @MKGD = N'123456';

-- CCC: ATO/ATC nhiều nhà đầu tư
EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'B', @SoLuong = 100, @Gia = NULL, @MaTK = N'TK04', @LoaiLenh = N'ATO', @MKGD = N'222222';
EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = '2025-06-24 08:35:02.893', @LoaiGD = 'M', @SoLuong = 100, @Gia = NULL, @MaTK = N'TK02', @LoaiLenh = N'ATO', @MKGD = N'654321';

EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'B', @SoLuong = 200, @Gia = NULL, @MaTK = N'TK04', @LoaiLenh = N'ATC', @MKGD = N'222222';
EXEC sp_DatLenh @MaCP = N'CCC', @Ngay = '2025-06-24 14:35:02.893', @LoaiGD = 'M', @SoLuong = 200, @Gia = NULL, @MaTK = N'TK01', @LoaiLenh = N'ATC', @MKGD = N'123456';

-- =============================
-- KHỚP LỆNH ĐỊNH KỲ CHO TỪNG CỔ PHIẾU VÀ PHIÊN
-- =============================
DECLARE @Ngay DATE = '2025-06-24';
EXEC sp_KhopLenhDinhKy @MaCP = N'AAA', @Ngay = @Ngay, @LoaiLenh = N'ATO';
EXEC sp_KhopLenhDinhKy @MaCP = N'AAA', @Ngay = @Ngay, @LoaiLenh = N'ATC';
EXEC sp_KhopLenhDinhKy @MaCP = N'BBB', @Ngay = @Ngay, @LoaiLenh = N'ATO';
EXEC sp_KhopLenhDinhKy @MaCP = N'BBB', @Ngay = @Ngay, @LoaiLenh = N'ATC';
EXEC sp_KhopLenhDinhKy @MaCP = N'CCC', @Ngay = @Ngay, @LoaiLenh = N'ATO';
EXEC sp_KhopLenhDinhKy @MaCP = N'CCC', @Ngay = @Ngay, @LoaiLenh = N'ATC';

-- =============================
-- TRUY VẤN KẾT QUẢ CUỐI CÙNG
-- =============================
SELECT * FROM LENHDAT;
SELECT * FROM LENHKHOP;
SELECT * FROM TAIKHOAN_NGANHANG;
SELECT * FROM LICHSU_TIEN;
SELECT * FROM SOHUU;
SELECT * FROM BANGGIATRUCTUYEN;
SELECT * FROM LICHSUGIA;
SELECT * FROM GIATRI_PHIEN;