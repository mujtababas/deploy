import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

interface PaymentRequestBody {
  paymentMethod: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
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

    const body = (await req.json()) as PaymentRequestBody;
    const { paymentMethod, items, total } = body;

    if (!paymentMethod || !items || !total) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["easypaisa", "jazzcash", "bank_transfer"].includes(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "No items in order" },
        { status: 400 }
      );
    }

    // Create order
    try {
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          total,
          paymentMethod,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear cart after successful order
      const cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      // Handle different payment methods
      let paymentResponse;
      switch (paymentMethod) {
        case "easypaisa":
          paymentResponse = await handleEasypaisaPayment(order);
          break;
        case "jazzcash":
          paymentResponse = await handleJazzcashPayment(order);
          break;
        case "bank_transfer":
          paymentResponse = await handleBankTransferPayment(order);
          break;
        default:
          throw new Error("Invalid payment method");
      }

      return NextResponse.json({
        success: true,
        order,
        paymentDetails: paymentResponse,
      });
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Error creating order" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { message: "Error processing payment" },
      { status: 500 }
    );
  }
}

// Mock payment handlers (replace with actual payment gateway integration)
async function handleEasypaisaPayment(order: any) {
  return {
    success: true,
    transactionId: `EP${Date.now()}`,
    message: "Please complete payment using Easypaisa mobile app",
    accountNumber: "0300-1234567",
  };
}

async function handleJazzcashPayment(order: any) {
  return {
    success: true,
    transactionId: `JC${Date.now()}`,
    message: "Please complete payment using JazzCash mobile app",
    accountNumber: "0300-7654321",
  };
}

async function handleBankTransferPayment(order: any) {
  return {
    success: true,
    transactionId: `BT${Date.now()}`,
    message: "Please transfer the amount to the following bank account",
    bankDetails: {
      accountTitle: "Your Store Name",
      accountNumber: "1234-5678-9012-3456",
      bankName: "Your Bank Name",
      branchCode: "001",
    },
  };
}
