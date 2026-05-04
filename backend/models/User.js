import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        
    },
    lastName: {
        type: String,
        
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: String,
    otpExpiry: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
     password: {
    type: String,
    
  },
  role: {
  type: String,
  enum: ['user', 'employee', 'admin'],
  default: 'user'
}
   
}, { timestamps: true });

export default mongoose.model("User", userSchema);