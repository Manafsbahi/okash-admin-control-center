
export const generateAccountNumber = (type: "personal" | "business") => {
  const prefix = type === "personal" ? "12" : "13";
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
};

// Function to format account balances
export const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);
};

// Function to validate account number format
export const isValidAccountNumber = (accountNumber: string): boolean => {
  // Personal accounts start with 12, business with 13
  if (accountNumber.startsWith('12') || accountNumber.startsWith('13')) {
    // Check if it's 10 digits
    return accountNumber.length === 10 && !isNaN(Number(accountNumber));
  }
  return false;
};
