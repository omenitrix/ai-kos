import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getGateway } from "@/lib/gateway";
import { genInvoiceNo } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  let payments;
  if (role === "OWNER") {
    // get payments for bookings of kos owned by this owner (via subquery)
    const kosIds = await prisma.kosListing.findMany({ where: { ownerId: (session.user as any).id }, select: { id: true } });
    const kosIdArray = kosIds.map(k => k.id);
    const bookings = await prisma.booking.findMany({ where: { kosId: { in: kosIdArray } }, select: { id: true } });
    const bookingIds = bookings.map(b => b.id);
    payments = await prisma.payment.findMany({ where: { bookingId: { in: bookingIds } }, include: { booking: { include: { kamar: { include: { kos: true } }, penyewa: true } }, payer: { select: { id: true, name: true, email: true } } } });
  } else if (role === "ADMIN") {
    payments = await prisma.payment.findMany({ include: { booking: { include: { kamar: { include: { kos: true } }, penyewa: true } }, payer: { select: { id: true, name: true, email: true } } } });
  } else {
    // member
    payments = await prisma.payment.findMany({ where: { payerId: (session.user as any).id }, include: { booking: { include: { kamar: { include: { kos: true } } } }, payer: { select: { id: true, name: true, email: true } } } });
  }
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  const booking = await prisma.booking.findUnique({ where: { id: body.bookingId }, include: { kamar: { include: { kos: true } } } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  // only the booker or admin/owner of the kos can pay
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && booking.penyewaId !== userId && booking.kamar.kos.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const amount = body.amount || booking.totalHarga;
  const method = body.method || "VIRTUAL_ACCOUNT";
  const paymentReq = { amount, orderId: booking.id, customerEmail: (session.user as any).email || "", method };
  const gatewayResp = await getGateway().createPayment(paymentReq);
  // create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      payerId: userId,
      amount,
      method,
      status: gatewayResp.status as any,
      invoiceNo: genInvoiceNo(),
      // mock: if gateway provides vaNumber or qrString, we store in buktiBayar as placeholder
      buktiBayar: gatewayResp.vaNumber || gatewayResp.qrString || undefined,
    },
  });
  // update booking status to PENDING_PAYMENT if not already
  if (booking.status === "DRAFT") {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "PENDING_PAYMENT" } });
  }
  return NextResponse.json({ payment, ...gatewayResp });
}
