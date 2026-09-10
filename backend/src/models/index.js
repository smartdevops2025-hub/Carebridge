const User = require('./User');
const Patient = require('./Patient');
const Bystander = require('./Bystander');
const Booking = require('./Booking');
const Verification = require('./Verification');
const Payment = require('./Payment');

// Define associations
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
User.hasOne(Bystander, { foreignKey: 'user_id', as: 'bystander' });
User.hasMany(Booking, { foreignKey: 'patient_id', as: 'patientBookings' });
User.hasMany(Booking, { foreignKey: 'bystander_id', as: 'bystanderBookings' });

Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Patient.hasMany(Booking, { foreignKey: 'patient_id', as: 'bookings' });

Bystander.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Bystander.hasMany(Booking, { foreignKey: 'bystander_id', as: 'bookings' });

Booking.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Booking.belongsTo(Bystander, { foreignKey: 'bystander_id', as: 'bystander' });
Booking.belongsTo(User, { foreignKey: 'patient_id', as: 'patientUser' });
Booking.belongsTo(User, { foreignKey: 'bystander_id', as: 'bystanderUser' });

Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = {
    User,
    Patient,
    Bystander,
    Booking,
    Verification,
    Payment
};
