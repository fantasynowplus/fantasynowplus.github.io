let currentUserId = null;

async function loadLeagues() {
    const username = document.getElementById('username').value;
    if (!username) return alert("Please enter a username");
    
    document.getElementById('loader').style.display = 'block';
    
    try {
        // Fetch User ID
        const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
        const user = await userRes.json();
        currentUserId = user.user_id;

        // Fetch Leagues
        const leagueRes = await fetch(`https://api.sleeper.app/v1/user/${currentUserId}/leagues/nfl/2026`);
        const leagues = await leagueRes.json();

        document.getElementById('loader').style.display = 'none';
        const s = document.getElementById('leagueSelect');
        s.innerHTML = '<option value="">-- Select Your League --</option>';
        leagues.forEach(l => s.add(new Option(l.name, l.league_id)));
        document.getElementById('step2').style.display = 'block';
    } catch (e) {
        alert("Failed to load leagues. Please check the username.");
        document.getElementById('loader').style.display = 'none';
    }
}

async function generate() {
    const leagueId = document.getElementById('leagueSelect').value;
    if (!leagueId) return;

    document.getElementById('loader').style.display = 'block';
    
    try {
        // Fetch Rosters and Users directly from Sleeper
        const rosterRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
        const rosters = await rosterRes.json();
        const userRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
        const users = await userRes.json();

        // Find current user's roster
        const myRoster = rosters.find(r => r.owner_id === currentUserId);
        const myUser = users.find(u => u.user_id === currentUserId);
        
        // Logic to combine rostered players with your ranking data (if hosted as a JSON file in your repo)
        // const playerRankings = await fetch('data/rankings.json').then(r => r.json());
        
        document.getElementById('loader').style.display = 'none';
        // draw(myRoster, myUser); 
    } catch (e) {
        alert("Error fetching roster data.");
        document.getElementById('loader').style.display = 'none';
    }
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'RosterVisual.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
