let currentUserId = null;
let nflPlayers = {};

// Load full player database once on startup
async function init() {
    const res = await fetch('https://api.sleeper.app/v1/players/nfl');
    nflPlayers = await res.json();
}
init();

async function loadLeagues() {
    const username = document.getElementById('username').value;
    if (!username) return alert("Please enter a username");
    
    document.getElementById('loader').style.display = 'block';
    
    try {
        const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
        const user = await userRes.json();
        currentUserId = user.user_id;

        const leagueRes = await fetch(`https://api.sleeper.app/v1/user/${currentUserId}/leagues/nfl/2026`);
        const leagues = await leagueRes.json();

        document.getElementById('loader').style.display = 'none';
        const s = document.getElementById('leagueSelect');
        s.innerHTML = '<option value="">-- Select Your League --</option>';
        leagues.forEach(l => s.add(new Option(l.name, l.league_id)));
        document.getElementById('step2').style.display = 'block';
    } catch (e) {
        alert("Failed to load leagues.");
        document.getElementById('loader').style.display = 'none';
    }
}

async function generate() {
    const leagueId = document.getElementById('leagueSelect').value;
    if (!leagueId) return;

    document.getElementById('loader').style.display = 'block';
    
    try {
        const rosterRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
        const rosters = await rosterRes.json();
        const myRoster = rosters.find(r => r.owner_id === currentUserId);
        
        // Map roster player IDs to metadata
        const rosterData = myRoster.players.map(pId => {
            const p = nflPlayers[pId];
            return {
                name: p ? p.full_name : "Unknown",
                pos: p ? p.position : "N/A",
                team: p ? p.team : "FA",
                img: `https://sleepercdn.com/content/nfl/players/${pId}.jpg`
            };
        });

        document.getElementById('loader').style.display = 'none';
        draw(rosterData); 
    } catch (e) {
        alert("Error fetching roster data.");
        document.getElementById('loader').style.display = 'none';
    }
}

function draw(players) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const sidePad = 40;
    
    canvas.width = 1000;
    canvas.height = 800; // Adjust height based on roster size
    
    // Simple rendering logic
    ctx.fillStyle = "#001C45";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    players.forEach((p, i) => {
        const x = sidePad + (i % 4) * 230;
        const y = 100 + Math.floor(i / 4) * 100;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(p.name, x, y);
    });

    const finalImg = document.getElementById('finalImage');
    finalImg.src = canvas.toDataURL("image/png");
    finalImg.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'RosterVisual.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
