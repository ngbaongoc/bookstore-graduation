import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import getBaseUrl from '../../utils/baseURL';

// ─── Template definitions ─────────────────────────────────────────────────────
// Each template that needs personalisation will be fetched from the backend.
// Static templates are rendered directly on the client.

const SITE_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const API_URL = import.meta.env.VITE_BACKEND_URL || '${API_URL}';

const STATIC_TEMPLATES = {


    winback: {
        label: "☕ Win-Back (At Risk / Can't Lose)",
        subject: "Chúng tôi nhớ bạn (và những cuốn sách cũng vậy) ☕",
        segments: ["At Risk", "Can't Lose Them", "Hibernating"],
        buildHtml: (username, genre) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#922b21,#7d6608);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f9ebea;font-family:sans-serif;">BookShare · Chúng Tôi Nhớ Bạn</p>
    <h1 style="margin:16px 0 8px;font-size:30px;color:#fff;">Đã lâu rồi... ☕</h1>
    <p style="margin:0;color:#f9ebea;font-size:15px;font-style:italic;">Kệ sách của bạn vẫn đang chờ đợi.</p>
  </div>
  <div style="padding:32px 30px;background:#16213e;">
    <p style="font-size:16px;color:#a9cce3;">Chào <strong style="color:#fff;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#a9cce3;line-height:1.8;">Đã khá lâu rồi chúng tôi không thấy bạn ghé thăm. Cuộc sống bận rộn là điều không tránh khỏi, nhưng chúng tôi luôn mong được đón bạn trở lại.</p>
    <p style="font-size:15px;color:#a9cce3;line-height:1.8;">Gần đây chúng tôi vừa nhập về nhiều tựa sách mới tuyệt vời trong lĩnh vực <strong style="color:#f9e79f;">${genre || 'thể loại bạn yêu thích'}</strong> mà chúng tôi tin chắc bạn sẽ mê ngay.</p>
    <div style="background:#0d3b63;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a9cce3;text-transform:uppercase;letter-spacing:2px;font-family:sans-serif;">Quà Chào Đón Bạn Trở Lại</p>
      <h2 style="margin:12px 0;font-size:36px;color:#f9e79f;font-family:'Courier New',monospace;letter-spacing:4px;">COMEBACK30</h2>
      <p style="margin:0;font-size:15px;font-weight:bold;color:#82e0aa;">GIẢM 30% — DÀNH RIÊNG CHO BẠN</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#922b21,#7d6608);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;">Quay Lại &amp; Tiết Kiệm 30% →</a>
    </div>
  </div>
  <div style="background:#0f0f1a;padding:16px;text-align:center;font-size:12px;color:#4a4a6a;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Gửi đến một độc giả mà chúng tôi trân trọng.</p>
  </div>
</div>`,
    },

    new_reader: {
        label: "📚 Chào Mừng Độc Giả Mới",
        subject: "Hành trình đọc sách của bạn bắt đầu từ đây! 📚",
        segments: ["New Customers", "Potential Loyalist", "Promising"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a5276,#6c3483);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d7bde2;font-family:sans-serif;">BookShare · Chào Mừng</p>
    <h1 style="margin:16px 0 8px;font-size:30px;color:#fff;">Câu Chuyện Của Bạn Bắt Đầu Từ Đây 📚</h1>
    <p style="margin:0;color:#d7bde2;font-size:15px;font-style:italic;">Chúng tôi có cảm giác bạn sẽ sớm trở thành một độc giả quen thuộc.</p>
  </div>
  <div style="padding:32px 30px;background:#16213e;">
    <p style="font-size:16px;color:#a9cce3;">Chào <strong style="color:#fff;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#a9cce3;line-height:1.8;">Hy vọng bạn đã hài lòng với đơn hàng vừa rồi! Những độc giả bắt đầu hành trình giống như bạn đã khám phá ra vô số cuốn sách thú vị sau đó.</p>
    <p style="font-size:15px;color:#a9cce3;line-height:1.8;">Chúng tôi đã tuyển chọn riêng một số gợi ý phù hợp với bạn. Và vì bạn mới bắt đầu cùng chúng tôi:</p>
    <div style="background:#0d3b63;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a9cce3;text-transform:uppercase;letter-spacing:2px;font-family:sans-serif;">Miễn Phí Vận Chuyển Cho Đơn Hàng Tiếp Theo</p>
      <h2 style="margin:12px 0;font-size:36px;color:#f9e79f;font-family:'Courier New',monospace;letter-spacing:4px;">CHAPTER2</h2>
      <p style="margin:0;font-size:14px;color:#a9cce3;">Nhập mã khi thanh toán — không giới hạn giá trị đơn hàng</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#1a5276,#6c3483);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;"> Dùng Ngay Voucher →</a>
    </div>
  </div>
  <div style="background:#0f0f1a;padding:16px;text-align:center;font-size:12px;color:#4a4a6a;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Gửi đến một độc giả mà chúng tôi rất vui được làm quen.</p>
  </div>
</div>`,
    },


    loyalty_voucher: {
        label: "💌 Loyalty Voucher",
        subject: "Món quà đặc biệt từ Bookstore - Giảm giá 20% cho bạn!",
        segments: ["Loyal Customers"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#eee;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#c0392b,#7b241c);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f2d7d5;font-family:sans-serif;">BookShare · Ưu Đãi Đặc Biệt</p>
    <h1 style="margin:16px 0 8px;font-size:30px;color:#fff;">Món Quà Dành Riêng Cho Bạn 💌</h1>
    <p style="margin:0;color:#f2d7d5;font-size:15px;font-style:italic;">Cảm ơn bạn đã luôn đồng hành cùng chúng tôi.</p>
  </div>
  <div style="padding:32px 30px;background:#16213e;">
    <p style="font-size:16px;color:#a9cce3;">Chào <strong style="color:#fff;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#a9cce3;line-height:1.8;">Để tri ân sự ủng hộ không ngừng của bạn, chúng tôi gửi tặng bạn một mã giảm giá đặc biệt để bạn có thể tiếp tục hành trình khám phá những cuốn sách tuyệt vời.</p>
    <div style="background:#0d3b63;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a9cce3;text-transform:uppercase;letter-spacing:2px;font-family:sans-serif;">Mã Giảm Giá Của Bạn</p>
      <h2 style="margin:12px 0;font-size:36px;color:#f9e79f;font-family:'Courier New',monospace;letter-spacing:4px;">LOYALTY20</h2>
      <p style="margin:0;font-size:15px;font-weight:bold;color:#82e0aa;">GIẢM 20% CHO ĐƠN HÀNG TIẾP THEO</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#c0392b,#7b241c);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;">Sử Dụng Mã Ngay →</a>
    </div>
  </div>
  <div style="background:#0f0f1a;padding:16px;text-align:center;font-size:12px;color:#4a4a6a;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Dành riêng cho khách hàng thân thiết.</p>
  </div>
</div>`,
    },

    post_war_europe: {
        label: "🌍 Châu Âu Hậu Chiến",
        subject: "Đâu là những cuốn sách phản chiếu châu Âu thời hậu chiến? 🕰️",
        segments: ["All"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdfbf7;color:#333;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
  <div style="background:linear-gradient(135deg,#2c3e50,#1a252f);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#bdc3c7;font-family:sans-serif;">BookShare · Lịch Sử & Văn Học</p>
    <h1 style="margin:16px 0 8px;font-size:28px;color:#fff;">Châu Âu Thời Hậu Chiến 🌍</h1>
    <p style="margin:0;color:#bdc3c7;font-size:15px;font-style:italic;">Những mảnh vỡ, ký ức và sự tái sinh.</p>
  </div>
  <div style="padding:32px 30px;background:#fff;">
    <p style="font-size:16px;color:#555;">Chào <strong style="color:#2c3e50;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Thế chiến thứ hai kết thúc để lại một châu Âu hoang tàn, chia cắt và đầy rẫy những câu hỏi về nhân tính. Mảnh đất này đã trở thành nguồn cảm hứng vô tận cho các nhà văn, nơi họ soi chiếu nỗi đau, sự phân chia ý thức hệ và nỗ lực hàn gắn của con người.</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Dưới đây là 5 tác phẩm kinh điển phản chiếu rõ nét diện mạo chính trị và tâm lý của châu Âu thời hậu chiến:</p>
    
    <div style="margin:25px 0;padding:20px;border-left:4px solid #2c3e50;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#2c3e50;">1. 1984 - George Orwell</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=eTY9EAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Cuộc sống ngột ngạt của nhân viên mẫn cán Winston Smith dưới ách cai trị tuyệt đối của "Anh Cả" (Big Brother) và Đảng ở một quốc gia viễn tưởng. Mọi suy nghĩ, hành động và cả lịch sử đều bị giám sát và kiểm soát gắt gao bởi Cảnh sát Tư tưởng.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Viết vào năm 1949, ngay sau Thế chiến II, tác phẩm là tấm gương chân thực phản chiếu nỗi sợ hãi tột cùng về sự trỗi dậy của chủ nghĩa toàn trị ở Đông Âu. Nó báo hiệu sự bắt đầu của Chiến tranh Lạnh, phơi bày viễn cảnh tàn nhẫn khi sự thật bị bóp méo, quyền tự do bị tước đoạt và con người trở thành công cụ chính trị.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f219e2c9d6ae16e8dd2f39" style="color:#2980b9;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #2c3e50;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#2c3e50;">2. Cái Trống Thiếc (The Tin Drum) - Günter Grass</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="${API_URL}/uploads/1777705372914-cai-trong-thiec_859bbcb9c2574bd7a5b89ebd56c6dac7_grande.png" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Cậu bé Oskar Matzerath, người đã tự ném mình xuống cầu thang để ngừng lớn lên ở tuổi lên ba. Bằng lăng kính trẻ thơ nhưng vô cùng sắc sảo cùng chiếc trống thiếc trên tay, Oskar từ chối tham gia vào thế giới người lớn đầy dối trá.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Tác phẩm là một bản cáo trạng đanh thép và đầy tính biểu tượng đối với nước Đức. Bối cảnh diễn ra tại Danzig, nó bóc trần sự tàn ác, tư tưởng phát xít, sự hèn nhát và đồng lõa của một bộ phận người dân trước thềm Đệ tam Đế chế. Cuốn sách bắt xã hội Đức hậu chiến phải đối mặt với lương tâm thối rữa và tội lỗi lịch sử mà họ đang cố gắng lãng quên.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f219e2c9d6ae16e8dd2f3c" style="color:#2980b9;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #2c3e50;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#2c3e50;">3. Người Đọc (The Reader) - Bernhard Schlink</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=mt7kngGJdzsC&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Mối tình ám ảnh giữa cậu học sinh Michael Berg và người phụ nữ lớn tuổi Hanna Schmitz. Nhiều năm sau, khi là sinh viên luật, Michael bàng hoàng gặp lại Hanna tại tòa án, phát hiện ra người tình cũ từng là nữ cai ngục tàn nhẫn tại trại tập trung Auschwitz của Đức Quốc xã.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Tác phẩm khắc họa sâu sắc bi kịch của thế hệ thanh niên Đức sinh ra sau chiến tranh (thế hệ thứ hai). Họ bị mắc kẹt trong sự giằng xé giữa tình yêu thương đối với thế hệ cha ông và nghĩa vụ đạo đức phải phán xét, kết án những tội ác tày trời mà thế hệ đi trước đã gây ra đối với nhân loại.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f219e2c9d6ae16e8dd2f3f" style="color:#2980b9;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #2c3e50;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#2c3e50;">4. Austerlitz - W.G. Sebald</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=Q_rLDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Hành trình của Jacques Austerlitz, một giáo sư sống ở Anh, người đang cố gắng chắp vá lại danh tính thực sự của mình. Ông vốn là một đứa trẻ Do Thái thoát khỏi vòng tay Phát xít Đức qua chiến dịch Kindertransport và lớn lên mà không có chút ký ức nào về cội nguồn.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Cuốn sách mổ xẻ sự mất mát của ký ức cá nhân và tập thể tại châu Âu. Qua kiến trúc tĩnh lặng của các nhà ga và pháo đài, nó phản chiếu sự tàn phá ngầm của Holocaust—không chỉ là việc cướp đi sinh mạng, mà còn là việc xóa sổ lịch sử, gốc gác và để lại một vết thương vĩnh viễn ám ảnh lục địa già.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f219e2c9d6ae16e8dd2f42" style="color:#2980b9;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #2c3e50;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#2c3e50;">5. Tàn Ngày Để Lại (The Remains of the Day) - Kazuo Ishiguro</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://covers.openlibrary.org/b/isbn/9780679731726-L.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Chuyến du ngoạn của ông Stevens, một quản gia mẫu mực người Anh, diễn ra vào năm 1956. Trong suốt chuyến đi, ông hồi tưởng lại những năm tháng phục vụ tại Darlington Hall và nhận ra rằng sự cống hiến mù quáng của mình đã dành cho một vị Lãnh chúa có tư tưởng ủng hộ Phát xít trước Thế chiến.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Mặc dù bối cảnh ở Anh, nhưng nó phản ánh sự thay đổi chóng mặt của xã hội châu Âu nói chung. Tác phẩm bóc trần sự ngây thơ, mù quáng về mặt chính trị của giới quý tộc cũ, đồng thời đánh dấu sự sụp đổ của một đế chế, sự tàn lụi của hệ thống giai cấp và những ảo tưởng vỡ vụn của nước Anh sau chiến tranh.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f219e3c9d6ae16e8dd2f45" style="color:#2980b9;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="text-align:center;margin-top:35px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#5d4037,#3e2723);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;">Khám Phá Ngay →</a>
    </div>

   
  </div>
  <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#888;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Những câu chuyện thay đổi thế giới.</p>
  </div>
</div>`,
    },

    vietnamese_lit_20th: {
        label: "🇻🇳 Văn Học VN Thế Kỉ 20",
        subject: "Văn học Việt Nam thế kỷ 20 - Khi loạt trường phái giao thoa giữa Tây và Ta lên ngôi ✒️",
        segments: ["All"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdfbf7;color:#333;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
  <div style="background:linear-gradient(135deg,#5d4037,#3e2723);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d7ccc8;font-family:sans-serif;">BookShare · Văn Học Nước Nhà</p>
    <h1 style="margin:16px 0 8px;font-size:28px;color:#fff;line-height:1.4;">Văn học Việt Nam Thế Kỉ 20 ✒️</h1>
    <p style="margin:0;color:#d7ccc8;font-size:15px;font-style:italic;">Sự giao thoa rực rỡ giữa văn hóa Tây và Ta.</p>
  </div>
  <div style="padding:32px 30px;background:#fff;">
    <p style="font-size:16px;color:#555;">Chào <strong style="color:#5d4037;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Thế kỷ 20 là một giai đoạn đầy biến động nhưng cũng là "thời kỳ vàng son" của văn học Việt Nam. Đó là lúc những luồng tư tưởng mới mẻ từ phương Tây ồ ạt tràn vào, va đập mãnh liệt với nền tảng Nho giáo phương Đông. Sự giao thoa và xung đột ấy đã sinh ra một loạt các trường phái văn học rực rỡ: từ lãng mạn, hiện thực phê phán đến trào phúng sắc sảo.</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Dưới đây là 5 tuyệt tác vượt thời gian, là kết tinh của những tâm hồn lớn thời bấy giờ:</p>
    
    <div style="margin:25px 0;padding:20px;border-left:4px solid #5d4037;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5d4037;">1. Số Đỏ - Vũ Trọng Phụng</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://salt.tikicdn.com/cache/750x750/ts/product/6a/14/f8/efe8171950a0fbe2c5a1b5f4d6ff8744.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Sự đổi đời đến chóng mặt của Xuân Tóc Đỏ, từ một kẻ hạ lưu nhặt banh quần vợt trở thành bậc "vĩ nhân" trong giới thượng lưu nhờ vào sự bát nháo của phong trào "Âu hóa".</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Tiếng cười trào phúng cay độc nhắm vào một xã hội thành thị nửa vời, lố lăng, nơi đồng tiền và những giá trị Tây học bị bóp méo che mờ đi nhân tính.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f21db1739078e6230e6b5a" style="color:#8d6e63;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #5d4037;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5d4037;">2. Vang Bóng Một Thời - Nguyễn Tuân</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=RU0LCKHoaMAC&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Những thú chơi tao nhã như uống trà, viết câu đối, chơi chữ của các nhà Nho tài hoa nhưng sinh bất phùng thời, đang dần bị lãng quên.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Khát khao vươn tới cái "Đẹp" tuyệt đích và nỗi hoài niệm sâu sắc về những giá trị truyền thống cổ truyền dân tộc đang bị xô ngã bởi văn minh vật chất phương Tây.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f21db2739078e6230e6b5d" style="color:#8d6e63;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #5d4037;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5d4037;">3. Thơ Thơ - Xuân Diệu</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://salt.tikicdn.com/cache/750x750/ts/product/87/d2/39/d1d0f34ceddd02926bb93a560c864c1d.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Những vần thơ rạo rực, đắm say, ngập tràn khao khát yêu đương và giao cảm mãnh liệt với sự sống, với mùa xuân.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Sự trỗi dậy mạnh mẽ của cái "Tôi" cá nhân (ảnh hưởng từ thơ ca lãng mạn Pháp), đập vỡ lớp vỏ bọc khuôn thước, ước lệ của cái "Ta" trong thơ cũ phương Đông.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f21db2739078e6230e6b60" style="color:#8d6e63;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #5d4037;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5d4037;">4. Chí Phèo - Nam Cao</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://salt.tikicdn.com/cache/750x750/media/catalog/product/c/h/chi-pheo.u5465.d20170929.t175925.141730.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Tấn bi kịch của một người nông dân lương thiện bị nhà tù thực dân và bọn cường hào ác bá đẩy vào con đường tha hóa, lưu manh hóa.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Chủ nghĩa hiện thực phê phán đỉnh cao, lên án sâu sắc xã hội phong kiến nửa thuộc địa thối nát đã tước đoạt cả nhân hình lẫn nhân tính của con người.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f21db2739078e6230e6b63" style="color:#8d6e63;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #5d4037;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5d4037;">5. Gió Đầu Mùa - Thạch Lam</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="${API_URL}/uploads/1777705052684-giodaumua.jpg.webp" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Kể về:</strong> Những mảnh đời bình dị, những kiếp người nghèo khổ nhỏ bé nhưng luôn ánh lên tình người ấm áp và những rung động tinh tế.</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;"><strong>Phản chiếu:</strong> Một luồng gió lãng mạn nhẹ nhàng, sâu lắng, mang đậm chất thơ, hòa quyện giữa kỹ thuật phân tích tâm lý phương Tây và tâm hồn nhạy cảm phương Đông.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f21db2739078e6230e6b66" style="color:#8d6e63;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="text-align:center;margin-top:35px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#5d4037,#3e2723);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;">Khám Phá Ngay →</a>
    </div>
  </div>
  <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#888;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Tôn vinh tinh hoa văn học Việt.</p>
  </div>
</div>`,
    },

    nguyen_huy_thiep: {
        label: "🖋️ Nghệ thuật Nguyễn Huy Thiệp",
        subject: "Đọc gì để tìm hiểu thủ pháp viết của Nguyễn Huy Thiệp - Bậc thầy nghệ thuật truyện ngắn? 🖋️",
        segments: ["All"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdfbf7;color:#333;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
  <div style="background:linear-gradient(135deg,#37474f,#263238);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#cfd8dc;font-family:sans-serif;">BookShare · Tác Giả & Tác Phẩm</p>
    <h1 style="margin:16px 0 8px;font-size:28px;color:#fff;line-height:1.4;">Bậc Thầy Truyện Ngắn<br>Nguyễn Huy Thiệp 🖋️</h1>
    <p style="margin:0;color:#cfd8dc;font-size:15px;font-style:italic;">Giải phẫu thực tại bằng ngòi bút lạnh lùng.</p>
  </div>
  <div style="padding:32px 30px;background:#fff;">
    <p style="font-size:16px;color:#555;">Chào <strong style="color:#37474f;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Nếu phải gọi tên một nhà văn làm khuynh đảo văn đàn Việt Nam giai đoạn Đổi mới, đó chắc chắn là Nguyễn Huy Thiệp. Hiện tượng Nguyễn Huy Thiệp không chỉ nằm ở nội dung gây sốc mà còn ở <strong>thủ pháp nghệ thuật độc đáo</strong>: trần thuật khách quan lạnh lùng, ngôn ngữ đối thoại góc cạnh, và kĩ thuật "giải thiêng" đập vỡ mọi tượng đài.</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Để hiểu được nghệ thuật viết của ông, đây là 5 tác phẩm bạn không thể bỏ qua:</p>
    
    <div style="margin:25px 0;padding:20px;border-left:4px solid #37474f;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#37474f;">1. Tướng Về Hưu</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://salt.tikicdn.com/cache/750x750/ts/product/65/2b/00/698ca1747f659a9188fe30705a02cb0d.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Thủ pháp tiêu biểu: Đỉnh cao của lối viết trần trụi và đối thoại gãy gọn.</strong></p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;">Câu chuyện về sự bơ vơ của một vị tướng giữa thời bình. Nguyễn Huy Thiệp đã triệt tiêu sự lãng mạn, dùng ngôn từ sắc như dao mổ để bóc trần những giá trị đạo đức đang băng hoại trước đồng tiền.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f221fba82f17bd1a2559b0" style="color:#546e7a;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #37474f;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#37474f;">2. Những Ngọn Gió Hua Tát</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=57C5AAAAIAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Thủ pháp tiêu biểu: Huyền thoại hóa và tính nhị nguyên.</strong></p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;">10 câu chuyện đan xen giữa thực và ảo. Ông sử dụng màu sắc huyền thoại để mổ xẻ phần "con" và phần "người" trong bản tính nhân loại trước thiên nhiên hoang dã miền sơn cước.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f221fba82f17bd1a2559b3" style="color:#546e7a;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #37474f;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#37474f;">3. Chảy Đi Sông Ơi</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://salt.tikicdn.com/cache/750x750/ts/product/e1/47/70/b6ef380b99faef7eab9fddeb16d2846d.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Thủ pháp tiêu biểu: Tính biểu tượng và triết lý phương Đông.</strong></p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;">Dòng sông trở thành nhân vật chứng nhân vô ngôn. Sự tàn nhẫn được bọc trong một giọng văn có chất thơ u hoài, một sự kết hợp nghịch lý tạo ra sức ám ảnh sâu sắc về kiếp nhân sinh.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f221fba82f17bd1a2559b6" style="color:#546e7a;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #37474f;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#37474f;">4. Vàng Lửa</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="https://books.google.com/books/content?id=-1ItAQAAIAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Thủ pháp tiêu biểu: "Giải thiêng lịch sử" (Deconstruction).</strong></p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;">Phá bỏ hoàn toàn lối kể chuyện tụng ca truyền thống. Tác giả hạ bệ các hình tượng lịch sử xuống mức phàm tục, đa chiều, buộc người đọc phải hoài nghi và thoát khỏi hệ quy chiếu cũ.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f221fba82f17bd1a2559b9" style="color:#546e7a;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #37474f;background:#f9f9f9;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#37474f;">5. Tuổi 20 Yêu Dấu</h3>
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:15px;">
        <img src="${API_URL}/uploads/1777705236814-tuoi-20-yeu-dau-_92375_1.jpg" style="width:110px;height:auto;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.1);flex-shrink:0;">
        <div>
          <p style="margin:-6px 0 8px;font-size:14px;color:#666;line-height:1.4;text-align:justify;"><strong style="color:#333;">Thủ pháp tiêu biểu:</strong> Sử dụng khẩu ngữ đường phố và xây dựng hình tượng "phản anh hùng".</p>
          <p style="margin:0;font-size:14px;color:#666;line-height:1.6;text-align:justify;">Quyển tiểu thuyết xoáy sâu vào hố đen của tuổi trẻ tha hóa đô thị. Ngôn từ lấm láp, trực diện đến mức thô ráp, lột trần những cơn khủng hoảng hiện sinh của xã hội hiện đại.</p>
        </div>
      </div>
      <div style="margin-top:12px;"><a href="${SITE_URL}/books/69f221fba82f17bd1a2559bc" style="color:#546e7a;text-decoration:none;font-weight:bold;font-size:14px;">Xem và đặt mua tác phẩm &rarr;</a></div>
    </div>

    <div style="text-align:center;margin-top:35px;">
      <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#37474f,#263238);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;">Khám Phá Ngay →</a>
    </div>
  </div>
  <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#888;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Góc Nhìn Văn Học.</p>
  </div>
</div>`,
    },

    doctor_zhivago: {
        label: "🕵️ Bác sĩ Zhivago & CIA",
        subject: "Bác sĩ Zhivago - Cuốn sách từng là vũ khí để CIA tấn công Liên Xô 🕵️‍♂️",
        segments: ["All"],
        buildHtml: (username) => `
<div style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fdfbf7;color:#333;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
  <div style="background:linear-gradient(135deg,#8e44ad,#2c3e50);padding:40px 30px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d2b4de;font-family:sans-serif;">BookShare · Hồ Sơ Tuyệt Mật</p>
    <h1 style="margin:16px 0 8px;font-size:28px;color:#fff;line-height:1.4;">Bác Sĩ Zhivago 🕵️‍♂️</h1>
    <img src="https://books.google.com/books/content?id=0QRqVxRSIVQC&printsec=frontcover&img=1&zoom=1&source=gbs_api" style="width:160px;height:auto;margin:15px auto;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.3);display:block;">
    <p style="margin:0;color:#d2b4de;font-size:15px;font-style:italic;">Khi văn chương trở thành vũ khí tình báo.</p>
  </div>
  <div style="padding:32px 30px;background:#fff;">
    <p style="font-size:16px;color:#555;">Chào <strong style="color:#8e44ad;">${username || 'bạn'}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Bạn có tin rằng một cuốn tiểu thuyết tình yêu lại có thể trở thành vũ khí đáng gờm nhất của CIA trong cuộc Chiến tranh Lạnh? Đó chính là câu chuyện có thật đằng sau kiệt tác <strong>Bác sĩ Zhivago</strong> của văn hào Boris Pasternak.</p>
    <p style="font-size:15px;color:#555;line-height:1.8;">Trong bản tin hôm nay, hãy cùng chúng tôi lật lại hồ sơ tuyệt mật để hiểu vì sao cuốn sách này lại làm rung chuyển thế giới:</p>
    
    <div style="margin:25px 0;padding:20px;border-left:4px solid #8e44ad;background:#f9f9f9;">
      <h3 style="margin:0 0 10px;font-size:18px;color:#8e44ad;">1. Bản Thảo Bị Cấm Đoán</h3>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">Lấy bối cảnh Cách mạng tháng Mười và Nội chiến Nga, tác phẩm đề cao sự tự do cá nhân và giá trị con người hơn là lợi ích của tập thể hay nhà nước. Chính vì lập trường hoài nghi cách mạng này, cuốn sách đã bị chính quyền Liên Xô cấm xuất bản trong nước.</p>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #8e44ad;background:#f9f9f9;">
      <h3 style="margin:0 0 10px;font-size:18px;color:#8e44ad;">2. Chiến Dịch Tình Báo Của CIA</h3>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">Nhận thấy Bác sĩ Zhivago là một "vũ khí tư tưởng" hoàn hảo, CIA đã dàn xếp một chiến dịch bí mật trị giá hàng triệu đô la. Họ bí mật in ấn hàng nghìn bản sách bìa mềm bằng tiếng Nga tại một nhà in ở Hà Lan, sau đó lén lút phân phát cho các công dân Liên Xô tới tham dự Hội chợ Thế giới năm 1958 tại Brussels.</p>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #8e44ad;background:#f9f9f9;">
      <h3 style="margin:0 0 10px;font-size:18px;color:#8e44ad;">3. Cú Sốc Bật Ngược (Blowback)</h3>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">Cuốn sách được người dân bí mật chuyền tay nhau đọc, xé từng trang để lan truyền trong nước. Sự lan tỏa của Bác sĩ Zhivago đã tạo ra một làn sóng ngầm mạnh mẽ, đánh dấu một chiến thắng vang dội của văn hóa và tự do ngôn luận trước sức mạnh chính trị.</p>
    </div>

    <div style="margin:25px 0;padding:20px;border-left:4px solid #8e44ad;background:#f9f9f9;">
      <h3 style="margin:0 0 10px;font-size:18px;color:#8e44ad;">4. Giải Nobel Của Nước Mắt</h3>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">Boris Pasternak được trao giải Nobel Văn học năm 1958. Đáng buồn thay, dưới áp lực chính trị khổng lồ, ông đã buộc phải từ chối giải thưởng danh giá này để bảo vệ bản thân và những người thân yêu.</p>
    </div>

    <div style="margin:30px 0 20px;padding:20px;background:#f4ecf7;border-radius:8px;text-align:center;">
      <h3 style="margin:0 0 15px;font-size:18px;color:#5b2c6f;">Trải Nghiệm Kiệt Tác Bác Sĩ Zhivago</h3>
      <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">Hãy tự mình đọc và cảm nhận sức mạnh của một tác phẩm nghệ thuật từng khiến cả một cường quốc phải e sợ.</p>
      <a href="${SITE_URL}/books/69f22543bc16acd554b83149" style="display:inline-block;background:linear-gradient(135deg,#8e44ad,#5b2c6f);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:bold;font-family:sans-serif;box-shadow:0 4px 6px rgba(0,0,0,0.1);">Xem và đặt mua tác phẩm &rarr;</a>
    </div>

  </div>
  <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:12px;color:#888;font-family:sans-serif;">
    <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Sức mạnh của ngôn từ.</p>
  </div>
</div>`,
    },
};

const ComposeEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [sending, setSending] = useState(false);

    // Template panel state
    const [showTemplates, setShowTemplates] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Preview mode — renders html in an iframe so links are clickable
    const [previewMode, setPreviewMode] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');

    // Drip Campaign Builder State
    const [showSeriesBuilder, setShowSeriesBuilder] = useState(false);
    const [seriesSteps, setSeriesSteps] = useState([{ id: Date.now(), templateKey: '', delayDays: 0 }]);

    const togglePreview = () => {
        if (!previewMode) {
            // Snapshot current editor content into the iframe
            setPreviewHtml(editorRef.current?.innerHTML || '');
        }
        setPreviewMode(v => !v);
    };

    // Data passed from ManageUsers
    const { email, subject: initSubject, body, userId, segment, username, openSeriesBuilder, bulkRecipients } = location.state || {};

    useEffect(() => {
        if (location.state) {
            setTo(email || '');
            setSubject(initSubject || '');
            if (editorRef.current && body) {
                editorRef.current.innerHTML = body.replace(/\n/g, '<br/>');
            }
            if (openSeriesBuilder) {
                setShowSeriesBuilder(true);
            }
        }
    }, [location.state]);

    // ── Apply a static template ──────────────────────────────────────────────
    const applyStaticTemplate = (templateKey) => {
        const tpl = STATIC_TEMPLATES[templateKey];
        if (!tpl) return;
        setSubject(tpl.subject);
        const genre = ''; // could pass from location.state.favoriteGenre if available
        const html = tpl.buildHtml(username || '', genre);
        if (editorRef.current) editorRef.current.innerHTML = html;
        setShowTemplates(false);
    };

    // ── Fetch Reader's Wrapped template from backend ─────────────────────────
    const applyWrappedTemplate = async () => {
        if (!userId) {
            Swal.fire({ title: 'Cannot Load Template', text: 'No userId available for this user. Please navigate from Manage Users.', icon: 'warning', confirmButtonColor: '#6c3483' });
            return;
        }
        setLoadingTemplate(true);
        try {
            const res = await axios.get(`${getBaseUrl()}/api/admin/wrapped-preview/${userId}`);
            const { html, stats } = res.data;
            setSubject(`Your ${stats.year} Reader's Wrapped is Here 📖`);
            if (editorRef.current) editorRef.current.innerHTML = html;
            setShowTemplates(false);
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not generate the Wrapped template. The user may not have any delivered orders this year.';
            Swal.fire({ title: 'Template Unavailable', text: msg, icon: 'info', confirmButtonColor: '#6c3483' });
        } finally {
            setLoadingTemplate(false);
        }
    };





    // ── Send Custom Drip Campaign Series ─────────────────────────────────────
    const handleSendSeries = async () => {
        if (!to) return Swal.fire({ title: 'Error', text: 'Recipient email is missing', icon: 'warning' });
        
        const invalidStep = seriesSteps.find(s => !s.templateKey);
        if (invalidStep) return Swal.fire({ title: 'Error', text: 'Please select a template for all steps', icon: 'warning' });

        setSending(true);
        try {
            let successCount = 0;

            // If bulkRecipients is available, send personalized email to each user
            // Otherwise, fall back to sending once to the single "to" address
            const recipients = (bulkRecipients && bulkRecipients.length > 0)
                ? bulkRecipients
                : [{ email: to, username: username || '' }];

            for (const step of seriesSteps) {
                const tpl = STATIC_TEMPLATES[step.templateKey];
                if (!tpl) continue;

                const sendDate = step.delayDays > 0 ? new Date() : null;
                if (sendDate) sendDate.setDate(sendDate.getDate() + parseInt(step.delayDays));

                for (const recipient of recipients) {
                    const html = tpl.buildHtml(recipient.username || '', '');
                    const payload = {
                        to: recipient.email,
                        subject: tpl.subject,
                        html,
                    };
                    if (sendDate) payload.scheduledAt = sendDate.toISOString();

                    await axios.post(`${getBaseUrl()}/api/admin/send-email`, payload);
                    successCount++;
                }
            }
            
            Swal.fire({ title: 'Series Scheduled!', text: `Đã lên lịch thành công ${successCount} email.`, icon: 'success', confirmButtonColor: '#10b981' });
            setShowSeriesBuilder(false);
            setSeriesSteps([{ id: Date.now(), templateKey: '', delayDays: 0 }]);
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Failed to schedule some emails in the series.', icon: 'error' });
        } finally {
            setSending(false);
        }
    };

    // ── Send / Schedule ──────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        const finalHtml = editorRef.current.innerHTML;
        if (!finalHtml.trim() || finalHtml === '<br>') {
            return Swal.fire({ title: 'Error', text: 'Email body cannot be empty', icon: 'warning', confirmButtonColor: '#3b82f6' });
        }
        setSending(true);
        try {
            const payload = { to, subject, html: finalHtml };
            if (scheduledAt) {
                const parsed = new Date(scheduledAt);
                if (parsed <= new Date()) {
                    setSending(false);
                    return Swal.fire({ title: 'Error', text: 'Scheduled time must be in the future', icon: 'warning', confirmButtonColor: '#3b82f6' });
                }
                payload.scheduledAt = parsed.toISOString();
            }
            await axios.post(`${getBaseUrl()}/api/admin/send-email`, payload);
            const formattedTime = scheduledAt ? new Date(scheduledAt).toLocaleString('vi-VN') : '';
            Swal.fire({
                title: scheduledAt ? 'Email Scheduled!' : 'Email Sent!',
                text: scheduledAt ? `Email to ${to} scheduled for ${formattedTime}.` : `Email has been sent to ${to} successfully.`,
                icon: 'success',
                confirmButtonColor: '#3b82f6',
            }).then(() => navigate('/admin/manage-users'));
        } catch (error) {
            Swal.fire({ title: 'Failed to Send', text: error.response?.data?.message || 'Something went wrong.', icon: 'error', confirmButtonColor: '#3b82f6' });
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                editorRef.current.focus();
                const imgHtml = `<img src="${event.target.result}" style="max-width:100%;height:auto;display:block;margin:10px 0;" alt="inserted image" />`;
                document.execCommand('insertHTML', false, imgHtml);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
    };

    // Determine which templates are most relevant for this user's segment
    const relevantTemplates = Object.entries(STATIC_TEMPLATES).filter(([, tpl]) =>
        !segment || tpl.segments.includes(segment)
    );
    const isChampionOrLoyal = true; // Allowed for all now
    const isNeedsAttentionOrSleep = true; // Allowed for all now

    return (
        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-150px)] max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Compose Email</h2>
                    {segment && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            Sending to: <span className="font-medium text-gray-700">{username}</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">{segment}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={() => navigate('/admin/manage-users')}
                    className="text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm border border-gray-200 px-4 py-2 rounded-lg"
                >
                    Back to Users
                </button>
            </div>

            {/* ── Templates Panel ── */}
            <div className="mb-5 flex gap-4">
                <button
                    type="button"
                    onClick={() => { setShowTemplates(v => !v); setShowSeriesBuilder(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold border px-4 py-2.5 rounded-lg transition-colors ${showTemplates ? 'text-white bg-purple-600 border-purple-600' : 'text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100'}`}
                >
                    ✨ Single Template
                </button>
                <button
                    type="button"
                    onClick={() => { setShowSeriesBuilder(v => !v); setShowTemplates(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold border px-4 py-2.5 rounded-lg transition-colors ${showSeriesBuilder ? 'text-white bg-blue-600 border-blue-600' : 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100'}`}
                >
                    🛠️ Build Email Series
                </button>
            </div>

            {/* Custom Series Builder UI */}
            {showSeriesBuilder && (
                <div className="mb-5 p-5 border border-blue-100 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <p className="text-sm font-bold text-blue-800 mb-4">Drip Campaign Builder</p>
                    <div className="space-y-4">
                        {seriesSteps.map((step, index) => (
                            <div key={step.id} className="flex flex-col md:flex-row gap-3 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Step {index + 1} Template</label>
                                    <select
                                        value={step.templateKey}
                                        onChange={(e) => setSeriesSteps(seriesSteps.map(s => s.id === step.id ? { ...s, templateKey: e.target.value } : s))}
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select a Template --</option>
                                        {Object.entries(STATIC_TEMPLATES).map(([key, tpl]) => (
                                            <option key={key} value={key}>{tpl.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Delay (Days)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={step.delayDays}
                                        onChange={(e) => setSeriesSteps(seriesSteps.map(s => s.id === step.id ? { ...s, delayDays: e.target.value } : s))}
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                {seriesSteps.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setSeriesSteps(seriesSteps.filter(s => s.id !== step.id))}
                                        className="mb-1 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                        title="Remove Step"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setSeriesSteps([...seriesSteps, { id: Date.now(), templateKey: '', delayDays: 0 }])}
                            className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                        >
                            + Add Another Email
                        </button>
                        <button
                            type="button"
                            disabled={sending}
                            onClick={handleSendSeries}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {sending ? 'Scheduling...' : 'Schedule Series'}
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-5">

                {showTemplates && (
                    <div className="mt-2 p-4 border border-purple-100 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 space-y-3">
                        <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider mb-2">Select a Template</p>

                        {/* Reader's Wrapped — personalised from backend */}
                        <div className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${userId ? 'border-purple-400 bg-white hover:border-purple-600 hover:shadow-md' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}`}
                            onClick={userId ? applyWrappedTemplate : undefined}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📖</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-800 text-sm">Reader's Wrapped</p>
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">PERSONALISED</span>
                                        {!userId && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Requires Single User</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Annual retrospective with real MongoDB stats: books purchased, genres, favorite author & reading personality badge.</p>
                                </div>
                                {loadingTemplate && (
                                    <div className="flex items-center gap-1 text-purple-600 text-xs">
                                        <span className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full"></span>
                                        Generating...
                                    </div>
                                )}
                            </div>
                        </div>





                        {/* Static templates */}
                        {Object.entries(STATIC_TEMPLATES).map(([key, tpl]) => {
                            const isRelevant = true; // All templates shown
                            return (
                                <div
                                    key={key}
                                    onClick={isRelevant ? () => applyStaticTemplate(key) : undefined}
                                    className={`rounded-xl border-2 p-4 transition-all ${isRelevant ? 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer' : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{tpl.label.split(' ')[0]}</span>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{tpl.label.slice(tpl.label.indexOf(' ') + 1)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">For: {tpl.segments.join(', ')}</p>
                                            <p className="text-xs text-indigo-600 mt-1 font-medium">{tpl.subject}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Compose Form ── */}
            <form onSubmit={handleSend} className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                    <input
                        type="email"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Send (optional)</label>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Message</label>
                        <div className="flex items-center gap-2">
                            {/* Preview / Edit toggle */}
                            <button
                                type="button"
                                onClick={togglePreview}
                                className={`text-sm font-medium py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 border ${
                                    previewMode
                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
                                }`}
                            >
                                {previewMode ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Preview
                                    </>
                                )}
                            </button>

                            {/* Insert Image — hidden in preview mode */}
                            {!previewMode && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 border border-blue-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    Insert Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Preview iframe (links are clickable) ── */}
                    {previewMode ? (
                        <div className="relative w-full min-h-[400px] rounded-lg border border-amber-300 overflow-hidden">
                            <div className="absolute top-2 right-2 z-10 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-300">PREVIEW — links are live</div>
                            <iframe
                                title="email-preview"
                                srcDoc={previewHtml}
                                sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                                className="w-full border-0"
                                style={{ minHeight: '500px' }}
                            />
                        </div>
                    ) : (
                        <div
                            ref={editorRef}
                            contentEditable
                            className="w-full min-h-[400px] bg-white border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all font-sans text-sm leading-relaxed overflow-y-auto"
                            style={{ whiteSpace: 'pre-wrap' }}
                        ></div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                    <button
                        type="submit"
                        disabled={sending}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        {sending ? 'Sending...' : (scheduledAt ? 'Schedule Email' : 'Send Email')}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ComposeEmail;
