const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(value) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
              },
              message: 'Email must be a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    }, 
    role: {
        type: String,
        default: 'user',
        lowercase: true,
        required: true
    }
})

const User = mongoose.model("User", userSchema);
module.exports = { User };