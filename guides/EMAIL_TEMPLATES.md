# Email Marketing & Customer Segmentation Guide

This document provides a comprehensive overview of the email templates and customer segments used in the Bookstore application.

## 📊 Customer Segmentation (RFM Model)

The system uses the **Recency, Frequency, Monetary (RFM)** model to segment customers into 11 distinct groups based on their purchasing behavior. These segments are calculated in `backend/src/orders/rfm_analysis.js`.

| Segment | Description |
| :--- | :--- |
| **Champions** | Recent, frequent, and high-spending customers. |
| **Loyal Customers** | Regular buyers who are responsive to promotions. |
| **Potential Loyalist** | Recent customers with average frequency. |
| **New Customers** | Most recent buyers, but only once or twice. |
| **Promising** | Recent buyers who haven't spent much yet. |
| **Needs Attention** | Average recency and frequency; haven't bought recently. |
| **About to Sleep** | Below average recency and frequency. |
| **At Risk** | Purchased often but a long time ago. |
| **Can't Lose Them** | Frequent/high-spending but haven't returned in a long time. |
| **Hibernating** | Low frequency, last purchase was a long time ago. |
| **Lost** | Lowest scores across recency, frequency, and monetary. |
| **No Orders** | Users who have registered but never placed an order. |

---

## 📧 Email Templates & Campaigns

There are **6 primary email templates** currently in use or implementation.

### 1. VIP Reward Template
- **Target Segments:** `Champions`, `Loyal Customers`
- **Subject:** A little something for our favorite reader... 🎁
- **Purpose:** Retention and rewarding high-value customers with a 20% "Champion Discount" and early access to new collections.
- **Location:** `frontend/src/pages/dashboard/ManageUsers.jsx` (Dynamic Compose)

### 2. Recency Nudge Template
- **Target Segments:** `New Customers`, `Potential Loyalist`, `Promising`
- **Subject:** What’s next on your bookshelf? 📚
- **Purpose:** Encouraging a second purchase through personalized recommendations and a "CHAPTER2" free shipping code.
- **Location:** `frontend/src/pages/dashboard/ManageUsers.jsx` (Dynamic Compose)

### 3. Generous Win-Back Template
- **Target Segments:** `At Risk`, `Can't Lose Them`
- **Subject:** We miss you (and so do these books) ☕
- **Purpose:** Re-engaging high-value users who have drifted away with a significant 30% discount.
- **Location:** `frontend/src/pages/dashboard/ManageUsers.jsx` (Dynamic Compose)

### 4. General Newsletter Template
- **Target Segments:** `Needs Attention`, `About to Sleep`, `Hibernating`, `Lost`, `No Orders`
- **Subject:** Top 10 Books of 2026 (So Far) 📈
- **Purpose:** Keeping the brand top-of-mind for inactive users by sharing trending titles and news.
- **Location:** `frontend/src/pages/dashboard/ManageUsers.jsx` (Dynamic Compose)


### 5. Loyalty Voucher Template (Manual Bulk)
- **Target:** Manually selected recipients (usually the `Loyal Customers` segment).
- **Subject:** Món quà đặc biệt từ Bookstore - Giảm giá 20% cho bạn!
- **Code:** `LOYALTY20`
- **Purpose:** High-impact direct marketing used for specific promotions or holiday rewards.
- **Location:** `backend/src/users/user.controller.js` (`sendVouchers` endpoint)

---

## 🛠️ How to Use
1. **Admin Dashboard:** Navigate to "Manage Users".
2. **Filter:** Select a segment from the dropdown to see target customers.
3. **Send Email:** 
   - Click **"Send Email"** next to a user to auto-generate a segmented template in the Compose view.
   - For `Loyal Customers`, use the **"Send 20% Voucher"** button to bulk-send the official `LOYALTY20` template.
