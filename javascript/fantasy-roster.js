let currentId = null;

const nflFull = {
    "ARI": { c: "#97233F", n: "Arizona Cardinals", logo: "https://static.www.nfl.com/image/private/f_auto/league/u9fltosrhqvp689u8t6r" },
    "ATL": { c: "#A71930", n: "Atlanta Falcons", logo: "https://static.www.nfl.com/image/private/f_auto/league/oqnu9clstlsd9p301rb4" },
    "BAL": { c: "#241773", n: "Baltimore Ravens", logo: "https://static.www.nfl.com/image/private/f_auto/league/isvsc7ndv67v886w94g0" },
    "BUF": { c: "#00338D", n: "Buffalo Bills", logo: "https://static.www.nfl.com/image/private/f_auto/league/g9meog7bv9698d2ofp92" },
    "CAR": { c: "#0085CA", n: "Carolina Panthers", logo: "https://static.www.nfl.com/image/private/f_auto/league/erv7m769sqidp3atv1it" },
    "CHI": { c: "#0B162A", n: "Chicago Bears", logo: "https://static.www.nfl.com/image/private/f_auto/league/ra7m7l6v5vof7vxl430o" },
    "CIN": { c: "#FB4F14", n: "Cincinnati Bengals", logo: "https://static.www.nfl.com/image/private/f_auto/league/lndm09lx5m7f1atv697s" },
    "CLE": { c: "#311D00", n: "Cleveland Browns", logo: "https://static.www.nfl.com/image/private/f_auto/league/fd868lrp1gthpccdg6as" },
    "DAL": { c: "#003594", n: "Dallas Cowboys", logo: "https://static.www.nfl.com/image/private/f_auto/league/vbi9p6p7suisic83hvps" },
    "DEN": { c: "#FB4F14", n: "Denver Broncos", logo: "https://static.www.nfl.com/image/private/f_auto/league/wb9on7pwzoxvofvytatg" },
    "DET": { c: "#0076B6", n: "Detroit Lions", logo: "https://static.www.nfl.com/image/private/f_auto/league/v9v8084z6i99m9v_7838" },
    "GB":  { c: "#204E32", n: "Green Bay Packers", logo: "https://static.www.nfl.com/image/private/f_auto/league/gppfuh9444x825484p97" },
    "HOU": { c: "#03202F", n: "Houston Texans", logo: "https://static.www.nfl.com/image/private/f_auto/league/vvgfcy70atit87gkmgu6" },
    "IND": { c: "#002C5F", n: "Indianapolis Colts", logo: "https://static.www.nfl.com/image/private/f_auto/league/ket6brp3m9os7fofxrsh" },
    "JAX": { c: "#006778", n: "Jacksonville Jaguars", logo: "https://static.www.nfl.com/image/private/f_auto/league/qaynaas7grv9989u6v0" },
    "KC":  { c: "#E31837", n: "Kansas City Chiefs", logo: "https://static.www.nfl.com/image/private/f_auto/league/ujv9u98967v886w94g0" },
    "LV":  { c: "#000000", n: "Las Vegas Raiders", logo: "https://static.www.nfl.com/image/private/f_auto/league/gzwaofv9oxvofvytatg" },
    "LAC": { c: "#0080C6", n: "Los Angeles Chargers", logo: "https://static.www.nfl.com/image/private/f_auto/league/rf_8084z6i99m9v_7838" },
    "LAR": { c: "#003594", n: "Los Angeles Rams", logo: "https://static.www.nfl.com/image/private/f_auto/league/p_8084z6i99m9v_7838" },
    "MIA": { c: "#008E97", n: "Miami Dolphins", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "MIN": { c: "#4F2683", n: "Minnesota Vikings", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "NE":  { c: "#002244", n: "New England Patriots", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "NO":  { c: "#D3BC8D", n: "New Orleans Saints", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "NYG": { c: "#0B2265", n: "New York Giants", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "NYJ": { c: "#125740", n: "New York Jets", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "PHI": { c: "#004C54", n: "Philadelphia Eagles", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "PIT": { c: "#FFB612", n: "Pittsburgh Steelers", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "SF":  { c: "#AA0000", n: "San Francisco 49ers", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "SEA": { c: "#002244", n: "Seattle Seahawks", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "TB":  { c: "#D50A0A", n: "Tampa Bay Buccaneers", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "TEN": { c: "#0C2340", n: "Tennessee Titans", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "WAS": { c: "#773141", n: "Washington Commanders", logo: "https://static.www.nfl.com/image/private/f_auto/league/v_8084z6i99m9v_7838" },
    "FA":  { c: "#666666", n: "Free Agent", logo: "" }
};

const getPosColor = (pos) => {
    switch(pos) {
        case "QB": return "#ff3079";
        case "RB": return "#01ffc3";
        case "WR": return "#00b8ff";
        case "TE": return "#FFA515";
        case "DL": return "#FF795A";
        case "LB": return "#6D7DF5";
        case "DB": return "#FF7CB6";
        case "K":  return "#AF61ED";
        default:   return "#ccc";
    }
};

function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Please enter a username");
    
    document.getElementById('loader').style.display = 'block';
    
    google.script.run.withSuccessHandler(u => {
        currentId = u.user_id;
        google.script.run.withSuccessHandler(ls => {
            document.getElementById('loader').style.display = 'none';
            const s = document.getElementById('leagueSelect');
            s.innerHTML = '<option value="">-- Select Your League --</option>';
            ls.forEach(l => s.add(new Option(l.name, l.id)));
            document.getElementById('step2').style.display = 'block';
        }).getLeagues(currentId);
    }).getSleeperUser(user);
}

function generate() {
    const lId = document.getElementById('leagueSelect').value;
    if (!lId) return;

    document.getElementById('loader').style.display = 'block';
    google.script.run.withSuccessHandler(data => {
        document.getElementById('loader').style.display = 'none';
        draw(data);
    }).getRosterFromSheet(lId, currentId);
}

async function draw(data) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const leagueName = document.getElementById('leagueSelect').selectedOptions[0].text;
    const username = document.getElementById('username').value;

    const footerHeightPx = 50; 
    const cols = 4, cardW = 300, cardH = 75, gap = 12, headerH = 180, sidePad = 40;
    
    const posOrder = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
    let sortedList = [];
    posOrder.forEach(pos => {
        const group = data.players
            .filter(p => p.pos === pos)
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        sortedList.push(...group);
    });

    const rows = Math.ceil(sortedList.length / cols);
    canvas.width = (cardW * cols) + (gap * (cols - 1)) + (sidePad * 2);
    canvas.height = headerH + (rows * (cardH + gap)) + footerHeightPx + 20;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#002863";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText(data.teamName.toUpperCase(), sidePad, 85);
    
    ctx.fillStyle = "#FFA515"; 
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(leagueName.toUpperCase() + " • " + username.toUpperCase() + " • 2026 ROSTER", sidePad, 125);

    for (let i = 0; i < sortedList.length; i++) {
        const p = sortedList[i];
        const meta = nflFull[p.team] || nflFull["FA"];
        const posColor = getPosColor(p.pos);
        const colIdx = Math.floor(i / rows);
        const rowIdx = i % rows;
        const x = sidePad + (colIdx * (cardW + gap));
        const y = headerH + (rowIdx * (cardH + gap));
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 6); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = posColor;
        ctx.fillRect(x, y + cardH - 8, cardW, 8);
        ctx.fillStyle = "#111"; ctx.font = "bold 17px sans-serif";
        ctx.fillText(p.name, x + 80, y + 28);
        ctx.fillStyle = "#666"; ctx.font = "500 11px sans-serif";
        ctx.fillText(`${p.pos} | ${meta.n.toUpperCase()}`, x + 80, y + 46);
    }

    const finalImg = document.getElementById('finalImage');
    finalImg.src = canvas.toDataURL("image/png");
    finalImg.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
    finalImg.scrollIntoView({behavior: 'smooth'});
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'RosterVisual.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
