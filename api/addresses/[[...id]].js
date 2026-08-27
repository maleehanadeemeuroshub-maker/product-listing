import crypto from "crypto";
import { writeDB } from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";

async function handler(req, res) {
  const { user, db } = req;
  const { id: idParts } = req.query;
  const id = Array.isArray(idParts) ? idParts[0] : idParts;
  user.addresses = user.addresses || [];

  // /api/addresses — list or create
  if (!id) {
    if (req.method === "GET") {
      return res.status(200).json({ addresses: user.addresses });
    }

    if (req.method === "POST") {
      const { label, fullName, phone, line1, city, state, zip, country, isDefault } = req.body || {};

      if (!fullName?.trim() || !phone?.trim() || !line1?.trim() || !city?.trim()) {
        return res.status(400).json({ message: "Full name, phone, address line and city are required." });
      }

      const address = {
        id: crypto.randomUUID(),
        label: label?.trim() || "Home",
        fullName: fullName.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        city: city.trim(),
        state: state?.trim() || "",
        zip: zip?.trim() || "",
        country: country?.trim() || "",
        isDefault: Boolean(isDefault) || user.addresses.length === 0,
      };

      if (address.isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }

      user.addresses.push(address);
      writeDB(db);

      return res.status(201).json({ addresses: user.addresses });
    }

    return res.status(405).json({ message: "Method not allowed" });
  }

  // /api/addresses/:id — update or delete
  if (req.method === "DELETE") {
    user.addresses = user.addresses.filter((a) => a.id !== id);
    writeDB(db);
    return res.status(200).json({ addresses: user.addresses });
  }

  if (req.method === "PATCH") {
    const address = user.addresses.find((a) => a.id === id);
    if (!address) return res.status(404).json({ message: "Address not found." });

    user.addresses.forEach((a) => (a.isDefault = a.id === id));
    writeDB(db);
    return res.status(200).json({ addresses: user.addresses });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

// Optional catch-all ("/api/addresses/[[...id]]") standing in for what used
// to be two separate serverless functions (index.js + [id].js) — see
// api/auth/[action].js for why these were consolidated.
export default requireAuth(handler);
