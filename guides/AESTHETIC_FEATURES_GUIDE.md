# Hướng dẫn & Tài liệu: Hệ sinh thái Trải nghiệm Văn học (Aesthetic Features)

Tài liệu này tổng hợp các tính năng nâng cao vừa được phát triển nhằm biến Bookshare từ một trang web thương mại điện tử đơn thuần thành một "Hang trú ẩn" (Cave) - nơi độc giả có thể đắm chìm, chiêm nghiệm và lưu giữ hành trình tri thức của mình.

Đây là những điểm sáng (Selling points) cực kỳ tốt để đưa vào Báo cáo tốt nghiệp phần **Trải nghiệm người dùng (UX) & Cá nhân hóa**.

---

## 1. Kết nối đa phương tiện (The Cross-Media Link)
Nhắm đến tệp khách hàng yêu nghệ thuật, hệ thống sách giờ đây không chỉ giới hạn ở "Chữ" mà còn mở rộng sang "Âm thanh" và "Hình ảnh".

### 1.1. Mood Playlists
- **Mô tả**: Mỗi cuốn sách được đính kèm một danh sách phát nhạc (Spotify/YouTube) phù hợp với "tần số" và tâm trạng của tác phẩm.
- **Ví dụ**: Nhạc cổ điển cho "Lão Hạc", Dark Academia cho tiểu thuyết trinh thám, hoặc Jazz cho văn học lãng mạn.
- **Dữ liệu Database**: Trường `moodPlaylistUrl` trong Model `Book`.

### 1.2. Góc nhìn điện ảnh (Cinematic Viewpoint)
- **Mô tả**: Nếu một cuốn sách đã được chuyển thể thành phim, hệ thống sẽ cung cấp góc nhìn so sánh giữa nguyên tác văn học và nghệ thuật điện ảnh, kèm theo đường dẫn xem trailer.
- **Dữ liệu Database**: Trường `cinemaLink` và `cinemaComparison`.

---

## 2. Nhật ký đọc sách thông minh (AI-Powered Semantic Journal)
Biến chức năng Review nhàm chán thành một cuốn nhật ký phân tích tâm hồn.

### 2.1. Hành trình cảm xúc (Sentiment Mapping)
- **Mô tả**: Tại trang cá nhân, hệ thống tự động quét ngôn từ trong các bài đánh giá (review) của người dùng để chấm điểm cảm xúc (Sentiment Score).
- **Trải nghiệm UX**: Một biểu đồ dao động (Sin wave) sẽ được vẽ ra, phản ánh "dòng chảy cảm xúc" của độc giả qua các mốc thời gian. Cảm xúc tích cực (màu xanh vươn cao), tiêu cực (màu đỏ hạ thấp).

### 2.2. Trích dẫn nghệ thuật (Quote Art)
- **Mô tả**: Tại trang chi tiết sách, những câu nói tâm đắc nhất (`featuredQuote`) được hiển thị dưới dạng một khung Quote nghệ thuật, tối giản. Mở ra tiềm năng cho tính năng "Tạo ảnh trích dẫn" để chia sẻ mạng xã hội.

---

## 3. Lộ trình hành hương (Narrative Goals)
Thay thế những con số thống kê khô khan bằng các danh hiệu mang tính học thuật để khuyến khích việc đọc.

- **Academic Milestones**: Dựa vào phần trăm (%) tiến độ đọc sách trong năm, người dùng sẽ được thăng cấp qua các danh hiệu:
  - Dưới 20%: *Người tập sự tò mò*
  - 20% - 49%: *Kẻ lữ hành văn chương*
  - 50% - 79%: *Nhà phê bình chiều sâu*
  - Trên 80%: *Bậc thầy tri thức*
- **Trải nghiệm UX**: Giao diện mục tiêu đọc sách mang hơi hướng vũ trụ (Cosmic theme), biến việc đọc 10 cuốn sách thành 10 "chặng dừng chân" trong một cuộc viễn chinh tri thức.

---

## 4. Báo cáo "Dấu ấn cá nhân" (Personal Data Storytelling)
Sử dụng dữ liệu hành vi (Behavioral Data) để giúp người dùng hiểu rõ hơn về chính mình.

- **Bản đồ tư duy (Mental Tags / Knowledge Graph)**: Hệ thống tự động phân tích các thể loại sách đã mua (Classic, Fiction, Mystery...) và trích xuất ra các "Từ khóa tâm trí" cốt lõi.
- **Ví dụ**: Người hay đọc sách Trinh thám và Văn học cổ điển sẽ có các tags như: `#Logic`, `#Bí ẩn`, `#Học thuật`, `#Vĩnh cửu`.
- **Trải nghiệm UX**: Hiển thị dưới dạng một hệ sinh thái Tag sinh động trên Dashboard cá nhân.

---

## 💡 Ghi chú dành cho Báo cáo Tốt nghiệp:
Khi trình bày trước hội đồng, bạn nên nhấn mạnh vào:
1. **Sự thấu hiểu tệp khách hàng**: Nhấn mạnh rằng bạn không chỉ code chức năng, mà bạn nghiên cứu tâm lý (Psychology) của nhóm khách hàng tri thức, từ đó thiết kế tính năng phù hợp.
2. **Data-Driven Personalization**: Thể hiện khả năng tận dụng dữ liệu có sẵn (Đơn hàng, Đánh giá, Thể loại) để tái tạo ra những giá trị mới (Cảm xúc, Bản đồ tư duy, Danh hiệu) mà không làm nặng Database.
3. **Mô hình MERN linh hoạt**: Các tính năng phức tạp (phân tích cảm xúc, tính toán tag) được xử lý mượt mà ngay tại Frontend bằng React (`useMemo`), giảm tải đáng kể cho Backend.
