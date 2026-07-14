const LEAGUES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9LyrqxdoACV4VlaXiT9hCq5daoQjNoFkhSYkwQft3xmsPkorfiA4w8vY2ZCK8rUNeZDFKqUAPBwBl/pub?output=csv";

// 1. Load Leagues from CSV
async function init() {
    try {
        const res = await fetch(LEAGUES_CSV);
        const text = await res.text();
        const rows = text.split('\n').slice(1);
        const leagueSelect = document.getElementById('leagueSelect');
        
        leagueSelect.innerHTML = '<option value="">-- Select a League --</option>';
        rows.forEach(row => {
            const [name, id, platform] = row.split(',');
            if (id && name) {
                const opt = new Option(name.trim(), id.trim());
                opt.dataset.platform = platform ? platform.trim() : 'sleeper';
                leagueSelect.add(opt);
            }
        });
    } catch (e) {
        console.error("Error loading leagues:", e);
    }
}

// 2. Load Managers based on Platform
async function loadManagers() {
    const sel = document.getElementById('leagueSelect');
    const mgrSel = document.getElementById('managerSelect');
    const lid = sel.value;

    if (!lid) {
        mgrSel.style.display = 'none';
        document.getElementById('genBtn').style.display = 'none';
        return;
    }

    // Force visibility to ensure user sees it is loading
    mgrSel.innerHTML = '<option>Loading Managers...</option>';
    mgrSel.style.display = 'block'; 

    const platform = sel.options[sel.selectedIndex].dataset.platform;
    
    try {
        const res = await fetch(`/api/managers?platform=${platform}&lid=${lid}`);
        const managers = await res.json();
        
        mgrSel.innerHTML = '<option value="">-- Select Manager --</option>';
        managers.forEach(m => mgrSel.add(new Option(m.name, m.id)));
    } catch (e) {
        console.error("Error fetching managers:", e);
        mgrSel.innerHTML = '<option value="">Error loading managers</option>';
    }
}

// 3. Generate Graphic
async function generate() {
    const sel = document.getElementById('leagueSelect');
    const lid = sel.value;
    const platform = sel.options[sel.selectedIndex].dataset.platform;
    const mid = document.getElementById('managerSelect').value;
    
    if(!mid) return;

    document.getElementById('loader').style.display = 'block';

    try {
        const res = await fetch(`/api/draft?platform=${platform}&lid=${lid}&mid=${mid}`);
        const picks = await res.json();
        draw(picks);
    } catch (e) {
        console.error("Error generating graphic:", e);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

// 4. Drawing Logic (unchanged from your logic)
function draw(picks) {
    const canvas = document.getElementById('canvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 650;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 1000, 650);

    picks.forEach((p, i) => {
        if (i >= 20) return;
        const colX = (i >= 10) ? 500 : 0;
        const y = 100 + ((i % 10) * 50);
        
        ctx.fillStyle = p.pos.includes("QB") ? "#FCDAD7" : (p.pos.includes("RB") ? "#D2F4E2" : "#D2DCFF");
        ctx.fillRect(colX, y, 500, 50);
        
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(p.slot, colX + 15, y + 33);
        ctx.fillText(p.posRank, colX + 65, y + 33);
        ctx.fillText(p.name, colX + 135, y + 33);
        ctx.textAlign = "right";
        ctx.fillText(p.team, colX + 485, y + 33);
    });

    drawFooter(ctx);
    document.getElementById('finalImage').src = canvas.toDataURL("image/png");
    document.getElementById('finalImage').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
}

function drawFooter(ctx) {
    ctx.fillStyle = "#002863";
    ctx.fillRect(0, 600, 1000, 50);
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("SFB16 Roster powered by ", 450, 632);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("FantasyNow", 555, 632);
    ctx.fillStyle = "#FFA515";
    ctx.fillText("+", 615, 632);
}

// Run init
init();
