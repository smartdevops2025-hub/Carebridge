const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Patient, Bystander } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const otpService = require('../utils/otpService');
const { Op } = require('sequelize');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, mobile, password, full_name, role, ...otherData } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { mobile }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or mobile'
            });
        }

        // Create user
        const user = await User.create({
            email,
            mobile,
            password,
            full_name,
            role: role || 'patient',
            ...otherData
        });

        // Create role-specific profile
        if (role === 'patient') {
            await Patient.create({
                user_id: user.id,
                ...otherData
            });
        } else if (role === 'bystander') {
            await Bystander.create({
                user_id: user.id,
                verification_status: 'pending',
                ...otherData
            });
        }

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        const whereClause = {};
        if (email) whereClause.email = email;
        if (mobile) whereClause.mobile = mobile;

        if (!Object.keys(whereClause).length) {
            return res.status(400).json({
                success: false,
                message: 'Email or mobile is required'
            });
        }

        const user = await User.findOne({ where: whereClause });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await user.update({ last_login: new Date() });

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// @route   POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
    try {
        const { mobile, userId } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }

        const otp = otpService.generateOTP();
        const result = await otpService.sendMobileOTP(mobile, otp, userId);

        if (result.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully',
                data: { mobile }
            });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Request OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.message
        });
    }
});

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, otp, userId } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile and OTP are required'
            });
        }

        const result = await otpService.verifyOTP(mobile, otp, userId);

        if (result.success) {
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        let profile = null;
        if (user.role === 'patient') {
            profile = await Patient.findOne({ where: { user_id: user.id } });
        } else if (user.role === 'bystander') {
            profile = await Bystander.findOne({ where: { user_id: user.id } });
        }

        res.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
});

module.exports = router;
