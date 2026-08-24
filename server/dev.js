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
// string and any dynamic route segments (e.g. [id].js). Express splits
// those into req.query and req.params, so we merge them back together
// before the shared handler code ever runs.
function mount(method, routePath, importPath) {
  app[method](routePath, async (req, res) => {
    try {
      const mod = await import(importPath);
      // req.query is getter-only in Express 5, so redefine it instead of assigning.
      Object.defineProperty(req, "query", {
        value: { ...req.query, ...req.params },
        configurable: true,
      });
      await mod.default(req, res);
    } catch (err) {
      console.error(`Error handling ${method.toUpperCase()} ${routePath}:`, err);
      if (!res.headersSent) res.status(500).json({ message: "Internal server error" });
    }
  });
}

mount("post", "/api/auth/register", "../api/auth/register.js");
mount("post", "/api/auth/login", "../api/auth/login.js");
mount("get", "/api/auth/verify-email", "../api/auth/verify-email.js");
mount("post", "/api/auth/resend-verification", "../api/auth/resend-verification.js");
mount("post", "/api/auth/forgot-password", "../api/auth/forgot-password.js");
mount("post", "/api/auth/reset-password", "../api/auth/reset-password.js");
mount("post", "/api/auth/change-password", "../api/auth/change-password.js");
mount("get", "/api/auth/me", "../api/auth/me.js");

mount("get", "/api/orders", "../api/orders/index.js");
mount("post", "/api/orders", "../api/orders/index.js");
mount("get", "/api/orders/:id", "../api/orders/[id].js");
mount("post", "/api/orders/:id/cancel", "../api/orders/[id]/cancel.js");
mount("post", "/api/orders/validate-coupon", "../api/orders/validate-coupon.js");

mount("get", "/api/addresses", "../api/addresses/index.js");
mount("post", "/api/addresses", "../api/addresses/index.js");
mount("delete", "/api/addresses/:id", "../api/addresses/[id].js");
mount("patch", "/api/addresses/:id", "../api/addresses/[id].js");

mount("get", "/api/dev/inbox", "../api/dev/inbox.js");

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

app.listen(PORT, () => {
  console.log(`API dev server ready on http://localhost:${PORT}`);
});
