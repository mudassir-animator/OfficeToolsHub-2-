import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Template download routes
  app.get("/api/templates/download/:templateId", (req, res) => {
    const { templateId } = req.params;
    
    // In a real app, this would serve actual template files
    // For now, we'll return a placeholder response
    res.json({
      message: "Template download endpoint",
      templateId,
      downloadUrl: `/templates/${templateId}.pdf`,
    });
  });

  // Sitemap.xml route
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://officetoolshub.com";
    const tools = [
      "pdf-to-jpg", "jpg-to-pdf", "pdf-merge", "pdf-split", "pdf-compress", 
      "pdf-rotate", "pdf-protect", "image-compress", "image-resize", "image-crop",
      "image-converter", "image-color-picker", "image-enhance", "word-counter",
      "case-converter", "remove-duplicates", "lorem-ipsum", "grammar-checker",
      "qr-code", "barcode", "password", "username", "html-to-pdf", "image-to-text",
      "percentage-calculator", "loan-calculator", "gpa-calculator", "zakat-calculator"
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
  ${tools.map(tool => `  <url>
    <loc>${baseUrl}/tool/${tool}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Robots.txt route
  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://officetoolshub.com/sitemap.xml`;

    res.type('text/plain');
    res.send(robots);
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Contact form endpoint
  app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Log the message (in production, this would send via email service)
    const contactMessage = {
      timestamp: new Date().toISOString(),
      name,
      email,
      subject,
      message,
    };

    console.log("Contact message received:", contactMessage);
    // TODO: Integrate with SendGrid, Resend, or another email service to send to mudassiranimator92@gmail.com

    res.json({ 
      success: true, 
      message: "Message received. We'll get back to you soon at mudassiranimator92@gmail.com",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
