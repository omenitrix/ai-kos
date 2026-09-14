// Sanitize NEXTAUTH_URL before next-auth parses it — Vercel build crashes with "" (ERR_INVALID_URL)
// Use bracket notation to avoid Next.js static inlining (process.env.X -> "literal" at build)
function sanitizeAuthUrl() {
  const env: any = process.env as any;
  const raw = String(env["NEXTAUTH_URL"] || "").trim();
  if (raw && raw.startsWith("http")) return; // ok
  const vercel = String(env["VERCEL_URL"] || "").trim();
  if (vercel) {
    env["NEXTAUTH_URL"] = `https://${vercel}`;
    return;
  }
  if (!raw) env["NEXTAUTH_URL"] = "http://localhost:3000";
}
sanitizeAuthUrl();

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

function getSupabaseService() {
  const env: any = process.env as any;
  const url = env["NEXT_PUBLIC_SUPABASE_URL"] || env["SUPABASE_URL"];
  const key = env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SERVICE_KEY"];
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const providers: any[] = [
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = credentials.email.toLowerCase().trim();
      const password = credentials.password;

      // 1) Try Supabase first (full native) — if env set
      const sb = getSupabaseService();
      if (sb) {
        const { data: user, error } = await sb.from("users").select("*").eq("email", email).single();
        if (!error && user) {
          if (user.isSuspended) throw new Error("Akun disuspend admin");
          if (!user.passwordHash) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.photo, role: user.role } as any;
        }
        // if not found in supabase, fallback to prisma (during migration)
      }

      // 2) Fallback Prisma (pooled.db.prisma.io) — keep working during hybrid phase
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if ((user as any).isSuspended) throw new Error("Akun disuspend admin");
        const ok = await bcrypt.compare(password, (user as any).passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: (user as any).name, image: (user as any).photo, role: (user as any).role } as any;
      } catch (e) {
        // if prisma fails (DATABASE_URL missing), return null -> CredentialsSignin
        console.error("[auth] prisma fallback failed", (e as any)?.message);
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
      if (user) {
        token.role = (user as any).role || "GUEST";
        token.id = user.id;
      }
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
