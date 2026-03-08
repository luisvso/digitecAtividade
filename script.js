let state = JSON.parse(localStorage.getItem('studyflow') || 'null') || {
    subjects: [],
    activities: {},
    nextId: 1
};

let selectedSubject = null;
let filterCategory = 'Todas';

let feriados = [];

const COLORS = ['dot-0', 'dot-1', 'dot-2', 'dot-3', 'dot-4', 'dot-5', 'dot-6', 'dot-7'];

function save() {
    localStorage.setItem('studyflow', JSON.stringify(state));
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
}

function formatDate(d) {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

function getAvg(subjectId) {
    const acts = (state.activities[subjectId] || []).filter(a => a.grade !== '');
    if (!acts.length) return null;
    const sum = acts.reduce((acc, a) => acc + parseFloat(a.grade), 0);
    return (sum / acts.length).toFixed(1);
}

function avgClass(value) {
    if (value === null) return '';
    if (value >= 7) return 'bom';
    if (value >= 5) return 'ok';
    return 'ruim';
}

function getStatusEmoji(avg) {
    if (avg === null) return '📊';
    const v = parseFloat(avg);
    if (v >= 9) return '🏆';
    if (v >= 7) return '✅';
    if (v >= 5) return '⚠️';
    return '❌';
}

function getStatusText(avg) {
    if (avg === null) return 'Sem notas';
    const v = parseFloat(avg);
    if (v >= 9) return 'Excelente!';
    if (v >= 7) return 'Aprovado';
    if (v >= 5) return 'Atenção';
    return 'Recuperação';
}


function showToast(msg, type = 'success', emoji = '✅') {
    const t = document.getElementById('toast');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${emoji}</span><span>${msg}</span>`;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

function openModal(title, sub, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalSub').textContent = sub;
    document.getElementById('modalConfirmBtn').onclick = () => { onConfirm(); closeModal(); };
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

function addSubject() {
    const input = document.getElementById('subjectInput');
    const name = input.value.trim();

    if (!name) {
        showToast('Digite o nome da matéria!', 'error', '⚠️');
        return;
    }
    if (state.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        showToast('Esta matéria já existe!', 'error', '⚠️');
        return;
    }

    const id = 's_' + (state.nextId++);
    const colorIdx = state.subjects.length % COLORS.length;

    state.subjects.push({ id, name, colorIdx });
    state.activities[id] = [];
    save();

    input.value = '';
    renderSidebar();
    selectSubject(id);
    showToast(`"${name}" adicionada!`, 'success', '');
}

function deleteSubject(id) {
    const subject = state.subjects.find(s => s.id === id);
    openModal(
        'Excluir Matéria',
        `Excluir "${subject.name}" e todas as suas atividades?`,
        () => {
            state.subjects = state.subjects.filter(s => s.id !== id);
            delete state.activities[id];
            if (selectedSubject === id) {
                selectedSubject = null;
                renderMain();
            }
            save();
            renderSidebar();
            showToast('Matéria excluída!', 'error', '️');
        }
    );
}

function selectSubject(id) {
    selectedSubject = id;
    filterCategory = 'Todas';
    renderSidebar();
    renderMain();
}

function renderSidebar() {
    const list = document.getElementById('subjectsList');

    if (!state.subjects.length) {
        list.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:13px;padding:16px 0">
      Nenhuma matéria ainda
    </div>`;
        return;
    }

    list.innerHTML = state.subjects.map(s => {
        const avg = getAvg(s.id);
        const activeClass = s.id === selectedSubject ? 'active' : '';
        const avgText = avg !== null ? avg : '—';
        const avgColorClass = avg !== null ? avgClass(parseFloat(avg)) : '';

        return `
      <div class="subject-item ${activeClass}" onclick="selectSubject('${s.id}')">
        <div class="subject-left">
          <div class="subject-dot ${COLORS[s.colorIdx]}"></div>
          <div class="subject-name">${escHtml(s.name)}</div>
        </div>
        <span class="subject-avg ${avgColorClass}">${avgText}</span>
        <button class="btn-del" onclick="event.stopPropagation(); deleteSubject('${s.id}')" title="Excluir">✕</button>
      </div>`;
    }).join('');
}

