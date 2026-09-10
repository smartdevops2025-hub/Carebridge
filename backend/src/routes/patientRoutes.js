const express = require('express');
const router = express.Router();
const { Patient, Booking, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// All patient routes require authentication
router.use(authMiddleware);

// @route   GET /api/patient/profile
router.get('/profile', async (req, res) => {
    try {
        const patient = await Patient.findOne({
            where: { user_id: req.userId },
            include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
            }]
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Get Patient Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
});

// @route   PUT /api/patient/profile
router.put('/profile', async (req, res) => {
    try {
        const patient = await Patient.findOne({
            where: { user_id: req.userId }
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        await patient.update(req.body);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: patient
        });
    } catch (error) {
        console.error('Update Patient Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// @route   GET /api/patient/bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { patient_id: req.userId },
            include: [
                { model: Bystander, as: 'bystander', include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile', 'email'] }] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get Patient Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookings',
            error: error.message
        });
    }
});

module.exports = router;
