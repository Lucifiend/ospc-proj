// 1. Panel Expansion Logic
document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const toggle = header.querySelector('.section-toggle');
    
    // Toggle active class
    const isActive = body.classList.toggle('active');
    toggle.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
  });
});

// 2. Data Syncing Logic
const typstOutputField = document.getElementById('input'); // The field screept.js watches
const resumeInputs = document.querySelectorAll('.resume-input');

function updateTypstPreview() {
  const name = document.getElementById('ui-name').value || "Your Name";
  const title = document.getElementById('ui-title').value || "Professional Title";
  const email = document.getElementById('ui-email').value || "email@example.com";
  const location = document.getElementById('ui-location').value || "City, Country";
  const experience = document.getElementById('ui-experience').value;
  const education = document.getElementById('ui-education').value;

  // Professional Typst Template String
  const typstTemplate = `
#set page(margin: 1.25cm)
#set text(font: "Linux Libertine", size: 10pt)

= ${name}
#text(size: 12pt, weight: "bold", fill: rgb("#2563eb"))[${title}] \
#text(fill: gray)[${email} | ${location}]

== Work Experience
${experience || "_Add your experience here_"}

== Education
${education || "_Add your education here_"}
  `;

  // Update the hidden input and manually trigger the event for screept.js
  typstOutputField.value = typstTemplate;
  typstOutputField.dispatchEvent(new Event('input'));
}

// Attach listeners to all inputs
resumeInputs.forEach(input => {
  input.addEventListener('input', updateTypstPreview);
});

// Initial render
window.addEventListener('load', () => {
  setTimeout(updateTypstPreview, 500); // Small delay to ensure Typst is ready
});