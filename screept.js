const contentDiv = document.getElementById('content');

/**
 * Typst preview: same as before
 */
const previewSvg = (mainContent) => {
  $typst.svg({ mainContent }).then((svg) => {
    contentDiv.innerHTML = svg;
    const svgElem = contentDiv.firstElementChild;
    if (!svgElem) return;

    const width = Number.parseFloat(svgElem.getAttribute('width'));
    const height = Number.parseFloat(svgElem.getAttribute('height'));
    const cw = document.body.clientWidth - 40;

    svgElem.setAttribute('width', cw);
    svgElem.setAttribute('height', (height * cw) / width);
  });
};

const exportPdf = (mainContent) =>
  $typst.pdf({ mainContent }).then((pdfData) => {
    const pdfFile = new Blob([pdfData], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfFile);
    link.target = '_blank';
    link.click();
    URL.revokeObjectURL(link.href);
  });

/**
 * Collect data from the form
 */
function collectFormData() {
  const formData = {
    personal: {
      fullName: document.getElementById('fullName')?.value || '',
      title: document.getElementById('title')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      location: document.getElementById('location')?.value || '',
      summary: document.getElementById('summary')?.value || '',
    },
    work: [],
    education: [],
    projects: [],
    skills: [],
  };

  // Work items
  document.querySelectorAll('.repeatable-item[data-section="work"]').forEach((item) => {
    formData.work.push({
      company: item.querySelector('.work-company')?.value || '',
      role: item.querySelector('.work-role')?.value || '',
      period: item.querySelector('.work-period')?.value || '',
      description: item.querySelector('.work-description')?.value || '',
    });
  });

  // Education items
  document.querySelectorAll('.repeatable-item[data-section="education"]').forEach((item) => {
    formData.education.push({
      institution: item.querySelector('.edu-institution')?.value || '',
      degree: item.querySelector('.edu-degree')?.value || '',
      period: item.querySelector('.edu-period')?.value || '',
      description: item.querySelector('.edu-description')?.value || '',
    });
  });

  // Projects
  document.querySelectorAll('.repeatable-item[data-section="projects"]').forEach((item) => {
    formData.projects.push({
      name: item.querySelector('.proj-name')?.value || '',
      link: item.querySelector('.proj-link')?.value || '',
      description: item.querySelector('.proj-description')?.value || '',
    });
  });

  // Skills (comma separated)
  const skillsInput = document.getElementById('skills')?.value || '';
  formData.skills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length);

  return formData;
}

/**
 * Generate a simple Typst document from formData
 */
function generateTypstFromData(data) {
  const { personal, work, education, projects, skills } = data;

  const header = `
= ${personal.fullName || "Your Name"}
${personal.title}
${personal.location} · ${personal.email} · ${personal.phone}

`;

  const summary = personal.summary
    ? `== Summary

${personal.summary}

`
    : '';

  const workSection = work.length
    ? `== Experience

${work
      .map(
        (w) =>
          `=== ${w.role} — ${w.company}
${w.period}

${w.description}

`
      )
      .join('')}`
    : '';

  const educationSection = education.length
    ? `== Education

${education
      .map(
        (e) =>
          `=== ${e.degree} — ${e.institution}
${e.period}

${e.description}

`
      )
      .join('')}`
    : '';

  const projectsSection = projects.length
    ? `== Projects

${projects
      .map(
        (p) =>
          `=== ${p.name}${p.link ? ` (${p.link})` : ''}
${p.description}

`
      )
      .join('')}`
    : '';

  const skillsSection = skills.length
    ? `== Skills

${skills.join(', ')}

`
    : '';

  return header + summary + workSection + educationSection + projectsSection + skillsSection;
}

/**
 * Create a new repeatable item block for a section
 */
function createRepeatableItem(section) {
  const wrapper = document.createElement('div');
  wrapper.className = 'repeatable-item';
  wrapper.dataset.section = section;

  if (section === 'work') {
    wrapper.innerHTML = `
      <div class="repeatable-item-header">
        <div class="field">
          <label>Company</label>
          <input type="text" class="work-company" placeholder="Company Name" />
        </div>
        <div class="field">
          <label>Role</label>
          <input type="text" class="work-role" placeholder="Job Title" />
        </div>
      </div>
      <div class="field-grid">
        <div class="field">
          <label>Period</label>
          <input type="text" class="work-period" placeholder="2022 – Present" />
        </div>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="work-description" rows="3" placeholder="Key responsibilities and achievements."></textarea>
      </div>
      <div class="repeatable-item-actions">
        <button type="button" class="icon-btn remove-item-btn" title="Remove item">×</button>
      </div>
    `;
  } else if (section === 'education') {
    wrapper.innerHTML = `
      <div class="repeatable-item-header">
        <div class="field">
          <label>Institution</label>
          <input type="text" class="edu-institution" placeholder="University Name" />
        </div>
        <div class="field">
          <label>Degree</label>
          <input type="text" class="edu-degree" placeholder="B.Tech in CSE" />
        </div>
      </div>
      <div class="field-grid">
        <div class="field">
          <label>Period</label>
          <input type="text" class="edu-period" placeholder="2019 – 2023" />
        </div>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="edu-description" rows="3" placeholder="Highlights, GPA, coursework."></textarea>
      </div>
      <div class="repeatable-item-actions">
        <button type="button" class="icon-btn remove-item-btn" title="Remove item">×</button>
      </div>
    `;
  } else if (section === 'projects') {
    wrapper.innerHTML = `
      <div class="repeatable-item-header">
        <div class="field">
          <label>Project Name</label>
          <input type="text" class="proj-name" placeholder="Project Name" />
        </div>
        <div class="field">
          <label>Link</label>
          <input type="text" class="proj-link" placeholder="GitHub / Live URL" />
        </div>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="proj-description" rows="3" placeholder="What the project does, tech stack, impact."></textarea>
      </div>
      <div class="repeatable-item-actions">
        <button type="button" class="icon-btn remove-item-btn" title="Remove item">×</button>
      </div>
    `;
  }

  return wrapper;
}

