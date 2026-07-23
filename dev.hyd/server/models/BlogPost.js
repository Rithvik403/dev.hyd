import mongoose from 'mongoose'

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog post title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Blog post slug is required'],
    unique: true,
    trim: true,
    index: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Blog post content is required']
  },
  author: {
    type: String,
    default: 'Dev.hyd'
  },
  published: {
    type: Boolean,
    default: false
  },
  cover: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('BlogPost', BlogPostSchema)
