import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Usa tu API key de FootyStats (la que ya probaste en el navegador)
const API_KEY = "8d1c39d984324bdb8a6f26567cf495c5126d480d165c38d6d4a61a624f407aa5";

// Proxy básico
app.get("/league-list", async (req, res) => {
  try {
    const response = await fetch(`https://api.footystats.org/league-list?key=${API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Otros endpoints que quieras (ejemplo: equipos de liga)
app.get("/league-teams", async (req, res) => {
  try {
    const { season_id } = req.query;
    const response = await fetch(`https://api.footystats.org/league-teams?key=${API_KEY}&season_id=${season_id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy corriendo en puerto ${PORT}`);
});
