const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bystander = sequelize.define('Bystander', {
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
    // KYC Documents
    aadhaar_number: {
        type: DataTypes.STRING(12)
    },
    aadhaar_front: {
        type: DataTypes.STRING(255)
    },
    aadhaar_back: {
        type: DataTypes.STRING(255)
    },
    pan_number: {
        type: DataTypes.STRING(10)
    },
    pan_image: {
        type: DataTypes.STRING(255)
    },
    selfie_image: {
        type: DataTypes.STRING(255)
    },
    experience_certificate: {
        type: DataTypes.STRING(255)
    },
    experience_years: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Bank Details
    bank_account_number: {
        type: DataTypes.STRING(20)
    },
    bank_ifsc: {
        type: DataTypes.STRING(11)
    },
    bank_account_name: {
        type: DataTypes.STRING(100)
    },
    // Verification Status
    verification_status: {
        type: DataTypes.ENUM('pending', 'under_review', 'verified', 'rejected', 'suspended'),
        defaultValue: 'pending'
    },
    verification_notes: {
        type: DataTypes.TEXT
    },
    verified_at: {
        type: DataTypes.DATE
    },
    verified_by: {
        type: DataTypes.INTEGER
    },
    // Police Verification
    police_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    police_verification_date: {
        type: DataTypes.DATE
    },
    // Professional Details
    skills: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    service_radius: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    hourly_rate: {
        type: DataTypes.DECIMAL(10, 2)
    },
    // Status & Stats
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    total_jobs_completed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_earnings: {
        type: DataTypes.DECIMAL(10, 2),
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
}, {
    getterMethods: {
        average_rating() {
            return this.rating_count > 0 ? (this.rating_sum / this.rating_count) : 0;
        }
    }
});

module.exports = Bystander;
