async function fetchNews() {
    // Using your custom RSS.app feed
    const rssUrl = "https://rss.app/feeds/t0yMjPknbcSjLVy8.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const newsContainer = document.getElementById('news-container');
        
        // Map the items to create a string of links
        // We wrap each title in an <a href="..."> tag
        const newsItems = data.items.map(item => 
            `<a href="${item.link}" target="_blank" style="color: inherit; text-decoration: none;">${item.title}</a>`
        ).join(" ••• ");
        
        newsContainer.innerHTML = `<span>${newsItems}</span>`;
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('news-container').innerHTML = "<span>Latest news unavailable.</span>";
    }
}

fetchNews();
