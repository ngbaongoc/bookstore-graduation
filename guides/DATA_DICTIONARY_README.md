# Bookstore Data Dictionary & Analysis Guide

This guide explains how the five exported CSV files relate to each other and provides instructions on how to join them across popular data analysis tools.

## Entity Relationship Diagram (Schema Connections)

The exported data consists of 5 tables:
- **`users.csv`**: Contains registered user information.
- **`books.csv`**: Contains core book catalog details.
- **`inventories.csv`**: Contains stock counts and locations for books.
- **`orders.csv`**: Contains customer order headers and shipping details.
- **`order_items.csv`**: Contains the individual line-items (books and quantities) for each order.

### Foreign Keys (How they connect)

1. **Orders ↔ Users**:
   - `orders.csv` has a `userId` column (which is a 6-digit number).
   - This connects directly to `users.csv` via the `userId` column.

2. **Inventories ↔ Books**:
   - `inventories.csv` has a `bookId` column.
   - This connects directly to `books.csv` via the `_id` column.

3. **Order Items ↔ Orders**:
   - `order_items.csv` has an `orderId` column.
   - This connects directly to `orders.csv` via the `_id` column.

4. **Order Items ↔ Books**:
   - `order_items.csv` has a `bookId` column.
   - This connects directly to `books.csv` via the `_id` column.

---

## 📊 How to Join Data in Excel

You can use either `VLOOKUP` or **Power Query** to join these tables.

### Using Power Query (Recommended)
1. Go to **Data > Get Data > From File > From Text/CSV** and import all 5 CSV strings.
2. In the Power Query Editor, click **Home > Merge Queries** (or **Merge Queries as New**).
3. To attach Books to their Inventory:
   - Select the **Inventory** table as Table 1.
   - Select the **Books** table as Table 2.
   - Highlight `bookId` in Inventory, and `_id` in Books, and click OK.
4. To analyze Sales (Orders + Order Items):
   - Select **Order Items** as Table 1, and **Orders** as Table 2. Join on `orderId` and `_id`. Then, Merge that new table with **Books** linking `bookId` to `_id`.

---

## 🐍 How to Join Data in Python (Pandas)

Here is a quick Python script to load and merge everything into a unified DataFrame:

```python
import pandas as pd

# 1. Load the data
users = pd.read_csv('users.csv')
books = pd.read_csv('books.csv')
inventories = pd.read_csv('inventories.csv')
orders = pd.read_csv('orders.csv')
order_items = pd.read_csv('order_items.csv')

# 2. Join Books and their Inventory
books_with_inventory = pd.merge(books, inventories, left_on='_id', right_on='bookId', how='left')

# 3. Join Orders and Users
orders_with_users = pd.merge(orders, users, on='userId', how='left')

# 4. Join everything together to see comprehensive line-item sales
sales_data = pd.merge(order_items, orders_with_users, left_on='orderId', right_on='_id', how='left', suffixes=('_item', '_order'))
sales_data = pd.merge(sales_data, books_with_inventory, left_on='bookId', right_on='_id', how='left')

# Now `sales_data` contains every dimension connected perfectly!
print(sales_data.head())
```

---

## 📈 How to Join Data in Tableau

1. Open Tableau and under **Connect**, select **Text file**.
2. Open `orders.csv`.
3. In the Data Source pane, drag out your other CSVs (`users.csv`, `order_items.csv`, `books.csv`, `inventories.csv`) into the canvas to build logical relationships:
   - Drag `users.csv` to `orders.csv` and set the relationship: `userId = userId`.
   - Drag `order_items.csv` to `orders.csv` and set the relationship: `orderId = _id`.
   - Drag `books.csv` to `order_items.csv` and set the relationship: `_id = bookId`.
   - Drag `inventories.csv` to `books.csv` and set the relationship: `bookId = _id`.

Once mapped, Tableau's data model will automatically handle aggregations without double-counting your order totals across multiple books!
