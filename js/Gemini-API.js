// Gemini API Integration Module – FINAL, REST-SAFE, FRONTEND-SAFE

class GeminiAPI {
    constructor() {
        this.apiKey = localStorage.getItem('gemini-api-key') || '';
        // ONLY model supported by Gemini REST API (v1beta)
        this.model = 'gemini-2.5-flash';
    }

    /* ------------------ CONFIG ------------------ */

    setApiKey(apiKey) {
        this.apiKey = apiKey.trim();
        localStorage.setItem('gemini-api-key', this.apiKey);
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    _getJobDescription() {
        return document.getElementById('job-description')?.value || '';
    }

    /* ------------------ UTILITIES ------------------ */

    _ensureString(val) {
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return String(val || '');
    }

    _setValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = this._ensureString(value);
    }

    /* ------------------ CORE REQUEST ------------------ */

    async _makeRequest(prompt, { temperature = 0.6, maxOutputTokens = 2048 } = {}) {
        if (!this.hasApiKey()) {
            throw new Error('Gemini API key is required.');
        }

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature, maxOutputTokens }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `API error ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Empty response from Gemini.');
        }

        return text;
    }

    /* ------------------ PUBLIC API ------------------ */

    async generateSampleData() {
        const jobDesc = this._getJobDescription();

        const prompt = `
Generate a professional English resume sample.
${jobDesc ? `Target Job Description:\n${jobDesc}\n` : ''}

Return ONLY valid JSON (no markdown, no explanation):

{
  "personal": { "name": "", "email": "", "location": "", "phone": "" },
  "education": [{ "institution": "", "degree": "", "description": "" }],
  "work": [{ "company": "", "position": "", "description": "" }],
  "projects": [{ "name": "", "description": "" }],
  "skills": ["", ""]
}
`;

        const raw = await this._makeRequest(prompt, {
            temperature: 0.7,
            maxOutputTokens: 4096
        });

        try {
            return JSON.parse(
                raw.replace(/```json/g, '').replace(/```/g, '').trim()
            );
        } catch {
            throw new Error('Gemini returned invalid JSON.');
        }
    }

    async enhanceText(text, context = '') {
        if (!text.trim()) return text;

        const prompt = `
Rewrite the following resume content to be more impactful and professional.

Job Context:
${context}

Text:
"${text}"

Return ONLY the rewritten text.
`;

        return this._makeRequest(prompt, { temperature: 0.6 });
    }
}

/* ------------------ GLOBAL INSTANCE ------------------ */

window.geminiAPI = new GeminiAPI();

/* ------------------ UI WIRING ------------------ */

document.addEventListener('DOMContentLoaded', () => {
    const genBtn = document.getElementById('generate-sample');
    const enhanceBtn = document.getElementById('enhance-all');
    const apiKeyInput = document.getElementById('gemini-api-key');

    if (apiKeyInput) {
        apiKeyInput.value = geminiAPI.apiKey || '';
        apiKeyInput.addEventListener('input', e =>
            geminiAPI.setApiKey(e.target.value)
        );
    }

    // -------- Generate Sample --------
    if (genBtn) {
        genBtn.addEventListener('click', async () => {
            if (!geminiAPI.hasApiKey()) {
                alert('Please enter a Gemini API key.');
                return;
            }

            const original = genBtn.innerHTML;
            genBtn.disabled = true;
            genBtn.innerText = 'Generating...';

            try {
                const data = await geminiAPI.generateSampleData();

                geminiAPI._setValue('ui-name', data.personal?.name);
                geminiAPI._setValue('ui-email', data.personal?.email);
                geminiAPI._setValue('ui-location', data.personal?.location);
                geminiAPI._setValue('ui-phone', data.personal?.phone);

                geminiAPI._setValue(
                    'ui-education',
                    data.education?.map(e =>
                        `- ${e.degree} at ${e.institution}\n${e.description}`
                    ).join('\n\n')
                );

                geminiAPI._setValue(
                    'ui-experience',
                    data.work?.map(w =>
                        `- ${w.position} at ${w.company}\n${w.description}`
                    ).join('\n\n')
                );

                geminiAPI._setValue(
                    'ui-projects',
                    data.projects?.map(p =>
                        `- ${p.name}\n${p.description}`
                    ).join('\n\n')
                );

                geminiAPI._setValue(
                    'ui-skills',
                    (data.skills || []).join(', ')
                );

                document
                    .querySelectorAll('.resume-input')
                    .forEach(el => el.dispatchEvent(new Event('input')));

            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                genBtn.innerHTML = original;
                genBtn.disabled = false;
            }
        });
    }

    // -------- Enhance Content --------
    if (enhanceBtn) {
        enhanceBtn.addEventListener('click', async () => {
            const expField = document.getElementById('ui-experience');
            if (!expField || !expField.value.trim()) {
                alert('No experience to enhance.');
                return;
            }

            const original = enhanceBtn.innerHTML;
            enhanceBtn.disabled = true;
            enhanceBtn.innerText = 'Enhancing...';

            try {
                const enhanced = await geminiAPI.enhanceText(
                    expField.value,
                    geminiAPI._getJobDescription()
                );
                expField.value = enhanced;
                expField.dispatchEvent(new Event('input'));
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                enhanceBtn.innerHTML = original;
                enhanceBtn.disabled = false;
            }
        });
    }
});
