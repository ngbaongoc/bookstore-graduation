# Email Campaign Strategy: 03 - Mystery Book Date

**Target Segments:** Lost, Hibernating
**Primary Goal:** Re-activation via curiosity gap

## 1. Segment Psychology
"Lost" and "Hibernating" users are cold. They haven't opened emails or visited the site in months (or longer). 
A standard sales pitch ("10% off" or "Check out these books") will likely be ignored because they have tuned out the brand. 

Instead of an advertisement, this campaign presents a **game**. The human brain dislikes an unsolved puzzle. By offering cryptic clues and hiding the book cover, we trigger the "Curiosity Gap", prompting them to click just to see if they guessed right.

## 2. The Campaign Flow
1. **The Hook (Email):** The email shows an image of a book wrapped in plain brown paper. The title is hidden. Instead of a synopsis, the user sees 2-3 short, mysterious sentences extracted from the book's description.
2. **The Click:** The user clicks the CTA button ("Reveal the Book").
3. **The Reward (Frontend):** They are taken to the specific book's page. Immediately, a celebratory toast drops down congratulating them on revealing the mystery and offering a `MYSTERY20` discount code.
4. **The Result:** The user is now active on the site, browsing a book, with a 20% discount code in hand.

## 3. Data Aggregation Strategy (`mysteryEmail.js`)
To generate these emails dynamically:
- Identify the user's `userId`.
- Query the `Order` collection to find which `productIds` the user has already purchased.
- Query the `Book` collection to find a random book with an `average_review_score >= 4` that is **not** in the user's purchase history.
- Automatically extract the first two sentences of the book's `description` to act as the "Clues".
- Render the HTML template utilizing the generic `mystery_book.png` asset and the dynamic clues.

## 4. Frontend Integration (`SingleBook.jsx`)
When the CTA in the email is clicked, the link generated will look like:
`http://localhost:5173/books/<bookId>?mystery=true`

The frontend `SingleBook.jsx` component will:
- Parse the `?mystery=true` parameter.
- Trigger a `SweetAlert2` modal ("Surprise! You found it! Use code MYSTERY20...").
- Clean the URL to prevent the modal from popping up again on refresh.
