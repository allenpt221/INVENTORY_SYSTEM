import { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default async function requestHandler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { userEmail, userName } = req.body;

  // Validate request body
  if (!userEmail || !userName) {
    return res.status(400).json({
      message: "Missing userEmail or userName in request body.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, 
      },
    });

    const mailOptions = {
      from: `"Request Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to your own email
      subject: "Access Request to Manage Products",
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 30px; text-align: center;">
              <h2 style="color: #333;">Access Request</h2>
              <p style="font-size: 16px; color: #555;">
                username <strong>${userName}</strong> (<a href="mailto:${userEmail}" style="color: #1a73e8;">${userEmail}</a>)
                is requesting access to <strong>manage products</strong>.
              </p>
              <div style="margin-top: 30px;">
                <a href="mailto:${userEmail}" style="background-color: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Reply to ${userName}
                </a>
              </div>
            </div>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Request sent successfully." });
  } catch (error: any) {
    console.error("Email sending failed:", error);

    return res.status(500).json({
      message: "Failed to send request.",
      error: error?.message || "Unknown error",
    });
  }
}
