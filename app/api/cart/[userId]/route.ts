import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }) {
  const { userId } = params;
  const cartItems = await prisma.cartItem.findMany({
    where: { cart: { userId } },
    include: { product: true },
  });

  return NextResponse.json({ items: cartItems }, { status: 200 });
}
