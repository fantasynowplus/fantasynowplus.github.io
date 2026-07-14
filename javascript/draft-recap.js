const CURRENT_SEASON = '2026';

// 1. Fetch Leagues
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
        console.error(e);
        alert("Error fetching data. Check username.");
        document.getElementById('loader').style.display = 'none';
    }
}

// 2. Generate Data & Call Draw
async function generate() {
    const lid = document.getElementById('leagueSelect').value;
    if (!lid) return;
    
    document.getElementById('loader').style.display = 'block';
    
    try {
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
        allPicks.forEach(p => pickMap[p.pick_no] = { name: `${p.metadata.first_name || ''} ${p.metadata.last_name || ''}`, pos: p.metadata.position });
        
        const userPicks = allPicks.filter(p => p.picked_by === window.globalUserId).map(p => ({
            round: p.round, pick: p.pick_no, name: `${p.metadata.first_name || ''} ${p.metadata.last_name || ''}`, pos: p.metadata.position,
            nextPicks: [pickMap[p.pick_no + 1], pickMap[p.pick_no + 2], pickMap[p.pick_no + 3]]
        }));

        document.getElementById('loader').style.display = 'none';
        draw(userPicks, teamName);
    } catch (err) {
        console.error(err);
        document.getElementById('loader').style.display = 'none';
        alert("Error generating graphic.");
    }
}

// 3. Drawing Logic
function draw(picks, teamNameLabel) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const leagueName = document.getElementById('leagueSelect').selectedOptions[0].text;

    const cardW = 400, cardH = 240, margin = 50, gap = 30;
    const footerH = 80; 
    const numRows = Math.ceil(picks.length / 3);
    
    canvas.width = (cardW * 3) + (gap * 2) + (margin * 2);
    canvas.height = 250 + (numRows * (cardH + gap)) + footerH;

    // Background
    ctx.fillStyle = "#001C45";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title & Header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText(teamNameLabel, margin, 110);
    ctx.fillStyle = "#FFA515"; 
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(leagueName.toUpperCase() + " • 2026 DRAFT RECAP", margin, 160);

    // Define colors for each position
    const positionColors = {
        "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", 
        "TE": "#FFA515", "K": "#AF61ED", "DL": "#FF795A", 
        "LB": "#6D7DF5", "DB": "#FF7CB6", "DEF": "#636b73" 
    };

    // Draw Cards
    picks.forEach((p, i) => {
        const x = margin + (i % 3) * (cardW + gap);
        const y = 230 + Math.floor(i / 3) * (cardH + gap);
        
        ctx.fillStyle = "#2D5285"; 
        ctx.fillRect(x, y, cardW, cardH);
        
        // DYNAMIC POSITION COLOR LOOKUP
        const posColor = positionColors[p.pos.toUpperCase()] || "#FFA515";
        ctx.fillStyle = posColor; 
        ctx.fillRect(x, y, 10, cardH); // Stripe
        
        // Player Info
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(p.name, x + 30, y + 50);
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(p.pos.toUpperCase() + " • PK " + p.pick + " (RD " + p.round + ")", x + 30, y + 80);

        // Divider
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath(); ctx.moveTo(x + 30, y + 100); ctx.lineTo(x + cardW - 30, y + 100); ctx.stroke();

        // Next Picks
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("SELECTED IMMEDIATELY AFTER:", x + 30, y + 125);
        ctx.font = "14px sans-serif";
        p.nextPicks.forEach((np, idx) => {
            if (np) ctx.fillText((p.pick + idx + 1) + ". " + np.name + " (" + np.pos + ")", x + 30, y + 155 + (idx * 28));
        });
    });

    // Footer
    ctx.fillStyle = "#f8fafc"; 
    ctx.fillRect(0, canvas.height - footerH, canvas.width, footerH);
    
    const footerY = canvas.height - 35;
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#A8B0BF";
    ctx.fillText("Draft Recap powered by ", margin, footerY);
    ctx.fillStyle = "#002863";
    ctx.fillText("FantasyNow", margin + 265, footerY);
    ctx.fillStyle = "#FFA515";
    ctx.fillText("+", margin + 380, footerY);

    // Display
    const img = document.getElementById('finalImage');
    img.src = canvas.toDataURL("image/png");
    img.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
    img.scrollIntoView({behavior: 'smooth'});
}

// 4. Download Logic
function downloadImg() {
    const link = document.createElement('a');
    link.download = 'DraftRecap.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
