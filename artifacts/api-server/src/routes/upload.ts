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

export default router;