/**
 * Re-render preview from current form data
 */
function updatePreview() {
  const data = collectFormData();
  const typstSource = generateTypstFromData(data);
  previewSvg(typstSource);
}

/**
 * Theme handling
 */
let currentTheme = 'light';

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('app-theme', theme);
}

function loadTheme() {
  const saved = localStorage.getItem('app-theme') || 'light';
  setTheme(saved);
}

function toggleTheme() {
  const next = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(next);
}

/**
 * Gemini key + job description storage
 */
const GEMINI_KEY_STORAGE = 'gemini-api-key';
const JOB_DESC_STORAGE = 'job-description';

function getStoredGeminiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

function setStoredGeminiKey(key) {
  localStorage.setItem(GEMINI_KEY_STORAGE, key || '');
}

function getStoredJobDescription() {
  return localStorage.getItem(JOB_DESC_STORAGE) || '';
}

function setStoredJobDescription(text) {
  localStorage.setItem(JOB_DESC_STORAGE, text || '');
}

/**
 * Initialize UI behavior and Typst
 */
document.getElementById('typst').addEventListener('load', function () {
  // Initialize theme
  loadTheme();

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Gemini API Key & Job Description UI
  const apiKeyInput = document.getElementById('gemini-api-key');
  if (apiKeyInput) {
    apiKeyInput.value = getStoredGeminiKey();
    apiKeyInput.addEventListener('input', (e) => {
      setStoredGeminiKey(e.target.value.trim());
    });
  }

  const jobDescInput = document.getElementById('job-description');
  if (jobDescInput) {
    jobDescInput.value = getStoredJobDescription();
    jobDescInput.addEventListener('input', (e) => {
      setStoredJobDescription(e.target.value);
    });
  }

  // AI buttons (ready for future Gemini integration)
  const generateSampleBtn = document.getElementById('generate-sample');
  if (generateSampleBtn) {
    generateSampleBtn.addEventListener('click', () => {
      alert('Sample-data generation via Gemini is not wired yet.');
    });
  }

  const enhanceAllBtn = document.getElementById('enhance-all');
  if (enhanceAllBtn) {
    enhanceAllBtn.addEventListener('click', () => {
      alert('Enhance-all via Gemini is not wired yet.');
    });
  }

  // Typst init
  $typst.setCompilerInitOptions({
    getModule: () =>
      'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
  });

  $typst.setRendererInitOptions({
    getModule: () =>
      'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
  });

  // Export button uses generated Typst
  document.getElementById('export').onclick = () => {
    const data = collectFormData();
    const typstSource = generateTypstFromData(data);
    exportPdf(typstSource);
  };

  // Add-item buttons
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-btn');
    if (addBtn) {
      const section = addBtn.getAttribute('data-section');
      const containerId =
        section === 'work'
          ? 'work-items'
          : section === 'education'
          ? 'education-items'
          : section === 'projects'
          ? 'project-items'
          : null;
      if (!containerId) return;

      const container = document.getElementById(containerId);
      const item = createRepeatableItem(section);
      container.appendChild(item);
      updatePreview();
    }

    const removeBtn = e.target.closest('.remove-item-btn');
    if (removeBtn) {
      const item = removeBtn.closest('.repeatable-item');
      if (item) {
        item.remove();
        updatePreview();
      }
    }

    // Collapsible section toggle
    const header = e.target.closest('.section-header');
    if (header) {
      const card = header.parentElement;
      const body = card.querySelector('.section-body');
      const toggle = header.querySelector('.section-toggle');
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      if (toggle) toggle.textContent = isHidden ? '▼' : '▲';
    }
  });

  // Live updates on any input/textarea change
  document.addEventListener('input', (e) => {
    if (e.target.matches('input, textarea')) {
      updatePreview();
    }
  });

  // Initialize with a single empty block for each repeatable section
  ['work', 'education', 'projects'].forEach((section) => {
    const containerId =
      section === 'work'
        ? 'work-items'
        : section === 'education'
        ? 'education-items'
        : 'project-items';
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(createRepeatableItem(section));
    }
  });

  // Trigger first render
  updatePreview();
});
