const User = require("./user.model");
const Order = require("../orders/order.model");
const bcrypt = require('bcrypt');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const sendEmail = require('../utils/sendEmail');

const registerUser = async (req, res) => {
    const { username, userId, email, password, phone } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
        if (existingUser) {
            return res.status(400).send({ message: "User with this email or userId already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, userId, email, password: hashedPassword, phone });
        await newUser.save();
        res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
        console.error("Failed to register user", error);
        res.status(500).send({ message: "Failed to register user" });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        console.error("Failed to fetch user profile", error);
        res.status(500).send({ message: "Failed to fetch user profile" });
    }
}

const createOrUpdateProfile = async (req, res) => {
    try {
        const { username, userId, email, phone } = req.body;
        
        let user = await User.findOne({ email });
        
        if (user) {
            // Update existing
            user.username = username || user.username;
            user.phone = phone || user.phone;
            // userId stays unchanged as per requirement if it already exists
            await user.save();
        } else {
            // Create new for Firebase user (no password needed as they are pre-authenticated)
            user = new User({ 
                username, 
                userId, 
                email, 
                phone, 
                password: 'firebase_authenticated' // placeholder, won't be used for login
            });
            await user.save();
        }

        res.status(200).send({
            message: "Profile synced successfully",
            user: user
        });
    } catch (error) {
        console.error("Failed to sync user profile", error);
        res.status(500).send({ message: "Failed to sync user profile", error: error.message });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { email } = req.params;
        const { username, phone, email: newEmail } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        user.username = username || user.username;
        user.phone = phone || user.phone;
        if (newEmail) user.email = newEmail;

        await user.save();

        res.status(200).send({
            message: "Profile updated successfully",
            user: user
        });
    } catch (error) {
        console.error("Failed to update user profile", error);
        res.status(500).send({ message: "Failed to update user profile", error: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        const rfmReport = await getRFMAnalysis();

        // 1. Gather all users' favorite genre by finding the most frequently purchased category
        const genreAggregation = await Order.aggregate([
            { $unwind: "$productIds" },
            {
                $lookup: {
                    from: "books", // the collection name defined in book.model.js
                    localField: "productIds.productId",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: "$bookDetails" },
            {
                $group: {
                    _id: { userId: "$userId", category: "$bookDetails.category" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            {
                $group: {
                    _id: "$_id.userId",
                    favoriteCategory: { $first: "$_id.category" }
                }
            }
        ]);

        const favoriteGenreMap = {};
        for (const item of genreAggregation) {
            favoriteGenreMap[item._id] = item.favoriteCategory;
        }

        // Build a lookup map: userId -> RFM data
        const rfmMap = {};
        for (const entry of rfmReport) {
            rfmMap[entry.userId] = {
                rfmCode: entry.rfmCode,
                segment: entry.segment,
            };
        }

        // Merge RFM data and favoriteGenre into each user
        const usersWithRFM = users.map(user => ({
            ...user,
            rfmCode: rfmMap[user.userId]?.rfmCode || null,
            segment: rfmMap[user.userId]?.segment || "No Orders",
            favoriteGenre: favoriteGenreMap[user.userId] || null,
        }));

        res.status(200).send(usersWithRFM);
    } catch (error) {
        console.error("Failed to fetch users", error);
        res.status(500).send({ message: "Failed to fetch users" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Failed to delete user", error);
        res.status(500).send({ message: "Failed to delete user" });
    }
}

const sendVouchers = async (req, res) => {
    try {
        const { emails } = req.body;
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).send({ message: "No recipient emails provided" });
        }

        const subject = "Món quà đặc biệt từ Bookstore - Giảm giá 20% cho bạn!";
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #3b82f6; color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Cảm ơn bạn đã luôn đồng hành cùng Bookstore!</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6; color: #374151;">
                    <p style="font-size: 18px;">Chào bạn,</p>
                    <p>Vì bạn là một khách hàng thân thiết của chúng tôi, Bookstore xin gửi tặng bạn một mã giảm giá đặc biệt để tri ân sự ủng hộ của bạn trong suốt thời gian qua.</p>
                    <div style="background-color: #f3f4f6; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Mã giảm giá của bạn:</p>
                        <h2 style="margin: 10px 0; font-size: 32px; color: #1e40af; font-family: 'Courier New', Courier, monospace;">LOYALTY20</h2>
                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #3b82f6;">GIẢM 20% CHO ĐƠN HÀNG TIẾP THEO</p>
                    </div>
                    <p>Mã giảm giá này có thể được áp dụng khi bạn thanh toán tại website của chúng tôi.</p>
                    <div style="text-align: center; margin-top: 40px;">
                        <a href="http://localhost:5173" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ghé thăm cửa hàng ngay</a>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">&copy; 2026 Bookstore. Mọi quyền được bảo lưu.</p>
                    <p style="margin: 5px 0;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
                </div>
            </div>
        `;

        const results = await Promise.all(emails.map(email => 
            sendEmail({ to: email, subject, html })
        ));

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.status(200).send({
            message: `Emails processed: ${successful} sent, ${failed} failed.`,
            successful,
            failed
        });
    } catch (error) {
        console.error("Failed to send vouchers", error);
        res.status(500).send({ message: "Failed to send vouchers", error: error.message });
    }
}

module.exports = {
    registerUser,
    getUserProfile,
    updateUserProfile,
    createOrUpdateProfile,
    getUsers,
    deleteUser,
    sendVouchers
}
