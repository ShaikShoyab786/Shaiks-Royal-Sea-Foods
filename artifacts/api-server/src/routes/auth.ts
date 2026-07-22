import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, usersTable, otpsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { signToken } from "../lib/jwt";
import {
  SendOtpBody,
  SendOtpResponse,
  VerifyOtpBody,
  VerifyOtpResponse,
  AdminLoginBody,
  AdminLoginResponse,
  GetMeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /auth/send-otp
router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phone } = parsed.data;
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate old OTPs for this phone
  await db
    .update(otpsTable)
    .set({ used: true })
    .where(eq(otpsTable.phone, phone));

  await db.insert(otpsTable).values({ phone, code, expiresAt });

  // In production, send SMS. For demo, return OTP in response.
  req.log.info({ phone }, "OTP generated");

  res.json(
    SendOtpResponse.parse({
      message: `OTP sent to ${phone}. Demo OTP: ${code}`,
      expiresIn: 600,
    })
  );
});

// POST /auth/verify-otp
router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phone, otp } = parsed.data;
  const now = new Date();

  const [otpRecord] = await db
    .select()
    .from(otpsTable)
    .where(
      and(
        eq(otpsTable.phone, phone),
        eq(otpsTable.code, otp),
        eq(otpsTable.used, false),
        gt(otpsTable.expiresAt, now)
      )
    )
    .limit(1);

  if (!otpRecord) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  // Mark OTP as used
  await db.update(otpsTable).set({ used: true }).where(eq(otpsTable.id, otpRecord.id));

  // Find or create user
  let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({ phone, name: "", role: "customer" })
      .returning();
  }

  // Check if this is an executive logging in (role stored in DB)
  const token = signToken({ userId: user.id, role: user.role as "customer" | "admin" | "executive", phone: user.phone ?? undefined });

  res.json(
    VerifyOtpResponse.parse({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    })
  );
});

// POST /auth/admin/login
router.post("/auth/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  // Find admin user by phone (username field maps to phone for admins)
  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.phone, username), eq(usersTable.role, "admin")))
    .limit(1);

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: "admin" });

  res.json(
    AdminLoginResponse.parse({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    })
  );
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(
    GetMeResponse.parse({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    })
  );
});

export default router;
