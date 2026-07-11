// rankings-loader.js
async function loadRankings() {
    const tbody = document.getElementById('rankings-body');
    
    try {
        // Fetch the file created by your GitHub Action
        const response = await fetch('./data/rankings.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        tbody.innerHTML = ''; // Clear loading text

        // Adjust 'data.players' if your JSON structure differs
        data.players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.rank}</td>
                <td>${player.name}</td>
                <td>${player.position}</td>
                <td>${player.team}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading rankings:', error);
        tbody.innerHTML = '<tr><td colspan="4">Unable to load rankings.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', loadRankings);
