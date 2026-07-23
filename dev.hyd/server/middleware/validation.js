import { body, validationResult } from 'express-validator'

// Generic error handler for express-validator results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(', ')
    return res.status(400).json({ error: errorMsg })
  }
  next()
}

// Contact form validators
export const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^\+?[\d\s-]{10,15}$/).withMessage('Valid phone number (10-15 digits) is required'),
  body('service').trim().notEmpty().withMessage('Service selection is required').escape(),
  body('budget').trim().optional().escape(),
  body('message').trim().optional().escape(),
  handleValidationErrors
]

// Login validators
export const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password').trim().notEmpty().withMessage('Password is required'),
  handleValidationErrors
]

// Client account validators
export const validateClient = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().optional().escape(),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
]

// Blog post validators
export const validateBlogPost = [
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('slug').trim().notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric and hyphens only'),
  body('content').trim().notEmpty().withMessage('Blog content is required'),
  body('excerpt').trim().optional().escape(),
  body('published').optional().isBoolean().withMessage('Published status must be a boolean'),
  handleValidationErrors
]
