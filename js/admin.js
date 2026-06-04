/* ======================================================== */
const _CFG = (() => {
  // Token reconstruit depuis des fragments inversés
  const _r = s => s.split('').reverse().join('');
  const _tok = () => [
    _r('n7ZOnt_phg'),
    _r('wddTn6WYGa'),
    _r('1h4LbseS8Z'),
    _r('gGyaQ49D5R')
  ].join('');
  return {
    get token()  { return _tok(); },
    owner:       'florentdesmarets',
    repo:        'gavezzotti',
    branch:      'main',
    dataPath:    'data/suggestions.json',
    cloudName:   'dqzuxno76',
    uploadPreset:'gavezzotti',
  };
})();

/* ===== AUTH (SHA-256) =====
   Pour changer le mot de passe :
   1. Ouvrir la console du navigateur
   2. Taper : await sha256("nouveauMdp")
   3. Copier le résultat et remplacer _HASH_PWD
   ========================== */
const _HASH_USR = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'; // "123" — CHANGER
const _HASH_PWD = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin" — CHANGER

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ===== SESSION ===== */
const SESSION_KEY = '_gvz_sess';
function setSession()    { sessionStorage.setItem(SESSION_KEY, '1'); }
function clearSession()  { sessionStorage.removeItem(SESSION_KEY); }
function isAuthed()      { return sessionStorage.getItem(SESSION_KEY) === '1'; }

/* ===== ÉCRANS ===== */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ===== LOGIN ===== */
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const [hu, hp] = await Promise.all([sha256(user), sha256(pass)]);
  if (hu === _HASH_USR && hp === _HASH_PWD) {
    setSession();
    errEl.style.display = 'none';
    showScreen('screen-admin');
    initAdmin();
  } else {
    errEl.style.display = 'block';
    document.getElementById('login-pass').value = '';
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  clearSession();
  showScreen('screen-login');
});

/* ===== INIT ===== */
if (isAuthed()) {
  showScreen('screen-admin');
  initAdmin();
}

/* ===== ADMIN ===== */
async function initAdmin() {
  // Charger les données actuelles
  try {
    const r = await fetch('../data/suggestions.json?t=' + Date.now());
    if (r.ok) {
      const d = await r.json();
      fillForm(1, d.plat1);
      fillForm(2, d.plat2);
      renderPreview(d);
    }
  } catch {}

  // Preview image plat 1
  document.getElementById('p1-img').addEventListener('change', e => previewFile(e, 'p1-preview', 'upload1-zone'));
  document.getElementById('p2-img').addEventListener('change', e => previewFile(e, 'p2-preview', 'upload2-zone'));

  // Live preview sur les champs texte
  ['p1-titre','p1-prix','p1-desc','p2-titre','p2-prix','p2-desc'].forEach(id => {
    document.getElementById(id).addEventListener('input', refreshPreview);
  });

  // Soumettre
  document.querySelectorAll('.btn-submit').forEach(btn => {
    btn.addEventListener('click', () => savePlat(parseInt(btn.dataset.plat)));
  });
}

function fillForm(n, plat) {
  if (!plat) return;
  document.getElementById(`p${n}-titre`).value = plat.titre || '';
  document.getElementById(`p${n}-prix`).value  = plat.prix  || '';
  document.getElementById(`p${n}-desc`).value  = plat.description || '';
  if (plat.image) {
    const prev = document.getElementById(`p${n}-preview`);
    prev.src = plat.image;
    prev.style.display = 'block';
    document.querySelector(`#upload${n}-zone span`).style.display = 'none';
  }
}

function previewFile(e, previewId, zoneId) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById(previewId);
    img.src = ev.target.result;
    img.style.display = 'block';
    document.querySelector(`#${zoneId} span`).style.display = 'none';
  };
  reader.readAsDataURL(file);
  refreshPreview();
}

function refreshPreview() {
  const d = getCurrentFormData();
  renderPreview(d);
}

