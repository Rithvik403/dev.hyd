import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  sender_role: {
    type: String,
    enum: ['admin', 'client'],
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('Message', MessageSchema)
