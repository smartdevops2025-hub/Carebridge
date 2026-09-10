const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    emergency_contact: {
        type: DataTypes.STRING(15)
    },
    emergency_contact_name: {
        type: DataTypes.STRING(100)
    },
    medical_conditions: {
        type: DataTypes.TEXT
    },
    preferred_service: {
        type: DataTypes.ENUM('hospital_stay', 'home_care', 'emergency', 'elderly_care'),
        defaultValue: 'home_care'
    },
    gps_latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    gps_longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    total_bookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating_sum: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    rating_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Patient;
