import { Schema, model } from 'mongoose'
import { createHmac, randomBytes } from 'crypto';
import { createTokenForUser } from '../utils/authentication.js';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    }, 
    email: {
        type: String, 
        required: true,
        unique: true, 
    },
    bloodType: {
        type: String, 
         
    },
    contact: {
        type: Number, 
        required: true,
    },
    address: {
        type: String, 
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: './public/images/user-avatar.png',
    },
    role: {
        type: String,
        enum: ['DOCTOR', 'USER'],
        default: "USER",
    }
    
}, {timestamps: true})

userSchema.pre("save", function(next) {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {   // matchPassword is name of the function
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not Found!")
    
    const salt = user.salt; 
    const name = user.fullName;
    const hashedPassword = user.password;
    const role = user.role;

    const userProvidedHash = createHmac('sha256', salt)
    .update(password)
    .digest("hex");

    if (hashedPassword !== userProvidedHash)  
        throw new Error("Incorrect password");

    const token = createTokenForUser(user);
    return {token, name, role, uid: user._id}; 
})

export const User = model('User', userSchema);

