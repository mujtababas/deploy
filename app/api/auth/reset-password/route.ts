import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Send password reset link
export async function POST(req: Request) {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate a reset token (this should be implemented securely)
    const resetToken = 'some-generated-token'; // Replace with actual token generation logic

    // Send email with reset link
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Your email
            pass: 'your-email-password', // Your email password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        text: `Click the link to reset your password: http://your-frontend-url/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
}