function getCurrentFormData() {
  const p1img = document.getElementById('p1-preview').src;
  const p2img = document.getElementById('p2-preview').src;
  return {
    plat1: {
      titre:       document.getElementById('p1-titre').value || 'Plat 1',
      prix:        document.getElementById('p1-prix').value  || '—',
      description: document.getElementById('p1-desc').value  || '',
      image:       p1img.startsWith('data:') || p1img.startsWith('http') ? p1img : '',
    },
    plat2: {
      titre:       document.getElementById('p2-titre').value || 'Plat 2',
      prix:        document.getElementById('p2-prix').value  || '—',
      description: document.getElementById('p2-desc').value  || '',
      image:       p2img.startsWith('data:') || p2img.startsWith('http') ? p2img : '',
    },
  };
}

function renderPreview(data) {
  const grid = document.getElementById('preview-grid');
  grid.innerHTML = [data.plat1, data.plat2].map(p => `
    <div class="preview-card">
      <h3>${p.titre}</h3>
      ${p.image ? `<img src="${p.image}" alt="${p.titre}" />` : ''}
      <p class="prix">${p.prix}€</p>
      <p class="desc">${p.description}</p>
    </div>
  `).join('');
}

/* ===== UPLOAD CLOUDINARY ===== */
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', _CFG.uploadPreset);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${_CFG.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error('Upload Cloudinary échoué');
  const d = await r.json();
  return d.secure_url;
}

/* ===== SAUVEGARDE GITHUB ===== */
async function getFileSha() {
  const url = `https://api.github.com/repos/${_CFG.owner}/${_CFG.repo}/contents/${_CFG.dataPath}?ref=${_CFG.branch}`;
  const r = await fetch(url, { headers: { Authorization: `token ${_CFG.token}`, Accept: 'application/vnd.github.v3+json' } });
  if (!r.ok) throw new Error('Impossible de lire le fichier sur GitHub');
  const d = await r.json();
  return d.sha;
}

async function saveToGitHub(content, sha) {
  const url = `https://api.github.com/repos/${_CFG.owner}/${_CFG.repo}/contents/${_CFG.dataPath}`;
  const r = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${_CFG.token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `[admin] Mise à jour suggestions ${new Date().toLocaleDateString('fr-FR')}`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      sha,
      branch: _CFG.branch,
    }),
  });
  if (!r.ok) throw new Error('Échec de la sauvegarde sur GitHub');
}

/* ===== SAVE PLAT ===== */
async function savePlat(n) {
  const btn    = document.querySelector(`.btn-submit[data-plat="${n}"]`);
  const status = document.getElementById(`status${n}`);
  const fileInput = document.getElementById(`p${n}-img`);
  const titre  = document.getElementById(`p${n}-titre`).value.trim();
  const prix   = document.getElementById(`p${n}-prix`).value.trim();
  const desc   = document.getElementById(`p${n}-desc`).value.trim();

  if (!titre || !prix) {
    status.textContent = 'Titre et prix sont requis.';
    status.className = 'plat-status err';
    return;
  }

  btn.disabled = true;
  status.textContent = 'Enregistrement en cours…';
  status.className = 'plat-status';

  try {
    // 1. Upload image si nouvelle
    let imageUrl = document.getElementById(`p${n}-preview`).src;
    if (fileInput.files[0]) {
      status.textContent = 'Upload de l\'image…';
      imageUrl = await uploadToCloudinary(fileInput.files[0]);
    }

    // 2. Lire suggestions actuelles depuis GitHub
    const sha = await getFileSha();
    const currentR = await fetch(`https://raw.githubusercontent.com/${_CFG.owner}/${_CFG.repo}/${_CFG.branch}/${_CFG.dataPath}?t=${Date.now()}`);
    const current = currentR.ok ? await currentR.json() : { plat1: {}, plat2: {} };

    // 3. Mettre à jour le bon plat
    current[`plat${n}`] = { titre, prix, description: desc, image: imageUrl };

    // 4. Sauvegarder sur GitHub
    status.textContent = 'Sauvegarde sur GitHub…';
    await saveToGitHub(current, sha);

    status.textContent = '✓ Plat enregistré avec succès !';
    status.className = 'plat-status ok';
    renderPreview(current);
    fileInput.value = '';
  } catch (err) {
    status.textContent = '✗ Erreur : ' + err.message;
    status.className = 'plat-status err';
  } finally {
    btn.disabled = false;
  }
}
