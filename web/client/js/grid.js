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
    author: ''
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get filter from URL (support both old and new format)
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter') || params.get('data'); // data - old format
    const repoParam = params.get('repo');
    
    if (filterParam && ['top', 'new', 'updated'].includes(filterParam)) {
        currentFilter = filterParam;
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
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            columnFilters = { lang: '', license: '', author: '' };
            if (langFilter) langFilter.value = '';
            if (licenseFilter) licenseFilter.value = '';
            if (authorFilter) authorFilter.value = '';
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
        // Fetch data with column filters
        const result = await DataService.searchRepositories(
            searchQuery,
            currentFilter,
            currentPage,
            currentPageSize,
            columnFilters
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
        
        // Apply current sort if any
        if (currentSort.column) {
            sortData(currentSort.column, currentSort.direction);
        } else {
            // Render table
            renderTable(result.data);
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
        top: 'Самые популярные проекты по количеству звезд',
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
            render: (repo) => repo.author || 'N/A'
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
    
    const group = repo.group || 2;
    const markdown = `[![OpenYellow](https://img.shields.io/endpoint?url=https://openyellow.org/data/badges/${group}/${repo.id}.json)](https://openyellow.org/grid?data=top&repo=${repo.id})`;
    
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

// Sort data
function sortData(column, direction) {
    if (!direction) {
        direction = 'asc';
    }
    
    currentSort = { column, direction };
    
    const sorted = [...currentData].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle null/undefined
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle strings
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (direction === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    renderTable(sorted);
    updateSortIndicators(column, direction);
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
