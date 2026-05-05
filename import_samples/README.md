# Hướng dẫn nhập sách từ file CSV

Thư mục này chứa 2 file mẫu để nhập liệu sách vào hệ thống:

1.  **`mau_nhap_sach_don_gian.csv`**: Dùng cho việc nhập nhanh thông tin cơ bản và số lượng tồn kho.
2.  **`mau_nhap_sach_chi_tiet.csv`**: Dùng cho việc nhập đầy đủ thông tin metadata, vị trí kho và tâm trạng (moods).

## Giải thích các trường dữ liệu (Columns)

| Tên trường | Ý nghĩa | Ghi chú |
| :--- | :--- | :--- |
| `isbn` | Mã vạch/Mã sách | Bắt buộc, duy nhất (Unique) |
| `title` | Tên sách | Bắt buộc |
| `author` | Tác giả | Bắt buộc |
| `category` | Thể loại | Ví dụ: Văn học, Kinh tế... |
| `price` | Giá bán | Đơn vị: VNĐ |
| `inHouseQuantity` | Số lượng nhập kho | Số nguyên |
| `binLocation` | Vị trí kệ kho | Ví dụ: Khu-A1, Shelf-B |
| `thumbnail` | Link ảnh bìa | URL hình ảnh |
| `moods` | Tâm trạng/Vibe | Phân cách bởi dấu chấm phẩy `;` |

## Danh sách các Mood hợp lệ (cho trường `moods`)

Sử dụng các ID sau (ngôn ngữ hệ thống):
- `bitter_reality`: Trầm tư trước thời đại
- `existential_crisis`: Khủng hoảng hiện sinh
- `hanoi_polite`: Lịch thiệp kiểu Hà Nội xưa
- `french_sadness`: Buồn lơ lửng
- `urban_loneliness`: Người cô đơn trong thành thị
- `window_staring`: Thế giới đi ngủ và bạn ngồi bên cửa sổ
- `german_cold`: Khô lạnh như người Đức
- `noir_detective`: Trinh thám kiểu phim noir
- `not_on_earth`: Đi tìm điều chưa có trên Trái Đất
