const CONFIG = {
    draft: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1794539617&single=true&output=csv",
    dynasty: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1296121046&single=true&output=csv",
    rookie: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1320428164&single=true&output=csv"
};
const PHOTO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1637702286&single=true&output=csv";

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
    state.type = type; state.col = col;
    if(el) { el.parentElement.querySelectorAll('.bubble').forEach(b => b.classList.remove('active')); el.classList.add('active'); }
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
        if (name && !name.toUpperCase().includes("PLAYER")) {
            count++;
            const playerImg = photoBank[name] || normalizedBank[normalize(name)] || '';
            html += `<a href="https://www.fantasypros.com/nfl/players/${name.toLowerCase().replace(/ /g, '-')}.php" target="_blank" class="fnp-row">
                <div class="fnp-rank">${count}</div>
                <div class="photo-box"><img src="${playerImg}" class="player-photo"></div>
                <div style="flex-grow:1"><span class="fnp-name">${name}</span><span class="fnp-meta">${row[state.col+1] || ''}</span></div>
            </a>`;
        }
    });
    html += `<a href="rankings.html" class="footer-link">View All Player Rankings</a>`;
    document.getElementById('rank-list').innerHTML = html;
}
init();
