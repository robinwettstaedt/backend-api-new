import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        tokenVersion: {
            type: Number,
            required: true,
            default: 0,
        },
        username: {
            type: String,
            unique: true,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: true,
        },
        password: {
            type: String,
            // eslint-disable-next-line
            required: function () {
                // eslint-disable-next-line
                return this.googleToken ? false : true;
            },
        },
        googleToken: {
            type: String,
        },
        picture: {
            type: String,
            required: true,
            // change to url of default picture
            default: 'defaultpicture.com',
        },
        settings: {
            theme: {
                type: String,
                default: 'AUTO',
            },
            notifications: {
                type: String,
                default: 'ALL',
            },
            invites: {
                type: Boolean,
                default: true,
            },
        },
    },
    { timestamps: true }
);

// eslint-disable-next-line
userSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // eslint-disable-next-line
    bcrypt.hash(this.password, 8, (err, hash) => {
        if (err) {
            return next(err);
        }

        this.password = hash;
        next();
    });
});

userSchema.pre('save', function (next) {
    if (!this.isModified('username')) {
        return next();
    }

    const lowerCaseUsername = this.username.toLowerCase();
    this.username = lowerCaseUsername;

    next();
});

userSchema.methods.checkPassword = function (password) {
    const passwordHash = this.password;
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        bcrypt.compare(password, passwordHash, (err, same) => {
            if (err) {
                return reject(err);
            }

            resolve(same);
        });
    });
};

const User = mongoose.model('user', userSchema);

export default User;
