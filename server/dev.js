// Local-only dev server: runs the exact same handler files in api/ that
// Vercel would run in production, so there's no drift between "works in
// dev" and "works when deployed". It exists purely because `vercel dev`
// requires logging into a Vercel account — this lets `npm run dev` work
// immediately with zero external accounts.
import "dotenv/config";
import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json());

// Vercel gives handlers req.query populated from both the URL's query
// string and any dynamic route segments (e.g. [id].js, [[...slug]].js).
// Express splits those into req.query and req.params instead, and (unlike
// Vercel's catch-all routes) always gives a single string rather than an
// array — so `shapeParams` lets each route describe how its req.params
// should be reshaped into the query keys the consolidated handler expects.
function mount(method, routePath, importPath, shapeParams = (params) => params) {
  app[method](routePath, async (req, res) => {
    try {
      const mod = await import(importPath);
      // req.query is getter-only in Express 5, so redefine it instead of assigning.
      Object.defineProperty(req, "query", {
        value: { ...req.query, ...shapeParams(req.params) },
        configurable: true,
      });
      await mod.default(req, res);
    } catch (err) {
      console.error(`Error handling ${method.toUpperCase()} ${routePath}:`, err);
      if (!res.headersSent) res.status(500).json({ message: "Internal server error" });
    }
  });
}

// api/auth, api/addresses and api/orders were consolidated from one file per
// endpoint into a handful of dynamic catch-all routes (see api/auth/[action].js)
// to fit Vercel Hobby's 12-serverless-function cap. The route paths below are
// unchanged; only the underlying file each one loads (and how its params are
// shaped) is different now.
mount("all", "/api/auth/:action", "../api/auth/[action].js");

// api/orders/[[...slug]].js expects req.query.slug as an array (Vercel's
// optional-catch-all shape): [] for /api/orders, [id] for /api/orders/:id,
// [id, "cancel"] for /api/orders/:id/cancel.
mount("get", "/api/orders", "../api/orders/[[...slug]].js");
mount("post", "/api/orders", "../api/orders/[[...slug]].js");
mount("post", "/api/orders/validate-coupon", "../api/orders/[[...slug]].js", () => ({ slug: ["validate-coupon"] }));
mount("get", "/api/orders/:id", "../api/orders/[[...slug]].js", (p) => ({ slug: [p.id] }));
mount("post", "/api/orders/:id/cancel", "../api/orders/[[...slug]].js", (p) => ({ slug: [p.id, "cancel"] }));

mount("get", "/api/addresses", "../api/addresses/[[...id]].js");
mount("post", "/api/addresses", "../api/addresses/[[...id]].js");
mount("delete", "/api/addresses/:id", "../api/addresses/[[...id]].js");
mount("patch", "/api/addresses/:id", "../api/addresses/[[...id]].js");

mount("get", "/api/dev/inbox", "../api/dev/inbox.js");

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

app.listen(PORT, () => {
  console.log(`API dev server ready on http://localhost:${PORT}`);
});
