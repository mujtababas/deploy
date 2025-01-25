import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, itemId } = await req.json();

    // Validate request body
    if (!userId || !itemId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Find or create the user's cart
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Add item to the cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: itemId,
        quantity: 1,
      },
    });

    return NextResponse.json({ message: "Item added to cart", cartItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ message: "Error adding item to cart" }, { status: 500 });
  }
}
