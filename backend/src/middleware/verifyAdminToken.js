const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expired. Please login again.' });
            }
            return res.status(403).json({ message: 'Invalid token' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        req.user = user;
        next();
    });
};

module.exports = verifyAdminToken;
