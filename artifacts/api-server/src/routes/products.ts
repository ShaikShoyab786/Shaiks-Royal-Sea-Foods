import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  ListProductsResponse,
  GetProductParams,
  GetProductResponse,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /products
router.get("/products", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(
    ListProductsResponse.parse(
      products.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ?? null,
        createdAt: p.createdAt.toISOString(),
      }))
    )
  );
});

// GET /products/:id
router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(
    GetProductResponse.parse({
      ...product,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt.toISOString(),
    })
  );
});

// POST /products (admin)
router.post("/products", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(
    CreateProductResponse.parse({
      ...product,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt.toISOString(),
    })
  );
});

// PATCH /products/:id (admin)
router.patch("/products/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(
    UpdateProductResponse.parse({
      ...product,
      imageUrl: product.imageUrl ?? null,
      createdAt: product.createdAt.toISOString(),
    })
  );
});

// DELETE /products/:id (admin)
router.delete("/products/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
