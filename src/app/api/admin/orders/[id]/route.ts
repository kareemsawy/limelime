import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { status } = await req.json();
  const order = await db.order.update({ where: { id: params.id }, data: { status } });
  await db.auditLog.create({
    data: { userId: session.user.id, action: "UPDATE_STATUS", entity: "Order", entityId: params.id, meta: { status } },
  });
  return NextResponse.json(order);
}
