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
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;margin:0;padding:20px;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1a1a2e;color:#eee;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#111827,#374151);padding:50px 30px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;font-family:sans-serif;">BookShare &middot; Secret Selection</p>
      <h1 style="margin:16px 0 8px;font-size:32px;color:#f9fafb;font-weight:normal;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Blind Date with a Book &#128373;&#65039;</h1>
      <p style="margin:0;color:#d1d5db;font-size:16px;font-style:italic;">Don't judge a book by its cover. Mostly because we hid it.</p>
    </td></tr>

    <!-- Content -->
    <tr><td style="padding:40px 30px;background:#1f2937;text-align:center;">
      <p style="font-size:16px;color:#d1d5db;line-height:1.8;margin:0 0 30px;">It's been a while since your last adventure. We think it's time to spark your curiosity. We've wrapped up a highly-rated book just for you, and we're daring you to unwrap it.</p>

      <!-- Mystery Box -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#111827;border-radius:12px;padding:30px;border:1px dashed #4b5563;text-align:center;">
          <img src="${mysteryImageUrl}" alt="A book wrapped in brown paper" width="160" height="230" style="display:block;margin:0 auto 20px;width:160px;height:230px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.5);" />
          <p style="font-family:sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin:0 0 12px;">Your Clues:</p>
          <table width="85%" align="center" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:17px;color:#f3f4f6;line-height:1.6;font-style:italic;border-left:3px solid #6b7280;padding-left:15px;text-align:left;">
              "${clues}"
            </td></tr>
          </table>
          <p style="margin:15px 0 0;"><span style="display:inline-block;background:#374151;color:#d1d5db;padding:4px 10px;border-radius:4px;font-size:12px;font-family:sans-serif;">Genre: ${category}</span></p>
        </td></tr>
      </table>

      <p style="font-size:16px;color:#d1d5db;line-height:1.8;margin:30px 0;">Think you know what it is? Or are you just dying to find out?</p>
      <a href="${ctaLink}" style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#d97706);color:#111827;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:bold;font-family:sans-serif;text-transform:uppercase;letter-spacing:1px;">Unwrap the Mystery</a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#111827;padding:20px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#6b7280;font-family:sans-serif;">&copy; ${new Date().getFullYear()} BookShare &middot; Pssst. There might be a surprise waiting for you on the other side.</p>
    </td></tr>

  </table>
  </td></tr>
  </table>

</body>
</html>
    `;
};

module.exports = {
    buildMysteryDate,
    renderMysteryEmail
};
