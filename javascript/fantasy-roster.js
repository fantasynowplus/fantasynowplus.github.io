const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
const POS_COLORS = { "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", "TE": "#FFA515", "DL": "#FF795A", "LB": "#6D7DF5", "DB": "#FF7CB6", "K": "#AF61ED", "DEF": "#00b8ff" };

async function loadLeagues() {
    const user = document.getElementById('username').value;
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    const lRes = await fetch(`https://api.sleeper.app/v1/user/${u.user_id}/leagues/nfl/2026`);
    const ls = await lRes.json();
    const s = document.getElementById('leagueSelect');
    s.style.display = 'block';
    ls.forEach(l => s.add(new Option(l.name, l.league_id)));
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    const username = document.getElementById('username').value;
    const [rosters, players, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json())
    ]);
    
    const user = users.find(u => u.display_name === username || u.username === username);
    const roster = rosters.find(r => r.owner_id === user.user_id);
    const sortedPlayers = roster.players.map(id => players[id])
        .filter(p => p !== undefined)
        .sort((a, b) => POS_ORDER.indexOf(a.position) - POS_ORDER.indexOf(b.position));
    
    draw(sortedPlayers, user.metadata.team_name || username);
}

function draw(players, teamName) {
    const canvas = document.getElementById('canvas');
    canvas.width = 1200; canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#0B162A"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#FFF"; ctx.font = "bold 60px sans-serif";
    ctx.fillText(teamName.toUpperCase(), 50, 80);
    
    players.forEach((p, i) => {
        const x = 50 + ((i % 4) * 280);
        const y = 150 + (Math.floor(i / 4) * 100);
        ctx.strokeStyle = "#FFA515"; ctx.strokeRect(x, y, 250, 80);
        ctx.fillStyle = POS_COLORS[p.position] || "#FFF";
        ctx.beginPath(); ctx.arc(x + 30, y + 40, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFF"; ctx.font = "14px sans-serif";
        ctx.fillText(`${p.first_name} ${p.last_name}`, x + 50, y + 45);
    });
    canvas.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'Roster.png';
    link.href = document.getElementById('canvas').toDataURL("image/png");
    link.click();
}
