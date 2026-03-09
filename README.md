# Stock Realtime Backend (Node.js + MSSQL)

Backend API cho hệ thống giao dịch chứng khoán realtime.

Điểm cốt lõi của project này: **Node.js chỉ đóng vai trò API gateway**, còn phần nghiệp vụ quan trọng (xác thực SQL login, kiểm tra điều kiện đặt lệnh, khớp lệnh, cập nhật số dư, sao kê, bảng giá, backup/restore) được xử lý chủ yếu trong **Microsoft SQL Server** bằng **stored procedure + trigger + transaction**.

## 1. Kiến trúc tổng thể

- Backend: `Node.js + Express + Socket.IO + mssql`.
- CSDL: `SQL Server`.
- Realtime: Socket.IO gọi SP lấy bảng giá định kỳ 5 giây.
- Phân quyền: 2 nhóm nghiệp vụ chính `nhadautu` và `nhanvien`.

Luồng xử lý:

1. Client đăng nhập bằng SQL Login (`username/password`).
2. Backend kết nối SQL Server bằng chính credential người dùng.
3. Gọi `sp_DangNhap` để xác định vai trò.
4. Cấp JWT và dùng middleware để bảo vệ route.
5. Mọi nghiệp vụ giao dịch/chứng khoán gọi xuống stored procedure SQL Server.

Sơ đồ kiến trúc tổng thể:

![Kien truc tong the](github-assets/mermaid-architecture.png)

## 2. Cấu trúc mã nguồn

```text
src/
  app.js                    # Khai báo middleware, route
  index.js                  # Tạo HTTP server + Socket.IO
  config/db.js              # Quản lý connection pool theo user đăng nhập
  middleware/authMiddleware.js
  utils/jwt.js
  routes/                   # Router theo nhóm nhadautu/nhanvien
  controllers/              # Validate input + gọi service
  services/                 # Gọi stored procedure / query SQL
  socket/priceBoardSocket.js
```

Class diagram backend:

![Architecture Class Diagram](github-assets/architecture-class-diagram.png)

## 3. MSSQL là lõi nghiệp vụ

Project sử dụng nhiều kiến thức lý thuyết MSSQL trong thực tế:

- Thiết kế quan hệ dữ liệu giao dịch: `LENHDAT`, `LENHKHOP`, `SOHUU`, `TAIKHOAN_NGANHANG`, `LICHSU_TIEN`, `BANGGIATRUCTUYEN`, `GIATRI_PHIEN`, `LICHSUGIA`.
- Dùng `stored procedure` để đóng gói nghiệp vụ và kiểm soát nhất quán dữ liệu.
- Dùng `trigger` để cưỡng chế rule (giá/khối lượng hợp lệ, cập nhật bảng giá top 3).
- Dùng transaction/try-catch trong SP để đảm bảo tính toàn vẹn khi khớp lệnh.
- Dùng role/login ở SQL Server để tách quyền theo nhóm người dùng.
- Có module backup/restore và restore theo thời điểm (`point-in-time`) qua lệnh T-SQL.

Sơ đồ ERD database:

![ERD Database](github-assets/ERD.png)

## 4. Cách setup MSSQL cho dự án

### 4.1 Tạo database và schema

- Script schema chính: `QL_GiaoDichCoPhieu.sql`.
- Script nghiệp vụ khớp lệnh/trigger: `full.sql`, `sp_trg_LO.sql`.

Thứ tự khuyến nghị:

1. Chạy `QL_GiaoDichCoPhieu.sql` để tạo bảng.
2. Chạy `full.sql` (hoặc script chuẩn bạn đang dùng) để tạo trigger/SP nghiệp vụ.
3. Seed dữ liệu mẫu (nếu có script riêng trong môi trường của bạn).

### 4.2 Setup SQL Login, User, Role (auth trong MSSQL)

Backend hiện tại đăng nhập bằng SQL account, nên cần tạo login/user đúng chuẩn cho từng người dùng.

Ví dụ tối thiểu (tham khảo):

```sql
-- 1) Tạo login mức server
CREATE LOGIN NDT001 WITH PASSWORD = 'YourStrongPassword!123';
CREATE LOGIN NV001 WITH PASSWORD = 'YourStrongPassword!123';

-- 2) Map vào database
USE QL_GiaoDichCoPhieu;
GO
CREATE USER NDT001 FOR LOGIN NDT001;
CREATE USER NV001 FOR LOGIN NV001;

-- 3) Gán role theo mô hình của hệ thống
CREATE ROLE nhadautu;
CREATE ROLE nhanvien;
ALTER ROLE nhadautu ADD MEMBER NDT001;
ALTER ROLE nhanvien ADD MEMBER NV001;

-- 4) Cấp quyền EXEC SP theo vai trò (ví dụ)
GRANT EXECUTE ON OBJECT::sp_DangNhap TO nhadautu;
GRANT EXECUTE ON OBJECT::sp_DangNhap TO nhanvien;
```

Lưu ý:

- Tên user/login nên đồng bộ với mã nghiệp vụ (`MaNDT`, `MaNV`) để map logic dễ hơn.
- Trong code hiện tại, backend gọi `sp_DangNhap` và đọc `TENNHOM` để xác định role.
- Các API quản trị người dùng có dùng `sys.database_principals` để kiểm tra tài khoản đã đăng ký trong DB hay chưa.

## 5. Stored procedure và trigger chính

### 5.1 Procedure khớp lệnh trong script SQL

Theo các file SQL hiện có (`full.sql`, `sp_trg_LO.sql`), các SP lõi gồm:

