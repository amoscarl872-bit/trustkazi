const reportButton = document.getElementById("report-button");
const reportStatus = document.getElementById("report-status");
const reportType = document.getElementById("report-type");
const contactHint = document.getElementById("contact-hint");
const honeypot = document.getElementById("website");
const consentBox = document.getElementById("report-consent");

const COOLDOWN_MS = 60000; // one report per minute from this browser

function setReportStatus(message, isError) {
  reportStatus.textContent = message;
  reportStatus.className = isError ? "error" : "status-ok";
}

function recentlyReported() {
  try {
    const last = Number(localStorage.getItem("lastReportAt") || 0);
    return Date.now() - last < COOLDOWN_MS;
  } catch (e) {
    return false;
  }
}

function markReported() {
  try {
    localStorage.setItem("lastReportAt", String(Date.now()));
  } catch (e) {
    // storage may be blocked; the cooldown is only a convenience
  }
}

async function submitReport() {
  // Bots fill the hidden field. Pretend success and discard.
  if (honeypot.value !== "") {
    setReportStatus("Thank you. Your report was received.", false);
    return;
  }
  if (!lastCheck) {
    setReportStatus("Please check an offer first.", true);
    return;
  }
  if (!consentBox.checked) {
    setReportStatus("Please tick the confirmation box first.", true);
    return;
  }
  if (recentlyReported()) {
    setReportStatus("You just sent a report. Please wait a minute before sending another.", true);
    return;
  }

  reportButton.disabled = true;
  setReportStatus("Sending...", false);

  const hint = contactHint.value.trim();
  const { error } = await db.from("reports").insert({
    report_type: reportType.value,
    offer_text: lastCheck.text,
    contact_hint: hint === "" ? null : hint,
    client_score: lastCheck.score
  });

  if (error) {
    console.error(error);
    setReportStatus("Could not send your report. Please try again later.", true);
    reportButton.disabled = false;
    return;
  }

  markReported();
  setReportStatus("Thank you. Your report will be reviewed by a person.", false);
  setTimeout(() => { reportButton.disabled = false; }, COOLDOWN_MS);
}

reportButton.addEventListener("click", submitReport);