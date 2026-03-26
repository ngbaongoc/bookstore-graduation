const Book = require('../books/book.model');
const InventoryLog = require('./inventoryLog.model');

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

    // Log it
    await InventoryLog.create({
      actionType: 'ADJUST_STOCK',
      bookId: id,
      quantityChanged: quantityToAdd,
      description: `Added ${quantityToAdd} units to In-House stock.`
    });

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

    await InventoryLog.create({
      actionType: 'PLACE_ORDER',
      bookId,
      quantityChanged: quantityRequested,
      description: `Reserved ${quantityRequested} units for customer order.`
    });

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

// Original 3PL Handover script
const confirm3PLPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityPickedUp } = req.body; // or default to all reserved

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const pickupAmt = quantityPickedUp || book.inventory.reservedQuantity;
    if (pickupAmt <= 0) {
       return res.status(400).json({ message: "No reserved stock to hand over" });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id, 
      {
        $inc: { "inventory.reservedQuantity": -pickupAmt }
      },
      { new: true }
    );
    
    await InventoryLog.create({
      actionType: 'HANDOVER_3PL',
      bookId: id,
      quantityChanged: pickupAmt,
      description: `Handed ${pickupAmt} units to 3PL carrier.`
    });
    
    res.status(200).json({ success: true, message: `Handed ${pickupAmt} units to carrier`, book: updatedBook });
  } catch (error) {
    console.error("Handover Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Pack Order - Just logs the action for the dashboard "Mark as Packed" button
const packOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    await InventoryLog.create({
      actionType: 'PACK_ORDER',
      bookId: id,
      quantityChanged: 0,
      description: `Book physically picked and packed, awaiting 3PL.`
    });

    res.status(200).json({ success: true, message: `Order marked as packed for 3PL` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate('bookId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  placeOrder,
  confirm3PLPickup,
  adjustStock,
  packOrder,
  getLogs
};
