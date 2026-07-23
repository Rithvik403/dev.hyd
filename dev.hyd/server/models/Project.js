import mongoose from 'mongoose'

const UpdateSchema = new mongoose.Schema({
  note: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
})

const ProjectSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Discovery', 'Design', 'Development', 'Review', 'Delivered'],
    default: 'Discovery'
  },
  deadline: {
    type: Date
  },
  package: {
    type: String,
    trim: true
  },
  updates: [UpdateSchema],
  files: [FileSchema],
  payment_status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  payment_amount_total: {
    type: Number,
    default: 0
  },
  payment_amount_paid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('Project', ProjectSchema)
