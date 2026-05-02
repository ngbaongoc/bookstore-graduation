const Admin = require("./admin.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getRFMAnalysis } = require('../orders/rfm_analysis');
const sendEmail = require('../utils/sendEmail');
const ScheduledEmail = require('../emails/scheduledEmail.model');
const { runWrappedEmailCampaign } = require('../crons/wrappedEmailCron');
const { buildWrappedStats, renderWrappedEmail } = require('../emails/wrappedEmail');
const { buildMysteryDate, renderMysteryEmail } = require('../emails/mysteryEmail');

const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    try {
        const admin = await Admin.findOne({ username });
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
            { expiresIn: "24h" }
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

const triggerWrappedCampaign = async (req, res) => {
    try {
        res.status(200).send({ message: "Reader's Wrapped campaign is now running in the background. Check server logs for progress." });
        setImmediate(() => runWrappedEmailCampaign());
    } catch (error) {
        console.error("Failed to trigger Wrapped campaign", error);
        res.status(500).send({ message: "Failed to trigger campaign" });
    }
};

/**
 * GET /api/admin/wrapped-preview/:userId
 * Returns rendered Reader's Wrapped HTML for a specific user (for admin preview).
 */
const getWrappedPreview = async (req, res) => {
    try {
        const { userId } = req.params;
        const year = new Date().getFullYear();
        const stats = await buildWrappedStats(userId, year);
        if (!stats) {
            return res.status(404).json({ message: `No delivered orders found for userId "${userId}" in ${year}.` });
        }
        const html = renderWrappedEmail(stats);
        res.status(200).json({ html, stats });
    } catch (error) {
        console.error("Failed to generate Wrapped preview", error);
        res.status(500).send({ message: "Failed to generate preview" });
    }
};

/**
 * GET /api/admin/mystery-preview/:userId
 * Returns rendered Mystery Book Date HTML for a specific user (for admin preview).
 */
const getMysteryPreview = async (req, res) => {
    try {
        const { userId } = req.params;
        const mysteryData = await buildMysteryDate(userId);
        if (!mysteryData || !mysteryData.bookId) {
            return res.status(404).json({ message: `No suitable candidate books found for userId "${userId}".` });
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const html = renderMysteryEmail(mysteryData, frontendUrl);
        res.status(200).json({ html, data: mysteryData });
    } catch (error) {
        console.error("Failed to generate Mystery Book preview", error);
        res.status(500).send({ message: "Failed to generate preview" });
    }
};

module.exports = {
    adminLogin,
    registerAdmin,
    getRFMReport,
    composeSendEmail,
    triggerWrappedCampaign,
    getWrappedPreview,
    getMysteryPreview
}
