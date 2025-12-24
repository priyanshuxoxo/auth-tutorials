import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  VERIFICATION_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const html = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationCode
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email address",
      html,
    });

    console.log("Verification email sent:", email);
  } catch (error) {
    // ❗ never throw
    console.error("Verification email failed:", error.message);
  }
};

export const sendWelcomeEmail = async (email) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Email verified successfully 🎉",
      html: VERIFICATION_SUCCESS_TEMPLATE,
    });

    console.log("Welcome email sent:", email);
  } catch (error) {
    console.error("Welcome email failed:", error.message);
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
      "{resetURL}",
      resetUrl
    );

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html,
    });

    console.log("Password reset email sent:", email);
  } catch (error) {
    console.error("Password reset email failed:", error.message);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent:", email);
  } catch (error) {
    console.error("Reset success email failed:", error.message);
  }
};
