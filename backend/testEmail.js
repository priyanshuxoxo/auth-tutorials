// backend/testEmail.js
import { transporter } from "./utils/emailTransporter.js";

await transporter.sendMail({
  from: `"SMTP Test" <${process.env.EMAIL_USER}>`,
  to: "priyanshusri70@gmail.com",
  subject: "SMTP Working Test",
  text: "If you got this email, Gmail SMTP is working.",
});

console.log("Email sent successfully");
process.exit();
