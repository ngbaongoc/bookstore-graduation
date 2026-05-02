const Order = require('../orders/order.model');
const OrderItem = require('../orders/orderItem.model');

// ─── Badge Definitions (Merged with Alter Ego) ────────────────────────────────
const BADGES = {
    CLASSICIST:   { name: "Nhà tri thức thế kỷ 19",  icon: "🏛️", description: "Người quan sát và trầm ngâm trước những cơn lốc biến đổi của thời đại." },
    GENRE_HOPPER: { name: "Kẻ du hành tri thức",    icon: "🌈", description: "Bạn là cánh chim hải âu bay giữa đại dương tri thức, không ngại ngần đặt chân lên bất kỳ vùng đất lạ nào để kiếm tìm sự khai sáng." },
    DETECTIVE:    { name: "Thám tử ẩn danh",          icon: "🔍", description: "Người nắm giữ những bí mật đen tối nhất và luôn đi trước hung thủ một bước." },
    WORLD_BUILDER:{ name: "Pháp sư lãng du",         icon: "🪄", description: "Kẻ mang quyền năng thay đổi thực tại, bị lạc vào thế giới hiện đại đầy náo nhiệt." },
    BINGE_READER: { name: "Mọt sách chính hiệu",     icon: "📚", description: "Độc giả bền bỉ nhất, người dệt nên những giấc mơ từ hàng vạn con chữ." },
    ROMANTIC:     { name: "Thi sĩ mộng mơ",          icon: "🌹", description: "Đi tìm bản tình ca còn dang dở giữa nhịp sống hối hả." },
    SCHOLAR:      { name: "Lãnh đạo tiên phong",     icon: "🎓", description: "Một nhà cách tân luôn nhìn thấy cơ hội trong khi mọi người chỉ thấy khó khăn." },
    AVID_READER:  { name: "Độc giả chân thành",      icon: "⭐", description: "Người lữ hành lặng lẽ nhưng kiên trì trên con đường chinh phục tri thức." },
};

const CLASSIC_GENRES   = ['Classic Literature', 'Literary Fiction', 'Modern Classics'];
const MYSTERY_GENRES   = ['Mystery, Thriller & Suspense', 'Detective and mystery stories', 'Detective and mystery stories, English', 'Historical Mystery'];
const FANTASY_GENRES   = ['Fantasy', 'Science Fiction', 'Science Fiction Humor', 'Dystopian Fiction', 'Post-Apocalyptic', 'Adventure'];
const NONFICTION_GENRES= ['Biography', 'Literature & Fiction'];

/**
 * Classify a customer into a reading personality badge
 * based on their category purchase distribution.
 */
const assignReadingPersonality = (catTally, genreCount, totalBooks) => {
    if (totalBooks === 0) return BADGES.AVID_READER;

    const totalItems = Object.values(catTally).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(catTally).sort((a, b) => b[1] - a[1]);
    const [topCategory, topCount] = sorted[0] || ['', 0];
    const topShare = topCount / totalItems;

    // Prioritize specific interests even if they read many genres
    if (topShare >= 0.35 && CLASSIC_GENRES.includes(topCategory))   return BADGES.CLASSICIST;
    if (topShare >= 0.35 && MYSTERY_GENRES.includes(topCategory))   return BADGES.DETECTIVE;
    if (topShare >= 0.35 && FANTASY_GENRES.includes(topCategory))   return BADGES.WORLD_BUILDER;
    if (topShare >= 0.35 && topCategory === 'Contemporary Fiction')  return BADGES.ROMANTIC;
    if (topShare >= 0.35 && NONFICTION_GENRES.includes(topCategory)) return BADGES.SCHOLAR;
    
    // Then check for volume
    if (totalBooks >= 15) return BADGES.BINGE_READER;
    
    // Then check for diversity
    if (genreCount >= 5) return BADGES.GENRE_HOPPER;
    
    return BADGES.AVID_READER;
};

