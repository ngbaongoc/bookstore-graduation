# 📧 Email Template Plan: Champions & Loyal Customers

## Campaign: "The Reader's Wrapped" — Personalized Retrospective

> **Inspired by:** Spotify Wrapped / Goodreads Year in Review  
> **Frequency:** Annual (December) or Bi-annual (June + December)  
> **Target RFM Segments:** Champions (R≥4, F≥4, M≥4) · Loyal Customers (R≥3, F≥3, M≥3)

---

## 🎯 Purpose

Deepen the emotional bond between the customer and the brand by making them feel **seen and known**. This email mirrors the loyalty they've shown back to them in a celebratory, personalized way — reinforcing their "Champion" status and rewarding continued engagement.

---

## 📊 Data to Retrieve from MongoDB

The email is built from a real-time aggregation pipeline that runs on demand (or is pre-computed nightly by a cron job). Here is each data point and how to get it:

| Displayed Stat | Source Collection | Aggregation Logic |
|---|---|---|
| Total books purchased | `orderitems` → `orders` | Count `orderitems` where `order.userId = X` and `order.status = 'Delivered'` |
| Total genres explored | `orderitems` → `books` | `$lookup` on `books`, then `$addToSet: "$category"` grouped by `userId` |
| Favorite author | `orderitems` → `books` | Group by `author`, `$sum: "$quantity"`, sort descending, `$first` |
| Most-purchased category | `orderitems` → `books` | Group by `category`, `$sum: "$quantity"`, sort descending, `$first` |
| Total spent (VND) | `orders` | `$sum: "$totalPrice"` where `status = 'Delivered'` |
| Order count | `orders` | `$count` where `status = 'Delivered'` |
| Reading Personality Badge | Computed in Node.js | Derived from the category distribution (see logic below) |

### MongoDB Aggregation Pipeline (Node.js)

```javascript
// In backend/src/emails/wrappedEmail.js

const buildWrappedStats = async (userId) => {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);

    // Step 1: Get all delivered orders for this user this year
    const orders = await Order.find({
        userId,
        status: 'Delivered',
        createdAt: { $gte: startOfYear }
    }).lean();

    const orderIds = orders.map(o => o._id);

    if (orderIds.length === 0) return null;

    // Step 2: Aggregate stats from order items
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
                totalBooks: { $sum: '$quantity' },
                categories: { $addToSet: '$book.category' },
                // For favorite author: group further below
                authors: { $push: { author: '$book.author', qty: '$quantity' } },
                categoryList: { $push: { cat: '$book.category', qty: '$quantity' } }
            }
        }
    ]);

    const raw = stats[0];
    const genreCount = raw.categories.length;
    const totalBooks = raw.totalBooks;

    // Tally authors
    const authorTally = {};
    for (const a of raw.authors) {
        authorTally[a.author] = (authorTally[a.author] || 0) + a.qty;
    }
    const favoriteAuthor = Object.entries(authorTally)
        .sort((a, b) => b[1] - a[1])[0][0];

    // Tally categories
    const catTally = {};
    for (const c of raw.categoryList) {
        catTally[c.cat] = (catTally[c.cat] || 0) + c.qty;
    }
    const favoriteCategory = Object.entries(catTally)
        .sort((a, b) => b[1] - a[1])[0][0];

    // Total money spent
    const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Assign personality badge
    const badge = assignReadingPersonality(catTally, genreCount, totalBooks);

    return {
        totalBooks,
        genreCount,
        favoriteAuthor,
        favoriteCategory,
        totalSpent,
        orderCount: orders.length,
        badge,
        year
    };
};
```

---

## 🏅 Reading Personality Badge System

The badge is computed from the **category distribution** of a user's purchases. The logic runs after the aggregation and picks the **best-matching archetype**.

### Classification Logic

