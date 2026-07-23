import mongoose from 'mongoose'

const WebsiteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_settings'
  },
  siteName: {
    type: String,
    default: 'dev.hyd'
  },
  seoTitle: {
    type: String,
    default: 'dev.hyd — Web Development for Local Businesses in Hyderabad'
  },
  seoDescription: {
    type: String,
    default: 'Helping Hyderabad businesses get more customers with modern websites, WhatsApp bookings, and Google Search visibility.'
  },
  seoKeywords: {
    type: String,
    default: 'web design Hyderabad, local business website, salon website, restaurant website'
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: 'https://instagram.com' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    whatsapp: { type: String, default: 'https://wa.me/917780252258' }
  },
  logo: { type: String, default: '' },
  customContent: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export default mongoose.model('WebsiteSettings', WebsiteSettingsSchema)
