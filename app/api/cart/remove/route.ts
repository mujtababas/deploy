import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";  // Updated import path

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();

    // Validate request body
    if (!itemId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Remove item from the cart
    await prisma.cartItem.deleteMany({
      where: {
        cart: { userId: session.user.id },
        id: itemId,
      },
    });

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ message: "Error removing item from cart" }, { status: 500 });
  }
}
