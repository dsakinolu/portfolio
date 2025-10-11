// Highlight nav links on click (optional)
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Fade-in sections on scroll (optional)
document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll("#about, #skills, .timeline-item, .card, .list-group-item");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(el => observer.observe(el));
});

//Chat box
const chatIcon = document.getElementById("chat-icon");
const chatTooltip = document.getElementById("chat-tooltip");
const chatbot = document.getElementById("chatbot");
const chatBody = document.getElementById("chat-body");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

// Chat control buttons
const minimizeBtn = document.getElementById("minimize-chat");
const endChatBtn = document.getElementById("end-chat");
const endChatModal = document.getElementById("end-chat-modal");
const confirmEndBtn = document.getElementById("confirm-end");
const cancelEndBtn = document.getElementById("cancel-end");


let greeted = false;

// Fake AI responses
const responses = [
    {
        keywords: ["hello", "hi", "hey", "hola"],
        reply: "Hello, I hope your day is going great :)"
    },
    {
        keywords: ["projects", "portfolio", "work", "examples"],
        reply: "Check out my Projects page 🚀 to see what I’ve built."
    },
    {
        keywords: ["skills", "abilities", "expertise"],
        reply: "I’m skilled in Python, HTML, CSS, SQL, Tableau, React, and JavaScript."
    },
    {
        keywords: ["contact", "reach", "email", "agent", "representative"],
        reply: "Reach me via my Contact page 📬."
    }
];
const defaultReply = "That’s interesting! Try asking about projects, skills, or contact.";

function getBotReply(userMsg) {
    const msg = userMsg.toLowerCase(); // make case-insensitive
    for (let entry of responses) {
        for (let keyword of entry.keywords) {
            if (msg.includes(keyword)) {
                return entry.reply;
            }
        }
    }
    return defaultReply;
}


function playSound() {
    const audio = new Audio("sounds/chime.mp3");
    audio.play();
}

function addMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = sender;
    msgDiv.innerHTML = message;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Save the current chat to localStorage
    localStorage.setItem("chatHistory", chatBody.innerHTML);
}

// Open chatbox
chatIcon.addEventListener("click", () => {
    chatbot.classList.remove("hidden");
    playSound();

    if (!greeted) {
        addMessage("bot", "<img src='images/sefunmi_avatar.PNG' class='bot-img'> 👋 Hi! I’m Sefunmi AI. Ask me about my projects, skills, or contact info!");
        greeted = true;
    }
});

// Minimize chat (just hides it)
minimizeBtn.addEventListener("click", () => {
    chatbot.classList.add("hidden");
});

// End Chat confirmation
endChatBtn.addEventListener("click", () => {
    endChatModal.classList.remove("hidden");
});

// Confirm End Chat
confirmEndBtn.addEventListener("click", () => {
    chatbot.classList.add("hidden");
    chatBody.innerHTML = ""; // clear messages
    greeted = false; // reset greeting for next session
    endChatModal.classList.add("hidden");
});
// Cancel End Chat
cancelEndBtn.addEventListener("click", () => {
    endChatModal.classList.add("hidden");
});

// Sending messages
sendBtn.addEventListener("click", () => {
    const userMsg = chatInput.value.trim();
    if (userMsg) {
        addMessage("user", "👤 " + userMsg);
        chatInput.value = "";

        const reply = getBotReply(userMsg);
        setTimeout(() => addMessage("bot", "<img src='images/sefunmi_avatar.PNG' class='bot-img'> " + reply), 500);
    }
});


chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// Tooltip + sound on load
window.addEventListener("load", () => {
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) {
        chatBody.innerHTML = savedChat;
        greeted = true; // prevent greeting from showing again
    }
});