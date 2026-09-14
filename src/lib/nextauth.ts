// Sanitize NEXTAUTH_URL before next-auth parses it — Vercel build crashes with "" (ERR_INVALID_URL)
function sanitizeAuthUrl() {
  const env: any = process.env as any;
  const raw = String(env["NEXTAUTH_URL"] || "").trim();
  if (raw && raw.startsWith("http")) return;
  const vercel = String(env["VERCEL_URL"] || "").trim();
  if (vercel) { env["NEXTAUTH_URL"] = `https://${vercel}`; return; }
  if (!raw) env["NEXTAUTH_URL"] = "http://localhost:3000";
}
sanitizeAuthUrl();

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { createSupabaseService } from "@/lib/supabase/server";

const providers: any[] = [
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const sb = createSupabaseService();
        const { data: user, error } = await sb.from("users").select("*").eq("email", email).single();
        if (error || !user) return null;
        if ((user as any).isSuspended) throw new Error("Akun disuspend admin");
        if (!(user as any).passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, (user as any).passwordHash);
        if (!ok) return null;
        return { id: (user as any).id, email: (user as any).email, name: (user as any).name, image: (user as any).photo, role: (user as any).role } as any;
      } catch (e: any) {
        console.error("[nextauth authorize] ", e?.message || e);
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: (process.env as any)["NEXTAUTH_SECRET"],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) { token.role = (user as any).role || "GUEST"; token.id = user.id; }
      token.role = (token as any).role || "GUEST";
      return token;
    },
    async session({ session, token }: any) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
