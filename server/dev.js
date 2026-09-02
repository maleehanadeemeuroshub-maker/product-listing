// Local-only dev server: runs the exact same handler files in api/ that
// Vercel would run in production, so there's no drift between "works in
// dev" and "works when deployed". It exists purely because `vercel dev`
// requires logging into a Vercel account — this lets `npm run dev:api`
// work immediately with zero external accounts.
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Two local env files exist for historical reasons: .env (Resend/JWT/etc,
// hand-maintained) and .env.local (Stripe/Supabase, managed by
// `vercel env pull`). Load both — .env.local's values win on overlap.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());

// The Stripe webhook needs the raw body to verify its signature, so it must
// be mounted BEFORE express.json() — a global JSON parser would consume the
// stream first and leave nothing for the raw-body reader in api/webhooks/stripe.js.
app.post("/api/webhooks/stripe", async (req, res) => {
  try {
    const mod = await import("../api/webhooks/stripe.js");
    await mod.default(req, res);
  } catch (err) {
    console.error("Error handling POST /api/webhooks/stripe:", err);
    if (!res.headersSent) res.status(500).json({ message: "Internal server error" });
  }
});

app.use(express.json());

function mount(method, routePath, importPath) {
  app[method](routePath, async (req, res) => {
    try {
      const mod = await import(importPath);
      await mod.default(req, res);
    } catch (err) {
      console.error(`Error handling ${method.toUpperCase()} ${routePath}:`, err);
      if (!res.headersSent) res.status(500).json({ message: "Internal server error" });
    }
  });
}

mount("post", "/api/checkout/create-session", "../api/checkout/create-session.js");
mount("post", "/api/notify/cart-added", "../api/notify/cart-added.js");
mount("post", "/api/notify/welcome", "../api/notify/welcome.js");
mount("post", "/api/notify/login", "../api/notify/login.js");
mount("get", "/api/dev/inbox", "../api/dev/inbox.js");

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

app.listen(PORT, () => {
  console.log(`API dev server ready on http://localhost:${PORT}`);
  console.log(`Dev email inbox: http://localhost:${PORT}/api/dev/inbox`);
});
