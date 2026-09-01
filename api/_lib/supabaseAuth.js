import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
// The anon/publishable key is enough to validate a user's own access token —
// no service role key required for that. It's only needed for admin actions,
// which this app doesn't do server-side.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

function client() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

/** Reads the Bearer token from the request and resolves the Supabase user, or null. */
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return null;

  const { data, error } = await client().auth.getUser(token);
  if (error || !data?.user) return null;

  const meta = data.user.user_metadata || {};
  return {
    id: data.user.id,
    email: data.user.email,
    name: meta.name || data.user.email?.split("@")[0] || "Customer",
  };
}

/** Wraps a handler so it 401s automatically when there's no valid Supabase session. */
export function requireSupabaseAuth(handler) {
  return async (req, res) => {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "You must be signed in to do that." });
    }
    req.user = user;
    return handler(req, res);
  };
}
