// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // change to your provider if different
    auth: {
      user: process.env.EMAIL_USER, // from .env
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
};
