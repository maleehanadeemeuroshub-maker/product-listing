import { writeDB } from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";

async function handler(req, res) {
  const { user, db } = req;
  const { id } = req.query;
  user.addresses = user.addresses || [];

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

export default requireAuth(handler);
