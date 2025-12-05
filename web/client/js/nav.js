// Navigation component
function renderNav(activePage = '') {
    return `
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <img src="static/logo.png" alt="OpenYellow">
                <span>OpenYellow</span>
            </a>
            
            <div class="nav-links">
                <a href="index.html" class="nav-link ${activePage === 'index' ? 'active' : ''}">
                    <span>Главная</span>
                </a>
                <a href="grid" class="nav-link ${activePage === 'grid' ? 'active' : ''}">
                    <span>Репозитории</span>
                </a>
                <a href="authors.html" class="nav-link ${activePage === 'authors' ? 'active' : ''}">
                    <span>Авторы</span>
                </a>
                <a href="badges.html" class="nav-link ${activePage === 'badges' ? 'active' : ''}">
                    <span>Значки</span>
                </a>
                <a href="https://t.me/openyellow_community" target="_blank" class="nav-link nav-link-icon" title="Telegram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="15 60 110 90" fill="currentColor">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M76.33 132.14L62.5 143.73L58.59 144.26L49.84 114.11L19.06 104L113.82 67.8799L118.29 67.9799L103.36 149.19L76.33 132.14ZM100.03 83.1399L56.61 109.17L61.61 130.5L62.98 130.19L68.2 113.73L102.9 83.4799L100.03 83.1399Z"/>
                    </svg>
                </a>
                <a href="https://github.com/OpenBSL" target="_blank" class="nav-link nav-link-icon" title="GitHub">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </div>
            
            <button class="nav-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    `;
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    if (nav) {
        // Determine active page from body data attribute or URL
        const activePage = document.body.dataset.page || '';
        nav.innerHTML = renderNav(activePage);
        
        // Setup mobile menu toggle
        const navToggle = nav.querySelector('.nav-toggle');
        const navLinks = nav.querySelector('.nav-links');
        
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
    }
});
