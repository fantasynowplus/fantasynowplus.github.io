const nflFull = {
    "FA": {n: "Free Agent", logo: ""},
    "ARI": {n: "Arizona Cardinals", logo: "https://sleepercdn.com/images/team_logos/nfl/ari.png"},
    "ATL": {n: "Atlanta Falcons", logo: "https://sleepercdn.com/images/team_logos/nfl/atl.png"},
    "BAL": {n: "Baltimore Ravens", logo: "https://sleepercdn.com/images/team_logos/nfl/bal.png"},
    "BUF": {n: "Buffalo Bills", logo: "https://sleepercdn.com/images/team_logos/nfl/buf.png"},
    "CAR": {n: "Carolina Panthers", logo: "https://sleepercdn.com/images/team_logos/nfl/car.png"},
    "CHI": {n: "Chicago Bears", logo: "https://sleepercdn.com/images/team_logos/nfl/chi.png"},
    "CIN": {n: "Cincinnati Bengals", logo: "https://sleepercdn.com/images/team_logos/nfl/cin.png"},
    "CLE": {n: "Cleveland Browns", logo: "https://sleepercdn.com/images/team_logos/nfl/cle.png"},
    "DAL": {n: "Dallas Cowboys", logo: "https://sleepercdn.com/images/team_logos/nfl/dal.png"},
    "DEN": {n: "Denver Broncos", logo: "https://sleepercdn.com/images/team_logos/nfl/den.png"},
    "DET": {n: "Detroit Lions", logo: "https://sleepercdn.com/images/team_logos/nfl/det.png"},
    "GB": {n: "Green Bay Packers", logo: "https://sleepercdn.com/images/team_logos/nfl/gb.png"},
    "HOU": {n: "Houston Texans", logo: "https://sleepercdn.com/images/team_logos/nfl/hou.png"},
    "IND": {n: "Indianapolis Colts", logo: "https://sleepercdn.com/images/team_logos/nfl/ind.png"},
    "JAX": {n: "Jacksonville Jaguars", logo: "https://sleepercdn.com/images/team_logos/nfl/jax.png"},
    "KC": {n: "Kansas City Chiefs", logo: "https://sleepercdn.com/images/team_logos/nfl/kc.png"},
    "LV": {n: "Las Vegas Raiders", logo: "https://sleepercdn.com/images/team_logos/nfl/lv.png"},
    "LAC": {n: "Los Angeles Chargers", logo: "https://sleepercdn.com/images/team_logos/nfl/lac.png"},
    "LAR": {n: "Los Angeles Rams", logo: "https://sleepercdn.com/images/team_logos/nfl/lar.png"},
    "MIA": {n: "Miami Dolphins", logo: "https://sleepercdn.com/images/team_logos/nfl/mia.png"},
    "MIN": {n: "Minnesota Vikings", logo: "https://sleepercdn.com/images/team_logos/nfl/min.png"},
    "NE": {n: "New England Patriots", logo: "https://sleepercdn.com/images/team_logos/nfl/ne.png"},
    "NO": {n: "New Orleans Saints", logo: "https://sleepercdn.com/images/team_logos/nfl/no.png"},
    "NYG": {n: "New York Giants", logo: "https://sleepercdn.com/images/team_logos/nfl/nyg.png"},
    "NYJ": {n: "New York Jets", logo: "https://sleepercdn.com/images/team_logos/nfl/nyj.png"},
    "PHI": {n: "Philadelphia Eagles", logo: "https://sleepercdn.com/images/team_logos/nfl/phi.png"},
    "PIT": {n: "Pittsburgh Steelers", logo: "https://sleepercdn.com/images/team_logos/nfl/pit.png"},
    "SF": {n: "San Francisco 49ers", logo: "https://sleepercdn.com/images/team_logos/nfl/sf.png"},
    "SEA": {n: "Seattle Seahawks", logo: "https://sleepercdn.com/images/team_logos/nfl/sea.png"},
    "TB": {n: "Tampa Bay Buccaneers", logo: "https://sleepercdn.com/images/team_logos/nfl/tb.png"},
    "TEN": {n: "Tennessee Titans", logo: "https://sleepercdn.com/images/team_logos/nfl/ten.png"},
    "WAS": {n: "Washington Commanders", logo: "https://sleepercdn.com/images/team_logos/nfl/was.png"}
};

