import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireRole(roles: string[]) {
  const session = await getSession();
  if (!session || !roles.includes((session.user as any).role)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
