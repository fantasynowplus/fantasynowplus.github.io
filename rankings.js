const CONFIG = {
    draft: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1794539617&single=true&output=csv",
    dynasty: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1296121046&single=true&output=csv",
    rookie: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1320428164&single=true&output=csv"
};
const PHOTO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1637702286&single=true&output=csv";

const teamLookup = { "ARI": "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png", "ATL": "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png", "BAL": "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png", "BUF": "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png", "CAR": "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", "CHI": "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png", "CIN": "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", "CLE": "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", "DAL": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png", "DEN": "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", "DET": "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", "GB": "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", "HOU": "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png", "IND": "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png", "JAC": "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png", "KC": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png", "LV": "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", "LAC": "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", "LAR": "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", "MIA": "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png", "MIN": "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", "NE": "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png", "NO": "https://a.espncdn.com/i/teamlogos/nfl/500/no.png", "NYG": "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", "NYJ": "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png", "PHI": "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png", "PIT": "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", "SF": "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png", "SEA": "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", "TB": "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png", "TEN": "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png", "WAS": "https://a.espncdn.com/i/teamlogos/nfl/500/was.png" };

let state = { type: 'draft', col: 0 };
let masterRankings = [];
let photoBank = {};
let normalizedBank = {};

function normalize(name) { return name.toLowerCase().replace(/\./g, '').replace(/\b(jr|sr|iii|ii|iv|v)\b/g, '').replace(/\s+/g, ' ').trim(); }

async function init() {
    const res = await fetch(PHOTO_URL);
    const pt = await res.text();
    pt.split('\n').forEach(row => {
        const c = row.split(',');
        if(c[0] && c[1]) { photoBank[c[0].trim()] = c[1].trim(); normalizedBank[normalize(c[0].trim())] = c[1].trim(); }
    });
    switchTab('draft', 0);
}

window.switchTab = async function(type, col, el) {
    const isCategorySwitch = (type !== state.type);
    state.type = type;
    state.col = isCategorySwitch ? 0 : col;

    // Reset UI state for all bubbles in the widget
    document.querySelectorAll('#rankings-widget .bubble').forEach(b => b.classList.remove('active'));

    // Highlight the Category Bubble
    const catBtn = document.querySelector(`[onclick*="'${type}'"]`);
    if (catBtn) catBtn.classList.add('active');

    // Highlight the Position Bubble
    const posBtn = (el && !isCategorySwitch) ? el : document.querySelector(`[onclick*="switchTab('${state.type}', 0"]`);
    if (posBtn) posBtn.classList.add('active');

    const res = await fetch(CONFIG[type]);
    const text = await res.text();
    masterRankings = text.split('\n').map(r => r.split(','));
    renderList();
};

function renderList() {
    let html = ''; let count = 0;
    masterRankings.forEach(row => {
        if (count >= 10 || !row[state.col]) return;
        const name = row[state.col].replace(/"/g, '').trim();
        const team = row[state.col + 1]?.replace(/"/g, '').trim().toUpperCase();
        
        if (name && !name.toUpperCase().includes("PLAYER")) {
            count++;
            const playerImg = photoBank[name] || normalizedBank[normalize(name)];
            const teamLogo = teamLookup[team] || '';
            
            html += `<a href="https://www.fantasypros.com/nfl/players/${name.toLowerCase().replace(/ /g, '-')}.php" target="_blank" class="fnp-row">
                <div class="fnp-rank">${count}</div>
                <div class="photo-box">
                    <img src="${playerImg || teamLogo}" 
                         onerror="this.onerror=null; this.src='${teamLogo}';" 
                         class="player-photo">
                </div>
                <div style="flex-grow:1">
                    <span class="fnp-name">${name}</span>
                    <span class="fnp-meta">${team || ''}</span>
                </div>
            </a>`;
        }
    });
    html += `<a href="rankings.html" class="footer-link">View All Player Rankings</a>`;
    document.getElementById('rank-list').innerHTML = html;
}
init();
