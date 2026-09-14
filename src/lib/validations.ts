import { z } from "zod";
export const registerSchema = z.object({
  username: z.string().min(3), email: z.string().email(), password: z.string().min(6),
  phone: z.string().optional(), role: z.enum(["GUEST","MEMBER","OWNER"]).default("GUEST"),
});
export const kosSchema = z.object({
  nama: z.string().min(3), alamat: z.string().min(5), deskripsi: z.string().optional(),
  latitude: z.number().optional(), longitude: z.number().optional(),
});
export const kamarSchema = z.object({
  hargaBulanan: z.number().min(100000), hargaTahunan: z.number().optional(),
  nomor: z.string().optional(), tipe: z.string().optional(),
});
