import express from "express";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email.js";

async function signup(req, res) {
  console.log("➡️ Signup API hit");

  try {
    console.log("📦 Body:", req.body);

    const { email, password, name } = req.body;

    console.log("🔍 Checking user...");
    const userAlreadyExists = await User.findOne({ email });
    console.log("✅ User check done");

    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("🔐 Password hashed");

    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    console.log("💾 User saved");

    console.log("🍪 Generating token...");
    generateTokenAndSetCookie(res, user._id);
    console.log("✅ Token generated");

    console.log("📨 Sending email...");
    sendVerificationEmail(user.email, "123456")
      .then(() => console.log("📧 Email sent"))
      .catch((err) => console.error("❌ Email error", err));

    console.log("🚀 Sending response...");
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("🔥 Signup error:", err);
    return res.status(500).json({ success: false });
  }
}

async function verifyEmail(req, res) {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.verfied = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in verify Email", error);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    console.log("Error in Login", error);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    //generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    );
    res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.log("Error in forgotPassword", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a new password" });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
async function checkAuth(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.status(200).json({ success: true, message: "Authorized", user });
  } catch (error) {
    console.log("Error in checkAuth", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
};
