async function fetchNews() {
    // Updated to the ESPN NFL RSS feed
    const rssUrl = "https://www.espn.com/espn/rss/nfl/news";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const newsContainer = document.getElementById('news-container');
        
        // Map the feed titles into a single string
        const newsItems = data.items.map(item => item.title).join(" ••• ");
        newsContainer.innerHTML = `<span>${newsItems}</span>`;
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('news-container').innerHTML = "<span>Latest NFL news unavailable.</span>";
    }
}

fetchNews();
