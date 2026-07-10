async function fetchTrending(type, containerId) {
    const container = document.getElementById(containerId);
    try {
        const response = await fetch(`https://api.sleeper.app/v1/players/nfl/trending/${type}?lookback_hours=24&limit=10`);
        const players = await response.json();
        
        container.innerHTML = players.map(p => `
            <div class="player-row">
                <img src="https://sleepercdn.com/content/nfl/players/${p.player_id}.jpg" alt="Player" class="player-img">
                <div class="player-info">
                    <div class="player-name">${p.first_name} ${p.last_name}</div>
                    <div class="player-pos">${p.position} - ${p.team || 'FA'}</div>
                </div>
                <div class="player-count">+${p.count}</div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="padding: 10px;">Unable to load data.</p>';
    }
}

fetchTrending('add', 'adds-list');
fetchTrending('drop', 'drops-list');
