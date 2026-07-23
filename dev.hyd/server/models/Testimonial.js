import mongoose from 'mongoose'

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Testimonial content is required'],
    trim: true
  },
  business: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/images/avatar-default.png'
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('Testimonial', TestimonialSchema)
