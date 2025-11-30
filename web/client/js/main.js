// Main application initialization

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Load stats on homepage
    if (document.getElementById('totalRepos')) {
        loadHomeStats();
    }
});

// Load homepage statistics
async function loadHomeStats() {
    try {
        const data = await DataService.getCounters();
        
        const totalRepos = document.getElementById('totalRepos');
        const totalStars = document.getElementById('totalStars');
        const totalAuthors = document.getElementById('totalAuthors');
        
        if (totalRepos) totalRepos.textContent = formatNumber(data.totalcounter);
        if (totalStars) totalStars.textContent = formatNumber(data.starscounter);
        if (totalAuthors) totalAuthors.textContent = formatNumber(data.authorscounter);
        
        // Animate numbers
        animateValue(totalRepos, 0, data.totalcounter, 1000);
        animateValue(totalStars, 0, data.starscounter, 1000);
        animateValue(totalAuthors, 0, data.authorscounter, 1000);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Format number with spaces
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Animate number counting
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = formatNumber(end);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

// Data Service - abstraction layer for data fetching
// This makes it easy to switch from JSON files to API calls
class DataService {
    static baseURL = window.CONFIG ? window.CONFIG.dataSource.jsonBaseURL : 'https://openyellow.org/data';
    static useAPI = window.CONFIG ? window.CONFIG.dataSource.useAPI : false;
    static apiURL = window.CONFIG ? window.CONFIG.dataSource.apiBaseURL : '/api';
    
    // Get counters data
    static async getCounters() {
        if (this.useAPI) {
            const response = await this.fetchAPI('/repos/stats');
            // Transform API response to match old format
            return {
                totalcounter: response.data.totalRepos,
                starscounter: response.data.totalStars,
                authorscounter: response.data.totalAuthors
            };
        }
        return this.fetchJSON('/counters.json');
    }
    
    // Get repositories by filter
    static async getRepositories(filter = 'top') {
        if (this.useAPI) {
            const response = await this.fetchAPI(`/repos?filter=${filter}&pageSize=500`);
            // Transform API response to match old format
            return {
                data: response.data,
                title: '',
                description: ''
            };
        }
        const data = await this.fetchJSON(`/${filter}.json`);
        // Ensure data has the expected structure
        if (!data.data) {
            return { data: data, title: '', description: '' };
        }
        return data;
    }
    
    // Get authors data
    static async getAuthors() {
        if (this.useAPI) {
            const response = await this.fetchAPI('/authors?pageSize=100');
            // Transform API response to match old format
            return {
                data: response.data
            };
        }
        return this.fetchJSON('/authors.json');
    }
    
    // Search repositories (will use API when available)
    static async searchRepositories(query, filter = 'top', page = 1, pageSize = 50) {
        if (this.useAPI) {
            const params = new URLSearchParams({
                search: query,
                filter,
                page,
                pageSize
            });
            const response = await this.fetchAPI(`/repos?${params}`);
            // Transform API response to match expected format
            return {
                data: response.data,
                total: response.pagination.total,
                page: response.pagination.page,
                pageSize: response.pagination.pageSize,
                totalPages: response.pagination.totalPages
            };
        }
        
        // Client-side search fallback
        const data = await this.getRepositories(filter);
        return this.clientSideSearch(data, query, page, pageSize);
    }
    
    // Client-side search implementation
    static clientSideSearch(data, query, page, pageSize) {
        if (!query) {
            return this.paginate(data.data, page, pageSize);
        }
        
        const lowerQuery = query.toLowerCase();
        const filtered = data.data.filter(repo => {
            const name = (repo.name || '').toLowerCase();
            const description = (repo.description || '').toLowerCase();
            const author = (repo.author || '').toLowerCase();
            const lang = (repo.lang || '').toLowerCase();
            
            // Tags can be either string or array
            let tags = '';
            if (Array.isArray(repo.tags)) {
                tags = repo.tags.join(' ').toLowerCase();
            } else if (typeof repo.tags === 'string') {
                tags = repo.tags.toLowerCase();
            }
            
            return (
                name.includes(lowerQuery) ||
                description.includes(lowerQuery) ||
                author.includes(lowerQuery) ||
                lang.includes(lowerQuery) ||
                tags.includes(lowerQuery)
            );
        });
        
        return this.paginate(filtered, page, pageSize);
    }
    
    // Paginate data
    static paginate(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: data.slice(start, end),
            total: data.length,
            page,
            pageSize,
            totalPages: Math.ceil(data.length / pageSize)
        };
    }
    
    // Fetch from API
    static async fetchAPI(endpoint) {
        const url = `${this.apiURL}${endpoint}`;
        console.log(`[API] Fetching: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    }
    
    // Fetch JSON file
    static async fetchJSON(path) {
        const response = await fetch(`${this.baseURL}${path}`, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load: ${path}`);
        }
        
        return response.json();
    }
}

// Export for use in other modules
window.DataService = DataService;
window.formatNumber = formatNumber;
