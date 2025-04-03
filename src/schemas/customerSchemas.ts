
import { z } from "zod";

export const personalAccountSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  mother_name: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  birthdate: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  nationality: z.string().optional(),
  id_type: z.enum(["passport", "national_id", "residence_permit"]).optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  account_type: z.literal("personal"),
});

export const businessAccountSchema = personalAccountSchema.extend({
  business_name: z.string().min(3, { message: "Business name is required" }),
  business_registration: z.string().min(3, { message: "Registration number is required" }),
  business_address: z.string().min(3, { message: "Business address is required" }),
  account_type: z.literal("business"),
});
