const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            unique: true,
            required: [true, 'email is required, thanks'],
            lowercase: true,
            validate: {
                validator: function validateEmail(email) {
                    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                },
                message: 'sorry but we don\'t think that {VALUE} is a valid email'
            }
        },
        username: {
            type: String,
            unique:true,
            lowercase: true,
            required: [true, 'if this is blank how do we know what to call you'],
            minlength: [4, 'we love brevity but that is too brev']
        },
        password: {
            type: String,
            // required: [true, 'We want you to be secure, please help'],
        },
        profileImageUrl: {
            type: String
        },
    },
    {
        usePushEach: true
    });

const User = mongoose.model("User", userSchema);

module.exports = User;