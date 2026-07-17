const MFL_YEAR = '2026';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9LyrqxdoACV4VlaXiT9hCq5daoQjNoFkhSYkwQft3xmsPkorfiA4w8vY2ZCK8rUNeZDFKqUAPBwBl/pub?gid=1351376251&single=true&output=csv';

let allLeagues = { sleeper: [] };
let selectedLeagueData = null;

async function loadLeaguesFromCSV() {
    try {
        const res = await fetch(CSV_URL);
        const csv = await res.text();
        const lines = csv.trim().split('\n');
        
        allLeagues.sleeper = [];
        
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 3) continue;
            
            const name = cols[0].trim().replace(/^"(.+)"$/, '$1');
            const id = cols[1].trim().replace(/^"(.+)"$/, '$1');
            const platform = cols[2].trim().toLowerCase().replace(/^"(.+)"$/, '$1');
            
            if (!name || !id || !platform) continue;
            
            const league = { name, id };
            
            if (platform === 'sleeper') {
                allLeagues.sleeper.push(league);
            }
        }
        
        console.log("Loaded Sleeper leagues:", allLeagues.sleeper);
    } catch (e) {
        console.error("Error loading CSV:", e);
        alert("Error loading league data: " + e.message);
    }
}

async function handlePlatformChange() {
    // Auto-load Sleeper leagues since it's the only option
    const leagueSelect = document.getElementById('leagueSelect');
    const franchiseSelect = document.getElementById('franchiseSelect');
    
    leagueSelect.innerHTML = '<option value="">-- Select League --</option>';
    franchiseSelect.innerHTML = '<option value="">-- Select Franchise --</option>';
    franchiseSelect.style.display = 'none';
    selectedLeagueData = null;
    
    leagueSelect.style.display = 'block';
    
    if (allLeagues.sleeper.length === 0) {
        await loadLeaguesFromCSV();
    }
    
    const leagues = allLeagues.sleeper;
    
    leagueSelect.innerHTML = '<option value="">-- Select League --</option>';
    leagues.forEach((league, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = league.name;
        leagueSelect.appendChild(option);
    });
}

async function handleLeagueChange() {
    const leagueSelect = document.getElementById('leagueSelect');
    const franchiseSelect = document.getElementById('franchiseSelect');
    
    const leagueIndex = leagueSelect.value;
    if (!leagueIndex && leagueIndex !== '0') {
        franchiseSelect.style.display = 'none';
        franchiseSelect.innerHTML = '<option value="">-- Select Franchise --</option>';
        selectedLeagueData = null;
        return;
    }
    
    const leagues = allLeagues.sleeper;
    const league = leagues[leagueIndex];
    
    await loadSleeperFranchises(league);
}

async function loadSleeperFranchises(league) {
    const franchiseSelect = document.getElementById('franchiseSelect');
    
    try {
        const res = await fetch(`https://api.sleeper.app/v1/league/${league.id}/users`);
        const users = await res.json();
        console.log("Sleeper users:", users);
        
        franchiseSelect.innerHTML = '<option value="">-- Select Franchise --</option>';
        users.forEach((user, index) => {
            const displayName = user.display_name || user.username || `User ${index + 1}`;
            const option = document.createElement('option');
            option.value = index;
            option.textContent = displayName;
            franchiseSelect.appendChild(option);
        });
        
        selectedLeagueData = { type: 'sleeper', league: league, users: users };
        franchiseSelect.style.display = 'block';
    } catch (e) {
        console.error("Error loading Sleeper franchises:", e);
        alert("Error loading franchises: " + e.message);
    }
}

async function generateGraphic() {
    const leagueSelect = document.getElementById('leagueSelect').value;
    const franchiseSelect = document.getElementById('franchiseSelect').value;
    const loader = document.getElementById('loader');
    
    if (!leagueSelect) return alert("Select a league");
    if (!franchiseSelect) return alert("Select a franchise");
    if (!selectedLeagueData) return alert("League data not loaded. Try selecting the league again.");
    
    loader.style.display = 'block';
    loader.innerText = "Syncing draft data...";
    
    try {
        await generateSleeperGraphic(franchiseSelect);
    } catch (e) {
        console.error("Error:", e);
        alert("Error: " + e.message);
    } finally {
        loader.style.display = 'none';
    }
}

async function generateSleeperGraphic(userIndex) {
    if (!selectedLeagueData || !selectedLeagueData.users) {
        throw new Error("League data not properly loaded");
    }
    
    const league = selectedLeagueData.league;
    const users = selectedLeagueData.users;
    const user = users[userIndex];
    
    console.log("Generating for user:", user);
    console.log("League ID:", league.id);
    
    // Fetch league details to get draft_id
    const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${league.id}`);
    console.log("League response status:", leagueRes.status);
    
    if (!leagueRes.ok) {
        throw new Error(`Failed to fetch league: ${leagueRes.status}`);
    }
    
    const leagueData = await leagueRes.json();
    console.log("League data:", leagueData);
    
    if (!leagueData.draft_id) {
        throw new Error("No draft found for this league");
    }
    
    const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${leagueData.draft_id}/picks`);
    console.log("Picks response status:", picksRes.status);
    
    if (!picksRes.ok) {
        throw new Error(`Failed to fetch picks: ${picksRes.status}`);
    }
    
    const allPicks = await picksRes.json();
    console.log("All picks:", allPicks);
    
    if (!allPicks || allPicks.length === 0) {
        throw new Error("No picks found in response");
    }
    
    const myPicks = allPicks.filter(p => p.picked_by === user.user_id);
    console.log("My picks:", myPicks);
    
    if (myPicks.length === 0) return alert("No picks found for this user");
    
    const managerName = user.display_name || user.username || `User ${userIndex + 1}`;
    draw(myPicks, managerName, league.name);
}

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
