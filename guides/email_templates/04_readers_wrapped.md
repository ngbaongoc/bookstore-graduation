# Tài liệu Chiến dịch Reader's Wrapped 📖

Reader's Wrapped là chiến dịch cá nhân hóa sâu sắc nhất của BookShare, tổng kết hành trình đọc sách của khách hàng thông qua hệ thống định danh cá tính độc giả dựa trên dữ liệu lịch sử mua hàng.

---

## 1. Hệ thống Định danh Độc giả (Personality Persona System)

Hệ thống này hợp nhất dữ liệu hành vi đọc sách và các hình tượng nhân vật lịch sử/giả tưởng để tạo ra một "Bản sắc độc giả" độc nhất.

| Danh hiệu & Thân phận | Icon | Điều kiện (Logic) | Ý nghĩa & Mô tả |
| :--- | :--- | :--- | :--- |
| **Nhà tri thức thế kỷ 19** | 🏛️ | Tỷ trọng sách *Classic Literature* > 60% | Người quan sát và trầm ngâm trước những cơn lốc biến đổi của thời đại. |
| **Thám tử ẩn danh** | 🔍 | Tỷ trọng sách *Mystery/Thriller* > 50% | Người nắm giữ những bí mật đen tối nhất và luôn đi trước hung thủ một bước. |
| **Pháp sư lãng du** | 🪄 | Tỷ trọng sách *Fantasy/Sci-Fi* > 50% | Kẻ mang quyền năng thay đổi thực tại, bị lạc vào thế giới hiện đại đầy náo nhiệt. |
| **Lãnh đạo tiên phong** | 🎓 | Tỷ trọng sách *Non-fiction/Business* > 50% | Một nhà cách tân luôn nhìn thấy cơ hội trong khi mọi người chỉ thấy khó khăn. |
| **Thi sĩ mộng mơ** | 🌹 | Tỷ trọng sách *Romance* > 50% | Đi tìm bản tình ca còn dang dở giữa nhịp sống hối hả. |
| **Kẻ du hành tri thức** | 🌈 | Mua từ 5 thể loại sách trở lên | Bạn là cánh chim hải âu bay giữa đại dương tri thức, không ngại ngần đặt chân lên bất kỳ vùng đất lạ nào để kiếm tìm sự khai sáng. |
| **Mọt sách chính hiệu** | 📚 | Mua >= 15 cuốn sách/năm | Độc giả bền bỉ nhất, người dệt nên những giấc mơ từ hàng vạn con chữ. |
| **Độc giả chân thành** | ⭐ | Các trường hợp còn lại | Người lữ hành lặng lẽ nhưng kiên trì trên con đường chinh phục tri thức. |

---

## 2. Các chỉ số đo lường bổ sung

*   **Trang giấy đã lật:** Tổng số trang của tất cả sách đã mua.
    *   *So sánh:* Được đối chiếu với chiều cao tòa nhà Landmark 81 (461m) để tạo sự bất ngờ.
*   **Mùa đọc sách sôi động nhất:** Tháng có lượng đơn hàng cao nhất.
*   **Cuốn sách mở màn:** Cuốn sách đầu tiên khai xuân cho hành trình đọc sách của khách hàng.
*   **Hành trình đầu tư:** Tổng số tiền đã chi cho việc mua sách trong năm.

---

## 3. Công nghệ & Phân tích

*   **Aggregation Pipeline:** Sử dụng MongoDB để xử lý và phân tích hàng nghìn đơn hàng trong tích tắc.
*   **Email Engine:** Hệ thống template HTML chuyên nghiệp, tương thích tốt trên mobile và các trình duyệt email khắt khe như Outlook/Gmail.

> [!IMPORTANT]
> Việc gán danh hiệu dựa trên **thể loại chiếm tỷ trọng cao nhất** hoặc **tổng số lượng sách**. Điều này đảm bảo mỗi khách hàng đều nhận được một "định danh" phản ánh chính xác nhất gu đọc sách của họ.
