// Compatibility shim: legacy `import { prisma } from "@/lib/prisma"` now delegates to Supabase service client.
// New code should `import { createSupabaseService } from "@/lib/supabase/server"` directly.
import { createSupabaseService } from "@/lib/supabase/server";

function getService() {
  return createSupabaseService();
}

// Proxy so `prisma.from(...)` and any Supabase client prop works;
// legacy Prisma-style `prisma.user.findUnique` will return undefined and throw clearly.
export const prisma: any = new Proxy({} as any, {
  get(_target, prop) {
    const svc: any = getService();
    const val = svc[prop];
    if (typeof val === "function") return val.bind(svc);
    return val;
  },
});

export default prisma;
export { createSupabaseService };
