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
        const orders = await Order.find({ email }).populate('productIds.productId').sort({ createdAt: -1 });
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
        const orders = await Order.find({ userId }).populate('productIds.productId').sort({ createdAt: -1 });
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
        const orders = await Order.find({ cancelOrder: { $ne: true } }).populate('productIds.productId').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders", error);
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData = { status };
        
        // Record the date this specific stage was achieved
        const stageFieldName = `stageDates.${status}`;
        updateData[stageFieldName] = new Date();

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
}

const requestCancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: "Reason is required" });

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.cancelOrder) return res.status(400).json({ message: "Order is already cancelled" });
        if (order.status === 'Delivery') return res.status(400).json({ message: "Cannot cancel a delivered order" });

        order.cancelRequest = { requested: true, reason, requestedAt: new Date(), status: 'pending' };
        await order.save();
        res.status(200).json({ message: "Cancel request submitted", order });
    } catch (error) {
        console.error("Error requesting cancel", error);
        res.status(500).json({ message: "Failed to submit cancel request" });
    }
}

const approveCancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Rollback inventory: move reserved back to inHouse for each product
        for (const item of order.productIds) {
            await Book.findByIdAndUpdate(item.productId, {
                $inc: {
                    "inventory.reservedQuantity": -item.quantity,
                    "inventory.inHouseQuantity": item.quantity,
                }
            });
        }

        order.cancelOrder = true;
        order.cancelRequest.requested = false;
        order.cancelRequest.status = 'approved';
        order.cancellationReason = order.cancelRequest.reason;
        await order.save();
        res.status(200).json({ message: "Order cancelled and inventory restored", order });
    } catch (error) {
        console.error("Error approving cancel", error);
        res.status(500).json({ message: "Failed to approve cancellation" });
    }
}

const disapproveCancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.cancelRequest.requested = false;
        order.cancelRequest.status = 'disapproved';
        await order.save();
        res.status(200).json({ message: "Cancel request disapproved", order });
    } catch (error) {
        console.error("Error disapproving cancel", error);
        res.status(500).json({ message: "Failed to disapprove cancellation" });
    }
}

module.exports = {
    createOrder,
    getOrdersByEmail,
    getOrdersByUserId,
    getAllOrders,
    updateOrderStatus,
    requestCancelOrder,
    approveCancelOrder,
    disapproveCancelOrder
};
