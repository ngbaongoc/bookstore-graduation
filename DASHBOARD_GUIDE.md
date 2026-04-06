# Bookstore Admin Dashboard: Calculation Guide

This guide explains how each metric and chart in the Admin Dashboard is calculated and what data sources are used.

## 1. Sales Performance & Revenue
These metrics provide a top-level view of business health.

- **Total Revenue**: Calculated as the sum of `totalPrice` from all orders in the database that are **not cancelled** (`cancelOrder: false`).
- **Total Orders**: The total count of all orders (including both successful and cancelled) within the selected time range.
- **Cancellation Rate**: 
  - Formula: `(Total Cancelled Orders / (Delivered Orders + Cancelled Orders)) * 100`.
  - This provides a percentage of orders that failed to complete.

### Time-Series Granularity
The charts dynamically adjust their detail level based on the selected date range:
- **< 2 days**: Shows data hourly.
- **2 to 60 days**: Shows data daily.
- **> 60 days**: Shows data monthly.

---

## 2. Inventory Management
The inventory system tracks books across three distinct quantitative states.

- **In-House Quantity (Shelf Stock)**:
  - **Meaning**: Physical books currently on the shelf and available for sale.
  - **Change**: Atomically decreased the moment a customer clicks "Place Order".
- **Reserved Quantity (Lock Stock)**:
  - **Meaning**: Books that are set aside for open orders (Pending, Processing, Picked up).
  - **Change**: 
    - **Increased** when an order is placed.
    - **Decreased** when an order is marked as **"Delivery"** (finalizing the sale).
    - **Decreased** (and moved back to In-House) if an order cancellation is approved.
- **Low Stock Alerts**: Triggered automatically whenever a book's `In-House Quantity` drops below **10 units**.

---

## 3. Marketing Intelligence (RFM Analysis)
Customers are segmented into 11 categories using the **RFM Model**. This analysis strictly observes only **Delivered** orders.

| Metric | Calculation Logic |
| :--- | :--- |
| **Recency (R)** | Days since the customer's last **"Delivered"** timestamp. (Smaller number = higher score). |
| **Frequency (F)** | Total number of **"Delivered"** orders associated with the user account. |
| **Monetary (M)** | Total lifetime spend (sum of `totalPrice`) from **"Delivered"** orders. |

### Scoring & Segmentation
- Users are ranked 1 to 5 for each metric based on **quintiles** (top 20% get a score of 5).
- These scores are combined into a 3-digit **RFM Code** (e.g., "555" for Champions).
- **Segments** (like *Champions*, *Loyal Customers*, or *At Risk*) are automatically assigned based on specific score thresholds.

---

## 4. Logistics & Geographic Insights
- **Top 5 Books**: Aggregates the `quantity` of each book sold across all non-cancelled orders.
- **Geographic Chart**: Groups orders by the `city` field in the shipping address to identify top-performing regions.
- **Cancellation Analysis**: Groups cancelled orders by the `cancellationReason` provided by users or admins.
