export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateAdmissionNumber = (admissionNumber) => {
  const regex = /^\d{3}[A-Z]\/\d{4}$/;
  return regex.test(admissionNumber);
};

export const validateAccountNumber = (accountNumber) => {
  const regex = /^\d{5}$/;
  return regex.test(accountNumber);
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

export const sanitizeInput = (input) => {
  return input.replace(/[^a-zA-Z0-9@._/-]/g, '');
};
