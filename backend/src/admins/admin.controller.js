const Admin = require("./admin.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const sendEmail = require('../utils/sendEmail');
const ScheduledEmail = require('../emails/scheduledEmail.model');

const JWT_SECRET = process.env.JWT_SECRET_KEY

const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ $or: [{ username }, { email: username }] });
        if (!admin) {
            return res.status(404).send({ message: "Admin not found!" })
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid password!" })
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        )

        return res.status(200).send({
            message: "Authentication successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        })

    } catch (error) {
        console.error("Failed to login as admin", error)
        res.status(500).send({ message: "Failed to login as admin" })
    }
}

const registerAdmin = async (req, res) => {
    const { username, password, email, userId, phone } = req.body;
    try {
        const newAdmin = new Admin({ 
            username, 
            password, 
            email: email || `${username}@admin.com`, 
            userId: userId || `admin_${Date.now()}`, 
            phone: phone || '0000000000',
            role: 'admin' 
        });
        await newAdmin.save();
        res.status(201).send({ message: "Admin registered successfully" });
    } catch (error) {
        console.error("Failed to register admin", error);
        res.status(400).send({ message: "Failed to register admin" });
    }
}

const getRFMReport = async (req, res) => {
    try {
        const report = await getRFMAnalysis();
        res.status(200).json(report);
    } catch (error) {
        console.error("Failed to fetch RFM report", error);
        res.status(500).send({ message: "Failed to fetch RFM report" });
    }
}

const composeSendEmail = async (req, res) => {
    const { to, subject, html, scheduledAt } = req.body;
    if (!to || !subject || !html) {
        return res.status(400).send({ message: "Missing required fields: to, subject, html" });
    }
    try {
        // If scheduledAt is provided, save to DB for cron to pick up
        if (scheduledAt) {
            const scheduled = new ScheduledEmail({
                to, subject, html,
                scheduledAt: new Date(scheduledAt)
            });
            await scheduled.save();
            return res.status(200).send({
                message: "Email scheduled successfully",
                scheduledAt: scheduled.scheduledAt
            });
        }

        // Otherwise send immediately
        const result = await sendEmail({ to, subject, html });
        if (result.success) {
            return res.status(200).send({ message: "Email sent successfully", messageId: result.messageId });
        } else {
            return res.status(500).send({ message: "Failed to send email", error: result.error });
        }
    } catch (error) {
        console.error("Failed to send email", error);
        res.status(500).send({ message: "Failed to send email" });
    }
};

module.exports = {
    adminLogin,
    registerAdmin,
    getRFMReport,
    composeSendEmail
}
