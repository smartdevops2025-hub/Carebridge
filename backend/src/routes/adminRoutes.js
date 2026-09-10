const express = require('express');
const router = express.Router();
const { User, Patient, Bystander, Booking } = require('../models');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const totalPatients = await Patient.count();
        const totalBystanders = await Bystander.count();
        const totalUsers = await User.count();
        const pendingVerifications = await Bystander.count({
            where: { verification_status: 'pending' }
        });
        const totalBookings = await Booking.count();
        const completedBookings = await Booking.count({
            where: { status: 'completed' }
        });

        // Revenue calculations
        const revenueResult = await Booking.sum('final_price', {
            where: { status: 'completed' }
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPatients,
                totalBystanders,
                pendingVerifications,
                totalBookings,
                completedBookings,
                totalRevenue: revenueResult || 0,
                // Recent activity
                recentUsers: await User.findAll({
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: { exclude: ['password'] }
                }),
                recentBookings: await Booking.findAll({
                    limit: 5,
                    order: [['created_at', 'DESC']]
                })
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard data',
            error: error.message
        });
    }
});

// @route   GET /api/admin/bystanders/pending
router.get('/bystanders/pending', async (req, res) => {
    try {
        const bystanders = await Bystander.findAll({
            where: { verification_status: 'pending' },
            include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
            }]
        });

        res.json({
            success: true,
            data: bystanders
        });
    } catch (error) {
        console.error('Pending Bystanders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending bystanders',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/bystanders/:id/verify
router.put('/bystanders/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "verified" or "rejected"'
            });
        }

        const bystander = await Bystander.findByPk(id);
        if (!bystander) {
            return res.status(404).json({
                success: false,
                message: 'Bystander not found'
            });
        }

        await bystander.update({
            verification_status: status,
            verification_notes: notes,
            verified_at: status === 'verified' ? new Date() : null,
            verified_by: req.userId
        });

        // If verified, activate user
        if (status === 'verified') {
            await User.update(
                { is_active: true },
                { where: { id: bystander.user_id } }
            );
        }

        res.json({
            success: true,
            message: `Bystander ${status} successfully`,
            data: bystander
        });
    } catch (error) {
        console.error('Verify Bystander Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify bystander',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (role) whereClause.role = role;

        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                users: users.rows,
                total: users.count,
                page: parseInt(page),
                totalPages: Math.ceil(users.count / limit)
            }
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
});

// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) whereClause.status = status;

        const bookings = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] },
                { model: Bystander, as: 'bystander', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                bookings: bookings.rows,
                total: bookings.count,
                page: parseInt(page),
                totalPages: Math.ceil(bookings.count / limit)
            }
        });
    } catch (error) {
        console.error('Get Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookings',
            error: error.message
        });
    }
});

module.exports = router;
