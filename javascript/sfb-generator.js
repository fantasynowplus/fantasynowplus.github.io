const MFL_YEAR = '2026';
const CORS_PROXY = "https://corsproxy.io/?";

// 1. Main trigger function
async function generateGraphic() {
    const username = document.getElementById('username').value;
    const platform = document.getElementById('platformSelect').value;
    
    if (!username) return alert("Please enter a username or ID.");

    try {
        if (platform === 'sleeper') {
            await handleSleeper(username);
        } else {
            alert("MFL requires a League ID. Please update input to League ID.");
        }
    } catch (e) {
        console.error(e);
        alert("Error fetching data. Check your inputs.");
    }
}

// 2. Fetch Logic
async function handleSleeper(username) {
    const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    const user = await userRes.json();
    
    const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${user.user_id}/leagues/nfl/2026`);
    const leagues = await leaguesRes.json();
    
    const sfbLeague = leagues.find(l => l.name && l.name.startsWith("#SFB16"));
    if (!sfbLeague) return alert("No #SFB16 league found for this user.");
    
    const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${sfbLeague.draft_id}/picks`);
    const allPicks = await picksRes.json();
    const myPicks = allPicks.filter(p => p.picked_by === user.user_id);
    
    draw(myPicks, user.display_name, sfbLeague.name);
}

// 3. Drawing Controller
function draw(picks, managerName, leagueName) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imgTag = document.getElementById('finalImage');

    canvas.width = 1000;
    canvas.height = 600; 

    const sfbLogo = new Image();
    const secondLogo = new Image();
    
    let imagesLoaded = 0;
    function imageLoadedCallback() {
        imagesLoaded++;
        if (imagesLoaded === 2) { // Changed to 2 as sponsor logo is removed
            renderBoard(ctx, picks, managerName, leagueName, sfbLogo, secondLogo);
            imgTag.src = canvas.toDataURL("image/png");
            imgTag.style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';
        }
    }

    sfbLogo.src = "assets/images/SFB.png";
    sfbLogo.onload = imageLoadedCallback;
    sfbLogo.onerror = () => { sfbLogo.failed = true; imageLoadedCallback(); };

    secondLogo.src = "assets/images/fantasycares.png"; // Ensure this matches your file extension
    secondLogo.onload = imageLoadedCallback;
    secondLogo.onerror = () => { secondLogo.failed = true; imageLoadedCallback(); };
}

// 4. Board Rendering (Updated to remove sponsor logo)
function renderBoard(ctx, picks, manager, league, sfbLogo, secondLogo) {
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const targetHeight = 70; 
    const targetY = 15;
    let currentX = 25;

    // Logo Rendering
    if (sfbLogo && !sfbLogo.failed) {
        const scale = targetHeight / sfbLogo.height;
        const logoWidth = sfbLogo.width * scale;
        ctx.drawImage(sfbLogo, currentX, targetY, logoWidth, targetHeight);
        currentX += logoWidth + 15; 
    } else {
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = "normal 32px sans-serif";
        ctx.fillText("SFB", currentX, targetY + 45);
        currentX += 80;
    }

    if (secondLogo && !secondLogo.failed) {
        const scale = targetHeight / secondLogo.height;
        const secondWidth = secondLogo.width * scale;
        ctx.drawImage(secondLogo, currentX, targetY, secondWidth, targetHeight);
        currentX += secondWidth + 20; 
    }

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(currentX, 20);
    ctx.lineTo(currentX, 80);
    ctx.stroke();
    currentX += 25; 

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "normal 34px sans-serif";
    ctx.fillText(manager, currentX, 48); 
    ctx.font = "normal 16px sans-serif";
    ctx.fillText(league, currentX, 74);

    // Pick Loop
    if (picks && Array.isArray(picks)) {
        picks.forEach((p, i) => {
            if (!p || i >= 20) return; 
            const isRightCol = i >= 10;
            const colX = isRightCol ? 500 : 0;
            const y = 100 + ((i % 10) * 50);
            
            const posRaw = p.metadata.position || "UNK";
            let color = "#475569";
            if (posRaw.includes("QB")) color = "#FCDAD7";       
            else if (posRaw.includes("RB")) color = "#D2F4E2";  
            else if (posRaw.includes("WR")) color = "#D2DCFF";  
            else if (posRaw.includes("TE")) color = "#FFF3CD";  
            else if (posRaw.includes("K") || posRaw.includes("DEF")) color = "#E9D5FF";

            ctx.fillStyle = color;
            ctx.fillRect(colX, y, 500, 50);
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "left";
            ctx.font = "normal 14px sans-serif";
            ctx.fillText(`${p.round}.${p.draft_slot}`, colX + 15, y + 33);
            ctx.font = "bold 15px sans-serif";
            ctx.fillText(posRaw, colX + 65, y + 33);
            ctx.font = "normal 22px sans-serif"; 
            ctx.fillText(p.metadata.first_name + " " + p.metadata.last_name, colX + 135, y + 33);
        });
    }

    drawFooter(ctx);
}

function drawFooter(ctx) {
    ctx.fillStyle = "#002863";
    ctx.fillRect(0, 550, 1000, 50);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("#SFB16 Roster powered by FantasyNow+", 500, 582);
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'DraftRecap.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
