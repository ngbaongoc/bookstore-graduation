const Order = require("./order.model");
const User = require("../users/user.model");
const Book = require("../books/book.model");
const { placeOrder } = require("../inventory/inventory.controller");

const createOrder = async (req, res) => {
    try {
        const { userId, productIds } = req.body;

        // Verify user exists in MongoDB using the 6-digit userId string
        const user = await User.findOne({ userId });
        if (!user) {
            console.warn(`Order attempt rejected: User with ID ${userId} not found.`);
            return res.status(403).json({ message: "Only registered users can place an order. Please complete your profile in Settings." });
        }

        // Reserve inventory for each item (decrease inHouseQuantity, increase reservedQuantity)
        const reservedItems = [];
        for (const item of productIds) {
            const result = await placeOrder(item.productId, item.quantity);
            if (!result.success) {
                // Rollback previously reserved items
                for (const reserved of reservedItems) {
                    await Book.findByIdAndUpdate(reserved.productId, {
                        $inc: {
                            "inventory.inHouseQuantity": reserved.quantity,
                            "inventory.reservedQuantity": -reserved.quantity,
                        }
                    });
                }
                return res.status(400).json({
                    message: `Insufficient stock for one of the items. ${result.message}`
                });
            }
            reservedItems.push(item);
        }

        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (error) {
        console.error("Error creating order", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

const getOrdersByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await Order.find({ email }).sort({ createdAt: -1 });
        if (!orders) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders by email", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders by userId", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders", error);
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
}

module.exports = {
    createOrder,
    getOrdersByEmail,
    getOrdersByUserId,
    getAllOrders
};
