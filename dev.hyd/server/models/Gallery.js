import mongoose from 'mongoose'

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image path/URL is required']
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'Website',
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('Gallery', GallerySchema)
