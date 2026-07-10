async function loadFeed(playlistId) {
    // If it's your channel ID, use the channel RSS; otherwise use playlist RSS
    const isChannel = playlistId === 'UCCW6qFFB7ezwJk1cLPjPHDg';
    const rss = isChannel 
        ? `https://www.youtube.com/feeds/videos.xml?channel_id=${playlistId}`
        : `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
        
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rss}`);
    const data = await response.json();
    const videos = data.items.slice(0, 6); // Take the last 6

    const container = document.getElementById('youtube-feed');
    container.innerHTML = videos.map(v => `
        <div class="video-card">
            <a href="${v.link}" target="_blank">
                <img src="${v.thumbnail}" class="thumbnail" alt="${v.title}">
            </a>
            <div class="video-info">
                <h3 class="video-title">${v.title}</h3>
                <p class="video-date">${new Date(v.pubDate).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

// Initial load
loadFeed('UCCW6qFFB7ezwJk1cLPjPHDg');
