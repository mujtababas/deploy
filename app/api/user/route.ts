import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const users = await prisma.user.findMany();
  return NextResponse.json({ users }, { status: 200 });
}
