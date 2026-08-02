/**
 * Production Environment Validator for dev.hyd API Server
 * Verifies environment configuration before starting backend services.
 */
export function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production'
  const warnings = []
  const criticals = []

  // Check Database URL
  if (!process.env.DATABASE_URL) {
    criticals.push('DATABASE_URL is missing in process.env!')
  }

  // Check JWT Secrets
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_dev_hyd_2025_change_in_prod!') {
    if (isProd) {
      criticals.push('JWT_SECRET is using a default or missing value in production!')
    } else {
      warnings.push('JWT_SECRET is using default development key.')
    }
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    warnings.push('JWT_REFRESH_SECRET is missing. Refresh token fallbacks may be degraded.')
  }

  // Check Admin default password
  if (process.env.ADMIN_PASSWORD === 'admin123' && isProd) {
    criticals.push('ADMIN_PASSWORD is set to default "admin123" in production mode! Change ADMIN_PASSWORD immediately.')
  }

  // Check Client URL configuration
  if (!process.env.CLIENT_URL) {
    warnings.push('CLIENT_URL not specified; defaulting CORS allowed origin to http://localhost:5173')
  }

  // Print results
  if (criticals.length > 0) {
    console.error('\n🚨 CRITICAL SECURITY / CONFIGURATION ERRORS DETECTED:')
    criticals.forEach(err => console.error(`  - ❌ ${err}`))
    if (isProd) {
      console.error('Halting execution due to insecure production configuration.\n')
      // Non-zero exit code in production if critical secrets are missing or unsafe
      process.exit(1)
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ ENVIRONMENT CONFIGURATION WARNINGS:')
    warnings.forEach(warn => console.warn(`  - ⚠️ ${warn}`))
    console.warn('')
  }

  if (criticals.length === 0 && warnings.length === 0) {
    console.log('✅ Production Environment Variables validated successfully.\n')
  }
}
