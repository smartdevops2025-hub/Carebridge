const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    mobile: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('patient', 'bystander', 'admin', 'super_admin'),
        defaultValue: 'patient'
    },
    date_of_birth: {
        type: DataTypes.DATEONLY
    },
    address: {
        type: DataTypes.TEXT
    },
    city: {
        type: DataTypes.STRING(50)
    },
    state: {
        type: DataTypes.STRING(50)
    },
    pincode: {
        type: DataTypes.STRING(10)
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_mobile_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    profile_image: {
        type: DataTypes.STRING(255)
    },
    last_login: {
        type: DataTypes.DATE
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Remove password from JSON response
User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