/**
 * Aggregate all purchasing stats for a single user for the given year.
 * @param {string} userId  - Firebase UID stored in orders
 * @param {number} year    - e.g. 2026
 * @returns {Object|null}  - stats object or null if no purchases this year
 */
const buildWrappedStats = async (userId, year) => {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear   = new Date(`${year}-12-31T23:59:59.999Z`);

    // Fetch all delivered orders for this user within the target year, sorted by date
    const orders = await Order.find({
        userId,
        status: 'Delivered',
        createdAt: { $gte: startOfYear, $lte: endOfYear }
    }).sort({ createdAt: 1 }).lean();

    if (orders.length === 0) return null;

    const orderIds = orders.map(o => o._id);
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Calculate peak month
    const monthCounts = {};
    orders.forEach(o => {
        const m = new Date(o.createdAt).getMonth() + 1;
        monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Aggregate stats from order items joined with books
    const stats = await OrderItem.aggregate([
        { $match: { orderId: { $in: orderIds } } },
        {
            $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'book'
            }
        },
        { $unwind: '$book' },
        {
            $group: {
                _id: null,
                totalBooks:   { $sum: '$quantity' },
                totalPages:   { $sum: { $multiply: ['$book.num_pages', '$quantity'] } },
                categories:   { $addToSet: '$book.category' },
                authorPushes: { $push: { author: '$book.author', qty: '$quantity' } },
                catPushes:    { $push: { cat: '$book.category', qty: '$quantity' } },
                allBooks:     { $push: { title: '$book.title', author: '$book.author', thumbnail: '$book.thumbnail', orderId: '$orderId', createdAt: '$createdAt' } }
            }
        }
    ]);

    if (!stats.length) return null;

    const raw = stats[0];
    const { totalBooks, totalPages, categories, authorPushes, catPushes, allBooks } = raw;
    const genreCount = categories.length;

    // Tally authors → find top 3
    const authorTally = {};
    for (const { author, qty } of authorPushes) {
        authorTally[author] = (authorTally[author] || 0) + qty;
    }
    const topAuthors = Object.entries(authorTally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
    const favoriteAuthor = topAuthors[0]?.name || 'Unknown';

    // Tally categories → find top 3
    const catTally = {};
    for (const { cat, qty } of catPushes) {
        catTally[cat] = (catTally[cat] || 0) + qty;
    }
    const topCategories = Object.entries(catTally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
    const favoriteCategory = topCategories[0]?.name || 'Various';

    // Find the first book of the year
    const firstOrderId = orders[0]._id.toString();
    const firstBook = allBooks.find(b => b.orderId.toString() === firstOrderId) || allBooks[0];

    const badge = assignReadingPersonality(catTally, genreCount, totalBooks);

    return {
        year,
        totalBooks,
        totalPages,
        totalSpent,
        genreCount,
        favoriteAuthor,
        topAuthors,
        favoriteCategory,
        topCategories,
        firstBook,
        peakMonth,
        badge
    };
};

/**
 * Render the HTML email body with real data.
 */
const renderWrappedEmail = (stats) => {
    const { year, totalBooks, totalPages, genreCount, favoriteAuthor, topAuthors, favoriteCategory, topCategories, peakMonth, firstBook, badge } = stats;
    const formattedSpent = stats.totalSpent.toLocaleString('vi-VN') + ' ₫';
    const monthNames = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const peakMonthName = monthNames[peakMonth];

    return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Năm Đọc Sách ${year} Của Bạn 📖</title></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:30px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.6);background:#16213e;">

    <!-- ── HERO BANNER ── -->
    <tr><td style="background:linear-gradient(135deg,#8e44ad 0%,#3498db 100%);padding:60px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;letter-spacing:5px;text-transform:uppercase;color:#d7bde2;font-weight:bold;">BOOKSHARE · ${year} WRAPPED</p>
      <h1 style="margin:20px 0 10px;font-size:42px;color:#fff;line-height:1.1;font-weight:900;">Năm ${year} Của Bạn Qua Những Trang Sách</h1>
      <p style="margin:0;color:#eaf2f8;font-size:18px;font-style:italic;opacity:0.9;">Mỗi cuốn sách là một chương mới trong cuộc đời.</p>
    </td></tr>

    <!-- ── THE OPENER ── -->
    <tr><td style="background:#1a1a2e;padding:40px;text-align:center;border-bottom:1px solid #242442;">
      <div style="width:80px;height:80px;background:#16213e;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;border:2px solid #5dade2;">
        <span style="font-size:40px;">🌱</span>
      </div>
      <div style="display:inline-block;text-align:left;max-width:400px;margin:0 auto;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="120" valign="top" style="padding-right:20px;">
              ${firstBook?.thumbnail ? `<img src="${firstBook.thumbnail.startsWith('http') ? firstBook.thumbnail : `http://localhost:5000${firstBook.thumbnail}`}" alt="${firstBook.title}" style="width:120px;height:auto;border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,0.5);">` : ''}
            </td>
            <td valign="top">
              <h2 style="margin:0;font-size:24px;color:#fff;line-height:1.2;">${firstBook?.title || 'Cuốn sách bí ẩn'}</h2>
              <p style="margin:8px 0 0;color:#5dade2;font-size:16px;">bởi ${firstBook?.author || 'Tác giả tài năng'}</p>
              <p style="margin:15px 0 0;color:#566573;font-size:14px;line-height:1.4;">Cuốn sách đầu tiên mở màn cho hành trình năm ${year} của bạn.</p>
            </td>
          </tr>
        </table>
      </div>
    </td></tr>

    <!-- ── BIG NUMBERS ── -->
    <tr><td style="padding:40px 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#1b263b;border-radius:20px;padding:30px 20px;text-align:center;width:48%;">
            <p style="margin:0;font-size:58px;font-weight:900;color:#f1c40f;">${totalBooks}</p>
            <p style="margin:10px 0 0;font-size:13px;color:#a9cce3;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">Cuốn sách mới</p>
          </td>
          <td style="width:4%;"></td>
          <td style="background:#1b263b;border-radius:20px;padding:30px 20px;text-align:center;width:48%;">
            <p style="margin:0;font-size:58px;font-weight:900;color:#2ecc71;">${totalPages.toLocaleString('vi-VN')}</p>
            <p style="margin:10px 0 0;font-size:13px;color:#a9cce3;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">Trang giấy đã lật</p>
            <p style="margin:8px 0 0;font-size:11px;color:#5dade2;font-style:italic;">Xấp xỉ ${(totalPages * 0.2 / 461).toFixed(1)} lần chiều cao tòa Landmark 81!</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── EXTRA STATS ── -->
    <tr><td style="padding:0 30px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#16213e;border:1px solid #2c3e50;border-radius:15px;padding:20px;text-align:center;width:48%;">
            <p style="margin:0;font-size:24px;font-weight:bold;color:#e74c3c;">${genreCount}</p>
            <p style="margin:5px 0 0;font-size:10px;color:#85929e;text-transform:uppercase;font-weight:bold;">Thể loại đã đọc</p>
          </td>
          <td style="width:4%;"></td>
          <td style="background:#16213e;border:1px solid #2c3e50;border-radius:15px;padding:20px;text-align:center;width:48%;">
            <p style="margin:0;font-size:24px;font-weight:bold;color:#9b59b6;">${formattedSpent}</p>
            <p style="margin:5px 0 0;font-size:10px;color:#85929e;text-transform:uppercase;font-weight:bold;">Tổng tiền chi</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── PEAK MONTH ── -->
    <tr><td style="padding:0 30px 40px;">
      <div style="background:linear-gradient(to right, #1b263b, #0d1b2a);border-radius:20px;padding:30px;text-align:center;border:1px solid #2c3e50;">
        <p style="margin:0;font-size:13px;color:#a9cce3;text-transform:uppercase;letter-spacing:2px;">Mùa đọc sách sôi động nhất</p>
        <p style="margin:15px 0 0;font-size:32px;font-weight:bold;color:#fff;">${peakMonthName}</p>
        <p style="margin:8px 0 0;font-size:15px;color:#5dade2;opacity:0.8;">Bạn đã bùng nổ đam mê vào thời điểm này!</p>
      </div>
    </td></tr>

    <!-- ── TOP LISTS ── -->
    <tr><td style="background:#0f172a;padding:50px 40px;">
       <table width="100%" cellpadding="0" cellspacing="0">
         <tr>
           <td style="vertical-align:top;width:50%;padding-right:20px;">
             <h3 style="color:#fff;font-size:18px;margin:0 0 20px;border-left:4px solid #f1c40f;padding-left:12px;">Top Tác Giả</h3>
             ${topAuthors.map((a, i) => `
               <div style="margin-bottom:15px;">
                 <span style="color:#566573;font-size:14px;font-weight:bold;margin-right:8px;">#${i+1}</span>
                 <span style="color:#fdfefe;font-size:16px;">${a.name}</span>
               </div>
             `).join('')}
           </td>
           <td style="vertical-align:top;width:50%;padding-left:20px;">
             <h3 style="color:#fff;font-size:18px;margin:0 0 20px;border-left:4px solid #2ecc71;padding-left:12px;">Top Thể Loại</h3>
             ${topCategories.map((c, i) => `
               <div style="margin-bottom:15px;">
                 <span style="color:#566573;font-size:14px;font-weight:bold;margin-right:8px;">#${i+1}</span>
                 <span style="color:#fdfefe;font-size:16px;">${c.name}</span>
               </div>
             `).join('')}
           </td>
         </tr>
       </table>
    </td></tr>

    <!-- ── BADGE SECTION ── -->
    <tr><td style="background:linear-gradient(135deg,#1b263b 0%,#0d1b2a 100%);padding:60px 40px;text-align:center;border-top:2px solid #2c3e50;border-bottom:2px solid #2c3e50;">
      <p style="margin:0 0 20px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#f1c40f;font-weight:bold;">DANH HIỆU ĐỘC GIẢ ${year}</p>
      <div style="font-size:80px;line-height:1;margin-bottom:20px;">${badge.icon}</div>
      <h2 style="margin:0;font-size:36px;color:#fff;font-weight:900;">${badge.name}</h2>
      <p style="margin:15px auto 0;font-size:17px;color:#a9cce3;line-height:1.6;max-width:400px;font-style:italic;">"${badge.description}"</p>
    </td></tr>

    <!-- ── CTA ── -->
    <tr><td style="padding:60px 40px;text-align:center;">
      <p style="margin:0 0 25px;color:#fff;font-size:20px;font-weight:bold;">Sẵn sàng cho những kỷ lục mới trong năm ${year + 1}?</p>
      <a href="http://localhost:5173/books?category=${encodeURIComponent(favoriteCategory)}&excludePurchased=true"
         style="display:inline-block;background:linear-gradient(135deg,#f1c40f,#e67e22);color:#1a1a2e;
                text-decoration:none;padding:18px 45px;border-radius:100px;font-size:18px;
                font-weight:900;text-transform:uppercase;letter-spacing:1px;box-shadow:0 10px 30px rgba(241,196,15,0.3);">
        Tiếp Tục Hành Trình &rarr;
      </a>
      <p style="margin:25px 0 0;color:#566573;font-size:14px;">Tặng bạn mã <strong>WRAPPED${year}</strong> giảm 10% cho đơn hàng tiếp theo!</p>
    </td></tr>

    <!-- ── FOOTER ── -->
    <tr><td style="background:#0a0a12;padding:30px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#4a4a6a;line-height:1.6;">
        &copy; ${year} BookShare · Đội ngũ BookShare trân trọng sự đồng hành của bạn.<br>
        Bạn nhận được email này vì bạn là một phần của cộng đồng yêu sách của chúng tôi.
      </p>
    </td></tr>

  </table>
  </td></tr>
  </table>

</body>
</html>`;
};

module.exports = { buildWrappedStats, renderWrappedEmail, BADGES };
