const MFL_YEAR = '2026';
const CORS_PROXY = "https://corsproxy.io/?";

const MFL_LEAGUES = [
    { name: "#SFB16 - Baseball Stars", id: "42801" },
    { name: "#SFB16 - Crazy Taxi", id: "46308" },
    { name: "#SFB16 - Double dragon", id: "23484" },
    { name: "#SFB16 - Double dribble", id: "39518" },
    { name: "#SFB16 - Duck Hunt", id: "54792" },
    { name: "#SFB16 - Excitebike", id: "73136" },
    { name: "#SFB16 - Frogger", id: "14494" },
    { name: "#SFB16 - Ice Hockey", id: "61959" },
    { name: "#SFB16 - Metroid", id: "43844" },
    { name: "#SFB16 - Mutant League Football", id: "41323" },
    { name: "#SFB16 - NBA Jam (Berry)", id: "65583" },
    { name: "#SFB16 - NHL 2021", id: "15797" },
    { name: "#SFB16 - Pitfall", id: "72117" },
    { name: "#SFB16 - Pong", id: "55743" },
    { name: "#SFB16 - Rampage", id: "25949" },
    { name: "#SFB16 - Tetris", id: "44962" },
    { name: "#SFB16 - Zelda", id: "38735" }
];

function updateInputPlaceholder() {
    const platform = document.getElementById('platformSelect').value;
    const input = document.getElementById('username');
    
    if (platform === 'sleeper') {
        input.placeholder = "Sleeper Username";
    } else if (platform === 'mfl') {
        input.placeholder = "Franchise Name";
    }
}

// 1. Main trigger function (Updated for tools.css classes)
async function generateGraphic() {
    const platform = document.getElementById('platformSelect').value;
    const username = document.getElementById('username').value;
    const loader = document.getElementById('loader'); // Added missing declaration

    if (!platform) return alert("-- Select Platform --");
    if (!username) return alert("Enter username or ID");

    loader.style.display = 'block';
    loader.innerText = "Syncing draft data...";

    try {
        if (platform === 'sleeper') {
            await handleSleeper(username);
        } else if (platform === 'mfl') {
            await handleMFL(username);
        }
    } catch (e) {
        console.error("Detailed Error:", e); // This will show the actual API error in your browser console (F12)
        alert("Error fetching data: " + e.message); 
    } finally {
        loader.style.display = 'none';
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

async function handleMFL(franchiseName) {
    franchiseName = franchiseName.trim();
    if (!franchiseName) return alert("Enter your franchise name");
    
    let found = false;
    let leagueNameResult, leagueIdResult, franchiseIdResult, allPicksResult;
    
    for (const league of MFL_LEAGUES) {
        try {
            const franchisesUrl = `${CORS_PROXY}https://api.myfantasyleague.com/${MFL_YEAR}/export?TYPE=franchise&LEAGUE_ID=${league.id}&JSON=1`;
            const franchisesRes = await fetch(franchisesUrl);
            if (!franchisesRes.ok) continue;
            
            const franchisesData = await franchisesRes.json();
            if (!franchisesData.franchise) continue;
            
            const franchises = Array.isArray(franchisesData.franchise) 
                ? franchisesData.franchise 
                : [franchisesData.franchise];
            
            console.log(`League: ${league.name}`, franchises);
            
            const myFranchise = franchises.find(f => {
                const nameMatch = f.name && f.name.toLowerCase() === franchiseName.toLowerCase();
                const ownerMatch = f.owner && f.owner.toLowerCase() === franchiseName.toLowerCase();
                return nameMatch || ownerMatch;
            });
            
            if (myFranchise) {
                found = true;
                leagueNameResult = league.name;
                leagueIdResult = league.id;
                franchiseIdResult = myFranchise.id;
                
                const draftUrl = `${CORS_PROXY}https://api.myfantasyleague.com/${MFL_YEAR}/export?TYPE=draft&LEAGUE_ID=${league.id}&JSON=1`;
                const draftRes = await fetch(draftUrl);
                if (!draftRes.ok) return alert("Could not fetch draft data for " + league.name);
                
                const draftData = await draftRes.json();
                if (!draftData.draft || !draftData.draft.picks) return alert("No draft data found in " + league.name);
                
                allPicksResult = draftData.draft.picks;
                break;
            }
        } catch (e) {
            console.error("Error checking league " + league.name, e);
            continue;
        }
    }
    
    if (!found) {
        return alert(`Franchise "${franchiseName}" not found in any #SFB16 league. Check your spelling and try again.`);
    }
    
    const myPicks = allPicksResult.filter(p => p.franchise_id === franchiseIdResult);
    if (myPicks.length === 0) return alert("No picks found for this franchise.");
    
    processMFLPicks(myPicks, franchiseName, leagueNameResult);
}

function processMFLPicks(picks, franchiseName, leagueName) {
    const processedPicks = picks.map(p => ({
        round: parseInt(p.round),
        draft_slot: parseInt(p.overall),
        picked_by: p.franchise_id,
        metadata: {
            position: p.position || "UNK",
            first_name: p.first_name || "",
            last_name: p.last_name || ""
        }
    }));
    
    processedPicks.sort((a, b) => a.draft_slot - b.draft_slot);
    
    draw(processedPicks, franchiseName, leagueName);
}

// 3. Drawing Controller
function draw(picks, managerName, leagueName) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imgTag = document.getElementById('finalImage');

    canvas.width = 1000;
    canvas.height = 650; 

    const sfbLogo = new Image();
    const secondLogo = new Image();
    
    let imagesLoaded = 0;
    function imageLoadedCallback() {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            renderBoard(ctx, picks, managerName, leagueName, sfbLogo, secondLogo, canvas.height);
            imgTag.src = canvas.toDataURL("image/png");
            imgTag.style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';
        }
    }

    sfbLogo.src = "assets/images/SFB.png";
    sfbLogo.onload = imageLoadedCallback;
    sfbLogo.onerror = () => { sfbLogo.failed = true; imageLoadedCallback(); };

    secondLogo.src = "assets/images/fantasycares.org.png";
    secondLogo.onload = imageLoadedCallback;
    secondLogo.onerror = () => { secondLogo.failed = true; imageLoadedCallback(); };
}

