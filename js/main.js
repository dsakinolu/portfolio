// Mobile nav
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Sefunmi AI — a lightweight keyword assistant (runs entirely in the browser)
// ---------------------------------------------------------------------------
const launcher = document.getElementById("chat-launcher");
const chatbot = document.getElementById("chatbot");
const chatClose = document.getElementById("chat-close");
const chatBody = document.getElementById("chat-body");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

const RESPONSES = [
  { keywords: ["hello", "hi ", "hey", "good morning", "good afternoon"],
    reply: "Hello! I'm Sefunmi AI. Ask me about her education, skills, projects, dashboards, work experience, or how to get in touch." },

  // --- Education -----------------------------------------------------------
  { keywords: ["study", "studied", "college", "university", "school", "degree", "major", "minor",
               "education", "graduate", "grad", "bachelor", "masters", "master's", "msc", "bsc", "iu", "indiana university"],
    reply: "Sefunmi earned a B.Sc. in Informatics with Distinction from Indiana University Bloomington, with minors in Data Science, Web Design & Development, and African Languages, plus a Pre-Health Professions cognate. She's now completing an M.Sc. in Data Science at IU, expected December 2026." },
  { keywords: ["gpa", "distinction", "honors", "honours"],
    reply: "She graduated with Distinction — an honors designation at Indiana University." },

  // --- Work ----------------------------------------------------------------
  { keywords: ["igeeks", "bizappointly", "qa", "testing", "tester", "quality assurance", "product owner"],
    reply: "Sefunmi is a Product Owner & Software QA Engineer Intern at iGeeksNG Solutions, working on QA testing for BizAppointly — an appointment and business scheduling platform. She writes and runs test plans, reports defects, and turns user needs into development priorities." },
  { keywords: ["experience", "her job", "work history", "jobs", "intern", "internship", "career", "employed", "her role", "where does she work", "current job"],
    reply: "Currently a Product Owner & Software QA Engineer Intern at iGeeksNG Solutions (QA testing for BizAppointly). Previously: research assistant at IU's Luddy School, an equity-focused internship with Concept Schools, and a summer health professions program at the University of Louisville. Full details on the Experience page." },
  { keywords: ["cafe", "café", "coffee", "covenant", "c.h."],
    reply: "Sefunmi founded and runs C.H. Café, a community café at RCCG Covenant House Indianapolis — managing inventory, volunteers, and branding, with data analytics guiding operations. Its dashboard is on the Visualizations page." },
  { keywords: ["research", "lab", "luddy", "neuroscience"],
    reply: "She was an undergraduate research assistant in the Socioneural Physiology Lab at IU's Luddy School, applying data analysis to neuroscience studies." },

  // --- Skills --------------------------------------------------------------
  { keywords: ["skill", "tools", "stack", "technolog", "language", "know how", "proficient"],
    reply: "Core toolkit: Python (pandas), SQL/MySQL, D3.js, Tableau, JavaScript, HTML/CSS, PHP, and Figma — plus statistics from her M.Sc. in Data Science, and QA/software testing from her current role." },
  { keywords: ["python", "pandas"],
    reply: "Yes — Python with pandas is one of her main tools for data analysis and cleaning." },
  { keywords: ["sql", "mysql", "database"],
    reply: "SQL is a core skill. Her Sefunmi's Properties project runs an actual SQLite database in the browser — six related tables with joins, and a live SQL console you can type queries into." },
  { keywords: ["tableau", "power bi", "powerbi", "bi tool"],
    reply: "She works in Tableau and can publish to Tableau Public; the Visualizations page explains how Tableau and Power BI dashboards embed alongside the hand-coded D3 work." },
  { keywords: ["d3", "javascript", "js"],
    reply: "D3.js is how every dashboard on this site is built — 13 of them, all rendering live in your browser rather than as screenshots." },

  // --- Work on this site ---------------------------------------------------
  { keywords: ["dashboard", "visual", "chart", "graph", "data viz", "analytics"],
    reply: "There are 13 interactive dashboards on the Visualizations page, spanning clinical outcomes (readmissions, ED flow, trial enrollment), business (revenue, cohort retention, channel efficiency), climate and natural hazards (Bloomington climate, Indiana tornadoes, earthquakes, energy transition), and statistics." },
  { keywords: ["clinical", "health", "hospital", "medical", "patient"],
    reply: "Four clinical dashboards: hospital 30-day readmissions against national benchmarks, emergency department patient flow, a clinical trial enrollment funnel, and global health versus income. Sefunmi also holds a Pre-Health Professions cognate." },
  { keywords: ["climate", "weather", "tornado", "tornadoes", "earthquake", "earthquakes", "energy", "environment", "natural hazard", "warming"],
    reply: "The climate and hazards section covers Bloomington's climate profile with warming stripes, Indiana tornado seasonality by EF rating, global earthquake frequency, and the US energy transition." },
  { keywords: ["project", "portfolio", "built", "app", "made"],
    reply: "Four live installable apps: Kọ́ Yorùbá pẹ̀lú Ṣèfúnmí (kids' language learning), Sefunmi's Properties (SQL property management), MindEase (wellness app from a Figma prototype), and Sefunmi's Breakfast (bakery storefront). All linked from the Projects page." },
  { keywords: ["yoruba", "yorùbá", "language app", "kids", "children"],
    reply: "Kọ́ Yorùbá pẹ̀lú Ṣèfúnmí teaches children Yorùbá through flashcards, a memory game, a quiz, songs, and stories — installable on a phone and works offline." },
  { keywords: ["mindease", "wellness", "mental health", "figma", "design", "ux"],
    reply: "MindEase started as a Figma prototype and became a working, accessible web app: mood check-ins, a mood log, guided breathing, appointments, and support chat — rebuilt to WCAG AA standards." },
  { keywords: ["properties", "real estate", "property"],
    reply: "Sefunmi's Properties is a property management system with a real SQL database running in the browser — search by city, owner, size, or listing date, plus an admin area and SQL console." },
  { keywords: ["breakfast", "bakery", "ecommerce", "e-commerce", "store", "shop"],
    reply: "Sefunmi's Breakfast is a bakery storefront with category filters, a working cart, checkout that creates real orders, order history, and an admin panel — ported from a Python/Flask app." },

  // --- Contact / logistics -------------------------------------------------
  { keywords: ["contact", "email", "hire", "reach", "linkedin", "github", "resume", "cv", "available"],
    reply: "You can reach Sefunmi at dsakinolukunle@gmail.com or on LinkedIn — the Contact page has everything. She's open to data, analytics, and QA opportunities." },
  { keywords: ["where", "located", "location", "based", "indiana", "indianapolis", "bloomington", "relocate"],
    reply: "Sefunmi is based in Indiana and focused on opportunities in the Indianapolis area." },
  { keywords: ["who is she", "who is sefunmi", "about her", "her background", "herself", "introduce"],
    reply: "Sefunmi is a data scientist and web developer with a B.Sc. in Informatics with Distinction from Indiana University, now finishing an M.Sc. in Data Science. She works in QA and product at iGeeksNG Solutions, founded a community café, and builds apps and dashboards — several of which you can open right from this site." },
  { keywords: ["her name", "legal name", "deborah", "pronounce", "go by"],
    reply: "Her legal name is Deborah O. Akin-Olukunle, but she goes by Sefunmi (Ṣèfúnmí)." },

  { keywords: ["thank", "thanks", "bye", "goodbye"],
    reply: "You're welcome! Feel free to explore the dashboards or reach out through the Contact page." },
];

