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

// ===== COMMENTS STORAGE & RENDER =====
function getAllComments() {
    try { return JSON.parse(localStorage.getItem('animeComments') || '{}'); } catch(e) { return {}; }
}

function saveAllComments(obj) {
    localStorage.setItem('animeComments', JSON.stringify(obj));
}

function renderCommentsForId(animeId) {
    const container = document.getElementById('commentsList');
    if (!container) return;
    const all = getAllComments();
    const list = all[animeId] || [];
    if (list.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">Hozircha fikrlar yo\'q. Siz birinchi bo\'ling!</p>';
        return;
    }
    container.innerHTML = list.map(c => {
        const reactions = getCommentReactions(c.id) || { likes: 0, dislikes: 0 };
        return `
        <div class="comment-item" style="padding:0.8rem; border-bottom:1px solid rgba(99,41,253,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.6rem;">
                <strong style="color:var(--primary);">${c.name || 'Anonim'}</strong>
                <small style="color:var(--text-light);">${new Date(c.date).toLocaleString()}</small>
            </div>
            <p style="margin-top:0.4rem; color:var(--text);">${c.text}</p>
            <div style="display:flex; gap:0.8rem; margin-top:0.6rem; align-items:center; flex-wrap:wrap;">
                <button class="reaction-btn" onclick="toggleCommentReaction('${c.id}', 'like')">👍 ${reactions.likes}</button>
                <button class="reaction-btn" onclick="toggleCommentReaction('${c.id}', 'dislike')">👎 ${reactions.dislikes}</button>
                <button class="btn" onclick="deleteComment('${animeId}','${c.id}')" style="margin-left:auto;">O'chirish</button>
            </div>
        </div>
    `}).join('');
}

// ===== COMMENT REACTIONS =====
function getCommentReactions(commentId) {
    try {
        const data = JSON.parse(localStorage.getItem('commentReactions') || '{}');
        return data[commentId] || { likes: 0, dislikes: 0 };
    } catch(e) {
        return { likes: 0, dislikes: 0 };
    }
}

function saveCommentReactions(data) {
    localStorage.setItem('commentReactions', JSON.stringify(data));
}

function toggleCommentReaction(commentId, type) {
    const data = JSON.parse(localStorage.getItem('commentReactions') || '{}');
    if (!data[commentId]) data[commentId] = { likes: 0, dislikes: 0 };
    if (type === 'like') data[commentId].likes += 1;
    if (type === 'dislike') data[commentId].dislikes += 1;
    saveCommentReactions(data);
    const animeId = new URLSearchParams(window.location.search).get('id');
    if (animeId) renderCommentsForId(animeId);
}

function saveCommentForAnime(animeId) {
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    if (!text) { alert('Iltimos, fikr yozing.'); return; }
    const all = getAllComments();
    if (!all[animeId]) all[animeId] = [];
    const comment = { id: String(Date.now()), name, text, date: new Date().toISOString() };
    all[animeId].push(comment);
    saveAllComments(all);
    document.getElementById('commentName').value = '';
    document.getElementById('commentText').value = '';
    renderCommentsForId(animeId);
    showToast('Fikringiz qabul qilindi. Rahmat!', 'success');
}

function deleteComment(animeId, commentId) {
    if (!confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) return;
    const all = getAllComments();
    if (!all[animeId]) return;
    all[animeId] = all[animeId].filter(c => String(c.id) !== String(commentId));
    saveAllComments(all);
    renderCommentsForId(animeId);
}

// ===== ANIME DATA MANAGEMENT =====
function getAnimeData() {
    const data = localStorage.getItem('animeData');
    return data ? JSON.parse(data) : [];
}

function saveAnimeData(data) {
    localStorage.setItem('animeData', JSON.stringify(data));
}

// ===== GENRE FILTERING =====
let currentGenreFilter = null;
let currentStatusFilter = null;
let currentRatingFilter = null;

