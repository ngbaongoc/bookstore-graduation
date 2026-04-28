# 📦 Inventory vs. Book Architecture

## Why are they separate?

In this project, we explicitly separated **Book** details from **Inventory** management. This is a best practice in e-commerce architecture for several key reasons:

---

### 1. Static vs. Dynamic Data
- **Book (The Identity):** Information like Title, Author, ISBN, and Description almost never changes. This data can be heavily cached for speed.
- **Inventory (The Status):** Stock levels, reserved counts, and locations change **every time** an order is placed. 
- **Benefit:** By splitting them, we prevent high-frequency stock updates from interfering with the static catalog data.

### 2. Security and Data Integrity
When an order is placed, the backend only needs to "talk" to the `Inventory` collection. 
- **Benefit:** It is impossible for a bug in the stock-update code to accidentally delete a book's description or change its price, because they live in different collections.

### 3. "Reserved" Logic
We use a **`reservedQuantity`** field in the Inventory table.
- When an order is placed, stock moves from `inHouseQuantity` to `reservedQuantity`.
- It only leaves the system entirely when the book is physically delivered.
- **Benefit:** Keeping this logic in a separate table makes it easier to audit and manage the "virtual stock" vs. "physical stock."

### 4. Future Scalability
In a real enterprise system, one book might be stored in three different warehouses (Hanoi, Da Nang, HCM City).
- **Benefit:** With this split, you can easily add multiple inventory records for the same `bookId` later without duplicating the book's metadata 3 times.

---

## The Relationship (ERD)

- **Relationship:** 1 : 1 (One-to-One)
- **Link:** `Inventory.bookId` ➔ `Book._id`
- **Constraint:** The `bookId` in the Inventory table is **Unique**. This ensures every book has exactly one inventory record.
