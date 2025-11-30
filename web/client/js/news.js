// News feed logic

let currentNewsPage = 1;
let hasMoreNews = true;
let isLoadingNews = false;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('newsGrid')) {
        loadNews();
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreNews');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentNewsPage++;
                loadNews(true);
            });
        }
        
        // Modal close
        document.getElementById('newsModalClose')?.addEventListener('click', closeNewsModal);
        document.getElementById('newsModalOverlay')?.addEventListener('click', closeNewsModal);
    }
});

// Load news
async function loadNews(append = false) {
    if (isLoadingNews) return;
    
    isLoadingNews = true;
    const grid = document.getElementById('newsGrid');
    const loadMoreBtn = document.getElementById('loadMoreNews');
    
    if (!append) {
        grid.innerHTML = '<div class="news-loading"><div class="spinner"></div><p>Загрузка новостей...</p></div>';
    }
    
    try {
        const response = await DataService.getNews(currentNewsPage, 6);
        
        if (!append) {
            grid.innerHTML = '';
        } else {
            // Remove loading indicator if exists
            const loading = grid.querySelector('.news-loading');
            if (loading) loading.remove();
        }
        
        if (response.data.length === 0 && !append) {
            grid.innerHTML = '<div class="news-empty"><p>Пока нет новостей</p></div>';
            return;
        }
        
        response.data.forEach(news => {
            const newsCard = createNewsCard(news);
            grid.appendChild(newsCard);
        });
        
        // Update load more button
        hasMoreNews = response.pagination.page < response.pagination.totalPages;
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMoreNews ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Failed to load news:', error);
        grid.innerHTML = '<div class="news-error"><p>Ошибка загрузки новостей</p></div>';
    } finally {
        isLoadingNews = false;
    }
}

// Create news card
function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.onclick = () => openNewsModal(news);
    
    const date = new Date(news.created_at);
    const dateStr = date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Truncate text for preview
    const preview = news.text.length > 150 
        ? news.text.substring(0, 150) + '...' 
        : news.text;
    
    card.innerHTML = `
        <div class="news-card-header">
            <img src="${news.icon || 'static/logo.png'}" 
                 alt="${news.title}" 
                 class="news-card-icon"
                 onerror="this.src='static/logo.png'">
            <div class="news-card-date">${dateStr}</div>
        </div>
        <h3 class="news-card-title">${news.title}</h3>
        <p class="news-card-preview">${preview}</p>
        <span class="news-card-link">Читать далее →</span>
    `;
    
    return card;
}

// Open news modal
function openNewsModal(news) {
    const modal = document.getElementById('newsModal');
    if (!modal) return;
    
    const date = new Date(news.created_at);
    const dateStr = date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('newsIcon').src = news.icon || 'static/logo.png';
    document.getElementById('newsTitle').textContent = news.title;
    document.getElementById('newsDate').textContent = dateStr;
    document.getElementById('newsText').textContent = news.text;
    
    const linkContainer = document.getElementById('newsLinkContainer');
    const link = document.getElementById('newsLink');
    if (news.link) {
        link.href = news.link;
        linkContainer.style.display = 'block';
    } else {
        linkContainer.style.display = 'none';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close news modal
function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNewsModal();
    }
});
