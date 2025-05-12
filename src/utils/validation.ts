export const isEmailValid = (email: string) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const isPasswordStrong = (password: string) => {
  return password.length >= 6; 
};