- `sp_KiemTraDieuKienDatLenh`
- `sp_DatLenhLO`
- `sp_DatLenhATO`
- `sp_DatLenhATC`
- `sp_KhopLenhDinhKy`
- `sp_DatLenh`
- `sp_ProcessMatch`
- `sp_XoaCoPhieu`
- `sp_KhopLenhLienTuc` (trong `sp_trg_LO.sql`)

### 5.2 Trigger chính

- `trg_LenhDat_Validate` hoặc `trg_LenhDat_ValidateRules`: kiểm tra rule giá/khối lượng.
- `trg_LenhDat_UpdateBangGia`: cập nhật 3 mức giá mua/bán tốt nhất trên bảng giá realtime.

### 5.3 Procedure backend Node.js đang gọi

Từ code `src/services`, backend đang gọi các SP sau (cần tồn tại trong DB):

- Auth: `sp_DangNhap`
- Nhà đầu tư: `sp_DatLenh`, `sp_HuyLenh`, `sp_GetAccountsByNDT`, `sp_TraCuuSoDu`, `sp_SaoKeGiaoDichLenh`, `sp_SaoKeLenhDatTheoMaCP`, `sp_SaoKeGiaoDichTien`, `sp_SaoKeLenhKhop`, `sp_ThemTaiKhoanNganHang`, `sp_NapTien`, `sp_RutTien`, `sp_DoiMatKhauGiaoDich`, `sp_XemGia`
- Nhân viên: `sp_KhopLenhDinhKyFull`, `sp_TaoTaiKhoan`, `sp_XoaTaiKhoan`, `sp_DoiMatKhau`, `sp_ThemNhaDauTu`, `sp_XoaNhaDauTu`, `sp_ThemNhanVien`, `sp_XoaNhanVien`, `sp_NiemYetCoPhieu`, `sp_GoNiemYetCoPhieu`, `sp_XoaCoPhieu`
- Realtime bảng giá: `sp_LayBangGiaTrucTuyen`

## 6. Cài đặt và chạy backend Node.js

```bash
npm install
```

### 6.1 Biến môi trường

Tạo `.env`:

```env
PORT=3000

SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

DB_SERVER=localhost
DB_DATABASE=QL_GiaoDichCoPhieu
DB_PORT=1433
```

Ghi chú:

- `DB_USER/DB_PASS` không dùng cố định vì mỗi lần login backend dùng chính `username/password` từ người dùng SQL Server.

### 6.2 Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server mặc định chạy ở `http://localhost:3000`.

## 7. Xác thực và phân quyền API

- Login: `POST /api/auth/login`
- Header bảo vệ route: `Authorization: Bearer <token>`
- Middleware phân quyền theo role:
  - `nhadautu` cho route `/api/nhadautu/*`
  - `nhanvien` cho route `/api/nhanvien/*`

Ví dụ login:

```json
{
  "username": "NDT001",
  "password": "12345678"
}
```

## 8. Nhóm API chính

### 8.1 Nhà đầu tư (`/api/nhadautu`)

- Quản lý tài khoản ngân hàng, nạp/rút tiền, đổi mật khẩu giao dịch.
- Đặt/hủy lệnh và xem lệnh chờ.
- Tra cứu sao kê lệnh, sao kê tiền, sao kê khớp lệnh.
- Tra cứu danh mục cổ phiếu và xem giá.

Ví dụ đặt lệnh:

```json
{
  "maCP": "VNM",
  "ngay": null,
  "loaiGD": "M",
  "soLuong": 100,
  "gia": 65000,
  "maTK": "TK001",
  "loaiLenh": "LO",
  "mkgd": "123456"
}
```

### 8.2 Nhân viên (`/api/nhanvien`)

- Quản trị user/login SQL và danh sách nhà đầu tư/nhân viên.
- Quản trị cổ phiếu, niêm yết/gỡ niêm yết.
- Theo dõi dữ liệu lệnh đặt/lệnh khớp/lịch sử tiền.
- Kích hoạt khớp lệnh định kỳ ATO/ATC.
- Backup/restore database và restore theo thời điểm.

## 9. Socket realtime bảng giá

- File: `src/socket/priceBoardSocket.js`
- Event:
  - Client gửi `auth` với `username/password`
  - Server emit `bangGiaUpdate`
  - Client có thể gọi `requestPriceBoard`
- Server đang cập nhật định kỳ mỗi `5s` bằng SP `sp_LayBangGiaTrucTuyen`.

## 10. Một số lưu ý kỹ thuật

- `config/db.js` tạo connection pool theo từng cặp `username:password`.
- Có `graceful shutdown` để đóng toàn bộ pool khi tắt app.
- Service có xử lý `trim()` cho dữ liệu kiểu `NCHAR` trả về từ SQL Server.
- Một số chức năng undo/redo hiện lưu bằng stack trong RAM, không bền vững khi restart server.

## 11. Bảo mật và khuyến nghị

Project phù hợp demo học thuật/đồ án. Khi triển khai thực tế nên cải thiện:

1. Không đưa password SQL user vào JWT payload.
2. Hạn chế log toàn bộ request headers/body ở production.
3. Bật HTTPS và cấu hình `secure cookie`.
4. Áp dụng rotate secret, audit quyền SQL, và tách tài khoản service account.

## 12. Tài liệu script trong repo

- `QL_GiaoDichCoPhieu.sql`: schema bảng dữ liệu chính.
- `full.sql`: trigger + SP nghiệp vụ khớp lệnh.
- `sp_trg_LO.sql`: phiên bản SP/trigger chuyên cho luồng LO/khớp liên tục.
- `full cũ chạy ngon.sql`: bản script cũ để tham chiếu.
