// utils/email.ts
import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,         // your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD, // the App Password
      },
    });

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Click the button below to proceed. This link will expire in 15 minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" target="_blank" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: black;
                color: white;
                font-weight: 600;
                text-decoration: none;
                border-radius: 6px;
                font-size: 16px;
            ">
                Reset Password
            </a>
            </div>
            <p style="font-size: 14px; color: #999;">
            If you didn’t request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
            <hr style="margin-top: 30px;"/>
            <p style="font-size: 12px; color: #ccc; text-align: center;">
            &copy; ${new Date().getFullYear()} StockHub. All rights reserved.
            </p>
        </div>
        `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Could not send email");
  }
};
