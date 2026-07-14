// fantasy-roster.js

const getPosColor = (pos) => ({ 
    "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", 
    "TE": "#FFA515", "DL": "#FF795A", "LB": "#6D7DF5", 
    "DB": "#FF7CB6", "K": "#AF61ED" 
}[pos] || "#ccc");

async function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Enter Sleeper Username");
    
    document.getElementById('loader').style.display = 'block';
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    const lRes = await fetch(`https://api.sleeper.app/v1/user/${u.user_id}/leagues/nfl/2026`);
    const ls = await lRes.json();
    
    const s = document.getElementById('leagueSelect');
    s.innerHTML = '<option value="">-- Select Your League --</option>';
    ls.forEach(l => s.add(new Option(l.name, l.league_id)));
    document.getElementById('step2').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    document.getElementById('loader').style.display = 'block';
    
    const [rosterRes, playersDB, leagueRes, usersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json())
    ]);
    
    const roster = rosterRes.find(r => r.owner_id); // Adjust logic for your specific user ID
    const owner = usersRes.find(u => u.user_id === roster.owner_id);
    
    const players = roster.players.map(id => {
        const p = playersDB[id];
        return {
            name: `${p.first_name} ${p.last_name}`,
            pos: p.position === 'DEF' ? 'DEF' : p.position,
            img: `https://sleepercdn.com/content/nfl/players/${id}.jpg`,
            team: p.team || 'FA'
        };
    });

    draw({ players, teamName: owner.metadata.team_name, leagueName: leagueRes.name, username: owner.display_name });
    document.getElementById('loader').style.display = 'none';
}

async function draw(data) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const posOrder = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
    
    const sorted = data.players.sort((a,b) => posOrder.indexOf(a.pos) - posOrder.indexOf(b.pos));
    
    // Canvas dimensions setup
    const cols = 4, cardW = 280, cardH = 80, gap = 15, headH = 180, sidePad = 40;
    const rows = Math.ceil(sorted.length / cols);
    canvas.width = (cardW * cols) + (gap * (cols - 1)) + (sidePad * 2);
    canvas.height = headH + (rows * (cardH + gap)) + 100;

    // Background & Header Rendering
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#002863"; ctx.font = "bold 80px sans-serif"; ctx.fillText(data.teamName.toUpperCase(), sidePad, 85);
    
    // Card Rendering Loop
    for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        const col = i % cols; const row = Math.floor(i / cols);
        const x = sidePad + (col * (cardW + gap));
        const y = headH + (row * (cardH + gap));
        
        ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 6); ctx.fill(); ctx.shadowBlur = 0;
        
        // Clipping Headshot
        ctx.save(); ctx.beginPath(); ctx.arc(x + 35, y + 40, 25, 0, Math.PI * 2);
        ctx.fillStyle = getPosColor(p.pos); ctx.fill(); ctx.clip();
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.img;
        ctx.drawImage(img, x + 10, y + 15, 50, 50); ctx.restore();
        
        ctx.fillStyle = "#000"; ctx.font = "bold 16px sans-serif"; ctx.fillText(p.name, x + 75, y + 35);
    }
    
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
