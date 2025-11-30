// Authors page logic

let allAuthors = [];
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAuthors();
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAuthors(e.target.value);
            }, 300);
        });
    }
});

async function loadAuthors() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('authorsGrid');
    const empty = document.getElementById('empty');
    
    try {
        // Try to load from authors.json first
        let authorsData;
        try {
            authorsData = await DataService.getAuthors();
            if (authorsData && authorsData.data) {
                // Use authors data directly
                allAuthors = authorsData.data.map(author => ({
                    username: author.author || author.username,
                    url: author.authorUrl || author.url,
                    avatar: author.pic || author.avatar,
                    repos: author.repos || 0,
                    totalStars: author.totalStars || author.stars || 0,
                    totalForks: author.totalForks || author.forks || 0
                }))
                .sort((a, b) => b.totalStars - a.totalStars);
                
                renderAuthors(allAuthors);
                if (loading) loading.style.display = 'none';
                if (grid) grid.style.display = 'grid';
                return;
            }
        } catch (e) {
            console.log('Authors.json not found, extracting from repositories...');
        }
        
        // Fallback: extract authors from repositories data
        const topData = await DataService.getRepositories('top');
        
        // Extract unique authors with their stats
        const authorsMap = new Map();
        
        topData.data.forEach(repo => {
            if (!repo.author) return;
            
            if (!authorsMap.has(repo.author)) {
                authorsMap.set(repo.author, {
                    username: repo.author,
                    url: repo.authorUrl,
                    avatar: repo.pic,
                    repos: 0,
                    totalStars: 0,
                    totalForks: 0
                });
            }
            
            const author = authorsMap.get(repo.author);
            author.repos++;
            author.totalStars += repo.stars || 0;
            author.totalForks += repo.forks || 0;
        });
        
        // Convert to array and sort by total stars (descending)
        allAuthors = Array.from(authorsMap.values())
            .sort((a, b) => b.totalStars - a.totalStars);
        
        // Render
        renderAuthors(allAuthors);
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';
        
    } catch (error) {
        console.error('Failed to load authors:', error);
        if (loading) loading.innerHTML = '<p>Ошибка загрузки данных</p>';
    }
}

function filterAuthors(query) {
    if (!query) {
        renderAuthors(allAuthors);
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allAuthors.filter(author => 
        author.username.toLowerCase().includes(lowerQuery)
    );
    
    renderAuthors(filtered);
}

function renderAuthors(authors) {
    const grid = document.getElementById('authorsGrid');
    const empty = document.getElementById('empty');
    
    if (!grid) return;
    
    if (authors.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = authors.map((author, index) => `
        <a href="${author.url}" target="_blank" class="author-card">
            <img src="${author.avatar || 'static/logo.png'}" 
                 alt="${author.username}" 
                 class="author-avatar"
                 onerror="this.src='static/logo.png'">
            <h3 class="author-name">${author.username}</h3>
            <div class="author-stats">
                <div class="author-stat author-stat-place">
                    <span class="stat-value">#${index + 1}</span>
                    <span class="stat-label">место</span>
                </div>
                <div class="author-stat">
                    <span class="stat-value">${author.repos}</span>
                    <span class="stat-label">репозиториев</span>
                </div>
                <div class="author-stat">
                    <span class="stat-value">${author.totalStars}</span>
                    <span class="stat-label">звезд</span>
                </div>
            </div>
        </a>
    `).join('');
}
