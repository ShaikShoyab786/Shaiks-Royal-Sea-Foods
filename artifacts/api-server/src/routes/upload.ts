import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireRole } from "../middlewares/auth";

// Save uploads directly into the frontend's public/images folder so Vite serves them
const UPLOAD_DIR =
  process.env["UPLOAD_DIR"] ??
  path.resolve("/home/runner/workspace/artifacts/shaiks-royal-seafoods/public/images");

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image files (jpg, png, webp) are allowed"));
  },
});

const router = Router();

// POST /api/upload — admin-only image upload
router.post(
  "/upload",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
  (req, res): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    res.json({ url: `/images/${req.file.filename}` });
  }
);

// POST /api/upload/hero — upload a new hero background (saves as hero.jpg)
router.post(
  "/upload/hero",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
  (req, res): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    // Rename to hero.jpg so the landing page always reads the same URL
    const target = path.join(UPLOAD_DIR, "hero.jpg");
    fs.renameSync(req.file.path, target);
    res.json({ url: "/images/hero.jpg" });
  }
);

// POST /api/upload/content/:key/:index
// Saves image with a timestamped filename and updates the site_content DB row.
router.post(
  "/upload/content/:key/:index",
  requireAuth,
  requireRole("admin"),
  upload.single("image"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const key = req.params.key as string;
    const indexStr = req.params.index as string;
    const index = parseInt(indexStr, 10);

    try {
      // Import lazily to avoid circular deps
      const { db, siteContentTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");

      const newUrl = `/images/${req.file.filename}`;

      // Fetch current value and patch the image field
      const [row] = await db
        .select()
        .from(siteContentTable)
        .where(eq(siteContentTable.key, key))
        .limit(1);

      if (!row) {
        // Key not seeded yet — just return the URL
        res.json({ url: newUrl });
        return;
      }

      const parsed = JSON.parse(row.value);

      // Array content (royal_standard, journey_steps)
      if (Array.isArray(parsed) && parsed[index]) {
        parsed[index].image = newUrl;
        await db
          .update(siteContentTable)
          .set({ value: JSON.stringify(parsed) })
          .where(eq(siteContentTable.key, key));
      }
      // Object content with backgroundImage (event_cta, products_hero)
      else if (typeof parsed === "object" && parsed !== null && "backgroundImage" in parsed) {
        parsed.backgroundImage = newUrl;
        await db
          .update(siteContentTable)
          .set({ value: JSON.stringify(parsed) })
          .where(eq(siteContentTable.key, key));
      }

      res.json({ url: newUrl });
    } catch (err) {
      console.error("Content image upload error:", err);
      res.status(500).json({ error: "Failed to update content image" });
    }
  }
);

export default router;
