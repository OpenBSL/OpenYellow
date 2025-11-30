// Local development configuration
// Copy this to config.js for local development

window.CONFIG = {
    // Data source configuration
    dataSource: {
        // Use API or JSON files
        useAPI: true,
        
        // Base URL for JSON files (when useAPI = false)
        jsonBaseURL: '/data',
        
        // API base URL (when useAPI = true)
        apiBaseURL: 'http://localhost:3000/api'
    },
    
    // Site configuration
    site: {
        name: 'OpenYellow',
        description: 'Агрегатор open-source проектов для 1С:Предприятие',
        url: 'http://localhost:8000'
    },
    
    // Feature flags
    features: {
        authorsPage: true,
        badgesPage: true,
        search: true,
        pagination: true
    },
    
    // UI configuration
    ui: {
        defaultPageSize: 50,
        pageSizes: [25, 50, 100],
        searchDebounce: 300
    }
};
