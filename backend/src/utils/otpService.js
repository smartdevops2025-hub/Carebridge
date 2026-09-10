const axios = require('axios');
const crypto = require('crypto');
const { Verification } = require('../models');
const { Op } = require('sequelize');

class OTPService {
    constructor() {
        this.apiKey = process.env.FAST2SMS_API_KEY;
        this.senderId = process.env.FAST2SMS_SENDER_ID || 'CBYTEL';
        this.baseUrl = 'https://www.fast2sms.com/dev/bulkV2';
    }

    generateOTP(length = 6) {
        return crypto.randomInt(100000, 999999).toString();
    }

    async sendMobileOTP(mobile, otp, userId = null) {
        try {
            const response = await axios.post(this.baseUrl, {
                route: 'otp',
                variables_values: otp,
                numbers: mobile,
                sender_id: this.senderId
            }, {
                headers: {
                    'authorization': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.return) {
                // Save OTP to database
                await Verification.create({
                    user_id: userId || 0,
                    type: 'mobile',
                    code: otp,
                    data: { mobile },
                    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                });
                return { success: true, message: 'OTP sent successfully' };
            } else {
                throw new Error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('OTP Send Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    }

    async verifyOTP(mobile, otp, userId = null, type = 'mobile') {
        try {
            const whereClause = {
                type: type,
                code: otp,
                expires_at: { [Op.gt]: new Date() },
                status: 'pending'
            };

            if (userId) {
                whereClause.user_id = userId;
            }

            const verification = await Verification.findOne({
                where: whereClause,
                order: [['created_at', 'DESC']]
            });

            if (!verification) {
                return { success: false, message: 'Invalid or expired OTP' };
            }

            // Update attempts
            await verification.update({
                attempts: verification.attempts + 1
            });

            if (verification.attempts >= 5) {
                await verification.update({ status: 'failed' });
                return { success: false, message: 'Too many attempts. Please request a new OTP.' };
            }

            await verification.update({
                status: 'verified',
                verified_at: new Date()
            });

            return { success: true, message: 'OTP verified successfully' };
        } catch (error) {
            console.error('OTP Verification Error:', error.message);
            return { success: false, message: 'Failed to verify OTP' };
        }
    }

    async resendOTP(mobile, userId = null, type = 'mobile') {
        try {
            // Generate new OTP
            const otp = this.generateOTP();

            // Invalidate previous OTPs
            await Verification.update(
                { status: 'expired' },
                {
                    where: {
                        user_id: userId || 0,
                        type: type,
                        status: 'pending'
                    }
                }
            );

            // Send new OTP
            return await this.sendMobileOTP(mobile, otp, userId);
        } catch (error) {
            console.error('Resend OTP Error:', error.message);
            return { success: false, message: 'Failed to resend OTP' };
        }
    }
}

module.exports = new OTPService();
