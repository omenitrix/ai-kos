import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const targetId = params.id;
  if (targetId === (session.user as any).id) return NextResponse.json({ error: "Tidak bisa hapus akun sendiri" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role === "ADMIN") return NextResponse.json({ error: "Tidak bisa hapus sesama ADMIN" }, { status: 400 });

  // cek relasi: jangan hapus kalau masih punya kos/bookings/payments aktif
  const kosCount = await prisma.kosListing.count({ where: { ownerId: targetId } });
  if (kosCount > 0) return NextResponse.json({ error: `User masih punya ${kosCount} kos — hapus/suspend kos dulu` }, { status: 400 });
  const bookingCount = await prisma.booking.count({ where: { penyewaId: targetId } });
  if (bookingCount > 0) return NextResponse.json({ error: `User masih punya ${bookingCount} booking — batalkan dulu` }, { status: 400 });
  const paymentCount = await prisma.payment.count({ where: { payerId: targetId } });
  // marketplace orders boleh dibiarkan? kita cek
  const orderCount = await prisma.marketplaceOrder.count({ where: { buyerId: targetId } });
  if (orderCount > 0) return NextResponse.json({ error: `User masih punya ${orderCount} pesanan marketplace` }, { status: 400 });

  // hapus dependent kecil dulu
  await prisma.verification.deleteMany({ where: { userId: targetId } });
  await prisma.chatMessage.deleteMany({ where: { senderId: targetId } });
  // chatThreads where memberId/ownerId — skip jika ada, block
  const threadCount = await prisma.chatThread.count({ where: { OR: [{ memberId: targetId }, { ownerId: targetId }] } });
  if (threadCount > 0) return NextResponse.json({ error: `User masih punya ${threadCount} thread chat` }, { status: 400 });
  await prisma.adminLog.deleteMany({ where: { adminId: targetId } });

  await prisma.user.delete({ where: { id: targetId } });
  try { await prisma.adminLog.create({ data: { adminId: (session.user as any).id, action: "DELETE_USER", targetId, targetType: "User", keterangan: `${user.email} deleted` } }); } catch {}
  return NextResponse.json({ success: true });
}
