import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET ?? "shaiks-royal-seafoods-secret";

export interface JwtPayload {
  userId: number;
  role: "customer" | "admin" | "executive";
  phone?: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
