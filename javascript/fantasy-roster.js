const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_BP0MJYd9QseL_8gMK3YKNVRbZLut6CMBxcm06-BhAcUxmSJMBjpv8d8IHFEYv58YriwEYqKZ1sg3/pub?output=csv'; // The link from Publish to Web

async function loadLeagues() {
    const user = document.getElementById('username').value;
    document.getElementById('loader').style.display = 'block';
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    const lRes = await fetch(`https://api.sleeper.app/v1/user/${u.user_id}/leagues/nfl/2026`);
    const ls = await lRes.json();
    const s = document.getElementById('leagueSelect');
    ls.forEach(l => s.add(new Option(l.name, l.league_id)));
    document.getElementById('step2').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    window.currentUserId = u.user_id;
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    
    // 1. Fetch live roster + Sheet data
    const [rosters, sheetRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(SHEET_URL).then(r => r.text())
    ]);

    // 2. Parse Sheet CSV into a Map
    const rows = sheetRes.split('\n').slice(1); // skip header
    const playerMap = new Map();
    rows.forEach(row => {
        const [id, name, pos, img, team] = row.split(',');
        if(id) playerMap.set(id.trim(), { name, pos, img, team });
    });

    const roster = rosters.find(r => r.owner_id === window.currentUserId);
    const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
    
    const players = roster.players.map(id => playerMap.get(id) || { name: 'Unknown', pos: 'BN', img: '', team: 'FA' })
        .sort((a, b) => POS_ORDER.indexOf(a.pos) - POS_ORDER.indexOf(b.pos));

    draw(players, "MY TEAM");
}

function draw(players, teamName) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200; canvas.height = 1000;
    ctx.fillStyle = "#0B162A"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid exactly like your old index.html
    players.forEach((p, i) => {
        const x = 50 + ((i % 4) * 280);
        const y = 150 + (Math.floor(i / 4) * 100);
        
        ctx.strokeStyle = "#FFA515"; ctx.strokeRect(x, y, 250, 80);
        ctx.fillStyle = "#FFF"; ctx.fillText(p.name, x + 20, y + 45);
        
        // Load image from URL in sheet
        if (p.img) {
            const img = new Image();
            img.src = p.img;
            img.onload = () => ctx.drawImage(img, x, y, 50, 50);
        }
    });
    canvas.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
}
