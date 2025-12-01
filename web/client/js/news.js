// News feed logic

let currentNewsPage = 1;
let hasMoreNews = true;
let isLoadingNews = false;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('newsList')) {
        loadNews();
        
        // Infinite scroll
        const newsList = document.getElementById('newsList');
        if (newsList) {
            newsList.addEventListener('scroll', () => {
                if (isLoadingNews || !hasMoreNews) return;
                
                const scrollTop = newsList.scrollTop;
                const scrollHeight = newsList.scrollHeight;
                const clientHeight = newsList.clientHeight;
                
                // Load more when 200px from bottom
                if (scrollTop + clientHeight >= scrollHeight - 200) {
                    currentNewsPage++;
                    loadNews(true);
                }
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
    
    // Truncate text for preview - keep complete lines only, minimum 2 lines
    let preview = news.text;
    
    // Normalize line breaks - convert \n to <br> if not already present
    let normalizedText = news.text.replace(/\n/g, '<br>');
    
    // Find all line breaks in the normalized text
    const lineBreakRegex = /<br\s*\/?>/gi;
    const matches = [...normalizedText.matchAll(lineBreakRegex)];
    
    if (matches.length >= 2) {
        // At least 2 lines exist
        const secondLineBreak = matches[1].index;
        
        if (secondLineBreak <= 120) {
            // Second line fits within limit, show at least 2 lines
            if (normalizedText.length > secondLineBreak + 10) {
                // There's more content after second line
                preview = normalizedText.substring(0, secondLineBreak).trim() + '...';
            } else {
                preview = normalizedText;
            }
        } else {
            // Second line is beyond limit, show first line only
            const firstLineBreak = matches[0].index;
            if (firstLineBreak > 0 && normalizedText.length > firstLineBreak + 10) {
                preview = normalizedText.substring(0, firstLineBreak).trim() + '...';
            } else {
                preview = normalizedText;
            }
        }
    } else if (matches.length === 1) {
        // Only 1 line break exists
        const firstLineBreak = matches[0].index;
        if (firstLineBreak <= 120 && normalizedText.length > firstLineBreak + 10) {
            preview = normalizedText.substring(0, firstLineBreak).trim() + '...';
        } else if (normalizedText.length > 120) {
            preview = normalizedText.substring(0, 120).trim() + '...';
        } else {
            preview = normalizedText;
        }
    } else if (normalizedText.length > 120) {
        // No line breaks, use character limit
        preview = normalizedText.substring(0, 120).trim() + '...';
    } else {
        preview = normalizedText;
    }
    
    item.innerHTML = `
        <img src="${news.icon || 'static/logo.png'}" 
             alt="${news.title}" 
             class="news-item-icon"
             onerror="this.src='static/logo.png'">
        <div class="news-item-content">
            <div class="news-item-header">
                <h3 class="news-item-title">${news.title}</h3>
                <div class="news-item-date">${dateStr}</div>
            </div>
            <p class="news-item-text">${preview}</p>
            ${news.link ? `<span class="news-item-link">Подробнее →</span>` : ''}
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
    
    document.getElementById('newsIcon').src = news.icon || 'static/logo.png';
    document.getElementById('newsTitle').textContent = news.title;
    document.getElementById('newsDate').textContent = dateStr;
    
    // Clean up text: remove extra <br> tags that appear around block elements
    let formattedText = news.text;
    
    // Remove <br> before and after block elements (ul, ol, li, div, p, etc.)
    formattedText = formattedText.replace(/<br\s*\/?>\s*(<\/?(?:ul|ol|li|div|p|h[1-6]|blockquote))/gi, '$1');
    formattedText = formattedText.replace(/(<\/(?:ul|ol|li|div|p|h[1-6]|blockquote)>)\s*<br\s*\/?>/gi, '$1');
    
    // Remove multiple consecutive <br> tags (more than 2)
    formattedText = formattedText.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
    
    document.getElementById('newsText').innerHTML = formattedText;
    
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
