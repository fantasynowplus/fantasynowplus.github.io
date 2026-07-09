async function fetchNews() {
    const rssUrl = "https://rss.app/feeds/t0yMjPknbcSjLVy8.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const newsContainer = document.getElementById('news-container');
        
        const now = new Date();
        
        const newsItems = data.items.map(item => {
            const pubDate = new Date(item.pubDate);
            const diffMs = now - pubDate;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            // Determine relative time string
            let timeAgo = "";
            if (diffMin < 60) timeAgo = `${diffMin}m`;
            else if (diffHour < 24) timeAgo = `${diffHour}h`;
            else timeAgo = `${diffDay}d`;

            return `<a href="${item.link}" target="_blank" style="color: inherit; text-decoration: none;">
                        ${item.title} <small style="opacity: 0.7; font-size: 0.8em; margin-left: 5px;">(${timeAgo})</small>
                    </a>`;
        }).join(" 🔹🔹🔹 ");
        
        newsContainer.innerHTML = `<span>${newsItems}</span>`;
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('news-container').innerHTML = "<span>Latest news unavailable.</span>";
    }
}

fetchNews();
