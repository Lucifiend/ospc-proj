
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

const STORAGE_KEY = 'resume_builder_data_v1';

function saveFormData() {
  const data = {};
  document.querySelectorAll('.resume-input').forEach(el => {
    if (el.id) data[el.id] = el.value;
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

function loadFormData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = data[id];
    });
    return true;
  } catch (e) {
    return false;
  }
}

function updateTypstPreview() {
  const name = document.getElementById('ui-name').value || "Your Name";
  const title = document.getElementById('ui-title').value || "Professional Title";
  const email = document.getElementById('ui-email').value || "email@example.com";
  const locs = document.getElementById('ui-location').value || "City, Country";
  const experience = document.getElementById('ui-experience').value;
  const education = document.getElementById('ui-education').value;

  // github: "${github}",
  // linkedin: "${linkedin}",
  // phone: "${phone}",
  // personal-site: "${personal-site}",
  // Professional Typst Template String
  const typstTemplate = `
#import "@preview/basic-resume:0.2.9": *

// Put your personal information here, replacing mine

#show: resume.with(
  author: "${name}",
  location: "${location}",
  email: "${email}",
  accent-color: "#26428b",
  font: "New Computer Modern",
  paper: "us-letter",
  author-position: left,
  personal-info-position: left,
)

== Education
${education}

== Work Experience
${experience}
  `;

  // Update the hidden input and manually trigger the event for screept.js
  typstOutputField.value = typstTemplate;
  typstOutputField.dispatchEvent(new Event('input'));
}

// Attach listeners to all inputs
resumeInputs.forEach(input => {
  input.addEventListener('input', () => { updateTypstPreview(); saveFormData(); });
});

// Initial render
window.addEventListener('load', () => {
  // Restore saved values if present
  const restored = loadFormData();
  // Small delay to ensure Typst renderer script has initialized
  setTimeout(() => updateTypstPreview(), 300);
  // If we restored, also call preview after a short delay to ensure value propagation
  if (restored) setTimeout(() => updateTypstPreview(), 600);
});
