# MongoDB ERD — Bookstore Graduation Project

> **9 collections** extracted from Mongoose schemas.  
> Solid lines = `ObjectId` references · Dashed lines = loose string-based joins (e.g., `userId: String`, `email: String`).

```mermaid
erDiagram

    %% ─── USERS ───────────────────────────────────────────
    USER {
        ObjectId  _id
        String    userId       "unique"
        String    username
        String    email        "unique"
        String    password
        String    phone        "unique"
        String    role         "enum: user"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── ADMINS ──────────────────────────────────────────
    ADMIN {
        ObjectId  _id
        String    userId       "unique"
        String    username     "unique"
        String    email        "unique"
        String    password     "bcrypt hashed"
        String    phone
        String    role         "enum: admin"
    }

    %% ─── BOOKS ───────────────────────────────────────────
    BOOK {
        ObjectId  _id
        String    isbn                   "unique"
        String    title
        String    author
        String    category
        String    thumbnail
        String    description
        Number    published_year
        Number    num_pages
        Number    price
        Number    number_of_review       "default 0"
        Number    average_review_score   "default 0"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── ORDERS ──────────────────────────────────────────
    ORDER {
        ObjectId  _id
        String    name
        String    email
        String    phone
        String    shippingStreet
        String    shippingCity
        String    shippingState
        String    shippingCountry
        String    shippingZipcode
        Number    totalPrice
        String    status               "enum: Pending…Delivered"
        Date      stagePending
        Date      stageProcessing
        Date      stageReadyToPickUp
        Date      stagePickedUp
        Date      stageDelivery
        Date      stageDelivered
        Boolean   reminderSent
        Boolean   cancelOrder
        Boolean   cancelRequested
        String    cancelReason
        Date      cancelRequestedAt
        String    cancelStatus         "enum: pending|approved|disapproved"
        String    cancellationReason
        String    userId               "ref → User.userId (string)"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── ORDER ITEMS ─────────────────────────────────────
    ORDERITEM {
        ObjectId  _id
        ObjectId  orderId    "ref: Order"
        ObjectId  bookId     "ref: Book"
        Number    quantity   "min 1"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── REVIEWS ─────────────────────────────────────────
    REVIEW {
        ObjectId  _id
        ObjectId  bookId    "ref: Book"
        String    userId    "ref → User.userId (string)"
        String    email
        String    comment
        Number    rating    "1-5"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── INVENTORY ───────────────────────────────────────
    INVENTORY {
        ObjectId  _id
        ObjectId  bookId            "ref: Book, unique"
        Number    inHouseQuantity   "default 0"
        Number    reservedQuantity  "default 0"
        String    binLocation       "default General Shelf"
        Number    weightGrams       "default 500"
        Date      createdAt
        Date      updatedAt
    }

    %% ─── RECOMMENDATION RULES ────────────────────────────
    RECOMMENDATIONRULE {
        ObjectId    _id
        ObjectId    base_book_id        "ref: Book, unique"
        ObjectId[]  recommendations     "ref: Book[]"
        Date        createdAt
        Date        updatedAt
    }

    %% ─── BLOGS ───────────────────────────────────────────
    BLOG {
        ObjectId  _id
        String    title
        String    description
        String    category
        String    author
        String    coverImage
        Date      createdAt
        Date      updatedAt
    }

    %% ─── RELATIONSHIPS ───────────────────────────────────

    USER        ||--o{ ORDER              : "places (userId str)"
    USER        ||--o{ REVIEW             : "writes (userId str)"

    ORDER       ||--o{ ORDERITEM          : "contains"
    BOOK        ||--o{ ORDERITEM          : "included in"
    BOOK        ||--o{ REVIEW             : "receives"
    BOOK        ||--||  INVENTORY         : "tracked by"
    BOOK        ||--o|  RECOMMENDATIONRULE: "is base of"
    BOOK        ||--o{  RECOMMENDATIONRULE: "recommended in"
```

## Collection Summary

| Collection | Key Relationships | Notes |
|---|---|---|
| `users` | → orders, reviews | String `userId` foreign key |
| `admins` | _(standalone)_ | Separate auth collection |
| `books` | → orderitems, reviews, inventory, recommendationrules | Core catalog |
| `orders` | ← users, → orderitems | Full shipping + lifecycle tracking |
| `orderitems` | → orders, → books | Junction table |
| `reviews` | → books, → users | Rating 1–5 |
| `inventories` | → books (1-to-1) | Stock & warehouse info |
| `recommendationrules` | → books (base + array) | AI-generated MBA rules |
| `blogs` | _(standalone)_ | Editorial content, no FK |

## ID Field Notes

| Collection | `_id` usage | `userId` usage |
|---|---|---|
| `users` | Used by `findByIdAndDelete` (admin delete) | Firebase UID — FK in orders, reviews, RFM |
| `admins` | MongoDB internal PK | Admin identifier |
| `orderitems` | — | Uses ObjectId refs to Order & Book |
| All others | MongoDB internal PK | N/A |
