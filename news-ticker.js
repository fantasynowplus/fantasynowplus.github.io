async function fetchNews() {
    const rssUrl = "https://rss.app/feeds/t0yMjPknbcSjLVy8.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const newsContainer = document.getElementById('news-container');
            
            // Map the items
            const newsItems = data.items.map(item => {
                return `<a href="${item.link}" target="_blank">${item.title}</a>`;
            }).join(" ••• ");
            
            // Inject the content inside the ticker-content div
            newsContainer.innerHTML = newsItems;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

fetchNews();
