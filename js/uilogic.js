document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    const toggle = header.querySelector('.section-toggle');

    const isActive = body.classList.toggle('active');
    toggle.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
  });
});

/* ------------------ DATA SYNC ------------------ */

const typstOutputField = document.getElementById('input');
const resumeInputs = document.querySelectorAll('.resume-input');

const STORAGE_KEY = 'resume_builder_data_v1';

function saveFormData() {
  const data = {};
  resumeInputs.forEach(el => {
    if (el.id) data[el.id] = el.value;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
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
  } catch {
    return false;
  }
}

function safe(val, fallback = '') {
  return val && val.trim() ? val.trim() : fallback;
}

function updateTypstPreview() {
  const name = safe(document.getElementById('ui-name')?.value, 'Your Name');
  const title = safe(document.getElementById('ui-title')?.value, 'Professional Title');
  const email = safe(document.getElementById('ui-email')?.value, 'email@example.com');
  const location = safe(document.getElementById('ui-location')?.value, 'City, Country');
  const experience = document.getElementById('ui-experience')?.value || '';
  const education = document.getElementById('ui-education')?.value || '';

  const typstTemplate = `
#import "@preview/basic-resume:0.2.9": *

#show: resume.with(
  author: "${name}",
  author-position: left,
  location: "${location}",
  email: "${email}",
  accent-color: "#26428b",
  font: "New Computer Modern",
  paper: "us-letter",
)

== Education
${education}

== Work Experience
${experience}
`;

  typstOutputField.value = typstTemplate;
  typstOutputField.dispatchEvent(new Event('input'));
}

resumeInputs.forEach(input => {
  input.addEventListener('input', () => {
    updateTypstPreview();
    saveFormData();
  });
});

window.addEventListener('load', () => {
  const restored = loadFormData();
  setTimeout(updateTypstPreview, 300);
  if (restored) setTimeout(updateTypstPreview, 600);
});
