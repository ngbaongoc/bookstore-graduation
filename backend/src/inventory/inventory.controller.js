const Book = require('../books/book.model');
const Order = require('../orders/order.model');

// Step 1: Manual Stock adjustment
const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToAdd } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        $inc: { "inventory.inHouseQuantity": quantityToAdd }
      },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ success: true, message: `Added ${quantityToAdd} units to shelf`, book: updatedBook });
  } catch (error) {
    console.error("Adjust Stock Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Original place order script
const placeOrder = async (bookId, quantityRequested) => {
  try {
    // 1. ATOMIC UPDATE: Decrease shelf stock AND Increase reserved stock
    const updatedBook = await Book.findOneAndUpdate(
      { 
        _id: bookId, 
        "inventory.inHouseQuantity": { $gte: quantityRequested } 
      },
      { 
        $inc: { 
          "inventory.inHouseQuantity": -quantityRequested, 
          "inventory.reservedQuantity": quantityRequested 
        } 
      },
      { new: true }
    );

    if (!updatedBook) {
      return { success: false, message: "Insufficient stock on shelf." };
    }

    return { 
      success: true, 
      message: "Books locked for packing!", 
      remainingOnShelf: updatedBook.inventory.inHouseQuantity,
      nowReserved: updatedBook.inventory.reservedQuantity 
    };

  } catch (error) {
    console.error("Inventory Lock Error:", error);
    throw error;
  }
};

const getAlerts = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newOrdersCount = await Order.countDocuments({ createdAt: { $gte: oneDayAgo } });
    
    const lowStockBooks = await Book.find({ "inventory.inHouseQuantity": { $lt: 5 } }).select('title inventory.inHouseQuantity');

    const cancelRequestsCount = await Order.countDocuments({ 'cancelRequest.requested': true, cancelOrder: { $ne: true } });
    
    res.status(200).json({
      success: true,
      newOrdersCount,
      lowStockBooksCount: lowStockBooks.length,
      lowStockBooks,
      cancelRequestsCount
    });
  } catch (error) {
    console.error("Fetch Alerts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  placeOrder,
  adjustStock,
  getAlerts
};
