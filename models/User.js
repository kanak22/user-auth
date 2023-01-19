const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName : {
        type: Object,
        required: true
    },
    phoneNumber: {
        type: Object,
        required: true,
        unique: true
    },
    email: {
        type: Object,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;