function displayAnime() {
    const animeGrid = document.getElementById('animeGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!animeGrid) return;
    
    let animeList = getAnimeData();
    
    // Filter by genre if selected
    if (currentGenreFilter) {
        animeList = animeList.filter(anime => 
            anime.genres.toLowerCase().includes(currentGenreFilter.toLowerCase())
        );
    }
    
    // Filter by status if selected
    if (currentStatusFilter) {
        animeList = animeList.filter(anime => 
            anime.status === currentStatusFilter
        );
    }
    
    // Filter by rating if selected
    if (currentRatingFilter) {
        animeList = animeList.filter(anime => {
            const rating = parseFloat(anime.rating);
            if (currentRatingFilter === '9+') return rating >= 9;
            if (currentRatingFilter === '8+') return rating >= 8;
            if (currentRatingFilter === '7+') return rating >= 7;
            return true;
        });
    }
    
    if (animeList.length === 0) {
        animeGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const allAnimeData = getAnimeData();
    const favs = getFavorites();
    animeGrid.innerHTML = animeList.map(anime => {
        const isFav = favs.includes(String(anime.id));
        return `
        <div class="anime-card" onclick="goToAnimeById('${anime.id || ''}')">
            <div style="position: relative;">
                <img loading="lazy" src="${anime.poster}" alt="${anime.name}" class="anime-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%226329FD%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E🎨%3C/text%3E%3C/svg%3E'">
                <div class="rating-badge">⭐ ${anime.rating}</div>
                <button class="like-btn" onclick="event.stopPropagation(); toggleLikeById('${anime.id || ''}')">❤ <span class="like-count">${anime.likes || 0}</span></button>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavoriteById('${anime.id || ''}', this)">${isFav ? '♥' : '♡'}</button>
            </div>
            <div class="anime-info">
                <h3 class="anime-title">${anime.name}</h3>
                <span class="anime-status">${anime.status}</span>
                <div class="anime-genres">
                    ${anime.genres.split(',').map(g => `<span class="genre-tag">${g.trim()}</span>`).join('')}
                </div>
                <div class="anime-rating">⭐ ${anime.rating}</div>
            </div>
        </div>
    `;
    }).join('');
}

// ===== FAVORITES HELPERS =====
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch(e) { return []; }
}

function saveFavorites(arr) {
    localStorage.setItem('favorites', JSON.stringify(arr));
}

function toggleFavoriteById(id, btnEl) {
    if (!id) return;
    const favs = getFavorites();
    const idx = favs.indexOf(String(id));
    if (idx === -1) {
        favs.push(String(id));
        if (btnEl) btnEl.textContent = '♥';
        showToast('✅ Anime saqlandi (Favorite).', 'success');
    } else {
        favs.splice(idx,1);
        if (btnEl) btnEl.textContent = '♡';
        showToast('🗑️ Favorite dan o\'chirildi.', 'success');
    }
    saveFavorites(favs);
}

function filterByGenre(genre) {
    currentGenreFilter = genre;
    displayAnime();
    updateFilterButtons('genresFilter', genre);
    showClearButton();
    document.getElementById('animeGrid').scrollIntoView({ behavior: 'smooth' });
}

function filterByStatus(status) {
    currentStatusFilter = status;
    displayAnime();
    updateFilterButtons('statusFilter', status);
    showClearButton();
    document.getElementById('animeGrid').scrollIntoView({ behavior: 'smooth' });
}

function filterByRating(rating) {
    currentRatingFilter = rating;
    displayAnime();
    updateFilterButtons('ratingFilter', rating);
    showClearButton();
    document.getElementById('animeGrid').scrollIntoView({ behavior: 'smooth' });
}

function updateFilterButtons(filterId, value) {
    document.querySelectorAll(`#${filterId} .genre-filter-btn`).forEach(btn => {
        if (btn.textContent.includes(value)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showClearButton() {
    const clearBtn = document.getElementById('clearFilterBtn');
    if (clearBtn && (currentGenreFilter || currentStatusFilter || currentRatingFilter)) {
        clearBtn.style.display = 'block';
    }
}

function clearGenreFilter() {
    currentGenreFilter = null;
    displayAnime();
    document.querySelectorAll('#genresFilter .genre-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function clearStatusFilter() {
    currentStatusFilter = null;
    displayAnime();
    document.querySelectorAll('#statusFilter .genre-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function clearRatingFilter() {
    currentRatingFilter = null;
    displayAnime();
    document.querySelectorAll('#ratingFilter .genre-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function clearAllFilters() {
    currentGenreFilter = null;
    currentStatusFilter = null;
    currentRatingFilter = null;
    displayAnime();
    
    document.querySelectorAll('.genre-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const clearBtn = document.getElementById('clearFilterBtn');
    if (clearBtn) clearBtn.style.display = 'none';
}

// ===== SLIDER =====
function displaySlider() {
    const slider = document.getElementById('slider');
    if (!slider) return;
    
    const animeList = getAnimeData();
    const latestAnime = animeList.slice(-8); // So'nggi 8 ta anime
    
    slider.innerHTML = latestAnime.map((anime, index) => `
        <div class="slider-item" onclick="goToAnimeById('${anime.id || ''}')">
            <img loading="lazy" src="${anime.poster}" alt="${anime.name}" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%238338ec%22 width=%22200%22 height=%22300%22/%3E%3C/svg%3E'">
        </div>
    `).join('');
}

// ===== TOP CAROUSEL =====
function displayTopCarousel() {
    const container = document.getElementById('topCarousel');
    if (!container) return;
    const animeList = getAnimeData();
    // show latest 10
    const items = animeList.slice(-10).reverse();
    container.innerHTML = items.map(a => `
        <div class="top-carousel-item" onclick="goToAnimeById('${a.id || ''}')">
            <img loading="lazy" src="${a.poster}" alt="${a.name}">
            <div style="color:var(--text); margin-left:0.5rem; font-weight:600;">${a.name}</div>
        </div>
    `).join('');
    startTopCarouselAuto();
}

function startTopCarouselAuto() {
    const container = document.getElementById('topCarousel');
    if (!container) return;
    let index = 0;
    const items = container.querySelectorAll('.top-carousel-item');
    if (items.length === 0) return;
    // reset scroll
    container.scrollLeft = 0;
    // clear existing timer if any
    if (container._topTimer) clearInterval(container._topTimer);
    container._topTimer = setInterval(() => {
        index = (index + 1) % items.length;
        const item = items[index];
        const left = item.offsetLeft - 12;
        container.scrollTo({ left, behavior: 'smooth' });
    }, 3000);
    // pause on hover
    container.addEventListener('mouseenter', () => { if (container._topTimer) clearInterval(container._topTimer); });
    container.addEventListener('mouseleave', () => { startTopCarouselAuto(); });
}

// ===== FEATURED (Top Rated) =====
function displayFeatured() {
    const container = document.getElementById('featuredCarousel');
    if (!container) return;

    const animeList = getAnimeData();
    const top = animeList.slice().sort((a,b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0)).slice(0,5);

    container.innerHTML = top.map(a => `
        <div class="featured-card" onclick="goToAnimeById('${a.id || ''}')">
            <img loading="lazy" src="${a.poster}" alt="${a.name}" class="featured-thumb" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%226329FD%22 width=%22200%22 height=%22300%22/%3E%3C/svg%3E'">
            <div class="featured-info">
                <h4>${a.name}</h4>
                <div style="color: var(--text-light); font-size: 0.9rem;">${a.genres.split(',').slice(0,2).join(', ')}</div>
                <div style="margin-top: 0.6rem; color: var(--accent); font-weight:700; display:flex; gap:0.6rem; align-items:center;">
                    <span>⭐ ${a.rating}</span>
                    <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavoriteById('${a.id || ''}', this)">${getFavorites().includes(String(a.id)) ? '♥' : '♡'}</button>
                    <span style="margin-left:auto;">❤ ${a.likes || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== LIKE HANDLER =====
function toggleLikeById(id) {
    if (!id) return;
    const list = getAnimeData();
    const idx = list.findIndex(a => String(a.id) === String(id));
    if (idx === -1) return;
    if (!list[idx].likes) list[idx].likes = 0;
    list[idx].likes = parseInt(list[idx].likes || 0) + 1;
    saveAnimeData(list);
    // re-render affected components
    displayAnime();
    displayFeatured();
}

// ===== SUGGESTION MODAL HANDLERS =====
function openSuggestionModal() {
    const m = document.getElementById('suggestionModal');
    if (m) m.classList.add('active');
}

function closeSuggestionModal() {
    const m = document.getElementById('suggestionModal');
    if (m) m.classList.remove('active');
}

function saveSuggestion() {
    const text = document.getElementById('suggestionText').value.trim();
    if (!text) { alert('Iltimos, fikr yoki taklif yozing.'); return; }
    const list = JSON.parse(localStorage.getItem('suggestions') || '[]');
    list.push({ id: String(Date.now()), text, date: new Date().toISOString() });
    localStorage.setItem('suggestions', JSON.stringify(list));
    document.getElementById('suggestionText').value = '';
    closeSuggestionModal();
    showToast('Rahmat! Taklif qabul qilindi.', 'success');
}

// ===== GENRE FILTER DISPLAY =====
function displayGenreFilter() {
    const genreFilter = document.getElementById('genresFilter');
    if (!genreFilter) return;
    
    const animeList = getAnimeData();
    const genresSet = new Set();
    
    // Extract all unique genres
    animeList.forEach(anime => {
        anime.genres.split(',').forEach(genre => {
            genresSet.add(genre.trim());
        });
    });
    
    const sortedGenres = Array.from(genresSet).sort();
    
    genreFilter.innerHTML = sortedGenres.map(genre => `
        <button class="genre-filter-btn" onclick="filterByGenre('${genre}')">${genre}</button>
    `).join('');
}

// ===== STATUS FILTER DISPLAY =====
function displayStatusFilter() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) return;
    
    const statuses = ['Yangi', 'Davom etmoqda', 'Tugallangan'];
    
    statusFilter.innerHTML = statuses.map(status => `
        <button class="genre-filter-btn" onclick="filterByStatus('${status}')">${status}</button>
    `).join('');
}

// ===== RATING FILTER DISPLAY =====
function displayRatingFilter() {
    const ratingFilter = document.getElementById('ratingFilter');
    if (!ratingFilter) return;
    
    const ratings = ['9+', '8+', '7+'];
    
    ratingFilter.innerHTML = ratings.map(rating => `
        <button class="genre-filter-btn" onclick="filterByRating('${rating}')">⭐ ${rating}</button>
    `).join('');
}

// ===== NAVIGATE TO ANIME DETAIL =====
function goToAnime(indexOrId) {
    const animeList = getAnimeData();
    // If numeric index provided and exists, prefer redirecting by that item's id if present
    const idx = parseInt(indexOrId);
    if (!isNaN(idx) && animeList[idx]) {
        const anime = animeList[idx];
        const idToUse = anime.id ? String(anime.id) : String(idx);
        window.location.href = `anime.html?id=${encodeURIComponent(idToUse)}`;
        return;
    }

    // Otherwise treat parameter as id
    const idStr = String(indexOrId);
    const found = animeList.find(a => String(a.id) === idStr);
    if (found) {
        window.location.href = `anime.html?id=${encodeURIComponent(found.id)}`;
        return;
    }

    alert('Anime topilmadi!');
}

// ===== DISPLAY ANIME DETAIL PAGE =====
function displayAnimeDetail() {
    const detailContainer = document.getElementById('animeDetail');
    if (!detailContainer) {
        console.log('Detail container topilmadi');
        return;
    }
    // If a detail container exists, hide the main grid/empty state so detail is prominent
    const gridEl = document.getElementById('animeGrid');
    const emptyEl = document.getElementById('emptyState');
    if (gridEl) gridEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    detailContainer.style.display = 'block';
    
    // Read id from URL parameter and perform id-based lookup (fallback to numeric index)
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    console.log('URL Parametri id:', idParam);

    const animeList = getAnimeData();
    console.log('Anime ro\'yxati:', animeList.length);

    let anime = null;
    if (idParam) {
        anime = animeList.find(a => String(a.id) === idParam);
        // Fallback: older links used numeric index
        if (!anime && !isNaN(parseInt(idParam)) && animeList[parseInt(idParam)]) {
            anime = animeList[parseInt(idParam)];
        }
    }

    if (!anime) {
        console.log('Anime topilmadi. Param:', idParam, 'List length:', animeList.length);
        detailContainer.innerHTML = '<h2 style="text-align: center; padding: 2rem;">❌ Anime topilmadi</h2>';
        return;
    }
    console.log('Anime topildi:', anime.name);
    
    // Get user rating
    const userRating = getUserAnimeRating(anime.id);
    const avgRating = getAverageAnimeRating(anime.id);
    
    detailContainer.innerHTML = `
        <div class="detail-header">
            <img src="${anime.poster}" alt="${anime.name}" class="detail-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 250 350%22%3E%3Crect fill=%236329FD%22 width=%22250%22 height=%22350%22/%3E%3C/svg%3E'">
            <div class="detail-info">
                <h1>${anime.name}</h1>
                <div class="detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-value">${anime.status}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Yil</span>
                        <span class="meta-value">${anime.year || '—'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Epizodlar</span>
                        <span class="meta-value">${anime.episodes || '—'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Studio</span>
                        <span class="meta-value">${anime.studio || '—'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Rejissor</span>
                        <span class="meta-value">${anime.director || '—'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Reyting</span>
                        <span class="meta-value">⭐ ${anime.rating}/10</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Foydalanuvchi Reytingi</span>
                        <span class="meta-value">⭐ ${avgRating > 0 ? avgRating.toFixed(1) : 'Belgilanmagan'}</span>
                    </div>
                </div>
                <div class="detail-genres">
                    ${anime.genres.split(',').map(g => `<span class="genre-tag">${g.trim()}</span>`).join('')}
                </div>
                <div style="margin-top:1rem; display:flex; gap:0.6rem; flex-wrap:wrap;">
                    ${anime.trailer ? `<a href="${anime.trailer}" target="_blank" class="watch-btn">🎬 Trailer</a>` : ''}
                    <a href="${anime.link}" target="_blank" class="watch-btn">📺 Tomosha Qilish (Telegram)</a>
                    <button class="watch-btn" style="background: var(--secondary);" onclick="history.back()">← Orqaga</button>
                </div>
                <div style="margin-top:1.5rem; padding:1rem; background:rgba(99,41,253,0.04); border-radius:8px;">
                    <p style="color:var(--text-light); margin-bottom:0.6rem;">🌟 Siz bu anime'ni baho berding:</p>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        ${[1,2,3,4,5,6,7,8,9,10].map(num => `
                            <button class="rating-btn ${userRating === num ? 'active' : ''}" onclick="saveUserAnimeRating('${anime.id}', ${num})">${num}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        <div class="description">
            <h3>📖 Anime Haqida</h3>
            <p>${anime.description}</p>
        </div>
        <div class="comments-section" id="commentsSection">
            <h3>💬 Fikrlar</h3>
            <div id="commentsList">
                <!-- comments inserted here -->
            </div>
            <div style="margin-top:1rem;">
                <input id="commentName" placeholder="Ismingiz (ixtiyoriy)" style="width:100%; padding:0.6rem; border-radius:8px; margin-bottom:0.6rem; border:1px solid rgba(99,41,253,0.06); background:var(--dark-bg); color:var(--text);">
                <textarea id="commentText" placeholder="Fikringizni yozing..." style="width:100%; min-height:100px; padding:0.6rem; border-radius:8px; border:1px solid rgba(99,41,253,0.06); background:var(--dark-bg); color:var(--text); margin-top:0.4rem;"></textarea>
                <div style="display:flex; gap:0.6rem; justify-content:flex-end; margin-top:0.6rem;">
                    <button class="btn" onclick="renderCommentsForId('${anime.id}')">Bekor</button>
                    <button class="btn" onclick="saveCommentForAnime('${anime.id}')">Yuborish</button>
                </div>
            </div>
        </div>
    `;
    
    // Render comments after displaying detail
    setTimeout(() => {
        renderCommentsForId(anime.id);
    }, 100);

    // Render screenshots gallery
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'screenshots-gallery';
    const screenshots = anime.screenshots || [];
    if (screenshots.length > 0) {
        const html = `
            <h3>🖼️ Screenshots</h3>
            <div class="screenshots-row">
                ${screenshots.map(s => `<img src="${s}" alt="screenshot" onerror="this.src='${anime.poster}'">`).join('')}
            </div>
        `;
        detailContainer.insertAdjacentHTML('beforeend', html);
    }

    // Render Latest News
    const news = anime.news || [];
    if (news.length > 0) {
        const newsHtml = `
            <div class="latest-news">
                <h3>📰 Latest News</h3>
                <ul>
                    ${news.map(n => `<li>${n}</li>`).join('')}
                </ul>
            </div>
        `;
        detailContainer.insertAdjacentHTML('beforeend', newsHtml);
    }
}

// ===== SEARCH FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Update header based on login status
    updateHeaderAuth();
    
    // Agar anime detail sahifasi bo'lsa
    if (document.getElementById('animeDetail') && !document.getElementById('animeGrid')) {
        displayAnimeDetail();
        return;
    }
    
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                searchDropdown.classList.remove('active');
                return;
            }
            
            const animeList = getAnimeData();
            const results = animeList.filter(anime => 
                anime.name.toLowerCase().includes(searchTerm) ||
                anime.genres.toLowerCase().includes(searchTerm) ||
                anime.description.toLowerCase().includes(searchTerm)
            );
            
            if (results.length === 0) {
                searchDropdown.innerHTML = '<div style="padding: 1rem; color: #b0b0b0;">Natija topilmadi</div>';
                searchDropdown.classList.add('active');
                return;
            }
            
            searchDropdown.innerHTML = results.map(anime => `
                <div class="search-item" onclick="goToAnimeById('${anime.id || ''}')">
                    <strong>${anime.name}</strong>
                    <br>
                    <small style="color: #b0b0b0;">${anime.genres.split(',')[0]}</small>
                </div>
            `).join('');
            searchDropdown.classList.add('active');
        });
        
        document.addEventListener('click', function(e) {
            if (e.target !== searchInput) {
                searchDropdown.classList.remove('active');
            }
        });
    }
    
    // Display anime based on current page
    if (document.getElementById('animeGrid')) {
        displayAnime();
        displayFeatured();
        displaySlider();
        displayTopCarousel();
        displayGenreFilter();
        displayStatusFilter();
        displayRatingFilter();
    }
    
    if (document.getElementById('animeDetail')) {
        displayAnimeDetail();
    }
});

// ===== NAVIGATION =====
function goToAdmin() {
    window.location.href = 'admin.html';
}

// New navigation by id
function goToAnimeById(id) {
    if (!id) return;
    window.location.href = `anime.html?id=${encodeURIComponent(id)}`;
}

function scrollToGenres() {
    document.querySelector('.anime-grid').scrollIntoView({ behavior: 'smooth' });
}

// ===== ADMIN LOGIN/LOGOUT IN HEADER =====
// ===== HEADER AUTH STATUS UPDATE =====
function updateHeaderAuth() {
    const isAdmin = isAdminLoggedIn();
    const user = getCurrentUser();
    
    const userHeaderNav = document.getElementById('userHeaderNav');
    const adminHeaderNav = document.getElementById('adminHeaderNav');
    const loginHeaderNav = document.getElementById('loginHeaderNav');
    
    // Hide all first
    if (userHeaderNav) userHeaderNav.style.display = 'none';
    if (adminHeaderNav) adminHeaderNav.style.display = 'none';
    if (loginHeaderNav) loginHeaderNav.style.display = 'none';
    
    // Show appropriate header
    if (isAdmin) {
        if (adminHeaderNav) adminHeaderNav.style.display = 'block';
    } else if (user && user.type === 'user') {
        if (userHeaderNav) {
            userHeaderNav.style.display = 'block';
            const greeting = document.getElementById('userGreeting');
            if (greeting) greeting.textContent = `👤 ${user.name}`;
        }
    } else {
        if (loginHeaderNav) loginHeaderNav.style.display = 'block';
    }
}

function updateAdminHeaderStatus() {
    updateHeaderAuth();
}

// Allow Enter key for admin login modal
document.addEventListener('DOMContentLoaded', function() {
    const adminPassInput = document.getElementById('adminPassInput');
    if (adminPassInput) {
        adminPassInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    showToast('👋 Chiqildi!', 'success');
    updateAdminHeaderStatus();
}

// ===== DEMO / FILE DATA LOADER =====
document.addEventListener('DOMContentLoaded', async function() {
    if (getAnimeData().length === 0) {
        async function useDemo() {
            const demoData = [
                { name: "Naruto Shippuden", description: "Naruto Uzumaki ning o'sish yo'li va ninja hikoyasi.", genres: "Action, Adventure, Fantasy", poster: "https://via.placeholder.com/200x300/8338ec/ffffff?text=Naruto", status: "Tugallangan", rating: "9.1", link: "https://t.me/anime" },
                { name: "Attack on Titan", description: "Gigantik devalar va insoniyat hikoyasi.", genres: "Action, Fantasy, Dark", poster: "https://via.placeholder.com/200x300/ff006e/ffffff?text=AOT", status: "Tugallangan", rating: "8.9", link: "https://t.me/anime" },
                { name: "My Hero Academia", description: "Super qobiliyatlar dunyosi va yosh qahramonlar.", genres: "Action, Comedy, School", poster: "https://via.placeholder.com/200x300/fb5607/ffffff?text=MHA", status: "Davom etmoqda", rating: "8.2", link: "https://t.me/anime" }
            ];
            const base = Date.now();
            for (let i = 0; i < demoData.length; i++) {
                demoData[i].id = String(base + i);
                demoData[i].likes = 0;
                if (!demoData[i].year) demoData[i].year = '';
                if (!demoData[i].episodes) demoData[i].episodes = '';
                if (!demoData[i].studio) demoData[i].studio = '';
                if (!demoData[i].director) demoData[i].director = '';
                if (!demoData[i].trailer) demoData[i].trailer = '';
                if (!demoData[i].screenshots) demoData[i].screenshots = [];
                if (!demoData[i].news) demoData[i].news = [];
            }
            saveAnimeData(demoData);
        }

        try {
            const resp = await fetch('data/anime.json');
            if (resp.ok) {
                const arr = await resp.json();
                if (Array.isArray(arr) && arr.length > 0) {
                    const base = Date.now();
                    for (let i = 0; i < arr.length; i++) {
                        if (!arr[i].id) arr[i].id = String(base + i);
                        if (!arr[i].likes) arr[i].likes = 0;
                        if (!arr[i].year) arr[i].year = '';
                        if (!arr[i].episodes) arr[i].episodes = '';
                        if (!arr[i].studio) arr[i].studio = '';
                        if (!arr[i].director) arr[i].director = '';
                        if (!arr[i].trailer) arr[i].trailer = '';
                        if (!arr[i].screenshots) arr[i].screenshots = [];
                        if (!arr[i].news) arr[i].news = [];
                    }
                    saveAnimeData(arr);
                } else {
                    await useDemo();
                }
            } else {
                await useDemo();
            }
        } catch (e) {
            await useDemo();
        }
    }

    if (document.getElementById('animeGrid')) {
        displayAnime();
        displayFeatured();
        displaySlider();
    }
});
// ===== END DATA LOADER =====

/*
 * Note: admin can Export/Import JSON (admin panel) to update localStorage.
 * To persist changes permanently in the repo, export the JSON and replace `data/anime.json` in the project.
 */

// ===== ANIME RATING SYSTEM =====
// (rest of file continues)

// ===== ANIME RATING SYSTEM =====
// ===== ANIME RATING SYSTEM =====
function saveUserAnimeRating(animeId, rating) {
    try {
        const data = JSON.parse(localStorage.getItem('animeRatings') || '{}');
        if (!data[animeId]) data[animeId] = [];
        
        // Remove previous rating for this session user if exists, then add new one
        data[animeId] = data[animeId].filter(r => r.userId !== 'default-user');
        data[animeId].push({ userId: 'default-user', rating: rating, date: new Date().toISOString() });
        
        localStorage.setItem('animeRatings', JSON.stringify(data));
        showToast(`✅ Siz ${rating}/10 baho verdingiz!`, 'success');
        
        // Refresh the detail page to show updated rating
        if (document.getElementById('animeDetail')) {
            setTimeout(() => {
                displayAnimeDetail();
            }, 300);
        }
    } catch(e) {
        console.error('Rating saving error:', e);
    }
}

function getUserAnimeRating(animeId) {
    try {
        const data = JSON.parse(localStorage.getItem('animeRatings') || '{}');
        if (!data[animeId]) return 0;
        const userRating = data[animeId].find(r => r.userId === 'default-user');
        return userRating ? userRating.rating : 0;
    } catch(e) {
        return 0;
    }
}

function getAverageAnimeRating(animeId) {
    try {
        const data = JSON.parse(localStorage.getItem('animeRatings') || '{}');
        if (!data[animeId] || data[animeId].length === 0) return 0;
        const sum = data[animeId].reduce((acc, r) => acc + r.rating, 0);
        return sum / data[animeId].length;
    } catch(e) {
        return 0;
    }
}

