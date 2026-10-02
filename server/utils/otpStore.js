// In-memory OTP storage with TTL expiration, attempt tracking, and resend cooldown
const otpMap = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

// Periodically purge expired records (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpMap.entries()) {
    if (now > value.expiresAt) {
      otpMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function canResendOtp(email) {
  const normalized = normalizeEmail(email);
  const record = otpMap.get(normalized);
  if (!record) return { allowed: true };

  const elapsed = Date.now() - record.lastSentAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const secondsRemaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return {
      allowed: false,
      secondsRemaining,
      message: `Please wait ${secondsRemaining}s before requesting a new OTP.`,
    };
  }
  return { allowed: true };
}

function storeOtp(email, otp) {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  otpMap.set(normalized, {
    otp: String(otp).trim(),
    expiresAt: now + OTP_EXPIRY_MS,
    lastSentAt: now,
    attempts: 0,
  });
}

function verifyOtp(email, inputOtp) {
  const normalized = normalizeEmail(email);
  const record = otpMap.get(normalized);

  if (!record) {
    return {
      valid: false,
      message: 'No OTP found for this email. Please request a new one.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalized);
    return {
      valid: false,
      message: 'The OTP has expired. Please request a new one.',
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpMap.delete(normalized);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  const cleanInput = String(inputOtp || '').trim();
  if (record.otp !== cleanInput) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      message: remaining > 0 
        ? `Invalid OTP. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  return { valid: true };
}

function consumeOtp(email) {
  const normalized = normalizeEmail(email);
  otpMap.delete(normalized);
}

module.exports = {
  generateOtp,
  canResendOtp,
  storeOtp,
  verifyOtp,
  consumeOtp,
};
