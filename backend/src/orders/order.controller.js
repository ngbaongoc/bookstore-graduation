const Order = require("./order.model");
const User = require("../users/user.model");
const Book = require("../books/book.model");
const OrderItem = require("./orderItem.model");
const Inventory = require("../inventory/inventory.model");
const { placeOrder, decreaseReservedStock } = require("../inventory/inventory.controller");

// Helper function to format order back to nested shape
const formatOrder = async (order) => {
    const items = await OrderItem.find({ orderId: order._id }).populate('bookId').lean();
    
    // Reconstruct productIds structure
    const productIds = items.map(item => ({
        productId: item.bookId, // book object
        quantity: item.quantity
    }));

    return {
        ...order,
        shippingAddress: {
            street: order.shippingStreet,
            city: order.shippingCity,
            country: order.shippingCountry,
            state: order.shippingState,
            zipcode: order.shippingZipcode
        },
        stageDates: {
            Pending: order.stagePending,
            Processing: order.stageProcessing,
            'Ready to pick up': order.stageReadyToPickUp,
            'Picked up': order.stagePickedUp,
            Delivery: order.stageDelivery,
            Delivered: order.stageDelivered
        },
        cancelRequest: {
            requested: order.cancelRequested,
            reason: order.cancelReason,
            requestedAt: order.cancelRequestedAt,
            status: order.cancelStatus
        },
        productIds
    };
};

const createOrder = async (req, res) => {
    try {
        const { userId, productIds, shippingAddress, ...otherData } = req.body;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(403).json({ message: "Only registered users can place an order. Please complete your profile in Settings." });
        }

        const reservedItems = [];
        for (const item of productIds) {
            const result = await placeOrder(item.productId, item.quantity);
            if (!result.success) {
                // Rollback
                for (const reserved of reservedItems) {
                    await Inventory.findOneAndUpdate(
                        { bookId: reserved.productId },
                        {
                            $inc: {
                                inHouseQuantity: reserved.quantity,
                                reservedQuantity: -reserved.quantity,
                            }
                        }
                    );
                }
                return res.status(400).json({ message: `Insufficient stock for one of the items. ${result.message}` });
            }
            reservedItems.push(item);
        }

        // Build flat order
        const flatOrderData = {
            ...otherData,
            userId,
            shippingStreet: shippingAddress?.street,
            shippingCity: shippingAddress?.city,
            shippingCountry: shippingAddress?.country,
            shippingState: shippingAddress?.state,
            shippingZipcode: shippingAddress?.zipcode,
            stagePending: new Date(),
        };

        const newOrder = new Order(flatOrderData);
        const savedOrder = await newOrder.save();

        // Save order items
        for (const item of productIds) {
            await new OrderItem({
                orderId: savedOrder._id,
                bookId: item.productId,
                quantity: item.quantity
            }).save();
        }

        const formatted = await formatOrder(savedOrder.toObject());
        res.status(200).json(formatted);
    } catch (error) {
        console.error("Error creating order", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

const getOrdersByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await Order.find({ email }).sort({ createdAt: -1 }).lean();
        if (!orders) return res.status(404).json({ message: "Order not found" });
        
        const formattedOrders = await Promise.all(orders.map(o => formatOrder(o)));
        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error("Error fetching orders by email", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }
        
        const formattedOrders = await Promise.all(orders.map(o => formatOrder(o)));
        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error("Error fetching orders by userId", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ cancelOrder: { $ne: true } }).sort({ createdAt: -1 }).lean();
        const formattedOrders = await Promise.all(orders.map(o => formatOrder(o)));
        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error("Error fetching all orders", error);
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData = { status };
        
        const stageMap = {
            'pending': 'stagePending',
            'Pending': 'stagePending',
            'Processing': 'stageProcessing',
            'Ready to pick up': 'stageReadyToPickUp',
            'Picked up': 'stagePickedUp',
            'Delivery': 'stageDelivery',
            'Delivered': 'stageDelivered'
        };
        updateData[stageMap[status]] = new Date();

        if (status === 'Delivery') {
            const order = await Order.findById(id);
            if (order && order.status !== 'Delivery' && order.status !== 'Delivered') {
                const items = await OrderItem.find({ orderId: order._id }).lean();
                const productIds = items.map(item => ({ productId: item.bookId, quantity: item.quantity }));
                await decreaseReservedStock(productIds);
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const formatted = await formatOrder(updatedOrder);
        res.status(200).json(formatted);
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
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: "Order cancellation is only allowed while the order is in Pending status." });
        }

        order.cancelRequested = true;
        order.cancelReason = reason;
        order.cancelRequestedAt = new Date();
        order.cancelStatus = 'pending';
        
        await order.save();
        const formatted = await formatOrder(order.toObject());
        res.status(200).json({ message: "Cancel request submitted", order: formatted });
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

        if (['Delivery', 'Delivered'].includes(order.status)) {
            return res.status(400).json({ message: "Cannot approve cancellation for a delivered order. Inventory has already been finalized." });
        }

        // Rollback inventory
        const items = await OrderItem.find({ orderId: order._id }).lean();
        for (const item of items) {
            await Inventory.findOneAndUpdate(
                { bookId: item.bookId, reservedQuantity: { $gte: item.quantity } },
                { 
                    $inc: { 
                        reservedQuantity: -item.quantity,
                        inHouseQuantity: item.quantity,
                    }
                }
            );
        }

        order.cancelOrder = true;
        order.cancelRequested = false;
        order.cancelStatus = 'approved';
        await order.save();
        
        const formatted = await formatOrder(order.toObject());
        res.status(200).json({ message: "Order cancelled and inventory restored", order: formatted });
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

        order.cancelRequested = false;
        order.cancelStatus = 'disapproved';
        await order.save();
        
        const formatted = await formatOrder(order.toObject());
        res.status(200).json({ message: "Cancel request disapproved", order: formatted });
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
