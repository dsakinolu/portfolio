// Contact form: builds a mailto link so the form works on GitHub Pages
// without any backend.
const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const msg = document.getElementById("cf-msg").value.trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:dsakinolukunle@gmail.com?subject=${subject}&body=${body}`;
  });
}
