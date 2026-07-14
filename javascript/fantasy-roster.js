// javascript/fantasy-roster.js
let currentId = null;

// Replace this with the URL to your hosted player data file if you want to avoid live-fetching
const PLAYER_DATA_URL = 'https://raw.githubusercontent.com/your-username/your-repo/main/data/players.json';

async function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Please enter a username");
    
    document.getElementById('loader').style.display = 'block';
    
    try {
        // Fetch User ID
        const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
        const u = await uRes.json();
        currentId = u.user_id;

        // Fetch Leagues
        const lRes = await fetch(`https://api.sleeper.app/v1/user/${currentId}/leagues/nfl/2026`);
        const ls = await lRes.json();

        document.getElementById('loader').style.display = 'none';
        const s = document.getElementById('leagueSelect');
        s.innerHTML = '<option value="">-- Select Your League --</option>';
        ls.forEach(l => s.add(new Option(l.name, l.league_id)));
        document.getElementById('step2').style.display = 'block';
    } catch (e) {
        alert("Error finding leagues: " + e.message);
    }
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    if (!lId) return;

    document.getElementById('loader').style.display = 'block';

    try {
        // Fetch Sleeper Data
        const [rRes, uRes, lRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`),
            fetch(`https://api.sleeper.app/v1/league/${lId}/users`),
            fetch(`https://api.sleeper.app/v1/league/${lId}`)
        ]);
        
        const rosters = await rRes.json();
        const users = await uRes.json();
        const league = await lRes.json();
        
        const userRoster = rosters.find(r => r.owner_id === currentId);
        const userData = users.find(u => u.user_id === currentId);

        // Fetch your player mapping data (hosted on your GitHub repo)
        // This replaces the Google Sheet data call
        const playerMap = await fetch('data/players.json').then(r => r.json());

        // Process players (Matches logic from your previous Code.gs)
        const processed = userRoster.players.map(id => {
            const info = playerMap[id] || {};
            return {
                name: info.name || "Unknown",
                pos: info.pos || "BN",
                img: info.img || "",
                team: info.team || "FA"
            };
        });

        const data = {
            players: processed,
            teamName: userData.metadata.team_name || userData.display_name,
            username: userData.display_name,
            leagueName: league.name
        };

        document.getElementById('loader').style.display = 'none';
        draw(data);
    } catch (e) {
        alert("Error generating image: " + e.message);
    }
}

// ... Keep your existing 'draw' function logic here ...
