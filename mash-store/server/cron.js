const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Setup nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function checkStockAndSendEmail() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        qty: {
          lte: 5,
        },
      },
    });

    if (lowStockProducts.length === 0) {
      console.log("[Cron] Stock check: No products below threshold.");
      return;
    }

    const emailTo = process.env.SMTP_TO || "admin@example.com";
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[Cron] Mail configuration missing in .env. Skipping email send.");
      console.log("[Cron] Low stock products:", lowStockProducts.map(p => `${p.name} (qty: ${p.qty})`).join(", "));
      return;
    }

    const productList = lowStockProducts
      .map(p => `- ${p.name} (ID: ${p.id}, Qty: ${p.qty})`)
      .join("\n");

    const mailOptions = {
      from: `"MASH Store Bot" <${process.env.SMTP_USER}>`,
      to: emailTo,
      subject: "🚨 MASH Store Inventory Alert: Low Stock Products",
      text: `Dear Admin,\n\nThe following products are low in stock (quantities <= 5):\n\n${productList}\n\nPlease update the inventory soon.\n\nBest regards,\nMASH Inventory Bot`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Cron] Alert email sent successfully to ${emailTo}: ${info.messageId}`);
  } catch (error) {
    console.error("[Cron] Error running stock check job:", error);
  }
}

// Job 1: 8:30 AM IST (Asia/Kolkata timezone)
cron.schedule("30 8 * * *", () => {
  console.log("[Cron] Running 8:30 AM IST stock check...");
  checkStockAndSendEmail();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Job 2: 5:00 PM IST (Asia/Kolkata timezone)
cron.schedule("0 17 * * *", () => {
  console.log("[Cron] Running 5:00 PM IST stock check...");
  checkStockAndSendEmail();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

console.log("⏰ Cron job scheduler initialized for 8:30 AM IST and 5:00 PM IST");

module.exports = { checkStockAndSendEmail };
