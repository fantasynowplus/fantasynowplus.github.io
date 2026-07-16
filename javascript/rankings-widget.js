/**
 * FantasyNow+ Rankings Widget
 * ----------------------------
 * Replaces the old Google Sheets-based rankings script. Pulls from the
 * Cloudflare Worker proxy (never calls FantasyPros directly from the browser).
 */

const WORKER_URL = "https://fantasynowplus-rankings-proxy.fantasynowplus.workers.dev/rankings";

const state = {
  format: "draft", // 'draft' | 'dynasty' | 'rookie'
  position: "QB",  // 'QB' | 'RB' | 'WR' | 'TE'
};

// Simple in-memory cache so switching tabs back and forth doesn't
// re-fetch data you already have for this page view.
const cache = {};

async function fetchRankings(format, position) {
  const key = `${format}:${position}`;
  if (cache[key]) return cache[key];

  const url = `${WORKER_URL}?format=${format}&position=${position}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Rankings fetch failed: ${response.status}`);

  const data = await response.json();
  cache[key] = data;
  return data;
}

function renderRankings(data) {
  const container = document.getElementById("rank-list");
  if (!container) return;

  if (!data.players || data.players.length === 0) {
    container.innerHTML = '<p style="padding: 10px;">No rankings available.</p>';
    return;
  }

  container.innerHTML = data.players
    .map(
      (p, i) => `
        <a href="${p.pageUrl || "#"}" target="_blank" class="fnp-row">
            <div class="fnp-rank">${i + 1}</div>
            <div class="photo-box">
                <img src="${p.photoUrl || ""}"
                     alt="${p.name}"
                     class="player-photo"
                     onerror="this.style.visibility='hidden';">
            </div>
            <div>
                <span class="fnp-name">${p.name}</span>
                <span class="fnp-meta">${p.position} - ${p.team || "FA"}</span>
            </div>
        </a>
    `
    )
    .join("");
}

async function loadAndRender() {
  const container = document.getElementById("rank-list");
  if (container) container.innerHTML = "Loading...";

  try {
    const data = await fetchRankings(state.format, state.position);
    renderRankings(data);
  } catch (err) {
    console.error("Rankings error:", err);
    if (container) {
      container.innerHTML = '<p style="padding: 10px;">Error loading rankings.</p>';
    }
  }
}

/**
 * Called from the HTML onclick handlers.
 *   switchTab('format', 'draft')   -> switches the Draft/Dynasty/Rookie tab
 *   switchTab('position', 'RB')    -> switches the QB/RB/WR/TE tab
 */
function switchTab(kind, value, el) {
  if (kind === "format") {
    state.format = value;
    document.querySelectorAll(".cat-bubble").forEach((b) => b.classList.remove("active"));
  } else if (kind === "position") {
    state.position = value;
    document.querySelectorAll(".pos-bubble").forEach((b) => b.classList.remove("active"));
  }
  if (el) el.classList.add("active");
  loadAndRender();
}

document.addEventListener("DOMContentLoaded", loadAndRender);
