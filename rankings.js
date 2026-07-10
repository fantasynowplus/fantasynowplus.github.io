const CONFIG = {
    draft: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1794539617&single=true&output=csv",
    dynasty: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1296121046&single=true&output=csv",
    rookie: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1320428164&single=true&output=csv"
};
const PHOTO_URL = "ttps://docs.google.com/spreadsheets/d/e/2PACX-1vREbWvMUmCM-OhWdAN3Zjm-SgfmWvQFFP6TMm8Dcwve-NlsIJctkvEquMpDAb1QG56HWCRYtAQVjHRW/pub?gid=1637702286&single=true&output=csv";

let state = { type: 'draft', col: 0 };
let masterRankings = [];
let photoBank = {};

async function init() {
    const photoRes = await fetch(PHOTO_URL);
    const pt = await photoRes.text();
    pt.split('\n').forEach(row => {
        const c = row.split(',');
        if(c[0]) photoBank[c[0].trim()] = c[1]?.trim();
    });
    switchTab('draft', 0);
}

window.switchTab = async function(type, col) {
    state.type = type; state.col = col;
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
        if (name && !name.toUpperCase().includes("PLAYER")) {
            count++;
            html += `<div class="fnp-row"><div class="fnp-rank">${count}</div><div class="photo-box">...</div><div class="fnp-name">${name}</div></div>`;
        }
    });
    document.getElementById('rank-list').innerHTML = html;
}
init();
