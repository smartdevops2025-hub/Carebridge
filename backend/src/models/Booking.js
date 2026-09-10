const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    booking_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bystander_id: {
        type: DataTypes.INTEGER
    },
    service_type: {
        type: DataTypes.ENUM('hospital_stay', 'home_care', 'emergency', 'elderly_care'),
        allowNull: false
    },
    service_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    service_duration_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    pickup_address: {
        type: DataTypes.TEXT
    },
    delivery_address: {
        type: DataTypes.TEXT
    },
    patient_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    patient_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    bystander_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    bystander_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    estimated_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    final_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    commission_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    status: {
        type: DataTypes.ENUM(
            'pending', 'confirmed', 'assigned', 'in_progress', 
            'completed', 'cancelled', 'refunded'
        ),
        defaultValue: 'pending'
    },
    otp_verification: {
        type: DataTypes.STRING(6)
    },
    otp_verified_at: {
        type: DataTypes.DATE
    },
    service_started_at: {
        type: DataTypes.DATE
    },
    service_ended_at: {
        type: DataTypes.DATE
    },
    patient_rating: {
        type: DataTypes.FLOAT,
        min: 1,
        max: 5
    },
    bystander_rating: {
        type: DataTypes.FLOAT,
        min: 1,
        max: 5
    },
    patient_review: {
        type: DataTypes.TEXT
    },
    bystander_review: {
        type: DataTypes.TEXT
    },
    cancellation_reason: {
        type: DataTypes.TEXT
    },
    invoice_url: {
        type: DataTypes.STRING(255)
    }
});

module.exports = Booking;
