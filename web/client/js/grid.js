// Repositories page logic

let currentFilter = 'top';
let currentPage = 1;
let currentPageSize = 50;
let currentData = [];
let allData = [];
let searchTimeout = null;
let currentSort = { column: null, direction: null };
let columnFilters = {
    lang: '',
    license: '',
    author: '',
    excludeForks: false
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Filters toggle
    const filtersToggle = document.getElementById('filtersToggle');
    const filtersCollapsible = document.getElementById('filtersCollapsible');
    
    if (filtersToggle && filtersCollapsible) {
        // Start collapsed on mobile, expanded on desktop
        if (window.innerWidth > 768) {
            filtersCollapsible.classList.add('active');
            filtersToggle.classList.add('active');
        }
        
        filtersToggle.addEventListener('click', () => {
            filtersToggle.classList.toggle('active');
            filtersCollapsible.classList.toggle('active');
        });
    }
    
    // Get filter from URL (support both old and new format)
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter') || params.get('data'); // data - old format
    const repoParam = params.get('repo');
    
    if (filterParam && ['top', 'new', 'updated'].includes(filterParam)) {
        currentFilter = filterParam;
    }
    
    // Normalize URL: redirect grid.html to /grid and ensure filter parameter exists
    let needsUpdate = false;
    let newPath = window.location.pathname;
    
    if (window.location.pathname.endsWith('grid.html')) {
        newPath = window.location.pathname.replace('grid.html', 'grid');
        needsUpdate = true;
    }
    
    // Normalize URL parameter: use 'filter' instead of 'data'
    if (params.get('data') && !params.get('filter')) {
        params.delete('data');
        params.set('filter', currentFilter);
        needsUpdate = true;
    }
    
    // Add default filter parameter if missing
    if (!params.get('filter') && !params.get('data')) {
        params.set('filter', currentFilter);
        needsUpdate = true;
    }
    
    // Update URL if needed
    if (needsUpdate) {
        const newUrl = newPath + '?' + params.toString();
        window.history.replaceState({}, '', newUrl);
    }
    
    // Set active filter tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        // Remove active class from all tabs first
        tab.classList.remove('active');
        
        // Add active class only to current filter
        if (tab.dataset.filter === currentFilter) {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', () => {
            switchFilter(tab.dataset.filter);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadRepositories(e.target.value);
            }, 300);
        });
    }
    
    // Page size selector
    const pageSize = document.getElementById('pageSize');
    if (pageSize) {
        pageSize.addEventListener('change', (e) => {
            currentPageSize = parseInt(e.target.value);
            currentPage = 1;
            loadRepositories(searchInput?.value || '');
        });
    }
    
    // Pagination buttons
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadRepositories(searchInput?.value || '');
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', () => {
        currentPage++;
        loadRepositories(searchInput?.value || '');
    });
    
    // Page jump
    const pageJumpBtn = document.getElementById('pageJumpBtn');
    const pageJumpInput = document.getElementById('pageJump');
    
    if (pageJumpBtn && pageJumpInput) {
        pageJumpBtn.addEventListener('click', () => {
            const targetPage = parseInt(pageJumpInput.value);
            if (targetPage && targetPage > 0) {
                currentPage = targetPage;
                loadRepositories(searchInput?.value || '');
                pageJumpInput.value = '';
            }
        });
        
        // Allow Enter key to jump
        pageJumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                pageJumpBtn.click();
            }
        });
    }
    
    // Column filters
    const langFilter = document.getElementById('langFilter');
    const licenseFilter = document.getElementById('licenseFilter');
    const authorFilter = document.getElementById('authorFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (langFilter) {
        langFilter.addEventListener('change', (e) => {
            columnFilters.lang = e.target.value;
            currentPage = 1;
            loadRepositories(searchInput?.value || '');
        });
    }
    
    if (licenseFilter) {
        licenseFilter.addEventListener('change', (e) => {
            columnFilters.license = e.target.value;
            currentPage = 1;
            loadRepositories(searchInput?.value || '');
        });
    }
    
    if (authorFilter) {
        authorFilter.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                columnFilters.author = e.target.value;
                currentPage = 1;
                loadRepositories(searchInput?.value || '');
            }, 300);
        });
    }
    
    const excludeForksFilter = document.getElementById('excludeForksFilter');
    if (excludeForksFilter) {
        excludeForksFilter.addEventListener('change', (e) => {
            columnFilters.excludeForks = e.target.checked;
            currentPage = 1;
            loadRepositories(searchInput?.value || '');
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            columnFilters = { lang: '', license: '', author: '', excludeForks: false };
            if (langFilter) langFilter.value = '';
            if (licenseFilter) licenseFilter.value = '';
            if (authorFilter) authorFilter.value = '';
            if (excludeForksFilter) excludeForksFilter.checked = false;
            if (searchInput) searchInput.value = '';
            currentPage = 1;
            loadRepositories('');
        });
    }
    
    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', closeModal);
    
    // Load initial data
    loadRepositories('', repoParam);
});

