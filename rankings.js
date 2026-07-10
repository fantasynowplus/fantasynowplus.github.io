function render() {
    let html = `
        <div class="fn-plus-header">FANTASYNOW+ RANKINGS</div>
        <div class="fnp-nav">
            <div class="bubble ${state.type==='draft'?'active':''}" onclick="switchTab('draft', 0, this)">Draft</div>
            <div class="bubble ${state.type==='dynasty'?'active':''}" onclick="switchTab('dynasty', 0, this)">Dynasty</div>
            <div class="bubble ${state.type==='rookie'?'active':''}" onclick="switchTab('rookie', 0, this)">Rookie</div>
        </div>
        <div class="fnp-nav">
            <div class="bubble ${state.col===0?'active':''}" onclick="switchTab(state.type, 0, this)">QB</div>
            <div class="bubble ${state.col===3?'active':''}" onclick="switchTab(state.type, 3, this)">RB</div>
            <div class="bubble ${state.col===6?'active':''}" onclick="switchTab(state.type, 9, this)">WR</div>
            <div class="bubble ${state.col===9?'active':''}" onclick="switchTab(state.type, 12, this)">TE</div>
        </div>
    `;

    let count = 0;
    masterRankings.forEach(row => {
        if (count >= 10 || !row[state.col]) return;
        const name = row[state.col].replace(/"/g, '').trim();
        if (name && name !== "" && !name.toUpperCase().includes("PLAYER")) {
            count++;
            const playerImg = photoBank[name] || normalizedBank[normalize(name)];
            // FantasyPros search link
            const fpLink = `https://www.fantasypros.com/nfl/players/${name.toLowerCase().replace(' ', '-')}.php`;
            
            html += `
            <a href="${fpLink}" target="_blank" class="fnp-row">
                <div class="fnp-rank">${count}</div>
                <div class="photo-box"><img src="${playerImg}" class="player-photo"></div>
                <div>
                    <span class="fnp-name">${name}</span>
                    <span class="fnp-meta">${row[state.col+1] || ''}</span>
                </div>
            </a>`;
        }
    });

    html += `<a href="rankings.html" class="footer-link">View All Player Rankings</a>`;
    document.getElementById('rank-list').innerHTML = html;
}
