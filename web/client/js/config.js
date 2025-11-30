// Configuration file for OpenYellow
// This file must be loaded before main.js

window.CONFIG = {
    // Data source configuration
    dataSource: {
        // Use API or JSON files
        useAPI: true,
        
        // Base URL for JSON files (when useAPI = false)
        // Options:
        // - '/data' - load via server proxy from openyellow.org (recommended)
        // - './data' - load from local data folder (file mode only)
        // - './data-example' - load from example data (for testing)
        jsonBaseURL: '/data',
        
        // API base URL (when useAPI = true)
        // For production: 'https://openyellow.openintegrations.dev/api'
        // For local dev: 'http://localhost:3000/api'
        apiBaseURL: 'https://openyellow.openintegrations.dev/api'
    },
    
    // Site configuration
    site: {
        name: 'OpenYellow',
        description: 'Агрегатор open-source проектов для 1С:Предприятие',
        url: 'https://openyellow.org'
    },
    
    // Feature flags
    features: {
        // Enable/disable authors page
        authorsPage: true,
        
        // Enable/disable badges page
        badgesPage: true,
        
        // Enable/disable search
        search: true,
        
        // Enable/disable pagination
        pagination: true
    },
    
    // UI configuration
    ui: {
        // Default page size for tables
        defaultPageSize: 50,
        
        // Available page sizes
        pageSizes: [25, 50, 100],
        
        // Search debounce delay (ms)
        searchDebounce: 300
    }
};
