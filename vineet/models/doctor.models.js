import { Schema, model } from 'mongoose';
import { createHmac, randomBytes } from 'crypto';
import { createTokenForUser } from '../utils/authentication.js';

const doctorSchema = new Schema({
  doctorName: {
    type: String,
    required: true,
  },  
  speciality: {
    type: String, 
    required: true,
  },  
  email: {
    type: String, 
    unique: true,
  },
  salt: {
    type: String,
  },
  password: {
    type: String,
  },
  profileImageURL: {
    type: String,
    default: './public/images/user-avatar.png',
  },
  role: {
    type: String,
    enum: ['DOCTOR', 'USER'],
    default: "DOCTOR",
  },
}, {timestamps: true}
);

doctorSchema.pre("save", function(next) {
  const user = this;
 
  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac('sha256', salt).update(user.password)
  .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;

  next();
})

doctorSchema.static("matchPasswordAndGenerateToken", async function(email, password) {   // matchPassword is name of the function
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not Found!")
  const salt = user.salt;
  const name = user.doctorName;
  const hashedPassword = user.password;
  const role = user.role;
  const did = user._id;

  const userProvidedHash = createHmac('sha256', salt)
  .update(password)
  .digest("hex");

  if (hashedPassword !== userProvidedHash)  
      throw new Error("Incorrect password");

  const token = createTokenForUser(user);
  return {token, name, role, did}; 
})


export const Doctor = model('Doctor', doctorSchema);

