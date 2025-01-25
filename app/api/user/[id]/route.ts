import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }) {
  const { id } = params;
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user }, { status: 200 });
}

export async function PUT(req: Request, { params }) {
  const { id } = params;
  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ user: updatedUser }, { status: 200 });
}
