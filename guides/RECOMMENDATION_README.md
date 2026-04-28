# 📚 Book Recommendation System

## What it does

When a user opens a book's detail page, the app shows a **"Customers who bought this also bought..."** carousel of suggested books. This is powered by a machine learning algorithm called **Market Basket Analysis**.

---

## How it works — step by step

### Step 1 — You run the Python script (offline)

```bash
python backend/scripts/generate_recommendations.py
```

This script connects to MongoDB and does the following:

**1. Reads all order items**
```
OrderItem collection → [ { orderId, bookId }, { orderId, bookId }, ... ]
```

**2. Builds a basket table**

Each row is one order. Each column is a book. A cell is `True` if that book was in that order:

| orderId | Book A | Book B | Book C |
|---------|--------|--------|--------|
| order1  | ✅     | ✅     | ❌     |
| order2  | ❌     | ✅     | ✅     |
| order3  | ✅     | ✅     | ✅     |

**3. Runs FP-Growth algorithm**

FP-Growth scans the basket table and finds patterns like:
> "Book A and Book B appear together in 20% of orders"

It then generates **association rules** — e.g.:
> "If a customer buys Book A → they are likely to also buy Book B" (confidence: 85%)

**4. Saves results into the `RecommendationRule` collection**

For each book that has strong associations, it saves up to **5 recommendations**:

```json
{
  "base_book_id": "<Book A's _id>",
  "recommendations": ["<Book B's _id>", "<Book C's _id>", ...]
}
```

The collection is fully **replaced** every time the script runs (old stale rules are deleted first).

---

### Step 2 — User opens a book page (real-time)

When a user visits `/books/:id`, the backend runs `getSingleBook`:

```
Does a RecommendationRule exist for this book?
        │
        ├── YES → Fetch those recommended books → return to frontend
        │
        └── NO  → Fallback: return top-rated books in the same category
```

This is just a single fast database lookup — no ML computation happens at this point.

---

## Why this design?

| Question | Answer |
|---|---|
| Why not compute recommendations live? | FP-Growth scans ALL orders — too slow to run on every page load |
| Why store results in a separate collection? | So the page responds in milliseconds — just a simple `findOne()` |
| What if a new book has no order history yet? | The fallback serves top-rated books in the same category |
| When should I re-run the script? | Whenever you want fresh recommendations (e.g. weekly/monthly) |

---

## Collections involved

| Collection | Where | Role |
|---|---|---|
| `OrderItem` | Python script | Only input — provides `orderId` + `bookId` pairs |
| `RecommendationRule` | Python script + API | Output of the script; looked up on each book page load |
| `Book` | API (`getSingleBook`) | Fetched to turn recommended `_id`s into full book objects for the frontend |
| `Order` | ❌ Not used | The full order document is not needed — `OrderItem` has all the data required |

---

## Running the script

Make sure your `.env` has `DB_URL` set, then:

```bash
cd backend
pip install pandas mlxtend pymongo certifi
python scripts/generate_recommendations.py
```

Expected output:
```
Initiating RecSys Engine (Market Basket Analysis)...
Extracting transaction data from order items...
Mining frequent itemsets utilizing FP-Growth Algorithm...
Generating association rules via conditional Lift analysis...
Generated comprehensive relational recommendations for N baseline items.
Successfully deployed ML pipeline recommendations to DB!
```
