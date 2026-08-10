function toDate(value) {
  return value ? new Date(value) : null
}

function toLegacyRecord(record, overrides = {}) {
  if (!record) return null
  const normalized = {
    ...record,
    _id: record.id,
    created_at: toDate(record.createdAt),
    updated_at: toDate(record.updatedAt)
  }

  if (record.clientId !== undefined) normalized.client_id = record.clientId
  if (record.projectId !== undefined) normalized.project_id = record.projectId
  if (record.senderRole !== undefined) normalized.sender_role = record.senderRole
  if (record.paymentStatus !== undefined) normalized.payment_status = record.paymentStatus
  if (record.paymentAmountTotal !== undefined) normalized.payment_amount_total = Number(record.paymentAmountTotal || 0)
  if (record.paymentAmountPaid !== undefined) normalized.payment_amount_paid = Number(record.paymentAmountPaid || 0)
  if (record.amountDue !== undefined) normalized.amount_due = Number(record.amountDue || 0)
  if (record.amountPaid !== undefined) normalized.amount_paid = Number(record.amountPaid || 0)
  if (record.razorpayOrderId !== undefined) normalized.razorpay_order_id = record.razorpayOrderId
  if (record.razorpayPaymentId !== undefined) normalized.razorpay_payment_id = record.razorpayPaymentId
  if (record.razorpaySignature !== undefined) normalized.razorpay_signature = record.razorpaySignature
  if (record.paidAt !== undefined) normalized.paid_at = toDate(record.paidAt)
  if (record.verificationToken !== undefined) normalized.verificationToken = record.verificationToken
  if (record.verificationTokenExpires !== undefined) normalized.verificationTokenExpires = toDate(record.verificationTokenExpires)
  if (record.resetPasswordToken !== undefined) normalized.resetPasswordToken = record.resetPasswordToken
  if (record.resetPasswordExpires !== undefined) normalized.resetPasswordExpires = toDate(record.resetPasswordExpires)
  if (record.paymentStatus !== undefined) normalized.payment_status = record.paymentStatus
  if (record.socialLinks !== undefined) normalized.socialLinks = record.socialLinks || {}
  if (record.customContent !== undefined) normalized.customContent = record.customContent || {}
  if (record.tags !== undefined) normalized.tags = Array.isArray(record.tags) ? record.tags : []
  if (record.updates !== undefined) normalized.updates = Array.isArray(record.updates) ? record.updates : []
  if (record.files !== undefined) normalized.files = Array.isArray(record.files) ? record.files : []

  delete normalized.id
  delete normalized.createdAt
  delete normalized.updatedAt
  delete normalized.clientId
  delete normalized.projectId
  delete normalized.senderRole
  delete normalized.paymentStatus
  delete normalized.paymentAmountTotal
  delete normalized.paymentAmountPaid
  delete normalized.amountDue
  delete normalized.amountPaid
  delete normalized.razorpayOrderId
  delete normalized.razorpayPaymentId
  delete normalized.razorpaySignature
  delete normalized.paidAt
  delete normalized.verificationToken
  delete normalized.verificationTokenExpires
  delete normalized.resetPasswordToken
  delete normalized.resetPasswordExpires
  delete normalized.socialLinks
  delete normalized.customContent
  delete normalized.tags
  delete normalized.updates
  delete normalized.files

  return { ...normalized, ...overrides }
}

export function serializeRecord(record, overrides = {}) {
  return toLegacyRecord(record, overrides)
}

export function serializeList(records, overrides = {}) {
  return (records || []).map((record) => serializeRecord(record, overrides))
}

export function serializeProject(record) {
  const normalized = serializeRecord(record)
  if (!normalized) return null
  normalized.client_id = record.clientId
  return normalized
}

export function serializeClient(record) {
  const normalized = serializeRecord(record)
  return normalized
}

export function serializePayment(record) {
  const normalized = serializeRecord(record)
  if (!normalized) return null
  normalized.project_id = record.projectId
  normalized.client_id = record.clientId
  return normalized
}
