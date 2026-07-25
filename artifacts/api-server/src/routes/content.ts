import { Router } from "express";
import { db, siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import z from "zod";

const router = Router();

// ─── Seed defaults ────────────────────────────────────────────────────────────
const SEED_DATA: Record<string, unknown> = {
  royal_standard: [
    {
      image: "/images/quality-export.png",
      title: "Export Quality",
      desc: "Sourced from the finest catch and carefully selected to meet premium quality standards.",
      detail:
        "Every product in our lineup undergoes rigorous inspection to meet international export standards. We partner with certified processors who maintain HACCP and ISO 22000 compliance, ensuring each batch meets the highest benchmark of quality. Our selection criteria prioritise freshness, size consistency and zero contamination — so what reaches your table is the very finest the sea has to offer.",
    },
    {
      image: "/images/quality-hygiene.png",
      title: "Hygienically Cleaned",
      desc: "Professionally cleaned in a hygienic environment using safe food handling practices.",
      detail:
        "Our processing facility operates under strict food-safety protocols enforced by certified food handlers wearing PPE at all times. Every piece of seafood is meticulously cleaned, deveined and rinsed under potable water to eliminate bacteria and contaminants. We maintain a zero-tolerance policy for cross-contamination, so your family receives seafood that is not just clean — but clinically clean.",
    },
    {
      image: "/images/quality-frozen.png",
      title: "Flash Frozen \u201318\u00b0C",
      desc: "Instantly frozen at \u201318\u00b0C to lock freshness, taste and nutritional value.",
      detail:
        "Using industrial blast-freeze technology, our seafood is frozen within hours of processing — locking in peak freshness, natural flavour and vital nutrients like Omega-3 fatty acids. Unlike slow freezing which damages cell structure, our flash-freeze process preserves texture and taste at the molecular level. The result is seafood that is virtually indistinguishable from fresh-caught when properly prepared.",
    },
    {
      image: "/images/quality-temp.png",
      title: "Temperature Controlled",
      desc: "Maintained under strict cold-chain conditions from our facility to your doorstep.",
      detail:
        "Our cold-chain logistics ensure your order never deviates from the optimal \u201318\u00b0C to \u201320\u00b0C range from the moment it leaves our facility to the moment it arrives at your door. Deliveries are packed in high-density insulated thermocol boxes with ice packs rated to maintain temperature for up to 8 hours. Our field executives are trained to handle each parcel with the same care as a pharmaceutical cold-chain delivery.",
    },
  ],
  journey_steps: [
    {
      image: "/images/step1.png",
      title: "Select Your Catch",
      desc: "Browse our premium seafood collection including White Prawns, Apollo Fish and other carefully selected products.",
      detail:
        "Our catalogue features handpicked frozen seafood sourced from the finest coastal harvests. From peeled and deveined White Prawns to golden Apollo Fish Steaks and Tiger Prawns, every product is packed in export-quality 1 KG portions. Simply browse, choose what you love, and add it to your cart — it's that effortless.",
    },
    {
      image: "/images/step2.png",
      title: "Choose Delivery Slot",
      desc: "Choose your preferred delivery date, delivery time and delivery location before confirming your order.",
      detail:
        "Select your ideal delivery date and a time slot that suits your schedule — Morning (7 AM\u201311 AM) or Afternoon (3 PM\u20136 PM). Then confirm your delivery address using our interactive map. Our system validates every slot for freshness and logistics, so your order is always timed perfectly.",
    },
    {
      image: "/images/step3.png",
      title: "Royal Delivery",
      desc: "Our delivery executive safely delivers your seafood in a temperature-controlled insulated box to maintain maximum freshness.",
      detail:
        "Your order is packaged in a premium insulated thermocol box with ice packs sealed to maintain \u201318\u00b0C during transit. Our uniformed field executives deliver on time, handle your parcel with care, and confirm delivery at your doorstep. Cold-chain integrity is never compromised — from our facility to your hands.",
    },
  ],
  event_cta: {
    phone: "919908352959",
    backgroundImage: "/images/event-hero.png",
  },
  products_hero: {
    backgroundImage: "/images/products-hero.png",
  },
};

/** Insert seed if key doesn't exist yet. Returns current value. */
async function getOrSeed(key: string): Promise<unknown> {
  const [row] = await db
    .select()
    .from(siteContentTable)
    .where(eq(siteContentTable.key, key))
    .limit(1);

  if (row) {
    return JSON.parse(row.value);
  }

  // Seed defaults for ALL known keys in one shot (idempotent)
  for (const [k, v] of Object.entries(SEED_DATA)) {
    await db
      .insert(siteContentTable)
      .values({ key: k, value: JSON.stringify(v) })
      .onConflictDoNothing();
  }

  return SEED_DATA[key] ?? null;
}

// GET /api/content/:key — public
router.get("/content/:key", async (req, res): Promise<void> => {
  const key = req.params.key as string;
  if (!SEED_DATA[key] && key !== "event_cta" && key !== "products_hero" &&
      key !== "royal_standard" && key !== "journey_steps") {
    res.status(404).json({ error: "Unknown content key" });
    return;
  }

  try {
    const value = await getOrSeed(key);
    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ error: "Failed to load content" });
  }
});

const ContentPutBody = z.object({
  value: z.unknown(),
});

// PUT /api/content/:key — admin only
router.put("/content/:key", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const key = req.params.key as string;
  const parsed = ContentPutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db
      .insert(siteContentTable)
      .values({ key, value: JSON.stringify(parsed.data.value) })
      .onConflictDoUpdate({
        target: siteContentTable.key,
        set: { value: JSON.stringify(parsed.data.value) },
      });
    res.json({ key, value: parsed.data.value });
  } catch (err) {
    res.status(500).json({ error: "Failed to update content" });
  }
});

export default router;
