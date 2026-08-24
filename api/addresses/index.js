import crypto from "crypto";
import { writeDB } from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";

async function handler(req, res) {
  const { user, db } = req;
  user.addresses = user.addresses || [];

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

export default requireAuth(handler);
