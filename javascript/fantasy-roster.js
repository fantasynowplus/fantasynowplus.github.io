// fantasy-roster.js

// This replaces the logic that was in your Code.gs
async function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Enter username");

    document.getElementById('loader').style.display = 'block';
    
    // 1. Fetch User
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    
    // 2. Fetch Leagues (2026)
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
    const username = document.getElementById('username').value;
    
    document.getElementById('loader').style.display = 'block';
    document.getElementById('loader').innerText = "Syncing roster...";

    try {
        // Fetch everything directly in the browser (Replacing UrlFetchApp)
        const [rosters, players, users] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
            fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json()),
            fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json())
        ]);
        
        // Find your user and roster
        const user = users.find(u => u.display_name === username || u.username === username);
        const roster = rosters.find(r => r.owner_id === user.user_id);
        
        // POS_ORDER and Sorting Logic (exactly as you had it)
        const POS_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
        const playerData = roster.players.map(id => ({ ...players[id], id }))
            .sort((a, b) => POS_ORDER.indexOf(a.position) - POS_ORDER.indexOf(b.position));

        // Draw (Your exact canvas engine)
        draw(playerData, user.metadata.team_name || username);
    } catch (e) {
        alert("Generation failed: " + e.message);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}
