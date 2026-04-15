export const generateInviteCode = (length = 6) => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const isValidInviteCode = (code) => {
  const isValid = /^[A-Z0-9]{6}$/.test(code);
  return isValid;
};
