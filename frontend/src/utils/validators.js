/**
 * Validates an email address.
 * @param {string} email
 * @returns {string|null} error message or null
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Enter a valid email address.';
  return null;
};

/**
 * Validates a required text field.
 * @param {string} value
 * @param {string} fieldName
 * @param {number} [minLength=2]
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'This field', minLength = 2) => {
  if (!value || !String(value).trim()) return `${fieldName} is required.`;
  if (String(value).trim().length < minLength)
    return `${fieldName} must be at least ${minLength} characters.`;
  return null;
};

/**
 * Validates a phone number (exactly 10 digits).
 * @param {string} phone
 * @returns {string|null}
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required.';
  const re = /^\d{10}$/;
  if (!re.test(phone.replace(/[\s\-()]/g, '')))
    return 'Enter a valid 10-digit phone number.';
  return null;
};

/**
 * Validates booking form data.
 * @param {{ userName: string, email: string, phone: string, slot: string }} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateBookingForm = (data) => {
  const errors = {};

  const nameError = validateRequired(data.userName, 'Name');
  if (nameError) errors.userName = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (!data.slot) errors.slot = 'Please select an available time slot.';

  return { isValid: Object.keys(errors).length === 0, errors };
};
