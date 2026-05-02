const Order = require('../orders/order.model');
const Book = require('../books/book.model');

/**
 * Helper to extract a "clue" from a book description.
 * It attempts to take the first 2 sentences.
 */
const extractClue = (description) => {
    if (!description) return "A story waiting to be discovered.";
    // Split by period followed by space
    const sentences = description.split(/\.\s+/);
    if (sentences.length <= 2) {
        return description.length > 200 ? description.substring(0, 197) + "..." : description;
    }
    return sentences.slice(0, 2).join(". ") + ".";
};

/**
 * Builds the data required for the Mystery Book email campaign for a specific user.
 * 1. Finds all books the user has purchased.
 * 2. Finds a random book with high rating (>=4) that the user hasn't bought.
 * 3. Extracts clues from its description.
 * 
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} Object containing mystery book details.
 */
const buildMysteryDate = async (userId) => {
    // 1. Get all purchased book IDs
    const userOrders = await Order.aggregate([
        { $match: { userId: userId, status: 'Delivered' } },
        { $unwind: "$productIds" },
        { $group: { _id: null, purchasedBookIds: { $addToSet: "$productIds" } } }
    ]);
    
    const purchasedIds = userOrders.length > 0 ? userOrders[0].purchasedBookIds : [];

    // 2. Find a high-rated book not in the purchased list
    const candidateBooks = await Book.aggregate([
        { 
            $match: { 
                _id: { $nin: purchasedIds },
                average_review_score: { $gte: 4 }
            } 
        },
        // We want a random book to make it a true mystery
        { $sample: { size: 1 } }
    ]);

    let selectedBook = null;

    if (candidateBooks.length > 0) {
        selectedBook = candidateBooks[0];
    } else {
        // Fallback: If they bought all high-rated books, just pick any random book they haven't bought
        const fallbackBooks = await Book.aggregate([
            { $match: { _id: { $nin: purchasedIds } } },
            { $sample: { size: 1 } }
        ]);
        if (fallbackBooks.length > 0) {
            selectedBook = fallbackBooks[0];
        } else {
            // Extreme fallback: Just pick any top-rated book
            selectedBook = await Book.findOne().sort({ average_review_score: -1 }).lean();
        }
    }

    if (!selectedBook) return null;

    const clues = extractClue(selectedBook.description);

    return {
        bookId: selectedBook._id.toString(),
        clues: clues,
        category: selectedBook.category
    };
};

/**
 * Renders the HTML email template for the Mystery Book Date.
 * @param {Object} data - The object returned by buildMysteryDate
 * @param {string} frontendUrl - Base URL of the frontend
 * @returns {string} The HTML email content
 */
const renderMysteryEmail = (data, frontendUrl = 'http://localhost:5173') => {
    const { bookId, clues, category } = data;
    
    // The CTA link takes them to the single book page with the mystery=true flag
    const ctaLink = `${frontendUrl}/books/${bookId}?mystery=true`;
    
    // Path to the mystery book placeholder image (must be in frontend/public)
    const mysteryImageUrl = `${frontendUrl}/mystery_book.png`;

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Georgia', serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #111827, #374151); padding: 50px 30px; text-align: center; }
        .preheader { margin: 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #9ca3af; font-family: sans-serif; }
        .title { margin: 16px 0 8px; font-size: 32px; color: #f9fafb; font-weight: normal; }
        .subtitle { margin: 0; color: #d1d5db; font-size: 16px; font-style: italic; }
        .content { padding: 40px 30px; background: #1f2937; text-align: center; }
        
        .mystery-container { background: #111827; border-radius: 12px; padding: 30px; margin: 20px 0; border: 1px dashed #4b5563; }
        .mystery-image { width: 180px; height: 260px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        .clues-title { font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 12px; }
        .clues-text { font-size: 17px; color: #f3f4f6; line-height: 1.6; font-style: italic; border-left: 3px solid #6b7280; padding-left: 15px; text-align: left; margin: 0 auto; max-width: 85%; }
        .clues-genre { display: inline-block; background: #374151; color: #d1d5db; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-family: sans-serif; margin-top: 15px; }
        
        .message { font-size: 16px; color: #d1d5db; line-height: 1.8; margin-bottom: 30px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #fbbf24, #d97706); color: #111827; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s; }
        .footer { background: #111827; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; font-family: sans-serif; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p class="preheader">BookShare · Secret Selection</p>
            <h1 class="title">Blind Date with a Book 🕵️‍♀️</h1>
            <p class="subtitle">Don't judge a book by its cover. Mostly because we hid it.</p>
        </div>
        <div class="content">
            <p class="message">It's been a while since your last adventure. We think it's time to spark your curiosity. We've wrapped up a highly-rated book just for you, and we're daring you to unwrap it.</p>
            
            <div class="mystery-container">
                <img src="${mysteryImageUrl}" alt="A book wrapped in brown paper" class="mystery-image" />
                <div class="clues-title">Your Clues:</div>
                <div class="clues-text">"${clues}"</div>
                <div class="clues-genre">Genre: ${category}</div>
            </div>
            
            <p class="message">Think you know what it is? Or are you just dying to find out?</p>
            <a href="${ctaLink}" class="cta-button">Unwrap the Mystery</a>
        </div>
        <div class="footer">
            <p style="margin:0;">© ${new Date().getFullYear()} BookShare · Pssst. There might be a surprise waiting for you on the other side.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = {
    buildMysteryDate,
    renderMysteryEmail
};
