// controllers/verificationController.js
import VerificationCode from "../models/VerificationCode.js";
import { generateVerificationCode } from "../utils/generateCode.js";
import { sendMail } from "../utils/mailer.js";

export const sendEmailVerification = async (req, res) => {
  const { email } = req.body;
  const code = generateVerificationCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min expiry

  // Optionally, remove old codes for this email
  await VerificationCode.deleteMany({ email });

  await VerificationCode.create({ email, code, expiresAt });

  await sendMail(email, "Your Verification Code", `<h3>Your code is: ${code}</h3>`);
  res.json({ message: "Verification code sent" });
};

export const verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;
  const record = await VerificationCode.findOne({ email, code });

  if (!record)
    return res.status(400).json({ error: "Invalid code" });

  if (record.expiresAt < Date.now())
    return res.status(400).json({ error: "Code expired" });

  // Optionally delete code after successful verification
  await VerificationCode.deleteMany({ email });

  res.json({ message: "Email verified" });
};
