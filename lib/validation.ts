export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string) {
  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  // Calculate a basic strength score out of 5
  let strength = 0;
  if (isLengthValid) strength += 1;
  if (hasUppercase) strength += 1;
  if (hasLowercase) strength += 1;
  if (hasNumber) strength += 1;
  if (hasSpecialChar) strength += 1;

  return {
    isValid,
    strength,
    requirements: {
      length: isLengthValid,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecialChar,
    }
  };
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}