function botReply(text) {
  const q = " " + text.toLowerCase().replace(/[^a-z0-9àáèéìíòóùúẹọṣ\s]/g, " ") + " ";
  let best = null, bestScore = 0;
  for (const r of RESPONSES) {
    let score = 0;
    for (const k of r.keywords) {
      if (q.includes(k)) score += k.length;   // longer matches are more specific
    }
    if (score > bestScore) { bestScore = score; best = r; }
  }
  if (best) return best.reply;
  return "I'm not sure I caught that. I can tell you about Sefunmi's education, work at iGeeksNG, skills, the 13 dashboards, her four live apps, or how to contact her — what would you like to know?";
}

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "chat-msg " + who;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

if (launcher && chatbot) {
  let greeted = false;
  launcher.addEventListener("click", () => {
    chatbot.classList.toggle("open");
    if (chatbot.classList.contains("open") && !greeted) {
      addMsg("Hi, I'm Sefunmi AI 👋 — ask me anything about Sefunmi's work.", "bot");
      greeted = true;
      chatInput.focus();
    }
  });
  chatClose.addEventListener("click", () => chatbot.classList.remove("open"));
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMsg(text, "user");
    chatInput.value = "";
    setTimeout(() => addMsg(botReply(text), "bot"), 350);
  });
}
