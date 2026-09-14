import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const targetId = params.id;
  if (targetId === (session.user as any).id) return NextResponse.json({ error: "Tidak bisa hapus akun sendiri" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: user } = await supabase.from("users").select("id,role,email").eq("id", targetId).maybeSingle();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if ((user as any).role === "ADMIN") return NextResponse.json({ error: "Tidak bisa hapus sesama ADMIN" }, { status: 400 });

  const { count: kosCount } = await supabase.from("kos_listings").select("id", { count: "exact", head: true }).eq("ownerId", targetId);
  if ((kosCount || 0) > 0) return NextResponse.json({ error: `User masih punya ${kosCount} kos \u2014 hapus/suspend kos dulu` }, { status: 400 });
  const { count: bookingCount } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("penyewaId", targetId);
  if ((bookingCount || 0) > 0) return NextResponse.json({ error: `User masih punya ${bookingCount} booking \u2014 batalkan dulu` }, { status: 400 });
  const { count: orderCount } = await supabase.from("marketplace_orders").select("id", { count: "exact", head: true }).eq("buyerId", targetId);
  if ((orderCount || 0) > 0) return NextResponse.json({ error: `User masih punya ${orderCount} pesanan marketplace` }, { status: 400 });
  const { count: threadCount } = await supabase.from("chat_threads").select("id", { count: "exact", head: true }).or(`memberId.eq.${targetId},ownerId.eq.${targetId}`);
  if ((threadCount || 0) > 0) return NextResponse.json({ error: `User masih punya ${threadCount} thread chat` }, { status: 400 });

  await supabase.from("verifications").delete().eq("userId", targetId);
  await supabase.from("chat_messages").delete().eq("senderId", targetId);
  await supabase.from("admin_logs").delete().eq("adminId", targetId);

  const { error: delErr } = await supabase.from("users").delete().eq("id", targetId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  try { await supabase.from("admin_logs").insert({ adminId: (session.user as any).id, action: "DELETE_USER", targetId, targetType: "User", keterangan: `${(user as any).email} deleted` }); } catch {}
  return NextResponse.json({ success: true });
}
