// pages/api/footystats.js  (Next.js - Pages)  ||  api/footystats.js (Función Vercel)
export default async function handler(req, res) {
  try {
    // Solo GET
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Método no permitido. Usa GET.' });
    }

    // Leer parámetros de entrada
    const urlIn = new URL(req.url, `http://${req.headers.host}`);
    const path = urlIn.searchParams.get('path') || '';
    if (!path) {
      return res.status(400).json({ success: false, message: 'Missing ?path=' });
    }

    // ✅ Lista blanca de endpoints permitidos
    const allowed = new Set([
      'country-list',
      'league-list',
      'league-season',
      'league-teams',
      'league-matches',
      'league-tables',
      'player-stats',
      'match'
    ]);
    if (!allowed.has(path)) {
      return res.status(400).json({ success: false, message: `Path not allowed: ${path}` });
    }

    // ✅ Validaciones mínimas por endpoint
    const needSeason = new Set(['league-season', 'league-teams', 'league-matches', 'league-tables']);
    if (needSeason.has(path) && !urlIn.searchParams.get('season_id')) {
      return res.status(400).json({ success: false, message: `season_id requerido para ${path}` });
    }
    if (path === 'match' && !urlIn.searchParams.get('match_id')) {
      return res.status(400).json({ success: false, message: 'match_id requerido para match' });
    }
    if (path === 'player-stats' && !urlIn.searchParams.get('player_id')) {
      return res.status(400).json({ success: false, message: 'player_id requerido para player-stats' });
    }

    // ✅ Construir URL al origen (FootyStats oficial)
    const upstream = new URL(`https://api.footystats.org/${path}`);

    // Copiar todos los params salvo 'path'
    urlIn.searchParams.forEach((v, k) => {
      if (k !== 'path') upstream.searchParams.set(k, v);
    });

    // Inyectar API Key desde variables de entorno de Vercel
    // Usa FOOTYSTATS_API_KEY (preferente) o FOOTYSTATS_KEY si ya la tienes creada.
    const apiKey = process.env.FOOTYSTATS_API_KEY || process.env.FOOTYSTATS_KEY || '';
    upstream.searchParams.set('key', apiKey);

    // Llamada al origen
    const r = await fetch(upstream.toString(), { headers: { Accept: 'application/json' } });

    // Passthrough del cuerpo (FootyStats ya devuelve success/errores)
    const bodyText = await r.text();

    // (Opcional) Cache corta en éxito para aliviar rate limit
    if (r.ok) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=30');
    }

    res.status(r.status).setHeader('Content-Type', 'application/json').send(bodyText);
  } catch (e) {
    res.status(500).json({ success: false, message: e?.message || 'Proxy error' });
  }
}
