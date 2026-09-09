const express = require('express');
const router = express.Router();
const { Bystander, Booking, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { uploadKYCDocuments } = require('../middleware/upload');

// All bystander routes require authentication
router.use(authMiddleware);

// @route   GET /api/bystander/profile
router.get('/profile', async (req, res) => {
    try {
        const bystander = await Bystander.findOne({
            where: { user_id: req.userId },
            include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
            }]
        });

        if (!bystander) {
            return res.status(404).json({
                success: false,
                message: 'Bystander profile not found'
            });
        }

        res.json({
            success: true,
            data: bystander
        });
    } catch (error) {
        console.error('Get Bystander Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
});

// @route   PUT /api/bystander/profile
router.put('/profile', async (req, res) => {
    try {
        const bystander = await Bystander.findOne({
            where: { user_id: req.userId }
        });

        if (!bystander) {
            return res.status(404).json({
                success: false,
                message: 'Bystander profile not found'
            });
        }

        await bystander.update(req.body);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: bystander
        });
    } catch (error) {
        console.error('Update Bystander Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// @route   POST /api/bystander/kyc/upload
router.post('/kyc/upload', uploadKYCDocuments, async (req, res) => {
    try {
        const bystander = await Bystander.findOne({
            where: { user_id: req.userId }
        });

        if (!bystander) {
            return res.status(404).json({
                success: false,
                message: 'Bystander profile not found'
            });
        }

        const files = req.files;
        const updateData = {};

        if (files.aadhaar_front) {
            updateData.aadhaar_front = files.aadhaar_front[0].path;
        }
        if (files.aadhaar_back) {
            updateData.aadhaar_back = files.aadhaar_back[0].path;
        }
        if (files.pan_image) {
            updateData.pan_image = files.pan_image[0].path;
        }
        if (files.selfie_image) {
            updateData.selfie_image = files.selfie_image[0].path;
        }
        if (files.experience_certificate) {
            updateData.experience_certificate = files.experience_certificate[0].path;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        await bystander.update(updateData);

        res.json({
            success: true,
            message: 'KYC documents uploaded successfully',
            data: bystander
        });
    } catch (error) {
        console.error('KYC Upload Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload documents',
            error: error.message
        });
    }
});

// @route   GET /api/bystander/bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { bystander_id: req.userId },
            include: [
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile', 'email'] }] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get Bystander Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookings',
            error: error.message
        });
    }
});

// @route   PUT /api/bystander/availability
router.put('/availability', async (req, res) => {
    try {
        const { is_available } = req.body;

        const bystander = await Bystander.findOne({
            where: { user_id: req.userId }
        });

        if (!bystander) {
            return res.status(404).json({
                success: false,
                message: 'Bystander profile not found'
            });
        }

        await bystander.update({ is_available });

        res.json({
            success: true,
            message: `Availability updated to ${is_available ? 'available' : 'unavailable'}`,
            data: bystander
        });
    } catch (error) {
        console.error('Update Availability Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update availability',
            error: error.message
        });
    }
});

module.exports = router;
