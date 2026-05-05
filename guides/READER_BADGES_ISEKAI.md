# 🎭 Hệ Thống Danh Hiệu Độc Giả: Hành Trình Xuyên Không 2026

Chào mừng bạn đến với hệ thống định danh độc giả mới. Thay vì những cái tên thông thường, chúng ta sẽ đưa độc giả vào một hành trình du hành thời gian dựa trên những trang sách họ đã lật.

## 1. Danh sách Nhân vật Xuyên không (Badges)

| ID | Danh hiệu (Nhân vật) | Biểu tượng | Điều kiện (Logic) | Mô tả cốt truyện |
|:---|:---|:---:|:---|:---|
| **INTELLECTUAL_20TH** | Trí thức tiểu tư sản đầu TK 20 | 🖋️ | Đọc nhiều Văn học VN đầu TK 20 | "Bạn mang tâm thế của những trí thức đầy trăn trở như trong văn Nam Cao, dùng ngòi bút và tri thức để soi rọi những góc khuất của nhân thế." |
| **RENAISSANCE_NOBLE** | Quý tộc thời kỳ Phục hưng | 🏛️ | Đọc nhiều Văn học Cổ điển Thế giới | "Giữa những tòa lâu đài đá và những bữa tiệc xa hoa, bạn là người nắm giữ tinh hoa nghệ thuật và tư tưởng tự do của nhân loại." |
| **BAKER_STREET_DETECTIVE** | Thám tử tư phố Baker | 🔍 | Đọc nhiều Trinh thám / Mystery | "Sương mù London không làm khó được bạn. Với óc quan sát nhạy bén, bạn chính là nỗi khiếp sợ của những kẻ thủ ác trong bóng tối." |
| **GALACTIC_TRAVELER** | Kẻ lữ hành thiên hà | 🚀 | Đọc nhiều Khoa học viễn tưởng (Sci-fi) | "Bạn đã vượt qua giới hạn của thực tại để đặt chân lên những vì sao xa xôi, nơi công nghệ và tri thức không có biên giới." |
| **ANCIENT_SCRIBE** | Sử gia cung đình | 📜 | Đọc nhiều Lịch sử / Non-fiction | "Bạn là người ghi chép lại những thăng trầm của các đế chế, nắm giữ chìa khóa mở ra kho tàng tri thức của hàng ngàn năm trước." |
| **MYSTIC_WIZARD** | Pháp sư huyền thoại | 🪄 | Đọc nhiều Kỳ ảo (Fantasy) | "Thế giới này quá nhỏ bé với bạn. Bạn thuộc về những vùng đất của phép thuật, nơi rồng và những lời nguyền thống trị." |
| **MODERN_ENTREPRENEUR** | Nhà công nghiệp thực dụng | 📈 | Đọc nhiều Kinh doanh / Kỹ năng | "Bạn là người định hình nên thời đại mới, luôn đi trước một bước trong việc biến những ý tưởng táoạo thành hiện thực." |
| **WANDERING_POET** | Thi sĩ giang hồ | 🌸 | Đọc nhiều Tình cảm / Tản văn | "Bạn đi tìm vẻ đẹp trong từng nhành hoa kẽ lá, viết nên những bản tình ca lãng mạn nhất giữa thế giới đầy biến động." |
| **MULTIVERSE_EXPLORER** | Kẻ du hành đa vũ trụ | 🌈 | Đọc trên 5 thể loại khác nhau | "Không dòng thời gian nào có thể giữ chân bạn. Bạn là kẻ lữ hành tự do giữa các thế giới, thu thập tinh hoa từ mọi nền văn minh." |
| **CHRONICLE_KEEPER** | Người giữ đền tri thức | 📚 | Đọc trên 20 cuốn sách/năm | "Bạn không chỉ đọc, bạn đang xây dựng một thư viện vĩnh cửu trong tâm trí, nơi lưu trữ mọi giấc mơ của nhân loại." |

## 2. Quy tắc gán danh hiệu (Logic Cải tiến)

Hệ thống sẽ ưu tiên các thể loại đặc thù trước khi xét đến số lượng:
1. **Ưu tiên 1 (Niche)**: Nếu >35% lượng sách thuộc một thể loại đặc trưng.
2. **Ưu tiên 2 (Volume)**: Nếu đọc >20 cuốn -> `CHRONICLE_KEEPER`.
3. **Ưu tiên 3 (Diversity)**: Nếu đọc >5 thể loại -> `MULTIVERSE_EXPLORER`.
4. **Mặc định**: `ANCIENT_SCRIBE` (Người mới bắt đầu hành trình).