const getPosColor = (pos) => ({ "QB": "#ff3079", "RB": "#01ffc3", "WR": "#00b8ff", "TE": "#FFA515", "K": "#AF61ED", "DEF": "#00b8ff", "DL": "#FF795A", "LB": "#6D7DF5", "DB": "#FF7CB6" }[pos] || "#ccc");

async function loadLeagues() {
    const user = document.getElementById('username').value;
    document.getElementById('loader').style.display = 'block';
    const uRes = await fetch(`https://api.sleeper.app/v1/user/${user}`);
    const u = await uRes.json();
    const lRes = await fetch(`https://api.sleeper.app/v1/user/${u.user_id}/leagues/nfl/2026`);
    const ls = await lRes.json();
    const s = document.getElementById('leagueSelect');
    ls.forEach(l => s.add(new Option(l.name, l.league_id)));
    document.getElementById('step2').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    window.currentUserId = u.user_id;
}

async function preloadImages(players) {
    return Promise.all(players.map(p => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = `https://sleepercdn.com/content/nfl/players/${p.player_id}.jpg`;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });
    }));
}

async function generate() {
    const lId = document.getElementById('leagueSelect').value;
    document.getElementById('loader').style.display = 'block';

    const [rostersRes, usersRes, playersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${lId}/rosters`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/league/${lId}/users`).then(r => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then(r => r.json())
    ]);

    const roster = rostersRes.find(r => r.owner_id === window.currentUserId);
    const user = usersRes.find(u => u.user_id === window.currentUserId);
    const players = roster.players.map(id => ({ ...playersRes[id], player_id: id }));

    const loadedImages = await preloadImages(players);

    await draw({ players, teamName: user.metadata.team_name || "MY TEAM", images: loadedImages });
    document.getElementById('loader').style.display = 'none';
}

async function draw(data) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    const leagueName = document.getElementById('leagueSelect').selectedOptions[0].text;
    const username = document.getElementById('username').value;
    const footerHeightPx = 50, cols = 4, cardW = 300, cardH = 75, gap = 12, headerH = 180, sidePad = 40;
    const posOrder = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];
    
    let sortedList = [];
    posOrder.forEach(pos => {
        const group = data.players.filter(p => p.position === pos).sort((a, b) => a.first_name.localeCompare(b.first_name));
        sortedList.push(...group);
    });

    const rows = Math.ceil(sortedList.length / cols);
    canvas.width = (cardW * cols) + (gap * (cols - 1)) + (sidePad * 2);
    canvas.height = headerH + (rows * (cardH + gap)) + footerHeightPx + 20;

    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#002863"; ctx.font = "bold 80px sans-serif"; ctx.fillText(data.teamName.toUpperCase(), sidePad, 85);
    ctx.fillStyle = "#FFA515"; ctx.font = "bold 24px sans-serif"; ctx.fillText(leagueName.toUpperCase() + " • " + username.toUpperCase() + " • 2026 ROSTER", sidePad, 125);

    for (let i = 0; i < sortedList.length; i++) {
        const p = sortedList[i];
        const img = data.images[i];
        const meta = nflFull[p.team] || nflFull["FA"];
        const posColor = getPosColor(p.position);
        const colIdx = Math.floor(i / rows), rowIdx = i % rows;
        const x = sidePad + (colIdx * (cardW + gap)), y = headerH + (rowIdx * (cardH + gap));

        ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 6); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = posColor; ctx.fillRect(x, y + cardH - 8, cardW, 8);
        ctx.fillStyle = "#111"; ctx.font = "bold 17px sans-serif"; ctx.fillText(`${p.first_name} ${p.last_name}`, x + 80, y + 28);
        ctx.fillStyle = "#666"; ctx.font = "500 11px sans-serif"; ctx.fillText(`${p.position} | ${(p.team || 'FA').toUpperCase()}`, x + 80, y + 46);

        ctx.save();
        ctx.beginPath(); ctx.arc(x + 38, y + 37, 30, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = posColor; ctx.fill();
        if (img) ctx.drawImage(img, x + 8, y + 7, 60, 60);
        ctx.restore();
    }

    const finalImg = document.getElementById('finalImage');
    finalImg.src = canvas.toDataURL("image/png");
    finalImg.style.display = 'block';
    document.getElementById('dlBtn').style.display = 'block';
    finalImg.scrollIntoView({behavior: 'smooth'});
}
