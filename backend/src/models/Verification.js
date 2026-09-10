const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Verification = sequelize.define('Verification', {
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
    type: {
        type: DataTypes.ENUM('mobile', 'email', 'aadhaar', 'pan', 'bystander'),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(10)
    },
    reference_id: {
        type: DataTypes.STRING(50)
    },
    data: {
        type: DataTypes.JSON
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'expired', 'failed'),
        defaultValue: 'pending'
    },
    expires_at: {
        type: DataTypes.DATE
    },
    verified_at: {
        type: DataTypes.DATE
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    indexes: [
        {
            fields: ['user_id', 'type']
        },
        {
            fields: ['code']
        }
    ]
});

module.exports = Verification;
