// 1. Data Mapping Helpers
const nflFull = {
    "ARI": { c: "#97233F", n: "Arizona Cardinals" }, "BAL": { c: "#241773", n: "Baltimore Ravens" },
    "BUF": { c: "#00338D", n: "Buffalo Bills" }, "CAR": { c: "#0085CA", n: "Carolina Panthers" },
    "CHI": { c: "#0B162A", n: "Chicago Bears" }, "CIN": { c: "#FB4F14", n: "Cincinnati Bengals" },
    "CLE": { c: "#311D00", n: "Cleveland Browns" }, "DAL": { c: "#003594", n: "Dallas Cowboys" },
    "DEN": { c: "#FB4F14", n: "Denver Broncos" }, "DET": { c: "#0076B6", n: "Detroit Lions" },
    "GB": { c: "#204E32", n: "Green Bay Packers" }, "HOU": { c: "#03202F", n: "Houston Texans" },
    "IND": { c: "#002C5F", n: "Indianapolis Colts" }, "JAX": { c: "#006778", n: "Jacksonville Jaguars" },
    "KC": { c: "#E31837", n: "Kansas City Chiefs" }, "LV": { c: "#000000", n: "Las Vegas Raiders" },
    "LAC": { c: "#0080C6", n: "Los Angeles Chargers" }, "LAR": { c: "#003594", n: "Los Angeles Rams" },
    "MIA": { c: "#008E97", n: "Miami Dolphins" }, "MIN": { c: "#4F2683", n: "Minnesota Vikings" },
    "NE": { c: "#002244", n: "New England Patriots" }, "NO": { c: "#D3BC8D", n: "New Orleans Saints" },
    "NYG": { c: "#0B2265", n: "New York Giants" }, "NYJ": { c: "#125740", n: "New York Jets" },
    "PHI": { c: "#004C54", n: "Philadelphia Eagles" }, "PIT": { c: "#FFB612", n: "Pittsburgh Steelers" },
    "SF": { c: "#AA0000", n: "San Francisco 49ers" }, "SEA": { c: "#002244", n: "Seattle Seahawks" },
    "TB": { c: "#D50A0A", n: "Tampa Bay Buccaneers" }, "TEN": { c: "#0C2340", n: "Tennessee Titans" },
    "WAS": { c: "#773141", n: "Washington Commanders" }, "FA": { c: "#666666", n: "Free Agent" }
};

const getPosColor = (pos) => {
    const map = { "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", "TE": "#FFA515", "DL": "#FF795A", "LB": "#6D7DF5", "DB": "#FF7CB6", "K": "#AF61ED" };
    return map[pos] || "#ccc";
};

let currentId = null;
let sleeperPlayers = {};

// 2. Initialize Sleeper Player DB
async function init() {
    const res = await fetch('https://api.sleeper.app/v1/players/nfl');
    sleeperPlayers = await res.json();
}
init();

// 3. UI Logic
async function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Please enter a username");
    document.getElementById('loader').style.display = 'block';
    
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    currentId = u.user_id;

    const lRes = await fetch(`https://api.sleeper.app/v1/user/${currentId}/leagues/nfl/2026`);
    const ls = await lRes.json();

    document.getElementById('loader').style.display = 'none';
    const s = document.getElementById('leagueSelect');
    s.innerHTML = '<option value="">-- Select Your League --</option>';
    ls.forEach(l => s.add(new Option(l.name, l.league_id)));
    document.getElementById('step2').style.display = 'block';
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    if (!lId) return;

    document.getElementById('loader').style.display = 'block';
    const [rRes, uRes, lRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${lId}`)
    ]);
    const rosters = await rRes.json();
    const users = await uRes.json();
    const league = await lRes.json();

    const myRoster = rosters.find(r => r.owner_id === currentId);
    const myUser = users.find(u => u.user_id === currentId);

    const processed = myRoster.players.map(id => {
        const p = sleeperPlayers[id] || {};
        return {
            id: id,
            name: p.full_name || "Unknown",
            pos: p.position || "BN",
            img: `https://sleepercdn.com/content/nfl/players/${id}.jpg`,
            team: p.team || "FA"
        };
    });

    draw({
        players: processed,
        teamName: myUser.metadata.team_name || myUser.display_name,
        username: myUser.display_name,
        leagueName: league.name
    });
}

// 4. THE DRAW FUNCTION (Full Visual Fidelity)
async function draw(data) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const footerH = 50;
    const cols = 4, cardW = 280, cardH = 80, gap = 15, headH = 200, sidePad = 40;
    const rows = Math.ceil(data.players.length / cols);
    
    canvas.width = (cardW * cols) + (gap * (cols - 1)) + (sidePad * 2);
    canvas.height = headH + (rows * (cardH + gap)) + footerH + 40;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = "#002863";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText(data.teamName.toUpperCase(), sidePad, 85);
    ctx.fillStyle = "#FFA515"; 
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(data.leagueName.toUpperCase() + " • " + data.username.toUpperCase() + " • 2026 ROSTER", sidePad, 125);

    // Render Players
    for (let i = 0; i < data.players.length; i++) {
        const p = data.players[i];
        const meta = nflFull[p.team] || nflFull["FA"];
        const posColor = getPosColor(p.pos);
        
        const colIdx = i % cols;
        const rowIdx = Math.floor(i / cols);
        const x = sidePad + (colIdx * (cardW + gap));
        const y = headH + (rowIdx * (cardH + gap));
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 6); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = posColor;
        ctx.fillRect(x, y + cardH - 8, cardW, 8);

        ctx.fillStyle = "#111"; ctx.font = "bold 17px sans-serif";
        ctx.fillText(p.name, x + 85, y + 30);
        ctx.fillStyle = "#666"; ctx.font = "500 13px sans-serif";
        ctx.fillText(`${p.pos} | ${meta.n.toUpperCase()}`, x + 85, y + 48);

        ctx.fillStyle = posColor;
        ctx.fillRect(x + cardW - 55, y + cardH - 28, 50, 20);
        ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif";
        ctx.fillText(p.team === "FA" ? "FA" : p.team, x + cardW - 48, y + cardH - 14);

        ctx.save();
        ctx.beginPath(); ctx.arc(x + 42, y + 37, 28, 0, Math.PI*2); ctx.clip();
        ctx.fillStyle = "#eee"; ctx.fill();
        const img = new Image(); img.crossOrigin = "anonymous";
        img.src = p.img;
        ctx.drawImage(img, x + 14, y + 9, 56, 56);
        ctx.restore();
    }

    ctx.fillStyle = "#002863";
    ctx.fillRect(0, canvas.height - footerH, canvas.width, footerH);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FantasyRoster powered by FantasyNow+", canvas.width / 2, canvas.height - 18);

    document.getElementById('loader').style.display = 'none';
    const finalImg = document.getElementById('finalImage');
    finalImg.src = canvas.toDataURL("image/png");
    finalImg.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'RosterVisual.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
