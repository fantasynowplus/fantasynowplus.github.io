const CONFIG = {
    draft: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1794539617&single=true&output=csv",
    dynasty: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1296121046&single=true&output=csv",
    rookie: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1320428164&single=true&output=csv"
};
const PHOTO_URL = "https://docs.google.com/spreadsheets/d/e/.../pub?gid=1637702286&single=true&output=csv";

let currentType = 'draft';
let currentPos = 0;
let masterRankings = [];
let photoBank = {};

async function loadRankings(type, pos, el) {
    currentType = type;
    currentPos = pos;
    // Update active state for buttons
    document.querySelectorAll('.fnp-nav .bubble').forEach(b => b.classList.remove('active'));
    el.classList.add('active');

    const response = await fetch(CONFIG[type]);
    const text = await response.text();
    masterRankings = text.split('\n').map(r => r.split(','));
    
    renderList();
}

function renderList() {
    let html = '';
    let count = 0;
    masterRankings.forEach(row => {
        if (count >= 15 || !row[currentPos]) return;
        const name = row[currentPos].replace(/"/g, '').trim();
        if (name && !name.toUpperCase().includes("PLAYER")) {
            count++;
            // ... (Your row building logic here, similar to your existing code)
            html += `<div class="fnp-row">...</div>`;
        }
    });
    document.getElementById('rank-list').innerHTML = html;
}
