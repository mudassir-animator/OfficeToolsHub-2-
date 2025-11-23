// server/index-prod.ts
import fs from "node:fs";
import path2 from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});
async function registerRoutes(app2) {
  app2.get("/api/templates/download/:templateId", (req, res) => {
    const { templateId } = req.params;
    res.json({
      message: "Template download endpoint",
      templateId,
      downloadUrl: `/templates/${templateId}.pdf`
    });
  });
  app2.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://officetoolshub.com";
    const tools = [
      "pdf-to-jpg",
      "jpg-to-pdf",
      "pdf-merge",
      "pdf-split",
      "pdf-compress",
      "pdf-rotate",
      "pdf-protect",
      "image-compress",
      "image-resize",
      "image-crop",
      "image-converter",
      "image-color-picker",
      "image-enhance",
      "word-counter",
      "case-converter",
      "remove-duplicates",
      "lorem-ipsum",
      "grammar-checker",
      "qr-code",
      "barcode",
      "password",
      "username",
      "html-to-pdf",
      "image-to-text",
      "percentage-calculator",
      "loan-calculator",
      "gpa-calculator",
      "zakat-calculator"
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tools</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/templates</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  ${tools.map((tool) => `  <url>
    <loc>${baseUrl}/tool/${tool}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  });
  app2.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://officetoolshub.com/sitemap.xml`;
    res.type("text/plain");
    res.send(robots);
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `Office Tools Hub - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, "<br>")}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">
              This message was sent from Office Tools Hub contact form.
            </p>
          </div>
        `
      });
      console.log(`Contact message from ${name} (${email}) sent successfully`);
      res.json({
        success: true,
        message: "Message sent successfully! We'll get back to you soon."
      });
    } catch (error) {
      console.error("Failed to send contact email:", error);
      res.status(500).json({
        error: "Failed to send message. Please try again later."
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
