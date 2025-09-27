export default async function handler(req, res) {
  try {
    const urlIn = new URL(req.url, `http://${req.headers.host}`);
    const path = urlIn.searchParams.get("path") || "";
    if (!path) return res.status(400).json({ success: false, message: "Missing ?path=" });

    const allowed = new Set(["league-list", "league-teams", "league-matches", "match"]);
    if (!allowed.has(path)) {
      return res.status(400).json({ success: false, message: `Path not allowed: ${path}` });
    }

    const upstream = new URL(`https://api.footystats.org/${path}`);
    urlIn.searchParams.forEach((v, k) => {
      if (k !== "path") upstream.searchParams.set(k, v);
    });
    upstream.searchParams.set("key", process.env.FOOTYSTATS_KEY);

    const r = await fetch(upstream.toString(), { headers: { "Accept": "application/json" } });
    const body = await r.text();
    res.status(r.status).setHeader("Content-Type", "application/json").send(body);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || "Proxy error" });
  }
}
