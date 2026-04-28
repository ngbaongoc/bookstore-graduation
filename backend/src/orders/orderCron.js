const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Order = require('./order.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendAbandonedCartEmail = async (order) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.email,
        subject: 'Khôi phục giỏ hàng của bạn',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>Chào ${order.name},</h1>
                <p>Chúng tôi nhận thấy bạn đã để lại một số mặt hàng trong giỏ hàng.</p>
                <p>Đừng quên hoàn tất đơn hàng của bạn với tổng số tiền là <strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</strong>.</p>
                <a href="http://localhost:5173/checkout" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Quay lại thanh toán</a>
                <p>Trân trọng,<br>Đội ngũ Bookstore</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${order.email}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${order.email}:`, error);
        return false;
    }
};

const initAbandonedCartCron = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running abandoned cart cronjob...');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        try {
            const abandonedOrders = await Order.find({
                status: 'pending',
                reminderSent: false,
                createdAt: { $lt: oneDayAgo }
            });

            console.log(`Found ${abandonedOrders.length} abandoned orders.`);

            for (const order of abandonedOrders) {
                const success = await sendAbandonedCartEmail(order);
                if (success) {
                    order.reminderSent = true;
                    await order.save();
                }
            }
        } catch (error) {
            console.error('Error in abandoned cart cronjob:', error);
        }
    });

    console.log('Abandoned cart cronjob scheduled.');
};

module.exports = initAbandonedCartCron;
