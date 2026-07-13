async function loadRankings() {
    const response = await fetch('data/rankings.json');
    const data = await response.json();
    const container = document.getElementById('table-container');

    let table = '<table><thead><tr><th>Rank</th><th>Name</th><th>Meta</th></tr></thead><tbody>';
    
    data.forEach(player => {
        table += `<tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.meta}</td>
        </tr>`;
    });
    
    table += '</tbody></table>';
    container.innerHTML = table;
}

loadRankings();
