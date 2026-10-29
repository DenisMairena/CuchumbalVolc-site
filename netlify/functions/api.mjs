import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

// Huellas (SHA-256) de los 3 usuarios autorizados. El primero es el administrador.
const HASHES = ["f00fc010f3789548448575e2bad8b62a8758e8404cc32ea752d71a16248832e2", "dd43fb14c49ca351308ed987f24a0c87e763c4382dfc437a09f08a095df159d1", "7ed00705ddbe8fe1a2c420dc75699cd67c4bec794fe7c25e6285c3c5bbfce711"];
const ADMIN = HASHES[0];

const nz = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
const hash = (u, p) => createHash("sha256").update("cuchumbal|" + nz(u) + "|" + p).digest("hex");
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false }, 400); }

  const h = hash(String(b.user || ""), String(b.pass || ""));
  if (!HASHES.includes(h)) return json({ ok: false, error: "auth" }, 401);
  if (b.action === "login") return json({ ok: true });
  if (b.action === "admin") return h === ADMIN ? json({ ok: true }) : json({ ok: false }, 403);

  const store = getStore({ name: "cuchumbal", consistency: "strong" });
  const cur = (await store.get("estado", { type: "json" })) || { rev: 0, state: null };

  if (b.action === "get") return json({ ok: true, rev: cur.rev, state: cur.state });

  if (b.action === "save") {
    if (Number(b.rev) !== cur.rev) return json({ ok: false, rev: cur.rev, state: cur.state }, 409);
    const st = b.state;
    if (!st || !Array.isArray(st.people) || st.people.length > 200) return json({ ok: false }, 400);
    const rev = cur.rev + 1;
    await store.setJSON("estado", { rev, state: st });
    return json({ ok: true, rev });
  }
  return json({ ok: false }, 400);
};
