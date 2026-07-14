const LEAGUES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9LyrqxdoACV4VlaXiT9hCq5daoQjNoFkhSYkwQft3xmsPkorfiA4w8vY2ZCK8rUNeZDFKqUAPBwBl/pub?output=csv";

// 1. Load Leagues from CSV
async function init() {
    const res = await fetch(LEAGUES_CSV);
    const text = await res.text();
    const rows = text.split('\n').slice(1); // skip header
    const leagueSelect = document.getElementById('leagueSelect');
    
    rows.forEach(row => {
        const [name, id, platform] = row.split(',');
        if (id) {
            const opt = new Option(name, id);
            opt.dataset.platform = platform.trim();
            leagueSelect.add(opt);
        }
    });
}

// 2. Load Managers based on Platform
async function loadManagers() {
    const sel = document.getElementById('leagueSelect');
    const lid = sel.value;
    const platform = sel.options[sel.selectedIndex].dataset.platform;
    const mgrSel = document.getElementById('managerSelect');
    
    // Fetch via your proxy endpoint
    const res = await fetch(`/api/managers?platform=${platform}&lid=${lid}`);
    const managers = await res.json();
    
    mgrSel.innerHTML = '<option value="">-- Select Manager --</option>';
    managers.forEach(m => mgrSel.add(new Option(m.name, m.id)));
    mgrSel.style.display = 'block';
    document.getElementById('genBtn').style.display = 'block';
}

// 3. Generate Graphic
async function generate() {
    const lid = document.getElementById('leagueSelect').value;
    const mid = document.getElementById('managerSelect').value;
    document.getElementById('loader').style.display = 'block';

    const res = await fetch(`/api/draft?platform=${platform}&lid=${lid}&mid=${mid}`);
    const picks = await res.json();
    
    draw(picks);
    document.getElementById('loader').style.display = 'none';
}

// 4. Drawing Logic
function draw(picks) {
    const canvas = document.getElementById('canvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 650;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 1000, 650);

    // Draft Pick Rows
    picks.forEach((p, i) => {
        if (i >= 20) return;
        const colX = (i >= 10) ? 500 : 0;
        const y = 100 + ((i % 10) * 50);
        
        // Dynamic row coloring
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

// Initialize
init();
