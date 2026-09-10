const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Bookings',
            key: 'id'
        }
    },
    razorpay_order_id: {
        type: DataTypes.STRING(50)
    },
    razorpay_payment_id: {
        type: DataTypes.STRING(50)
    },
    razorpay_signature: {
        type: DataTypes.STRING(100)
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'INR'
    },
    payment_method: {
        type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet', 'cod'),
        defaultValue: 'upi'
    },
    status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    refund_id: {
        type: DataTypes.STRING(50)
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    refund_reason: {
        type: DataTypes.TEXT
    },
    invoice_url: {
        type: DataTypes.STRING(255)
    }
});

module.exports = Payment;
