const Book = require('../books/book.model');
const Order = require('../orders/order.model');
const Inventory = require('./inventory.model');

// Step 1: Manual Stock adjustment
const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToAdd } = req.body;

    const updatedInventory = await Inventory.findOneAndUpdate(
      { bookId: id },
      {
        $inc: { inHouseQuantity: quantityToAdd }
      },
      { new: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: "Inventory not found for this book" });
    }

    res.status(200).json({ success: true, message: `Added ${quantityToAdd} units to shelf`, inventory: updatedInventory });
  } catch (error) {
    console.error("Adjust Stock Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const adjustBinLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { newBinLocation } = req.body;

    const updatedInventory = await Inventory.findOneAndUpdate(
      { bookId: id },
      {
        $set: { binLocation: newBinLocation }
      },
      { new: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: "Inventory not found for this book" });
    }

    res.status(200).json({ success: true, message: `Moved to new bin ${newBinLocation}`, inventory: updatedInventory });
  } catch (error) {
    console.error("Adjust Bin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Original place order script
const placeOrder = async (bookId, quantityRequested) => {
  try {
    // 1. ATOMIC UPDATE: Decrease shelf stock AND Increase reserved stock
    const updatedInventory = await Inventory.findOneAndUpdate(
      { 
        bookId: bookId, 
        inHouseQuantity: { $gte: quantityRequested } 
      },
      { 
        $inc: { 
          inHouseQuantity: -quantityRequested, 
          reservedQuantity: quantityRequested 
        } 
      },
      { new: true }
    );

    if (!updatedInventory) {
      return { success: false, message: "Insufficient stock on shelf." };
    }

    return { 
      success: true, 
      message: "Books locked for packing!", 
      remainingOnShelf: updatedInventory.inHouseQuantity,
      nowReserved: updatedInventory.reservedQuantity 
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
    
    // Find low stock directly from Inventory
    const lowStockInventories = await Inventory.find({ inHouseQuantity: { $lt: 10 } }).populate('bookId', 'title');
    const lowStockBooks = lowStockInventories.map(inv => ({ _id: inv.bookId._id, title: inv.bookId.title, inventory: { inHouseQuantity: inv.inHouseQuantity } }));

    const cancelRequestsCount = await Order.countDocuments({ cancelRequested: true, cancelOrder: { $ne: true } });
    
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

const decreaseReservedStock = async (productIds) => {
  try {
    for (const item of productIds) {
      // Ensure reservedQuantity never drops below 0 by adding a guard in the query
      await Inventory.findOneAndUpdate(
        { bookId: item.productId, reservedQuantity: { $gte: item.quantity } },
        { $inc: { reservedQuantity: -item.quantity } }
      );
      
      // Fallback: If for some reason the above didn't match (already low), 
      // we ensure it's at least 0 and not negative if we were to force it.
      // But the $gte guard is the preferred way to prevent underflow.
    }
    return { success: true };
  } catch (error) {
    console.error("Decrease Reserved Stock Error:", error);
    throw error;
  }
};

module.exports = {
  placeOrder,
  adjustStock,
  adjustBinLocation,
  getAlerts,
  decreaseReservedStock
};
