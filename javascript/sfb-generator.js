const MFL_YEAR = '2026';
const CORS_PROXY = "https://corsproxy.io/?"; // Public proxy to bypass MFL CORS blocks

async function generateGraphic() {
    const username = document.getElementById('username').value;
    const platform = document.getElementById('platformSelect').value; // Add a select box for Sleeper/MFL
    
    try {
        if (platform === 'sleeper') {
            await handleSleeper(username);
        } else {
            // For MFL, you'd typically need the league ID since MFL doesn't have a global "username" lookup like Sleeper
            alert("MFL requires a League ID. Please update input to League ID.");
        }
    } catch (e) {
        console.error(e);
        alert("Error fetching data. Check your inputs.");
    }
}

async function handleSleeper(username) {
    const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    const user = await userRes.json();
    
    const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/2026`);
    const leagues = await leaguesRes.json();
    
    const sfbLeague = leagues.find(l => l.name && l.name.startsWith("#SFB16"));
    
    const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${sfbLeague.draft_id}/picks`);
    const allPicks = await picksRes.json();
    const myPicks = allPicks.filter(p => p.picked_by === user.user_id);
    
    draw(myPicks, user.display_name, sfbLeague.name);
}

// Drawing logic remains the same as your preferred version
function draw(picks, manager, league) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000; canvas.height = 650;
    
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 1000, 650);

    // Draft Pick Rendering (Your preferred layout logic)
    picks.forEach((p, i) => {
        if (i >= 20) return;
        const colX = (i >= 10) ? 500 : 0;
        const y = 100 + ((i % 10) * 50);
        
        ctx.fillStyle = p.metadata.position === "QB" ? "#FCDAD7" : "#D2F4E2";
        ctx.fillRect(colX, y, 500, 50);
        
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${p.round}.${p.draft_slot}`, colX + 15, y + 33);
        ctx.fillText(p.metadata.first_name + " " + p.metadata.last_name, colX + 135, y + 33);
    });

    drawFooter(ctx);
    document.getElementById('finalImage').src = canvas.toDataURL("image/png");
    document.getElementById('finalImage').style.display = 'block';
}

function drawFooter(ctx) {
    ctx.fillStyle = "#002863";
    ctx.fillRect(0, 600, 1000, 50);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SFB16 Roster powered by FantasyNow+", 500, 632);
}
