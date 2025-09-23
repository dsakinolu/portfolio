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
