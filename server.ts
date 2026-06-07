import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import fs from "fs";
import { getChatResponse } from "./src/services/geminiService";

let currentFilename = "";
let currentDirname = "";
try {
  currentFilename = fileURLToPath(import.meta.url);
  currentDirname = path.dirname(currentFilename);
} catch (e) {
  // Fallback for CommonJS/bundled environments
  currentFilename = typeof __filename !== "undefined" ? __filename : "";
  currentDirname = typeof __dirname !== "undefined" ? __dirname : "";
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("SMTP_USER or SMTP_PASS environment variables are not set. Email delivery is simulated in server logs.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set higher limits for base64 file uploads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Serve static files from the uploads directory
  app.use("/uploads", express.static(uploadsDir));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, history, propertiesContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }
      const responseText = await getChatResponse(message, history || [], propertiesContext || "");
      return res.json({ response: responseText });
    } catch (err: any) {
      console.error("[Chatbot Error] Error in /api/chatbot:", err);
      return res.status(500).json({ error: err.message || "An error occurred in AI Assistant." });
    }
  });

  app.post("/api/upload", (req, res) => {
    const { fileName, base64Data } = req.body;

    if (!fileName || !base64Data) {
      return res.status(400).json({ error: "fileName and base64Data are required." });
    }

    try {
      // Split header from logic (e.g. "data:image/jpeg;base64,.....")
      const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      let dataBuffer: Buffer;

      if (matches && matches.length === 3) {
        dataBuffer = Buffer.from(matches[2], "base64");
      } else {
        // Fallback to raw base64 split
        const base64Clean = base64Data.includes(";base64,")
          ? base64Data.split(";base64,").pop()
          : base64Data;
        dataBuffer = Buffer.from(base64Clean, "base64");
      }

      // Create unique filename to prevent overwrites
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${uniqueSuffix}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, dataBuffer);

      const fileUrl = `/uploads/${uniqueFileName}`;
      return res.status(200).json({ success: true, url: fileUrl });
    } catch (err: any) {
      console.error("[Upload Error] Failed to write file:", err);
      return res.status(500).json({ error: `File write failed: ${err.message || err}` });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    const { name, email, phone, message, subject, propertyTitle } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields (name, email, message)." });
    }

    const mailOptions = {
      from: `"TopNotch Portal" <${process.env.SMTP_USER || "noreply@lovethproperties.com"}>`,
      to: "lovethbproperties02@gmail.com",
      subject: subject || `New Inquiry from ${name} - TopNotch Real Estate`,
      text: `
        You have received a new inquiry on Loveth TopNotch Global Properties:

        Name: ${name}
        Email: ${email}
        Phone: ${phone || "Not specified"}
        Property: ${propertyTitle || "General Inquiry"}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #C9A84C; font-family: Georgia, serif;">New TopNotch Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || "Not specified"}</p>
          <p><strong>Interested In:</strong> ${propertyTitle || "General Inquiry"}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-weight: bold;">Message:</p>
          <blockquote style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #C9A84C; margin: 10px 0;">
            ${message.replace(/\n/g, "<br>")}
          </blockquote>
        </div>
      `,
    };

    const transporter = getMailTransporter();
    
    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] Successfully delivered to lovethbproperties02@gmail.com from ${email}`);
        return res.status(200).json({ success: true, message: "Email sent successfully via SMTP!" });
      } catch (err: any) {
        console.error("[Email Error] Failed to send email via SMTP:", err);
      }
    }

    // Fallback / simulated logs
    console.log(`
========================================================================
SIMULATED EMAIL SENT TO: lovethbproperties02@gmail.com
Subject: ${mailOptions.subject}
From: ${email}
Body:
${mailOptions.text}
========================================================================
    `);
    
    return res.status(200).json({
      success: true,
      message: "Inquiry logged. (SMTP not configured, delivery simulated in console)."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
