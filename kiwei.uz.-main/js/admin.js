// ===== ADMIN CREDENTIALS =====
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ===== SESSION MANAGEMENT =====
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

function setAdminLoggedIn(status) {
    if (status) {
        sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
        sessionStorage.removeItem('adminLoggedIn');
    }
}

// ===== LOGIN/LOGOUT =====
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setAdminLoggedIn(true);
        if (typeof showToast === 'function') {
            showToast('✅ Muvaffaqiyatli kirildi!', 'success');
        }
        setTimeout(() => {
            location.reload();
        }, 500);
    } else {
        if (typeof showToast === 'function') {
            showToast('❌ Noto\'g\'ri username yoki parol!', 'error');
        } else {
            alert('Noto\'g\'ri credentials');
        }
    }
}

function adminLogoutAndRedirect() {
    setAdminLoggedIn(false);
    if (typeof showToast === 'function') {
        showToast('👋 Chiqildi!', 'success');
    }
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

function login() {
    adminLogin();
}

function logout() {
    adminLogoutAndRedirect();
}

// ===== GET ANIME DATA =====
function getAnimeData() {
    const data = localStorage.getItem('animeData');
    return data ? JSON.parse(data) : [];
}

function saveAnimeData(data) {
    localStorage.setItem('animeData', JSON.stringify(data));
}

// ===== GENRE MANAGEMENT =====
function getAllGenres() {
    try {
        return JSON.parse(localStorage.getItem('allGenres') || '[]');
    } catch(e) { return []; }
}

function saveAllGenres(arr) {
    localStorage.setItem('allGenres', JSON.stringify(arr));
}

function displayGenresList() {
    const container = document.getElementById('genresList');
    if (!container) return;
    const genres = getAllGenres();
    if (genres.length === 0) {
        container.innerHTML = '<p style="color:var(--text-light);">Janrlar yo\'q</p>';
        return;
    }
    container.innerHTML = genres.map(g => `
        <div style="padding:0.6rem 1.2rem; background:linear-gradient(135deg, rgba(99,41,253,0.1), rgba(99,41,253,0.05)); border-radius:20px; border:1px solid rgba(99,41,253,0.08); display:flex; align-items:center; gap:0.6rem; color:var(--text);">
            <span>${g}</span>
            <button class="btn" onclick="deleteGenre('${g}')" style="padding:0.3rem 0.6rem; font-size:0.85rem;">🗑️</button>
        </div>
    `).join('');
}

function addNewGenre() {
    const input = document.getElementById('newGenreInput');
    const name = input.value.trim();
    if (!name) { showToast('Janr nomini kiriting.', 'error'); return; }
    const genres = getAllGenres();
    if (genres.includes(name)) { showToast('Bu janr allaqachon mavjud.', 'error'); return; }
    genres.push(name);
    saveAllGenres(genres);
    input.value = '';
    displayGenresList();
    showToast('✅ Janr qo\'shildi!', 'success');
}

function deleteGenre(name) {
    if (!confirm(`"${name}" janrni o'chirmoqchimisiz?`)) return;
    let genres = getAllGenres();
    genres = genres.filter(g => g !== name);
    saveAllGenres(genres);
    displayGenresList();
    showToast('🗑️ Janr o\'chirildi!', 'success');
}

// ===== ADD ANIME =====
function addAnime() {
    const name = document.getElementById('animeName').value;
    const description = document.getElementById('animeDescription').value;
    const genres = document.getElementById('animeGenres').value;
    const poster = document.getElementById('animePoster').value;
    const status = document.getElementById('animeStatus').value;
    const rating = document.getElementById('animeRating').value;
    const link = document.getElementById('animeLink').value;
    const type = document.getElementById('animeType').value;
    const year = document.getElementById('animeYear').value;
    const episodes = document.getElementById('animeEpisodes').value;
    const studio = document.getElementById('animeStudio').value;
    const director = document.getElementById('animeDirector').value;
    const trailer = document.getElementById('animeTrailer').value;
    const screenshotsRaw = document.getElementById('animeScreenshots').value;
    const newsRaw = document.getElementById('animeNews').value;
    const screenshots = screenshotsRaw ? screenshotsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const news = newsRaw ? newsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
    
    if (!name || !description || !genres || !poster || !rating || !link) {
        showToast('⚠️ Barcha maydonlarni to\'ldiring!', 'error');
        return;
    }
    
    if (rating < 1 || rating > 10) {
        showToast('⚠️ Reyting 1-10 orasida bo\'lishi kerak!', 'error');
        return;
    }
    
    const anime = {
        name,
        description,
        genres,
        poster,
        status,
        rating,
        link,
        type
    };
    // attach new metadata
    anime.year = year || '';
    anime.episodes = episodes || '';
    anime.studio = studio || '';
    anime.director = director || '';
    anime.trailer = trailer || '';
    anime.screenshots = screenshots;
    anime.news = news;
    // Assign a stable unique id
    anime.id = String(Date.now() + Math.floor(Math.random() * 1000));
    
    const animeList = getAnimeData();
    animeList.push(anime);
    saveAnimeData(animeList);
    
    // Clear form
    document.getElementById('animeName').value = '';
    document.getElementById('animeDescription').value = '';
    document.getElementById('animeGenres').value = '';
    document.getElementById('animePoster').value = '';
    document.getElementById('animeRating').value = '';
    document.getElementById('animeLink').value = '';
    document.getElementById('animeYear').value = '';
    document.getElementById('animeEpisodes').value = '';
    document.getElementById('animeStudio').value = '';
    document.getElementById('animeDirector').value = '';
    document.getElementById('animeTrailer').value = '';
    document.getElementById('animeScreenshots').value = '';
    document.getElementById('animeNews').value = '';
    
    showToast('✅ Anime muvaffaqiyatli qo\'shildi!', 'success');
    displayAnimeList();
}

// ===== DISPLAY ANIME LIST IN ADMIN =====
function displayAnimeList() {
    const animeListAdmin = document.getElementById('animeListAdmin');
    const animeList = getAnimeData();
    
    if (animeList.length === 0) {
        animeListAdmin.innerHTML = '<p style="text-align: center; color: #b0b0b0;">Hozircha anime yo\'q</p>';
        return;
    }
    
    animeListAdmin.innerHTML = animeList.map((anime, index) => `
        <div class="anime-item">
            <div class="anime-item-info">
                <h4>🎬 ${anime.name} <small style="color:var(--text-light); font-weight:600; margin-left:0.6rem;">${anime.year || ''}</small></h4>
                <p><strong>Janrlar:</strong> ${anime.genres}</p>
                <p><strong>Status:</strong> ${anime.status} • <strong>Epizod:</strong> ${anime.episodes || '—'}</p>
                <p><strong>Studio:</strong> ${anime.studio || '—'} • <strong>Rejissor:</strong> ${anime.director || '—'}</p>
                <p><strong>Reyting:</strong> ⭐ ${anime.rating}/10</p>
                <p style="color: #ff006e;"><strong>Link:</strong> <a href="${anime.link}" target="_blank" style="color: #ff006e;">Telegram</a></p>
            </div>
            <div class="anime-item-actions">
                <button class="btn btn-edit btn-small" onclick="editAnimeById('${anime.id}')">✏️ Tahrirlash</button>
                <button class="btn btn-delete btn-small" onclick="deleteAnimeById('${anime.id}')">🗑️ O'chirish</button>
            </div>
        </div>
    `).join('');
}

// ===== EDIT ANIME =====
let editingId = null;

function editAnimeById(id) {
    const animeList = getAnimeData();
    const index = animeList.findIndex(a => String(a.id) === String(id));
    if (index === -1) return;
    editingId = String(id);
    const anime = animeList[index];

    document.getElementById('editAnimeName').value = anime.name;
    document.getElementById('editAnimeDescription').value = anime.description;
    document.getElementById('editAnimeGenres').value = anime.genres;
    document.getElementById('editAnimePoster').value = anime.poster;
    document.getElementById('editAnimeStatus').value = anime.status;
    document.getElementById('editAnimeRating').value = anime.rating;
    document.getElementById('editAnimeLink').value = anime.link;
        document.getElementById('editAnimeType').value = anime.type || 'serial';
        document.getElementById('editAnimeYear').value = anime.year || '';
        document.getElementById('editAnimeEpisodes').value = anime.episodes || '';
        document.getElementById('editAnimeStudio').value = anime.studio || '';
        document.getElementById('editAnimeDirector').value = anime.director || '';
        document.getElementById('editAnimeTrailer').value = anime.trailer || '';
        document.getElementById('editAnimeScreenshots').value = (anime.screenshots || []).join(', ');
        document.getElementById('editAnimeNews').value = (anime.news || []).join('\n');

    document.getElementById('editModal').classList.add('active');
}

function saveEditAnime() {
    const name = document.getElementById('editAnimeName').value;
    const description = document.getElementById('editAnimeDescription').value;
    const genres = document.getElementById('editAnimeGenres').value;
    const poster = document.getElementById('editAnimePoster').value;
    const status = document.getElementById('editAnimeStatus').value;
    const rating = document.getElementById('editAnimeRating').value;
    const link = document.getElementById('editAnimeLink').value;
    const type = document.getElementById('editAnimeType').value;
    const year = document.getElementById('editAnimeYear').value;
    const episodes = document.getElementById('editAnimeEpisodes').value;
    const studio = document.getElementById('editAnimeStudio').value;
    const director = document.getElementById('editAnimeDirector').value;
    const trailer = document.getElementById('editAnimeTrailer').value;
    const screenshotsRaw = document.getElementById('editAnimeScreenshots').value;
    const newsRaw = document.getElementById('editAnimeNews').value;
    const screenshots = screenshotsRaw ? screenshotsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const news = newsRaw ? newsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
    
    if (!name || !description || !genres || !poster || !rating || !link) {
        showToast('⚠️ Barcha maydonlarni to\'ldiring!', 'error');
        return;
    }
    
    if (rating < 1 || rating > 10) {
        showToast('⚠️ Reyting 1-10 orasida bo\'lishi kerak!', 'error');
        return;
    }
    
    const animeList = getAnimeData();
    const idx = animeList.findIndex(a => String(a.id) === String(editingId));
    if (idx === -1) {
        showToast('❌ Tahrirlashda xatolik: anime topilmadi', 'error');
        return;
    }
    // Preserve id
    animeList[idx] = Object.assign({}, animeList[idx], {
        name,
        description,
        genres,
        poster,
        status,
        rating,
        link,
        type
    });
    // merge new metadata
    animeList[idx].year = year || '';
    animeList[idx].episodes = episodes || '';
    animeList[idx].studio = studio || '';
    animeList[idx].director = director || '';
    animeList[idx].trailer = trailer || '';
    animeList[idx].screenshots = screenshots;
    animeList[idx].news = news;
    
    saveAnimeData(animeList);
    closeEditModal();
    displayAnimeList();
    showToast('✅ Anime muvaffaqiyatli tahrirlandi!', 'success');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    editingIndex = null;
}

// ===== DELETE ANIME =====
function deleteAnimeById(id) {
    if (confirm('Ushbu animeni o\'chirishni xohlaysizmi?')) {
        let animeList = getAnimeData();
        animeList = animeList.filter(a => String(a.id) !== String(id));
        saveAnimeData(animeList);
        displayAnimeList();
        showToast('✅ Anime o\'chirildi!', 'success');
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== IMPORT / EXPORT JSON =====
function exportAnimeToFile() {
    const data = getAnimeData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('✅ JSON eksport qilindi. Lokal repo ga joylang yoki saqlang.', 'success');
}

function importAnimeFromFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const arr = JSON.parse(e.target.result);
            if (!Array.isArray(arr)) throw new Error('Fayl noto‘g‘ri formatda');
            saveAnimeData(arr);
            displayAnimeList();
            showToast('✅ JSON import qilindi va saqlandi (localStorage).', 'success');
        } catch (err) {
            showToast('❌ JSON import xatosi: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

// ===== MODAL CLOSE =====
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // Create particles
    createParticles();
    
    // Display genres list
    displayGenresList();
    
    // Check if admin is logged in
    if (isAdminLoggedIn()) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        displayAnimeList();
        displayGenresList();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }
    
    // Allow Enter key for login
    const passwordInputs = document.querySelectorAll('#adminPassword, #password');
    passwordInputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    adminLogin();
                }
            });
        }
    });
    
    // Show toast function if not defined
    if (typeof showToast === 'undefined') {
        window.showToast = function(msg, type) {
            console.log(msg);
        };
    }
});

// ===== PARTICLE ANIMATION =====
function createParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 100 + 50 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 20) + 's';
        particleContainer.appendChild(particle);
    }
}

// ===== NAVIGATION =====
function goToAdmin() {
    window.location.href = 'admin.html';
}
