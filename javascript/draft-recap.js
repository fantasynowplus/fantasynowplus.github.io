// javascript/draft-recap.js
const CURRENT_SEASON = '2026';

async function findLeagues() {
    const username = document.getElementById('username').value;
    if (!username) return alert("Enter username");

    document.getElementById('loader').style.display = 'block';
    
    try {
        const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
        const userData = await userRes.json();
        const userId = userData.user_id;

        const leagueRes = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${CURRENT_SEASON}`);
        const leagues = await leagueRes.json();

        const sel = document.getElementById('leagueSelect');
        sel.innerHTML = '<option value="">-- Select Your League --</option>';
        leagues.forEach(l => sel.add(new Option(l.name, l.league_id)));
        
        document.getElementById('loader').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        window.globalUserId = userId;
    } catch (e) {
        alert("Error fetching data. Check username.");
        document.getElementById('loader').style.display = 'none';
    }
}

async function generate() {
    const lid = document.getElementById('leagueSelect').value;
    if (!lid) return;
    
    document.getElementById('loader').style.display = 'block';
    
    const [usersRes, draftsRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lid}/users`),
        fetch(`https://api.sleeper.app/v1/league/${lid}/drafts`)
    ]);
    
    const users = await usersRes.json();
    const drafts = await draftsRes.json();
    const draftId = drafts[0].draft_id;
    
    const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
    const allPicks = await picksRes.json();
    
    const currentUser = users.find(u => u.user_id === window.globalUserId);
    const teamName = currentUser ? (currentUser.metadata.team_name || currentUser.display_name) : "My Team";
    
    const pickMap = {};
    allPicks.forEach(p => pickMap[p.pick_no] = { name: `${p.metadata.first_name} ${p.metadata.last_name}`, pos: p.metadata.position });
    
    const userPicks = allPicks.filter(p => p.picked_by === window.globalUserId).map(p => ({
        round: p.round, pick: p.pick_no, name: `${p.metadata.first_name} ${p.metadata.last_name}`, pos: p.metadata.position,
        nextPicks: [pickMap[p.pick_no + 1], pickMap[p.pick_no + 2], pickMap[p.pick_no + 3]]
    }));

    document.getElementById('loader').style.display = 'none';
    draw(userPicks, teamName);
}
