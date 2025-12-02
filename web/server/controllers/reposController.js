const pool = require('../config/database');

// Get repositories with pagination, search and filtering
exports.getRepositories = async (req, res) => {
    try {
        const {
            filter = 'top',
            page = 1,
            pageSize = 50,
            search = '',
            lang = '',
            license = '',
            author = '',
            excludeForks = 'false',
            sortBy = '',
            sortDir = 'asc'
        } = req.query;

        const limit = Math.min(parseInt(pageSize), 100);
        const offset = (parseInt(page) - 1) * limit;

        let orderBy = 'stars DESC';
        let whereConditions = [];
        let params = [];

        // Apply custom sorting if provided
        if (sortBy) {
            const direction = sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            
            // Special handling for 'place' - use the same multi-level sorting
            if (sortBy === 'place') {
                // Place sorting uses the same criteria as default top filter
                if (direction === 'ASC') {
                    orderBy = 'stars DESC, forks DESC, createddate DESC, name ASC';
                } else {
                    orderBy = 'stars ASC, forks ASC, createddate ASC, name DESC';
                }
            } else {
                // Map frontend column names to database columns
                const columnMap = {
                    'name': 'name',
                    'description': 'description',
                    'author': 'author',
                    'stars': 'stars',
                    'forks': 'forks',
                    'lang': 'lang',
                    'license': 'license',
                    'createddate': 'createddate',
                    'updateddate': 'updateddate'
                };
                
                const dbColumn = columnMap[sortBy] || 'stars';
                orderBy = `${dbColumn} ${direction}`;
            }
        } else {
            // Apply default filter sorting with tie-breakers
            if (filter === 'new') {
                orderBy = 'createddate DESC, stars DESC, forks DESC, name ASC';
            } else if (filter === 'updated') {
                orderBy = 'updateddate DESC, stars DESC, forks DESC, name ASC';
            } else {
                // top filter: stars DESC, forks DESC, newer first, then alphabetically
                orderBy = 'stars DESC, forks DESC, createddate DESC, name ASC';
            }
        }

        // Apply search (including tags)
        if (search) {
            whereConditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ? OR tags LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Apply column filters
        if (lang) {
            whereConditions.push('lang = ?');
            params.push(lang);
        }

        if (license) {
            whereConditions.push('license = ?');
            params.push(license);
        }

        if (author) {
            whereConditions.push('author LIKE ?');
            params.push(`%${author}%`);
        }

        // Exclude forks if requested
        if (excludeForks === 'true') {
            whereConditions.push('(isFork IS NULL OR isFork = 0)');
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM repos ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get paginated data with global ranking
        let query;
        if (filter === 'top') {
            // For top filter, calculate global place based on multi-level ranking
            // Ranking: stars DESC, forks DESC, createddate DESC (newer = higher), name ASC
            query = `
                SELECT 
                    id, name, description, author, authorUrl, url, pic,
                    stars, forks, lang, license, createddate, updateddate, isFork, tags,
                    (SELECT COUNT(*) + 1 
                     FROM repos r2 
                     WHERE (r2.stars > r1.stars)
                        OR (r2.stars = r1.stars AND r2.forks > r1.forks)
                        OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate > r1.createddate)
                        OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate = r1.createddate AND r2.name < r1.name)
                    ) as place
                FROM repos r1
                ${whereClause}
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `;
        } else {
            query = `
                SELECT 
                    id, name, description, author, authorUrl, url, pic,
                    stars, forks, lang, license, createddate, updateddate, isFork, tags
                FROM repos 
                ${whereClause}
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `;
        }
        
        const [rows] = await pool.query(query, [...params, limit, offset]);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                pageSize: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repositories'
        });
    }
};

// Get repository by ID
exports.getRepositoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT 
                r1.id, r1.name, r1.description, r1.author, r1.authorUrl, r1.url, r1.pic,
                r1.stars, r1.forks, r1.lang, r1.license, r1.createddate, r1.updateddate,
                (SELECT COUNT(*) + 1 
                 FROM repos r2 
                 WHERE (r2.stars > r1.stars)
                    OR (r2.stars = r1.stars AND r2.forks > r1.forks)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate > r1.createddate)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate = r1.createddate AND r2.name < r1.name)
                ) as place
            FROM repos r1
            WHERE r1.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Repository not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error fetching repository:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repository'
        });
    }
};

// Get statistics
exports.getStatistics = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as totalRepos,
                SUM(stars) as totalStars,
                COUNT(DISTINCT author) as totalAuthors
            FROM repos
        `);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
};

// Get filter options (unique values for dropdowns)
exports.getFilterOptions = async (req, res) => {
    try {
        // Get unique languages
        const [languages] = await pool.query(`
            SELECT DISTINCT lang 
            FROM repos 
            WHERE lang IS NOT NULL AND lang != ''
            ORDER BY lang
        `);

        // Get unique licenses
        const [licenses] = await pool.query(`
            SELECT DISTINCT license 
            FROM repos 
            WHERE license IS NOT NULL AND license != ''
            ORDER BY license
        `);

        res.json({
            success: true,
            data: {
                languages: languages.map(row => row.lang),
                licenses: licenses.map(row => row.license)
            }
        });

    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch filter options'
        });
    }
};
