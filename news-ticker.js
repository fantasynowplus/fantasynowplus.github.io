async function fetchNews() {
    const rssUrl = "https://rss.app/feeds/t0yMjPknbcSjLVy8.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const newsContainer = document.getElementById('news-container');
            
            // Format links with wide spacing to avoid clumping
            const newsItems = data.items.map(item => {
                return `<a href="${item.link}" target="_blank">${item.title}</a>`;
            }).join(" &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ••• &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ");
            
            newsContainer.innerHTML = newsItems;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('news-container').innerHTML = "<span>Check back later for updates.</span>";
    }
}

fetchNews();
