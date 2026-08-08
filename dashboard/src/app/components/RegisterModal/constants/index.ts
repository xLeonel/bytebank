
export const REGISTER_VALIDATIONS = {
  minPasswordLength: 6,
  passwordRegex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};