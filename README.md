# Stock Realtime API

API backend cho hệ thống giao dịch chứng khoán realtime.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

#### POST /api/auth/login

Đăng nhập vào hệ thống.

**Request Body:**

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "role": "NhaDauTu"
}
```

#### POST /api/auth/logout

Đăng xuất khỏi hệ thống.

**Headers:**

```
Authorization: Bearer <token>
```

### Transaction Reports (Sao kê giao dịch)

#### POST /api/transactions/sao-ke-giao-dich

Lấy sao kê giao dịch theo tài khoản và khoảng thời gian.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "tuNgay": "2024-01-01",
  "denNgay": "2024-01-31"
}
```

**Lưu ý:** `maTK` sẽ tự động được lấy từ `username` đã đăng nhập.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "MaGD": "GD001",
      "NgayGD": "2024-01-15T00:00:00.000Z",
      "LoaiLenh": "Mua",
      "PhuongThuc": "Thị trường",
      "SoLuongKhop": 100,
      "MaCP": "VNM",
      "GiaDat": 50000,
      "ChiTietGD": "Khớp"
    }
  ],
  "message": "Lấy sao kê giao dịch thành công"
}
```

#### POST /api/transactions/sao-ke-lenh-khop

Lấy sao kê lệnh khớp theo tài khoản và khoảng thời gian.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "tuNgay": "2024-01-01",
  "denNgay": "2024-01-31"
}
```

**Lưu ý:** `maTK` sẽ tự động được lấy từ `username` đã đăng nhập.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "MaLK": "LK001",
      "MaGD": "GD001",
      "MaCP": "VNM",
      "PhuongThuc": "Thị trường",
      "GiaKhop": 50000,
      "SoLuongKhop": 100,
      "KieuKhop": "Khớp lệnh",
      "NgayGioKhop": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Lấy sao kê lệnh khớp thành công"
}
```

## Lưu ý

1. **Authentication**: Tất cả API (trừ login) đều yêu cầu JWT token trong header Authorization.
2. **Session**: Hệ thống sử dụng session để lưu trữ thông tin đăng nhập.
3. **Database Connection**: Mỗi user sẽ có connection pool riêng để kết nối database.
4. **Stored Procedures**: Các API sao kê sử dụng stored procedures từ SQL Server.
5. **Auto maTK**: `maTK` và `maNV` sẽ tự động được lấy từ `username` đã đăng nhập, không cần client gửi.

## Environment Variables

Tạo file `.env` với các biến môi trường sau:

```env
PORT=3000
SESSION_SECRET=your_session_secret_here
DB_SERVER=your_db_server
DB_DATABASE=QL_GiaoDichCoPhieu
DB_PORT=1433
```

## Stored Procedures

Hệ thống sử dụng các stored procedures sau:

1. `sp_GetUserRole` - Lấy role của user
2. `sp_SaoKeGiaoDich` - Sao kê giao dịch
3. `sp_SaoKeLenhKhop` - Sao kê lệnh khớp

## Security

- JWT token được sử dụng để xác thực
- Session được sử dụng để lưu trữ thông tin đăng nhập
- Mỗi user chỉ có thể truy cập dữ liệu của mình thông qua stored procedures
- `maTK` và `maNV` tự động lấy từ username đã đăng nhập, đảm bảo bảo mật
