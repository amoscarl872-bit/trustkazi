const searchInput = document.getElementById("search");
const typeSelect = document.getElementById("type");
const remoteCheckbox = document.getElementById("remote");
const resultsEl = document.getElementById("results");
const countEl = document.getElementById("result-count");

// Create an element with optional text and class
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function isOpen(opp) {
  const today = new Date().toISOString().slice(0, 10);
  return opp.deadline >= today;
}

function matches(opp, query, type, remoteOnly) {
  if (!isOpen(opp)) return false;
  if (type !== "all" && opp.type !== type) return false;
  if (remoteOnly && !opp.remote) return false;

  const text = (opp.title + " " + opp.organization + " " + opp.description).toLowerCase();
  return text.includes(query);
}

function createCard(opp) {
  const card = el("article", null, "card");

  card.appendChild(el("h3", opp.title));
  card.appendChild(el("p", opp.organization, "org"));

  const place = opp.remote ? "Remote" : opp.city + ", " + opp.country;
  card.appendChild(el("p", opp.type + " · " + place, "meta"));
  card.appendChild(el("p", opp.description));
  card.appendChild(el("p", "Deadline: " + opp.deadline, "meta"));
  card.appendChild(el("p", opp.verified ? "Verified" : "Not yet verified",
                      opp.verified ? "badge verified" : "badge unverified"));

  // Only allow secure links
  if (opp.applyUrl.startsWith("https://")) {
    const link = el("a", "Apply");
    link.href = opp.applyUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.appendChild(link);
  }
  return card;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const list = OPPORTUNITIES
    .filter(o => matches(o, query, typeSelect.value, remoteCheckbox.checked))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  resultsEl.replaceChildren(...list.map(createCard));
  countEl.textContent = list.length + " opportunit" + (list.length === 1 ? "y" : "ies") + " found";
}

searchInput.addEventListener("input", render);
typeSelect.addEventListener("change", render);
remoteCheckbox.addEventListener("change", render);

render();