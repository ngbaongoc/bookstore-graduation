const Book = require("./book.model");
const Inventory = require("../inventory/inventory.model");
const RecommendationRule = require("./recommendation.model");

const postABook = async (req, res) => {
    try {
        const newBook = await Book({ ...req.body });
        await newBook.save();
        const newInventory = await new Inventory({ 
            bookId: newBook._id,
            inHouseQuantity: req.body.inHouseQuantity ? parseInt(req.body.inHouseQuantity) : 0,
            binLocation: req.body.binLocation || "General Shelf"
        }).save();
        res.status(200).send({ message: "Book posted successfully", book: { ...newBook.toObject(), inventory: newInventory.toObject() } })
    } catch (error) {
        console.error("Error creating book", error);
        res.status(500).send({ message: "Failed to create book" })
    }
}

// get all books
const getAllBooks = async (req, res) => {
    console.log("Fetching all books...");
    try {
        const books = await Book.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "bookId",
                    as: "inventoryData"
                }
            },
            {
                $addFields: {
                    inventory: { $arrayElemAt: ["$inventoryData", 0] }
                }
            },
            { $project: { inventoryData: 0 } }
        ]);
        res.status(200).send(books)

    } catch (error) {
        console.error("Error fetching books", error);
        res.status(500).send({ message: "Failed to fetch books" })
    }
}

const getSingleBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).lean();
        if (!book) {
            return res.status(404).send({ message: "Book not Found!" })
        }
        const inventory = await Inventory.findOne({ bookId: id }).lean();
        book.inventory = inventory;

        // Look up pre-computed Association Rule recommendations
        let recommendedBooks = [];
        const rule = await RecommendationRule.findOne({ base_book_id: id }).lean();
        if (rule && rule.recommendations.length > 0) {
            // Association rules found — fetch full book details for each recommendation
            recommendedBooks = await Book.find({ _id: { $in: rule.recommendations } }).lean();
        } else {
            // Cold Start fallback: recommend top 4 books from same category, excluding itself
            recommendedBooks = await Book.find({ category: book.category, _id: { $ne: book._id } })
                .sort({ average_review_score: -1 })
                .limit(4)
                .lean();
        }
        book.recommendedBooks = recommendedBooks;

        res.status(200).send(book)

    } catch (error) {
        console.error("Error fetching book", error);
        res.status(500).send({ message: "Failed to fetch book" })
    }
}

// update book data
const UpdateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!updatedBook) {
            return res.status(404).send({ message: "Book is not Found!" })
        }
        const inventory = await Inventory.findOne({ bookId: id }).lean();
        updatedBook.inventory = inventory;
        res.status(200).send({
            message: "Book updated successfully",
            book: updatedBook
        })
    } catch (error) {
        console.error("Error updating a book", error);
        res.status(500).send({ message: "Failed to update a book" })
    }
}

const deleteABook = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id).lean();
        if (!deletedBook) {
            return res.status(404).send({ message: "Book is not Found!" })
        }
        await Inventory.findOneAndDelete({ bookId: id });
        res.status(200).send({
            message: "Book deleted successfully",
            book: deletedBook
        })
    } catch (error) {
        console.error("Error deleting a book", error);
        res.status(500).send({ message: "Failed to delete a book" })
    }
};

const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review, score } = req.body;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send({ message: "Book not Found!" });
        }

        // Calculate new average score
        const totalScore = (book.average_review_score * book.number_of_review) + Number(score);
        book.number_of_review += 1;
        book.average_review_score = totalScore / book.number_of_review;

        await book.save();
        
        const bookObj = book.toObject();
        bookObj.inventory = await Inventory.findOne({ bookId: id }).lean();

        res.status(200).send({
            message: "Review added successfully",
            book: bookObj
        });
    } catch (error) {
        console.error("Error adding review", error);
        res.status(500).send({ message: "Failed to add review" });
    }
}

const importBooks = async (req, res) => {
    try {
        const books = req.body;
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).send({ message: "Invalid payload. Expected a non-empty array of books." });
        }

        const insertedBooks = [];
        const errors = [];

        for (const bookData of books) {
            try {
                const existingBook = await Book.findOne({ isbn: bookData.isbn });
                if (existingBook) {
                    errors.push({ isbn: bookData.isbn, error: "ISBN already exists" });
                    continue;
                }

                const newBook = await new Book({ ...bookData }).save();
                await new Inventory({ 
                    bookId: newBook._id,
                    inHouseQuantity: bookData.inHouseQuantity ? parseInt(bookData.inHouseQuantity) : 0,
                    binLocation: bookData.binLocation || "General Shelf"
                }).save();
                insertedBooks.push(newBook._id);
            } catch (err) {
                errors.push({ isbn: bookData.isbn || "Unknown", error: err.message });
            }
        }

        res.status(200).send({
            message: `Successfully imported ${insertedBooks.length} books.`,
            insertedCount: insertedBooks.length,
            errorsCount: errors.length,
            errors
        });
    } catch (error) {
        console.error("Error importing books", error);
        res.status(500).send({ message: "Failed to import books" });
    }
}

module.exports = {
    postABook,
    getAllBooks,
    getSingleBook,
    UpdateBook,
    deleteABook,
    addReview,
    importBooks
}