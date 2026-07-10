const CONFIG = {
    draft: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1794539617&single=true&output=csv",
    dynasty: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1296121046&single=true&output=csv",
    rookie: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1320428164&single=true&output=csv"
};
const PHOTO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1637702286&single=true&output=csv";

const teamLookup = { "ARI": ["Arizona Cardinals", "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png"], "ATL": ["Atlanta Falcons", "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png"], "BAL": ["Baltimore Ravens", "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png"], "BUF": ["Buffalo Bills", "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png"], "CAR": ["Carolina Panthers", "https://a.espncdn.com/i/teamlogos/nfl/500/car.png"], "CHI": ["Chicago Bears", "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"], "CIN": ["Cincinnati Bengals", "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png"], "CLE": ["Cleveland Browns", "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png"], "DAL": ["Dallas Cowboys", "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png"], "DEN": ["Denver Broncos", "https://a.espncdn.com/i/teamlogos/nfl/500/den.png"], "DET": ["Detroit Lions", "https://a.espncdn.com/i/teamlogos/nfl/500/det.png"], "GB": ["Green Bay Packers", "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png"], "HOU": ["Houston Texans", "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png"], "IND": ["Indianapolis Colts", "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png"], "JAC": ["Jacksonville Jaguars", "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png"], "KC": ["Kansas City Chiefs", "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"], "LV": ["Las Vegas Raiders", "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png"], "LAC": ["LA Chargers", "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png"], "LAR": ["LA Rams", "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png"], "MIA": ["Miami Dolphins", "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png"], "MIN": ["Minnesota Vikings", "https://a.espncdn.com/i/teamlogos/nfl/500/min.png"], "NE": ["New England Patriots", "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png"], "NO": ["New Orleans Saints", "https://a.espncdn.com/i/teamlogos/nfl/500/no.png"], "NYG": ["NY Giants", "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png"], "NYJ": ["NY Jets", "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png"], "PHI": ["Philadelphia Eagles", "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png"], "PIT": ["Pittsburgh Steelers", "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png"], "SF": ["San Francisco 49ers", "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png"], "SEA": ["Seattle Seahawks", "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"], "TB": ["Tampa Bay Buccaneers", "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png"], "TEN": ["Tennessee Titans", "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png"], "WAS": ["Washington Commanders", "https://a.espncdn.com/i/teamlogos/nfl/500/was.png"] };

let state = { type: 'draft', col: 0 };
let masterRankings = [];
let photoBank = {};
let normalizedBank = {};

function normalize(name) {
    if (!name) return "";
    return name.toLowerCase().replace(/\./g, '').replace(/\b(jr|sr|iii|ii|iv|v)\b/g, '').replace(/\s+/g, ' ').trim();
}

async function init() {
    const photoRes = await fetch(PHOTO_URL);
    const pt = await photoRes.text();
    pt.split('\n').forEach(row => {
        const c = row.split(',');
        if(c[0] && c[1]) {
            const name = c[0].trim();
            const url = c[1].trim();
            photoBank[name] = url;
            normalizedBank[normalize(name)] = url;
        }
    });
    switchTab('draft', 0);
}

window.switchTab = async function(type, col, el) {
    state.type = type; state.col = col;
    if (el) {
        document.querySelectorAll('.bubble').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
    }
    const res = await fetch(CONFIG[type]);
    const text = await res.text();
    masterRankings = text.split('\n').map(r => r.split(','));
    render();
};

function render() {
    let html = ''; let count = 0;
    masterRankings.forEach(row => {
        if (count >= 15 || !row[state.col]) return;
        const name = row[state.col].replace(/"/g, '').trim();
        if (name && name !== "" && !name.toUpperCase().includes("PLAYER")) {
            count++;
            const tierClass = count <= 5 ? "tier-green" : (count <= 10 ? "tier-orange" : "tier-yellow");
            const rawAbbr = row[state.col + 1] ? row[state.col + 1].replace(/"/g, '').trim().toUpperCase() : "";
            const teamData = teamLookup[rawAbbr] || ["Unknown Team", ""];
            const playerImg = photoBank[name] || normalizedBank[normalize(name)];
            const imgHtml = playerImg ? `<img src="${playerImg}" class="player-photo">` : `<img src="${teamData[1]}" class="team-logo-fallback">`;
            
            html += `<div class="fnp-row">
                <div class="fnp-rank ${tierClass}">${count}</div>
                <div class="photo-box">${imgHtml}</div>
                <div style="min-width:0; overflow:hidden;">
                    <span class="fnp-name">${name}</span>
                    <span class="fnp-meta">${teamData[0]}</span>
                </div>
            </div>`;
        }
    });
    document.getElementById('rank-list').innerHTML = html;
}
init();
