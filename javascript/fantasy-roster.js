// Configuration for position sorting and colors
const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
const POS_COLORS = { 
    "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", 
    "TE": "#FFA515", "DL": "#FF795A", "LB": "#6D7DF5", 
    "DB": "#FF7CB6", "K": "#AF61ED", "DEF": "#00b8ff" 
};

// 1. Fetch Leagues for Username
async function loadLeagues() {
    const username = document.getElementById('username').value;
    const response = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    const user = await response.json();
    const leagues = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/2026`);
    const leagueList = await leagues.json();
    
    const select = document.getElementById('leagueSelect');
    select.innerHTML = '<option value="">Select League</option>';
    leagueList.forEach(l => select.innerHTML += `<option value="${l.league_id}">${l.name}</option>`);
}

// 2. Fetch Roster and Draw Graphic
async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    const username = document.getElementById('username').value;
    
    // Fetch data in parallel
    const [rosters, players, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json())
    ]);

    const user = users.find(u => u.display_name === username);
    const roster = rosters.find(r => r.owner_id === user.user_id);
    
    const rosterPlayers = roster.players.map(id => players[id])
        .sort((a, b) => POS_ORDER.indexOf(a.position) - POS_ORDER.indexOf(b.position));

    drawRoster(rosterPlayers, user.metadata.team_name || username);
}

// 3. Canvas Drawing Logic
function drawRoster(players, teamName) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Canvas setup
    canvas.width = 1200;
    canvas.height = 1000;
    ctx.fillStyle = "#FFFFFF"; // Background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = "#002863";
    ctx.font = "bold 60px sans-serif";
    ctx.fillText(teamName.toUpperCase(), 50, 80);
    
    // Render Grid
    players.forEach((p, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 50 + (col * 280);
        const y = 150 + (row * 100);
        
        // Draw Card Container
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 260, 80);
        
        // Color Dot
        ctx.fillStyle = POS_COLORS[p.position] || "#ccc";
        ctx.beginPath();
        ctx.arc(x + 30, y + 40, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Player Name
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`${p.first_name} ${p.last_name}`, x + 60, y + 45);
    });
    
    // Show final elements
    document.getElementById('canvas').style.display = 'block';
    document.getElementById('finalImage').src = canvas.toDataURL("image/png");
    document.getElementById('finalImage').style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'Roster.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