```javascript
const assignReadingPersonality = (catTally, genreCount, totalBooks) => {
    const totalItems = Object.values(catTally).reduce((a, b) => a + b, 0);
    const topCategoryShare = Math.max(...Object.values(catTally)) / totalItems;
    const topCategory = Object.entries(catTally).sort((a, b) => b[1] - a[1])[0][0];

    // Rule 1: The Classicist — dominant in Classic Literature or Literary Fiction
    if (
        topCategoryShare > 0.6 &&
        ['Classic Literature', 'Literary Fiction', 'Modern Classics'].includes(topCategory)
    ) return badges.CLASSICIST;

    // Rule 2: The Genre Hopper — spreads across many genres
    if (genreCount >= 5) return badges.GENRE_HOPPER;

    // Rule 3: The Detective — loves mystery/thriller
    if (
        topCategoryShare > 0.5 &&
        ['Mystery, Thriller & Suspense', 'Detective and mystery stories', 'Historical Mystery'].includes(topCategory)
    ) return badges.DETECTIVE;

    // Rule 4: The World Builder — dominant in Fantasy or Sci-Fi
    if (
        topCategoryShare > 0.5 &&
        ['Fantasy', 'Science Fiction', 'Science Fiction Humor', 'Dystopian Fiction'].includes(topCategory)
    ) return badges.WORLD_BUILDER;

    // Rule 5: The Binge Reader — high volume buyer
    if (totalBooks >= 15) return badges.BINGE_READER;

    // Rule 6: The Romantic — Contemporary Fiction majority
    if (topCategoryShare > 0.5 && topCategory === 'Contemporary Fiction')
        return badges.ROMANTIC;

    // Rule 7: The Scholar — dominant in non-fiction, biography, history
    if (
        topCategoryShare > 0.5 &&
        ['Biography', 'Literature & Fiction', 'Africa, East'].includes(topCategory)
    ) return badges.SCHOLAR;

    // Default fallback
    return badges.AVID_READER;
};
```

### 🎖️ All Badge Definitions

| Badge Key | Display Name | Icon | Description | Trigger Condition |
|---|---|---|---|---|
| `CLASSICIST` | **The Classicist** | 🏛️ | A guardian of timeless literature | >60% Classic/Literary Fiction purchases |
| `GENRE_HOPPER` | **The Genre Hopper** | 🌈 | Fearless explorer of every shelf | Purchased across ≥5 distinct genres |
| `DETECTIVE` | **The Detective** | 🔍 | Always chasing the next clue | >50% Mystery/Thriller purchases |
| `WORLD_BUILDER` | **The World Builder** | 🪄 | Lives in realms that don't exist | >50% Fantasy/Sci-Fi purchases |
| `BINGE_READER` | **The Binge Reader** | 📚 | One chapter? Never just one chapter | Bought ≥15 books in the period |
| `ROMANTIC` | **The Romantic** | 🌹 | Heart-first, always | >50% Contemporary Fiction purchases |
| `SCHOLAR` | **The Scholar** | 🎓 | Knowledge is the ultimate treasure | >50% non-fiction/biography purchases |
| `AVID_READER` | **The Avid Reader** | ⭐ | A true lover of books | Default — doesn't fit a single niche |

---

## ✉️ Email HTML Template