// Switch filter
function switchFilter(filter) {
    if (filter === currentFilter) return;
    
    currentFilter = filter;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('filter', filter);
    window.history.pushState({}, '', url);
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Load data
    loadRepositories('');
}

// Load repositories
async function loadRepositories(searchQuery = '', highlightRepoId = null) {
    const loading = document.getElementById('tableLoading');
    const table = document.getElementById('reposTable');
    const empty = document.getElementById('tableEmpty');
    
    // Show loading
    if (loading) loading.style.display = 'flex';
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'none';
    
    try {
        // Fetch data with column filters and sorting
        const result = await DataService.searchRepositories(
            searchQuery,
            currentFilter,
            currentPage,
            currentPageSize,
            columnFilters,
            currentSort
        );
        
        currentData = result.data;
        allData = result.data;
        
        // Populate filter dropdowns on first load
        if (!window.filterOptionsLoaded) {
            await populateFilterDropdowns();
            window.filterOptionsLoaded = true;
        }
        
        // Update page title and description
        updatePageInfo();
        
        // Render table (data already sorted on server)
        renderTable(result.data);
        
        // Update sort indicators
        if (currentSort.column) {
            updateSortIndicators(currentSort.column, currentSort.direction);
        }
        
        // Update pagination
        updatePagination(result);
        
        // Hide loading
        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';
        
        // Show empty state if no results
        if (result.data.length === 0) {
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'block';
        }
        
        // Highlight specific repo if requested
        if (highlightRepoId) {
            const repo = result.data.find(r => r.id?.toString() === highlightRepoId);
            if (repo) {
                setTimeout(() => openModal(repo), 500);
            } else if (!searchQuery && !columnFilters.lang && !columnFilters.license && !columnFilters.author && !columnFilters.excludeForks && currentFilter === 'top') {
                // Repo not on current page and no filters applied, find which page it's on (only for 'top' filter)
                try {
                    const repoData = await DataService.getRepositoryById(highlightRepoId);
                    if (repoData && repoData.place) {
                        // Calculate which page the repo is on
                        const repoPage = Math.ceil(repoData.place / currentPageSize);
                        if (repoPage !== currentPage) {
                            // Load the correct page
                            currentPage = repoPage;
                            await loadRepositories('', highlightRepoId);
                            return; // Exit to avoid duplicate processing
                        }
                    }
                    // If we couldn't find the page or it's the same page, just open modal
                    if (repoData) {
                        setTimeout(() => openModal(repoData), 500);
                    }
                } catch (error) {
                    console.error('Failed to load specific repository:', error);
                }
            } else {
                // For other filters or when filters are applied, just fetch and show modal
                try {
                    const repoData = await DataService.getRepositoryById(highlightRepoId);
                    if (repoData) {
                        setTimeout(() => openModal(repoData), 500);
                    }
                } catch (error) {
                    console.error('Failed to load specific repository:', error);
                }
            }
        }
        
    } catch (error) {
        console.error('Failed to load repositories:', error);
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: var(--text-primary); margin-bottom: 1rem;">Ошибка загрузки данных</p>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">${error.message}</p>
                    <p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 1rem;">
                        Проверьте консоль для подробностей
                    </p>
                </div>
            `;
        }
    }
}

// Update page info
function updatePageInfo() {
    const titles = {
        top: 'Индекс репозиториев',
        new: 'Новые репозитории',
        updated: 'Недавно обновленные'
    };
    
    const descriptions = {
        top: 'Полный индекс проектов для 1С:Предприятие и OneScript',
        new: 'Свежие проекты, ожидающие своих первых пользователей',
        updated: 'Проекты с недавними обновлениями и активной разработкой'
    };
    
    const title = document.getElementById('pageTitle');
    const description = document.getElementById('pageDescription');
    
    if (title) title.textContent = titles[currentFilter];
    if (description) description.textContent = descriptions[currentFilter];
}

// Populate filter dropdowns from API
async function populateFilterDropdowns() {
    const langFilter = document.getElementById('langFilter');
    const licenseFilter = document.getElementById('licenseFilter');
    
    try {
        const options = await DataService.getFilterOptions();
        
        if (langFilter && langFilter.options.length === 1) {
            options.languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = lang;
                langFilter.appendChild(option);
            });
        }
        
        if (licenseFilter && licenseFilter.options.length === 1) {
            options.licenses.forEach(license => {
                const option = document.createElement('option');
                option.value = license;
                option.textContent = license;
                licenseFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load filter options:', error);
    }
}

// Render table
function renderTable(data) {
    const thead = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    
    if (!thead || !tbody) return;
    
    // Define columns based on filter
    const columns = getColumns();
    
    // Render header
    thead.innerHTML = columns.map((col, index) => {
        const sortable = col.sortable !== false ? 'sortable' : '';
        const dataColumn = col.field || '';
        return `<th class="${sortable}" data-column="${dataColumn}">${col.header}</th>`;
    }).join('');
    
    // Add click handlers for sortable columns
    thead.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            if (!column) return;
            
            let direction = 'asc';
            if (currentSort.column === column) {
                direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            }
            
            sortData(column, direction);
        });
    });
    
    // Render rows
    const params = new URLSearchParams(window.location.search);
    const highlightRepoId = params.get('repo');
    
    tbody.innerHTML = data.map(repo => {
        const isHighlighted = highlightRepoId && repo.id && repo.id.toString() === highlightRepoId;
        const highlightClass = isHighlighted ? 'highlighted-row' : '';
        
        return `
            <tr class="${highlightClass}" onclick="openModalById(${data.indexOf(repo)})">
                ${columns.map(col => `<td>${col.render(repo)}</td>`).join('')}
            </tr>
        `;
    }).join('');
    
    // Scroll to highlighted row
    if (highlightRepoId) {
        setTimeout(() => {
            const highlightedRow = tbody.querySelector('.highlighted-row');
            if (highlightedRow) {
                highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    }
}

// Get columns configuration
function getColumns() {
    const baseColumns = [
        {
            header: 'Название',
            field: 'name',
            render: (repo) => `
                <div class="repo-name-cell">
                    <img src="${repo.pic || 'static/logo.png'}" 
                         alt="${repo.name}" 
                         class="repo-avatar-small"
                         onerror="this.src='static/logo.png'">
                    <span class="repo-name-text">${repo.name || 'N/A'}</span>
                </div>
            `
        },
        {
            header: 'Описание',
            field: 'description',
            render: (repo) => `<div class="repo-description-cell">${repo.description || 'Нет описания'}</div>`
        },
        {
            header: 'Автор',
            field: 'author',
            render: (repo) => `
                <div class="author-cell">
                    <span>${repo.author || 'N/A'}</span>
                    ${repo.isFork ? '<img src="static/fork.svg" alt="Форк" class="fork-icon" title="Форк">' : ''}
                </div>
            `
        },
        {
            header: 'Звезды',
            field: 'stars',
            render: (repo) => formatNumber(repo.stars || 0)
        },
        {
            header: 'Форки',
            field: 'forks',
            render: (repo) => formatNumber(repo.forks || 0)
        },
        {
            header: 'Язык',
            field: 'lang',
            render: (repo) => createLangBadge(repo.lang)
        },
        {
            header: 'Лицензия',
            field: 'license',
            render: (repo) => repo.license || '-'
        },
        {
            header: 'Создан',
            field: 'createddate',
            render: (repo) => formatDate(repo.createddate)
        },
        {
            header: 'Обновлен',
            field: 'updateddate',
            render: (repo) => formatDate(repo.updateddate)
        }
    ];
    
    // Add filter-specific columns
    if (currentFilter === 'top') {
        baseColumns.unshift({
            header: 'Место',
            field: 'place',
            render: (repo) => repo.place || '-'
        });
        
        // Remove last two columns (Создан, Обновлен) and add Badge
        baseColumns.splice(-2, 2);
        baseColumns.push({
            header: '<a href="badges.html" class="badge-help-link" title="Markdown разметка значка для README" onclick="event.stopPropagation()">Значок ?</a>',
            field: 'badge',
            sortable: false,
            render: (repo) => createBadgeMarkdown(repo)
        });
    } else if (currentFilter === 'new') {
        // Remove Обновлен column, keep Создан
        baseColumns.splice(-1, 1);
    } else if (currentFilter === 'updated') {
        // Remove Создан column, keep Обновлен
        baseColumns.splice(-2, 1);
    }
    
    return baseColumns;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Known languages with predefined colors
const knownLanguages = {
    '1c': true,
    '1centerprise': true,
    'csharp': true,
    'c#': true,
    'java': true,
    'javascript': true,
    'python': true,
    'go': true,
    'rust': true,
    'typescript': true,
    'php': true,
    'ruby': true,
    'cpp': true,
    'c++': true
};

// Get language badge class
function getLangClass(lang) {
    if (!lang) return 'lang-default';
    
    const normalized = lang.toLowerCase()
        .replace(/\s+/g, '')
        .replace('1centerprise', '1c')
        .replace('c#', 'csharp')
        .replace('c++', 'cpp');
    
    // Check if language has predefined color
    if (knownLanguages[normalized] || knownLanguages[lang.toLowerCase()]) {
        return `lang-${normalized}`;
    }
    
    // Generate color for unknown language
    return `lang-unknown lang-hash-${getColorHash(lang)}`;
}

// Generate consistent color hash for unknown languages
function getColorHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 8); // 8 different colors
}

// Create language badge
function createLangBadge(lang) {
    if (!lang) return '<span class="lang-badge lang-default">-</span>';
    const className = getLangClass(lang);
    return `<span class="lang-badge ${className}">${lang}</span>`;
}

// Create badge markdown
function createBadgeMarkdown(repo) {
    if (!repo.id || !repo.place) return '-';
    
    // New format: direct SVG badge (recommended)
    const apiUrl = window.CONFIG?.dataSource?.apiBaseURL?.replace('/api', '') || 'https://openyellow.openintegrations.dev';
    const siteUrl = 'https://openyellow.org';
    const markdown = `[![OpenYellow](${apiUrl}/data/badges/${repo.id}.svg)](${siteUrl}/grid?filter=top&repo=${repo.id})`;
    
    return `<input type="text" class="badge-input" value="${markdown.replace(/"/g, '&quot;')}" readonly onclick="event.stopPropagation(); copyBadgeToClipboard(this);" title="Кликните для копирования">`;
}

