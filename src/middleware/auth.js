const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required: roles,
                current: req.user.role
            });
        }
        next();
    };
};

const isAdmin = roleMiddleware('admin', 'super_admin');
const isSuperAdmin = roleMiddleware('super_admin');
const isPatient = roleMiddleware('patient');
const isBystander = roleMiddleware('bystander');

module.exports = {
    authMiddleware,
    roleMiddleware,
    isAdmin,
    isSuperAdmin,
    isPatient,
    isBystander
};
