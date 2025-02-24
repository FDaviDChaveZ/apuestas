const fs = require('fs');

const odds = JSON.parse(fs.readFileSync('Odds.json', 'utf8')).data;
const matchGames = JSON.parse(fs.readFileSync('MatchGame.json', 'utf8')).data;
const markets = JSON.parse(fs.readFileSync('FileFromMarketGames.json', 'utf8')).data;

const validOdds = odds.filter(odd => ["OP", "TD", "TDM"].includes(odd.status));

// Mapear mercados por ID 
const marketMap = {};
markets.forEach(market => {
    if (!marketMap[market.id]) {
        marketMap[market.id] = [];
    }
    marketMap[market.id].push(market);
});

// Mapear juegos por ID
const matchMap = {};
matchGames.forEach(match => {
    matchMap[match.id] = match;
});

const result = {};
validOdds.forEach(odd => {
    const match = matchMap[odd.match.id];
    const marketList = marketMap[odd.market_id];

    if (!match || !marketList) return;

    // Seleccionar el primer mercado con videojuego disponible
    const market = marketList.find(m => m.videogame) || marketList[0];
    const marketName = market.name;
    const videoGame = market.videogame || "Desconocido";

    const matchName = match.name;

    if (!result[matchName]) {
        result[matchName] = { videoGame, markets: {} };
    }

    if (!result[matchName].markets[marketName]) {
        result[matchName].markets[marketName] = [];
    }

    result[matchName].markets[marketName].push({
        selection: odd.selection_name,
        quota: odd.odd_quota,
        origin: odd.odd_origin,
        status: odd.status
    });
});

for (const match in result) {
    console.log(`Partido: ${match} (Videojuego: ${result[match].videoGame})`);
    
    const markets = result[match].markets;
    if (Object.keys(markets).length === 0) {
        console.log("  * No hay mercados disponibles para este partido.");
        continue;
    }

    for (const market in markets) {
        console.log(`  - Mercado: ${market}`);
        markets[market].forEach(odd => {
            console.log(`    * ${odd.selection}: ${odd.quota} (${odd.origin}) - Estado: ${odd.status}`);
        });
    }
}
