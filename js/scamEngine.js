const MAX_LENGTH = 5000;

// Skip a match if a negation word comes shortly before it,
// e.g. "you do not need to pay any fee".
const NEGATION = /\b(?:no|not|never|without|don['’]t|doesn['’]t|won['’]t|free of)\b[^.\n]{0,30}$/i;

// Return the first matching text that is not negated, or null.
function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const globalPattern = new RegExp(pattern.source, "gi");
    for (const m of text.matchAll(globalPattern)) {
      const before = text.slice(Math.max(0, m.index - 35), m.index);
      if (NEGATION.test(before)) continue;
      return m[0].trim().slice(0, 80);
    }
  }
  return null;
}

function looksLikeShouting(text) {
  if (/!{3,}/.test(text)) return "Repeated exclamation marks";
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 40) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.5) return "Mostly capital letters";
  }
  return null;
}

const SCAM_RULES = [
  {
    id: "secret-codes",
    label: "Asks for a PIN, password or one-time code",
    weight: 45,
    why: "No genuine employer or recruiter needs your PIN, password or verification code. Scammers use them to take over bank, mobile-money and email accounts.",
    advice: "Never share these. Stop talking to this sender.",
    check: t => firstMatch(t, [
      /\b(?:your|send|share|provide|give|enter)\b[^.\n]{0,25}\b(?:(?<!kra\s)pin|password|otp|cvv|verification code|one[- ]time (?:code|password))\b/i
    ])
  },
  {
    id: "upfront-fee",
    label: "Asks for money before hiring",
    weight: 40,
    why: "Real employers pay you. They do not charge you to be hired. Upfront fees are the most common job-scam signal.",
    advice: "Do not send any money. Check the employer through their official website or a phone number you find yourself.",
    check: t => firstMatch(t, [
      /\b(?:registration|application|processing|training|admin(?:istration)?|medical|uniform|interview|clearance|visa|security)\s+(?:fees?|payment|charge|deposit)\b/i,
      /\b(?:pay|send|deposit|transfer)\b[^.\n]{0,40}\b(?:fees?|deposit)\b/i
    ])
  },
  {
    id: "payment-channel",
    label: "Wants payment by mobile money, gift card or crypto",
    weight: 30,
    why: "Mobile money, gift cards, crypto and wire transfers are hard to reverse, which is why scammers prefer them.",
    advice: "Never pay a recruiter this way. A genuine employer will not ask.",
    check: t => firstMatch(t, [
      /\b(?:send|pay|transfer|deposit)\b[^.\n]{0,50}\b(?:m-?pesa|airtel money|paybill|till number|western union|moneygram|gift cards?|bitcoin|crypto|usdt)\b/i,
      /\b(?:m-?pesa|paybill|till number)\b[^.\n]{0,40}\b(?:fee|deposit|registration)\b/i
    ])
  },
  {
    id: "too-good",
    label: "Promises unusually easy or guaranteed income",
    weight: 20,
    why: "Offers that promise guaranteed or very easy money are a classic lure. Real jobs describe duties and normal pay.",
    advice: "Ask for details: who pays you, for what work, and how. Vague answers are a red flag.",
    check: t => firstMatch(t, [
      /\bguaranteed (?:income|salary|job|earnings|returns?|profit)\b/i,
      /\beasy money\b/i,
      /\bget rich\b/i,
      /\bearn\b[^.\n]{0,30}\b(?:daily|per day|a day|weekly|per week|a week)\b/i
    ])
  },
  {
    id: "overseas",
    label: "Guarantees overseas work or a visa",
    weight: 20,
    why: "Fake overseas job offers are widespread. Genuine visas and work permits are never guaranteed by a recruiter.",
    advice: "Check the agency with your government labour authority before sharing documents or paying anything.",
    check: t => firstMatch(t, [
      /\bguaranteed\b[^.\n]{0,30}\b(?:visa|work permit|overseas|abroad)\b/i,
      /\b(?:visa|work permit|ticket)s?\b[^.\n]{0,30}\bguaranteed\b/i,
      /\b(?:overseas|abroad|dubai|qatar|saudi|kuwait)\b[^.\n]{0,40}\bno (?:interview|experience)\b/i
    ])
  },
  {
    id: "urgency",
    label: "Pressures you to act fast",
    weight: 15,
    why: "Scammers rush you so you don't have time to check. Genuine employers give you reasonable time.",
    advice: "Slow down. A real opportunity will still be there after you verify it.",
    check: t => firstMatch(t, [
      /\b(?:urgent(?:ly)?|act now|hurry|last chance|today only|limited (?:slots|spots|positions|vacancies)|only \d+ (?:slots|spots|positions|vacancies)(?: left)?|within \d+ (?:hours?|minutes?))\b/i
    ])
  },
  {
    id: "off-platform",
    label: "Moves the conversation to WhatsApp or Telegram",
    weight: 15,
    why: "Scammers move to private chats where there is no record and no moderation. Some honest small businesses use WhatsApp too, so this is only a warning sign.",
    advice: "Ask for an official email from a company domain and check the company independently.",
    check: t => firstMatch(t, [
      /\b(?:contact|message|text|chat|reach|dm|inbox|send)\b[^.\n]{0,40}\b(?:whatsapp|telegram|signal)\b/i,
      /\b(?:wa\.me|t\.me)\/\S+/i,
      /\b(?:whatsapp|telegram)\s+(?:only|number)\b/i
    ])
  },
  {
    id: "documents",
    label: "Asks for ID or bank details early",
    weight: 15,
    why: "Identity documents and bank details can be used for fraud. Genuine employers ask for them only after a real interview and a verified offer.",
    advice: "Do not send these until you have confirmed the employer and the job are real.",
    check: t => firstMatch(t, [
      /\b(?:send|share|provide|attach|submit|upload)\b[^.\n]{0,40}\b(?:national id|id (?:card|number|copy)|\bid\b|passport|kra pin|bank (?:details|account|statement)|selfie)\b/i
    ])
  },
  {
    id: "links",
    label: "Uses shortened or non-secure links",
    weight: 15,
    why: "Shortened links hide where they lead, and plain http links are not encrypted. Scammers use both.",
    advice: "Do not click. Search for the company yourself and use its official site.",
    check: t => firstMatch(t, [
      /\b(?:bit\.ly|tinyurl\.com|cutt\.ly|rb\.gy|is\.gd|shorturl\.at|t\.co|goo\.gl|ow\.ly)\/\S+/i,
      /\bhttp:\/\/\S+/i
    ])
  },
  {
    id: "unsolicited-selection",
    label: "Says you are hired or selected without a real process",
    weight: 15,
    why: "Being 'selected' for a job you never applied for, or hired without an interview, is a common hook.",
    advice: "Ask which job you applied for and who interviewed you. If you did not apply, be very careful.",
    check: t => firstMatch(t, [
      /\byou (?:have been|are|were) (?:selected|chosen|hired)\b/i,
      /\bwithout (?:an? )?interview\b/i,
      /\bhired (?:immediately|instantly|today)\b/i
    ])
  },
  {
    id: "free-email",
    label: "Uses a free email address",
    weight: 10,
    why: "Companies usually write from their own domain. Free addresses are common for scammers, but some honest small employers use them too.",
    advice: "Check that the company really exists and that the email matches its official website.",
    check: t => firstMatch(t, [
      /\b[\w.%+-]+@(?:gmail|yahoo|hotmail|outlook|aol|mail)\.com\b/i
    ])
  },
  {
    id: "shouting",
    label: "Written in a pressuring style",
    weight: 5,
    why: "Heavy capital letters and repeated exclamation marks are common in mass scam messages.",
    advice: "On its own this means little. Look at the other signs.",
    check: looksLikeShouting
  }
];

function levelFor(score) {
  if (score >= 50) return "high";
  if (score >= 20) return "medium";
  return "low";
}

function analyzeOffer(rawText) {
  const text = String(rawText).slice(0, MAX_LENGTH);
  const findings = [];
  let total = 0;

  for (const rule of SCAM_RULES) {
    const evidence = rule.check(text);
    if (evidence) {
      findings.push({
        id: rule.id,
        label: rule.label,
        weight: rule.weight,
        evidence: evidence,
        why: rule.why,
        advice: rule.advice
      });
      total += rule.weight;
    }
  }

  findings.sort((a, b) => b.weight - a.weight);
  const score = Math.min(100, total);
  return { score: score, level: levelFor(score), findings: findings };
}