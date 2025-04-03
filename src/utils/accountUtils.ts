
export const generateAccountNumber = (type: "personal" | "business") => {
  const prefix = type === "personal" ? "12" : "13";
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
};