// 4. Board Rendering
function renderBoard(ctx, picks, manager, league, sfbLogo, secondLogo, canvasHeight) {
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const targetHeight = 70; 
    const targetY = 15;
    let currentX = 25;

    if (sfbLogo && !sfbLogo.failed) {
        const scale = targetHeight / sfbLogo.height;
        const logoWidth = sfbLogo.width * scale;
        ctx.drawImage(sfbLogo, currentX, targetY, logoWidth, targetHeight);
        currentX += logoWidth + 15; 
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

    drawFooter(ctx, canvasHeight);
}

// 5. Stylized Footer (Matches your Fantasy Roster footer)
function drawFooter(ctx, canvasHeight) {
    const footerHeightPx = 50;
    const footerStartY = canvasHeight - footerHeightPx;
    const footerTextY = footerStartY + 32;
    
    ctx.fillStyle = "#0a0f1a"; 
    ctx.fillRect(0, footerStartY, 1000, footerHeightPx);
    
    const mainText = "SFB16 Roster powered by ";
    const brandText = "FantasyNow";
    const plusText = "+";
    
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    
    const widthMain = ctx.measureText(mainText).width;
    const widthBrand = ctx.measureText(brandText).width;
    const widthPlus = ctx.measureText(plusText).width;
    const totalWidth = widthMain + widthBrand + widthPlus;
    
    let currentX = (1000 - totalWidth) / 2;
    
    ctx.fillStyle = "#94a3b8"; 
    ctx.fillText(mainText, currentX, footerTextY);
    currentX += widthMain;
    
    ctx.fillStyle = "#FFFFFF"; 
    ctx.fillText(brandText, currentX, footerTextY);
    currentX += widthBrand;
    
    ctx.fillStyle = "#FFA515"; 
    ctx.fillText(plusText, currentX, footerTextY);
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'DraftRecap.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
