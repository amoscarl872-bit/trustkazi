const offerInput = document.getElementById("offer-text");
const checkButton = document.getElementById("check-button");
const clearButton = document.getElementById("clear-button");
const resultEl = document.getElementById("check-result");

let lastCheck = null; // what was last analysed: { text, score }

const LEVEL_LABEL = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk"
};

const SUMMARY = {
  low: "Few warning signs found. This does not prove the offer is genuine, so always verify the employer yourself.",
  medium: "Some warning signs found. Be careful, and verify before you share any details or pay anything.",
  high: "Many warning signs found. Treat this offer as a likely scam. Do not send money or personal details."
};

function showResult(result) {
  const box = el("section", null, "result level-" + result.level);

  box.appendChild(el("h3", LEVEL_LABEL[result.level] + " (score " + result.score + "/100)"));

  const meter = document.createElement("meter");
  meter.min = 0;
  meter.max = 100;
  meter.value = result.score;
  meter.low = 20;
  meter.high = 50;
  meter.optimum = 0;
  meter.setAttribute("aria-label", "Risk score");
  box.appendChild(meter);

  box.appendChild(el("p", SUMMARY[result.level]));

  if (result.findings.length > 0) {
    box.appendChild(el("h4", "Warning signs found (" + result.findings.length + ")"));
    for (const f of result.findings) {
      const item = el("article", null, "finding");
      item.appendChild(el("h4", f.label));
      item.appendChild(el("p", "Found in text: " + f.evidence, "evidence"));
      item.appendChild(el("p", "Why it matters: " + f.why));
      item.appendChild(el("p", "What to do: " + f.advice));
      box.appendChild(item);
    }
  }

  box.appendChild(el("p",
    "This tool checks for common warning signs and can be wrong in both directions. " +
    "When in doubt, contact the employer through their official website or a phone number you found yourself, not one from the message.",
    "disclaimer"));

  resultEl.replaceChildren(box);
}

checkButton.addEventListener("click", () => {
  const text = offerInput.value.trim();
  if (text.length < 20) {
    resultEl.replaceChildren(el("p", "Please paste the full offer text (at least a sentence or two).", "error"));
    return;
  }
  const result = analyzeOffer(text);
  showResult(result);
  lastCheck = { text: text, score: result.score };
  document.getElementById("report-section").hidden = false;
});

clearButton.addEventListener("click", () => {
  offerInput.value = "";
  resultEl.replaceChildren();
  lastCheck = null;
  document.getElementById("report-section").hidden = true;
  offerInput.focus();
});