function renderMain() {
    const main = document.getElementById('mainContent');

    if (!selectedSubject) {
        main.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">Nenhuma matéria selecionada</div>
        <div class="empty-sub">Adicione ou selecione uma matéria na barra lateral para começar.</div>
      </div>`;
        return;
    }

    const subject = state.subjects.find(s => s.id === selectedSubject);
    const activities = state.activities[selectedSubject] || [];
    const avg = getAvg(selectedSubject);
    const total = activities.length;
    const withGrade = activities.filter(a => a.grade !== '').length;
    const highPriority = activities.filter(a => a.priority === 'Alta').length;

    const categories = ['Todas', ...new Set(activities.map(a => a.category))];
    const filtered = filterCategory === 'Todas'
        ? activities
        : activities.filter(a => a.category === filterCategory);

    main.innerHTML = `
    <div class="subject-header">
      <div class="subject-title-group">
        <div class="subject-title" style="display:flex; align-items:center; gap:12px">
          <span class="subject-dot ${COLORS[subject.colorIdx]}" style="width:14px; height:14px; border-radius:50%; flex-shrink:0"></span>
          ${escHtml(subject.name)}
        </div>
        <div class="subject-meta">
          ${total} atividade${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Média Geral</div>
        <div class="stat-value ${avg !== null ? avgClass(parseFloat(avg)) : 'accent'}">${avg !== null ? avg : '—'}</div>
        <div class="stat-sub">${withGrade} nota${withGrade !== 1 ? 's' : ''} registrada${withGrade !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total de Atividades</div>
        <div class="stat-value accent">${total}</div>
        <div class="stat-sub">em ${categories.length - 1} categoria${categories.length - 1 !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Alta Prioridade</div>
        <div class="stat-value red">${highPriority}</div>
        <div class="stat-sub">atenção necessária</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="font-size:20px">${getStatusEmoji(avg)}</div>
        <div class="stat-sub">${getStatusText(avg)}</div>
      </div>
    </div>

    <div class="quote-card" id="quoteCard">
      <div class="quote-mark">"</div>
      <div>
        <div class="quote-text" id="quoteText">Carregando frase motivacional...</div>
        <div class="quote-author" id="quoteAuthor"></div>
      </div>
    </div>

    <div class="add-activity-section">
      <div class="section-head">
        <div class="section-head-title">
          Nova Atividade
        </div>
        <button class="toggle-form-btn" onclick="toggleForm()">Adicionar</button>
      </div>
      <div class="activity-form" id="activityForm">
        <div class="form-row">
          <div class="form-group">
            <label>NOME DA ATIVIDADE</label>
            <input type="text" id="actName" placeholder="Ex: Prova de Cálculo 1">
          </div>
          <div class="form-group">
            <label>CATEGORIA</label>
            <select id="actCategory">
              <option>Prova</option>
              <option>Estudo</option>
              <option>Trabalho</option>
              <option>Lista</option>
              <option>Seminário</option>
              <option>Projeto</option>
              <option>Exercício</option>
              <option>Outro</option>
            </select>
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label>PRIORIDADE</label>
            <select id="actPriority">
              <option value="Alta">Alta</option>
              <option value="Média" selected>Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
          <div class="form-group">
            <label>NOTA (0-10)</label>
            <input type="number" id="actGrade" placeholder="—" min="0" max="10" step="0.1">
          </div>
          <div class="form-group">
            <label>DATA</label>
            <input type="date" id="actDate">
          </div>
        </div>
        <button class="btn-primary" onclick="addActivity()">Salvar Atividade</button>
      </div>
    </div>

    <div class="activities-section">
      <div class="filter-row">
        <span style="font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:1px">Filtrar:</span>
        ${categories.map(c => `
          <button class="filter-chip ${filterCategory === c ? 'active' : ''}" onclick="setFilter('${c}')">
            ${c}
          </button>`).join('')}
      </div>
      <div class="activities-grid" id="activitiesGrid">
        ${renderActivities(filtered)}
      </div>
    </div>`;

    loadQuote();
}

function renderActivities(activities) {
    if (!activities.length) {
        return `
      <div style="text-align:center; padding:40px; color:var(--muted)">
        <div>Nenhuma atividade encontrada</div>
      </div>`;
    }

    return activities.map(a => {
        const priorityClass = a.priority
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const grade = a.grade !== '' ? parseFloat(a.grade) : null;
        const gradeClass = grade === null ? 'none' : grade >= 7 ? 'good' : grade >= 5 ? 'ok' : 'bad';
        const gradeText = grade === null ? '—' : grade.toFixed(1);
        const dateStr = a.date ? formatDate(a.date) : '';

        return `
      <div class="activity-card">
        <div class="priority-bar ${priorityClass}"></div>
        <div class="activity-info">
          <div class="activity-name">${escHtml(a.name)}</div>
          <div class="activity-tags">
            <span class="tag tag-cat">${escHtml(a.category)}</span>
            <span class="tag tag-pri ${priorityClass}">${a.priority}</span>
            ${dateStr ? `<span class="tag tag-date">📅 ${dateStr}</span>` : ''}
          </div>
        </div>
        <div class="activity-grade ${gradeClass}">${gradeText}</div>
        <button class="card-del" onclick="deleteActivity('${a.id}')" title="Excluir">✕</button>
      </div>`;
    }).join('');
}

function addActivity() {
    const name = document.getElementById('actName').value.trim();
    const category = document.getElementById('actCategory').value;
    const priority = document.getElementById('actPriority').value;
    const gradeRaw = document.getElementById('actGrade').value;
    const date = document.getElementById('actDate').value;

    if (!name) {
        showToast('Digite o nome da atividade!', 'error', '⚠️');
        return;
    }

    let grade = '';
    if (gradeRaw !== '') {
        grade = Math.min(10, Math.max(0, parseFloat(gradeRaw)));
        if (isNaN(grade)) {
            showToast('Nota inválida!', 'error', '⚠️');
            return;
        }
    }

    const feriado = checkFeriado(date);

    const id = 'a_' + (state.nextId++);
    state.activities[selectedSubject].push({ id, name, category, priority, grade, date });
    save();
    renderSidebar();
    renderMain();

    if (feriado) {
        showToast(`"${name}" salva! ⚠️ Atenção: ${feriado.name}`, 'error', '🗓️');
    } else {
        showToast(`Atividade "${name}" salva!`, 'success', '✅');
    }
}

function deleteActivity(id) {
    const acts = state.activities[selectedSubject];
    const activity = acts.find(a => a.id === id);

    openModal(
        'Excluir Atividade',
        `Excluir "${activity.name}"?`,
        () => {
            state.activities[selectedSubject] = acts.filter(a => a.id !== id);
            save();
            renderSidebar();
            renderMain();
            showToast('Atividade excluída!', 'error', '🗑️');
        }
    );
}

function toggleForm() {
    const form = document.getElementById('activityForm');
    form.classList.toggle('open');
    if (form.classList.contains('open')) {
        document.getElementById('actName').focus();
        document.getElementById('actDate').value = new Date().toISOString().split('T')[0];
    }
}

function setFilter(category) {
    filterCategory = category;
    renderMain();
}

async function loadWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const { latitude, longitude } = position.coords;
        await fetchWeather(latitude, longitude);
    } catch {
        await fetchWeather(-12.97, -38.50);
    }
}

async function fetchWeather(lat, lon) {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;

        document.getElementById('weatherPill').innerHTML = `
      <span class="weather-emoji">${weatherEmoji(code)}</span>
      <span class="temp">${temp}°C</span>
      <span>${weatherDesc(code)}</span>`;
    } catch {
        document.getElementById('weatherPill').innerHTML = `<span>🌤 Clima indisponível</span>`;
    }
}

function weatherEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 3) return '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌤';
}

function weatherDesc(code) {
    if (code === 0) return 'Céu limpo';
    if (code <= 2) return 'Parcial nublado';
    if (code <= 3) return 'Nublado';
    if (code <= 49) return 'Neblina';
    if (code <= 69) return 'Chuva';
    if (code <= 79) return 'Neve';
    if (code <= 82) return 'Aguaceiro';
    if (code <= 99) return 'Tempestade';
    return 'Variável';
}

const FALLBACK_QUOTES = [
    { q: 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', a: 'Nelson Mandela' },
    { q: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', a: 'Robert Collier' },
    { q: 'A inteligência é a capacidade de se adaptar à mudança.', a: 'Stephen Hawking' },
    { q: 'Invista em si mesmo. Seu aprendizado é seu ativo mais valioso.', a: 'Benjamin Franklin' },
    { q: 'Cada especialista foi um dia um iniciante.', a: 'Helen Hayes' },
];

async function loadQuote() {
    try {
        const res = await fetch('https://api.quotable.io/random?tags=education|inspirational&maxLength=200');
        if (res.ok) {
            const data = await res.json();
            document.getElementById('quoteText').textContent = data.content;
            document.getElementById('quoteAuthor').textContent = '— ' + data.author;
            return;
        }
    } catch { }

    const quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    document.getElementById('quoteText').textContent = quote.q;
    document.getElementById('quoteAuthor').textContent = '— ' + quote.a;
}

async function fetchFeriados() {
  try {
    const ano = new Date().getFullYear();
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    if (res.ok) {
      feriados = await res.json();
    }
  } catch {}
}

function checkFeriado(date) {
  if (!date) return null;
  return feriados.find(f => f.date === date) || null;
}

document.getElementById('subjectInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addSubject();
});

renderSidebar();
loadWeather();
loadQuote();
fetchFeriados();