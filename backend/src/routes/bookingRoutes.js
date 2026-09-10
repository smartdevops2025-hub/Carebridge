const express = require('express');
const router = express.Router();
const { Booking, Patient, Bystander, User } = require('../models');
const { authMiddleware, isPatient, isBystander } = require('../middleware/auth');
const otpService = require('../utils/otpService');

// All booking routes require authentication
router.use(authMiddleware);

// @route   POST /api/booking/create
router.post('/create', isPatient, async (req, res) => {
    try {
        const {
            service_type,
            service_date,
            service_duration_hours,
            pickup_address,
            delivery_address,
            patient_latitude,
            patient_longitude
        } = req.body;

        // Create booking
        const booking = await Booking.create({
            patient_id: req.userId,
            service_type,
            service_date,
            service_duration_hours: service_duration_hours || 1,
            pickup_address,
            delivery_address,
            patient_latitude,
            patient_longitude,
            status: 'pending',
            estimated_price: 500 // Calculate based on service
        });

        // Generate OTP for verification
        const otp = otpService.generateOTP();
        await booking.update({ otp_verification: otp });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// @route   GET /api/booking/:id
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile', 'email'] }] },
                { model: Bystander, as: 'bystander', include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile', 'email'] }] }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get booking',
            error: error.message
        });
    }
});

// @route   PUT /api/booking/:id/accept
router.put('/:id/accept', isBystander, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Booking is no longer available'
            });
        }

        await booking.update({
            bystander_id: req.userId,
            status: 'assigned'
        });

        res.json({
            success: true,
            message: 'Booking accepted successfully',
            data: booking
        });
    } catch (error) {
        console.error('Accept Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept booking',
            error: error.message
        });
    }
});

// @route   PUT /api/booking/:id/start-service
router.put('/:id/start-service', isBystander, async (req, res) => {
    try {
        const { otp } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.otp_verification !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        await booking.update({
            status: 'in_progress',
            otp_verified_at: new Date(),
            service_started_at: new Date()
        });

        res.json({
            success: true,
            message: 'Service started successfully',
            data: booking
        });
    } catch (error) {
        console.error('Start Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start service',
            error: error.message
        });
    }
});

// @route   PUT /api/booking/:id/complete
router.put('/:id/complete', async (req, res) => {
    try {
        const { patient_rating, bystander_rating, patient_review, bystander_review } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        await booking.update({
            status: 'completed',
            service_ended_at: new Date(),
            patient_rating,
            bystander_rating,
            patient_review,
            bystander_review
        });

        // Update ratings
        if (patient_rating) {
            const patient = await Patient.findOne({ where: { user_id: booking.patient_id } });
            if (patient) {
                await patient.update({
                    rating_sum: patient.rating_sum + patient_rating,
                    rating_count: patient.rating_count + 1
                });
            }
        }

        if (bystander_rating && booking.bystander_id) {
            const bystander = await Bystander.findOne({ where: { user_id: booking.bystander_id } });
            if (bystander) {
                await bystander.update({
                    rating_sum: bystander.rating_sum + bystander_rating,
                    rating_count: bystander.rating_count + 1,
                    total_jobs_completed: bystander.total_jobs_completed + 1
                });
            }
        }

        res.json({
            success: true,
            message: 'Service completed successfully',
            data: booking
        });
    } catch (error) {
        console.error('Complete Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete service',
            error: error.message
        });
    }
});

// @route   PUT /api/booking/:id/cancel
router.put('/:id/cancel', async (req, res) => {
    try {
        const { cancellation_reason } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be cancelled'
            });
        }

        await booking.update({
            status: 'cancelled',
            cancellation_reason
        });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
});

module.exports = router;
