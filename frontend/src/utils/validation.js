const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email?.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return '';
};

export const validateName = (name, fieldLabel) => {
  if (!name?.trim()) return `${fieldLabel} is required`;
  if (name.trim().length < 2) return `${fieldLabel} must be at least 2 characters`;
  return '';
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return 'Date of birth is required';
  const dob = new Date(dateOfBirth);
  const today = new Date();
  if (dob > today) return 'Date of birth cannot be in the future';
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 13) return 'You must be at least 13 years old';
  if (age > 120) return 'Please enter a valid date of birth';
  return '';
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
};

export const validateSignupForm = (formData) => {
  const errors = {};
  const firstNameError = validateName(formData.firstName, 'First name');
  const lastNameError = validateName(formData.lastName, 'Last name');
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const dobError = validateDateOfBirth(formData.dateOfBirth);

  if (firstNameError) errors.firstName = firstNameError;
  if (lastNameError) errors.lastName = lastNameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (dobError) errors.dateOfBirth = dobError;

  return errors;
};
