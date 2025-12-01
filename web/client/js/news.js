// News feed logic

let currentNewsPage = 1;
let hasMoreNews = true;
let isLoadingNews = false;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('newsList')) {
        loadNews();
        
        // Infinite scroll on main page scroll
        window.addEventListener('scroll', () => {
            if (isLoadingNews || !hasMoreNews) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            
            // Load more when 500px from bottom
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                currentNewsPage++;
                loadNews(true);
            }
        });
        
        // Modal close
        document.getElementById('newsModalClose')?.addEventListener('click', closeNewsModal);
        document.getElementById('newsModalOverlay')?.addEventListener('click', closeNewsModal);
    }
});

// Load news
async function loadNews(append = false) {
    if (isLoadingNews) return;
    
    isLoadingNews = true;
    const list = document.getElementById('newsList');
    
    if (!append) {
        list.innerHTML = '<div class="news-loading"><div class="spinner"></div><p>Загрузка новостей...</p></div>';
    } else {
        // Add loading indicator at bottom
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'news-loading-more';
        loadingDiv.innerHTML = '<div class="spinner"></div>';
        list.appendChild(loadingDiv);
    }
    
    try {
        const response = await DataService.getNews(currentNewsPage, 10);
        
        if (!append) {
            list.innerHTML = '';
        } else {
            // Remove loading indicator
            const loading = list.querySelector('.news-loading-more');
            if (loading) loading.remove();
        }
        
        if (response.data.length === 0 && !append) {
            list.innerHTML = '<div class="news-empty"><p>Пока нет новостей</p></div>';
            return;
        }
        
        response.data.forEach(news => {
            const newsItem = createNewsItem(news);
            list.appendChild(newsItem);
        });
        
        // Update hasMore flag
        hasMoreNews = response.pagination.page < response.pagination.totalPages;
        
    } catch (error) {
        console.error('Failed to load news:', error);
        if (!append) {
            list.innerHTML = '<div class="news-error"><p>Ошибка загрузки новостей</p></div>';
        }
    } finally {
        isLoadingNews = false;
    }
}

// Create news item
function createNewsItem(news) {
    const item = document.createElement('div');
    item.className = 'news-item';
    item.onclick = () => openNewsModal(news);
    
    const date = new Date(news.created_at);
    const dateStr = date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Truncate text for preview - keep 2 non-empty lines, skip empty lines
    let preview = news.text;
    
    // Strip HTML tags for preview to get clean text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = news.text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Split by line breaks and filter out empty lines
    const lines = plainText.split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    // Take first 2 non-empty lines
    if (lines.length >= 2) {
        preview = lines.slice(0, 2).join('<br>');
    } else if (lines.length === 1) {
        preview = lines[0];
    } else if (plainText.length > 120) {
        preview = plainText.substring(0, 120);
    } else {
        preview = plainText;
    }
    
    item.innerHTML = `
        <img src="${news.icon || 'static/logo_small.png'}" 
             alt="${news.title}" 
             class="news-item-icon"
             onerror="this.src='static/logo_small.png'">
        <div class="news-item-content">
            <div class="news-item-header">
                <h3 class="news-item-title">${news.title}</h3>
                <div class="news-item-date">${dateStr}</div>
            </div>
            <p class="news-item-text">${preview}</p>
            ${news.link && news.link.trim() ? `<span class="news-item-link">Подробнее →</span>` : ''}
        </div>
    `;
    
    return item;
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
    
    document.getElementById('newsIcon').src = news.icon || 'static/logo_small.png';
    document.getElementById('newsTitle').textContent = news.title;
    document.getElementById('newsDate').textContent = dateStr;
    
    // Convert \n to <br> only if there are no <br> tags in the text
    let formattedText = news.text;
    if (!/<br\s*\/?>/i.test(formattedText)) {
        // No <br> tags found, convert \n to <br>
        formattedText = formattedText.replace(/\n/g, '<br>');
    }
    
    const newsTextElement = document.getElementById('newsText');
    newsTextElement.innerHTML = formattedText;
    
    const linkContainer = document.getElementById('newsLinkContainer');
    const link = document.getElementById('newsLink');
    if (news.link && news.link.trim()) {
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
