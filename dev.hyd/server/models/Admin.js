import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Admin',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('Admin', AdminSchema)
