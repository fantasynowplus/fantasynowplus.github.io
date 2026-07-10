// youtube-feed.js
const CHANNEL_ID = 'UCCW6qFFB7ezwJk1cLPjPHDg';
const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

async function fetchYoutubeFeed() {
    const feedContainer = document.getElementById('youtube-feed');
    try {
        const response = await fetch(RSS_URL);
        const data = await response.json();
        const videos = data.items.slice(0, 3); // Gets your last 3 videos
        
        let html = '';
        videos.forEach(video => {
            const videoId = video.guid.split('yt:video:')[1];
            html += `
                <div class="video-item">
                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    <a href="${video.link}" class="video-title" target="_blank">${video.title}</a>
                </div>`;
        });
        feedContainer.innerHTML = html;
    } catch (error) {
        feedContainer.innerHTML = '<p>Unable to load videos.</p>';
    }
}
fetchYoutubeFeed();