```html
<!-- Subject: Your [year] Reading Story is Here 📖 -->

<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; border-radius: 16px; overflow: hidden;">

  <!-- Hero Banner -->
  <div style="background: linear-gradient(135deg, #6c3483, #1a5276); padding: 40px 30px; text-align: center;">
    <p style="margin:0; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#d7bde2;">BookShare · {{year}} Wrapped</p>
    <h1 style="margin: 16px 0 8px; font-size: 32px; color: #fff;">Your Year in Books 📖</h1>
    <p style="margin:0; color: #d7bde2; font-size:16px;">A story written one page at a time.</p>
  </div>

  <!-- Stats Grid -->
  <div style="padding: 30px; background: #16213e;">
    <p style="text-align:center; color:#a9cce3; font-size:15px; margin-bottom:24px;">
      Here's what your reading journey looked like in <strong style="color:#fff;">{{year}}</strong>:
    </p>

    <table width="100%" cellpadding="0" cellspacing="12">
      <tr>
        <td style="background:#0d3b63; border-radius:12px; padding:20px; text-align:center; width:48%">
          <p style="margin:0; font-size:42px; font-weight:bold; color:#5dade2;">{{totalBooks}}</p>
          <p style="margin:6px 0 0; font-size:13px; color:#a9cce3; text-transform:uppercase; letter-spacing:1px;">Books Purchased</p>
        </td>
        <td style="width:4%"></td>
        <td style="background:#0d3b63; border-radius:12px; padding:20px; text-align:center; width:48%">
          <p style="margin:0; font-size:42px; font-weight:bold; color:#a569bd;">{{genreCount}}</p>
          <p style="margin:6px 0 0; font-size:13px; color:#a9cce3; text-transform:uppercase; letter-spacing:1px;">Genres Explored</p>
        </td>
      </tr>
    </table>

    <div style="background:#0d3b63; border-radius:12px; padding:20px; margin-top:12px; text-align:center;">
      <p style="margin:0; font-size:14px; color:#a9cce3;">Your Favorite Author</p>
      <p style="margin:8px 0 0; font-size:24px; font-weight:bold; color:#f9e79f;">{{favoriteAuthor}}</p>
    </div>

    <div style="background:#0d3b63; border-radius:12px; padding:20px; margin-top:12px; text-align:center;">
      <p style="margin:0; font-size:14px; color:#a9cce3;">Top Genre</p>
      <p style="margin:8px 0 0; font-size:20px; font-weight:bold; color:#82e0aa;">{{favoriteCategory}}</p>
    </div>
  </div>

  <!-- Badge Section -->
  <div style="background: linear-gradient(135deg, #1a5276, #6c3483); padding: 30px; text-align:center;">
    <p style="margin:0 0 8px; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#d7bde2;">Your Reading Personality</p>
    <p style="margin:0; font-size:48px;">{{badgeIcon}}</p>
    <h2 style="margin:8px 0 4px; font-size:26px; color:#fff;">{{badgeName}}</h2>
    <p style="margin:0; font-size:14px; color:#d7bde2; font-style:italic;">{{badgeDescription}}</p>
  </div>

  <!-- CTA -->
  <div style="padding:30px; text-align:center; background:#1a1a2e;">
    <p style="color:#a9cce3; font-size:15px;">Ready to write your next chapter?</p>
    <a href="http://localhost:5173/books"
       style="display:inline-block; background:linear-gradient(135deg,#6c3483,#1a5276); color:#fff;
              text-decoration:none; padding:14px 36px; border-radius:50px; font-size:16px;
              font-weight:bold; margin-top:8px; letter-spacing:1px;">
      Explore New Books →
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#111; padding:16px; text-align:center; font-size:12px; color:#555;">
    <p style="margin:0;">© {{year}} BookShare · You're receiving this because you're one of our most valued readers.</p>
  </div>
</div>
```

---

## 🔄 Implementation Flow

```
[Cron Job — December 1st]
        │
        ▼
  getRFMAnalysis()
  Filter: segment = "Champions" OR "Loyal Customers"
        │
        ▼
  For each user:
    buildWrappedStats(userId)  ← MongoDB aggregation
        │
        ▼
    assignReadingPersonality() ← Classification logic
        │
        ▼
    Render HTML template with real data
        │
        ▼
    sendEmail({ to, subject, html })
        │
        ▼
    Log result to ScheduledEmail collection
```

---

## 📁 Files to Create

| File | Purpose |
|---|---|
| `backend/src/emails/wrappedEmail.js` | Core data aggregation + badge assignment logic |
| `backend/src/emails/templates/readersWrapped.html` | HTML email template string |
| `backend/src/crons/wrappedEmailCron.js` | Scheduled cron job (runs December 1st annually) |

---

## 📌 Notes

- The **year** parameter is flexible — you can run this bi-annually by filtering `createdAt >= 6 months ago`.
- The badge system is **rule-based**, not ML-based, making it easy to extend with new badges.
- All template variables (`{{totalBooks}}`, `{{badgeName}}`, etc.) are replaced at send time using a simple string replacement or a templating library like `handlebars`.
