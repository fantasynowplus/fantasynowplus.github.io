let currentId = null;

async function loadLeagues() {
    const user = document.getElementById('username').value;
    if (!user) return alert("Please enter a username");
    
    document.getElementById('loader').style.display = 'block';
    
    // Calls your Google Apps Script
    google.script.run.withSuccessHandler(u => {
        currentId = u.user_id;
        google.script.run.withSuccessHandler(ls => {
            document.getElementById('loader').style.display = 'none';
            const s = document.getElementById('leagueSelect');
            s.innerHTML = '<option value="">-- Select Your League --</option>';
            ls.forEach(l => s.add(new Option(l.name, l.id)));
            document.getElementById('step2').style.display = 'block';
        }).getLeagues(currentId);
    }).getSleeperUser(user);
}

function generate() {
    const lId = document.getElementById('leagueSelect').value;
    if (!lId) return;

    document.getElementById('loader').style.display = 'block';
    google.script.run.withSuccessHandler(data => {
        document.getElementById('loader').style.display = 'none';
        draw(data);
    }).getRosterFromSheet(lId, currentId);
}

function downloadImg() {
    const link = document.createElement('a');
    link.download = 'RosterVisual.png';
    link.href = document.getElementById('finalImage').src;
    link.click();
}
// Add your draw(data) function logic here (from your existing script)[cite: 1].
