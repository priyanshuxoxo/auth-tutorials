import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ allowed
      to: "srivastavapriyanshu201@gmail.com", // ✅ any email
      subject: "Resend Test Email",
      html: "<h2>✅ Resend is working!</h2><p>This is a test email.</p>",
    });

    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Email failed:", error);
  }
}

testEmail();
