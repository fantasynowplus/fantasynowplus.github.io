// Configuration for position sorting and colors
const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
const POS_COLORS = { 
    "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", 
    "TE": "#FFA515", "DL": "#FF795A", "LB": "#6D7DF5", 
    "DB": "#FF7CB6", "K": "#AF61ED", "DEF": "#00b8ff" 
};

async function loadLeagues() {
    const username = document.getElementById('username').value;
    try {
        const uRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
        const user = await uRes.json();
        
        const lRes = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/2026`);
        const leagues = await lRes.json();
        
        const s = document.getElementById('leagueSelect');
        s.innerHTML = '<option value="">-- Select Your League --</option>';
        leagues.forEach(l => {
            let opt = document.createElement('option');
            opt.value = l.league_id;
            opt.innerHTML = l.name;
            s.appendChild(opt);
        });
        document.getElementById('step2').style.display = 'block';
    } catch (e) {
        alert("Could not find user or leagues. Check your username.");
    }
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    const username = document.getElementById('username').value;
    
    // 1. Fetch data
    const [rosters, players, users] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json())
    ]);
    
    // 2. Find the correct user and their specific roster
    const user = users.find(u => u.display_name === username || u.username === username);
    if (!user) { alert("User not found in this league."); return; }
    
    const roster = rosters.find(r => r.owner_id === user.user_id);
    if (!roster) { alert("Roster not found."); return; }
    
    // 3. Map player IDs to full data and sort
    const rosterPlayers = roster.players.map(id => players[id])
        .sort((a, b) => POS_ORDER.indexOf(a.position) - POS_ORDER.indexOf(b.position));
    
    draw(rosterPlayers, user.metadata.team_name || username);
}

function draw(players, teamName) {
    const canvas = document.getElementById('canvas');
    canvas.width = 1200; canvas.height = 800; // Set dimensions
    const ctx = canvas.getContext('2d');
    
    // Clear and Fill Background
    ctx.fillStyle = "#0B162A"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Players
    players.forEach((p, i) => {
        const x = 50 + ((i % 4) * 280);
        const y = 100 + (Math.floor(i / 4) * 100);
        
        // Card Border
        ctx.strokeStyle = "#FFA515";
        ctx.strokeRect(x, y, 250, 80);
        
        // Position Dot
        ctx.fillStyle = POS_COLORS[p.position] || "#fff";
        ctx.beginPath();
        ctx.arc(x + 30, y + 40, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Name Text
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.fillText(`${p.first_name} ${p.last_name}`, x + 50, y + 45);
    });
    
    // Finalize UI
    canvas.style.display = 'block';
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