// Copy badge to clipboard
window.copyBadgeToClipboard = async function(input) {
    try {
        await navigator.clipboard.writeText(input.value);
        showCopyNotification(input);
    } catch (err) {
        // Fallback for older browsers
        input.select();
        document.execCommand('copy');
        showCopyNotification(input);
    }
};

// Show copy notification
function showCopyNotification(element) {
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = '✓ Скопировано!';
    
    // Position near the clicked element
    const rect = element.getBoundingClientRect();
    notification.style.position = 'fixed';
    notification.style.left = rect.left + 'px';
    notification.style.top = (rect.top - 40) + 'px';
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Sort data - now triggers server-side sorting
function sortData(column, direction) {
    if (!direction) {
        direction = 'asc';
    }
    
    currentSort = { column, direction };
    currentPage = 1; // Reset to first page when sorting
    
    // Reload data with new sort parameters
    const searchInput = document.getElementById('searchInput');
    loadRepositories(searchInput?.value || '');
}

// Update sort indicators
function updateSortIndicators(column, direction) {
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        if (th.dataset.column === column) {
            th.classList.add(direction);
        }
    });
}

// Update pagination
function updatePagination(result) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const pageJumpInput = document.getElementById('pageJump');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= result.totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Страница ${currentPage} из ${result.totalPages} (${formatNumber(result.total)} записей)`;
    }
    
    if (pageJumpInput) {
        pageJumpInput.max = result.totalPages;
        pageJumpInput.placeholder = `1-${result.totalPages}`;
    }
}

// Open modal by index
window.openModalById = function(index) {
    if (currentData[index]) {
        openModal(currentData[index]);
    }
};

// Open modal
function openModal(repo) {
    const modal = document.getElementById('repoModal');
    if (!modal) return;
    
    // Populate modal
    document.getElementById('repoAvatar').src = repo.pic || 'static/logo.png';
    document.getElementById('repoName').textContent = repo.name || 'N/A';
    document.getElementById('repoAuthor').textContent = repo.author || 'N/A';
    document.getElementById('repoAuthor').href = repo.authorUrl || '#';
    document.getElementById('repoDescription').textContent = repo.description || 'Нет описания';
    document.getElementById('repoStars').textContent = formatNumber(repo.stars || 0);
    document.getElementById('repoForks').textContent = formatNumber(repo.forks || 0);
    document.getElementById('repoCreated').textContent = formatDate(repo.createddate);
    document.getElementById('repoUpdated').textContent = formatDate(repo.updateddate);
    document.getElementById('repoLink').href = repo.url || '#';
    
    // Optional fields
    const langBlock = document.getElementById('repoLangBlock');
    const lang = document.getElementById('repoLang');
    if (repo.lang) {
        langBlock.style.display = 'flex';
        lang.textContent = repo.lang;
    } else {
        langBlock.style.display = 'none';
    }
    
    const licenseBlock = document.getElementById('repoLicenseBlock');
    const license = document.getElementById('repoLicense');
    if (repo.license) {
        licenseBlock.style.display = 'flex';
        license.textContent = repo.license;
    } else {
        licenseBlock.style.display = 'none';
    }
    
    // Tags
    const tagsBlock = document.getElementById('repoTagsBlock');
    const tagsContainer = document.getElementById('repoTags');
    if (repo.tags) {
        tagsBlock.style.display = 'flex';
        const tagsArray = repo.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        tagsContainer.innerHTML = tagsArray.map(tag => 
            `<span class="repo-tag">${tag}</span>`
        ).join('');
    } else {
        tagsBlock.style.display = 'none';
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('repoModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
