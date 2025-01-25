import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

interface CartRequestBody {
  productId: string;
  quantity: number;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Error fetching cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CartRequestBody;
    const { productId, quantity } = body;

    // Validate request body
    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    try {
      let cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: session.user.id,
            items: {
              create: [
                {
                  productId,
                  quantity,
                },
              ],
            },
          },
          include: { items: true },
        });
      } else {
        const existingItem = cart.items.find(
          (item) => item.productId === productId
        );

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity,
            },
          });
        }

        cart = await prisma.cart.findUnique({
          where: { userId: session.user.id },
          include: { items: true },
        });
      }

      return NextResponse.json(cart);
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Error updating cart" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
