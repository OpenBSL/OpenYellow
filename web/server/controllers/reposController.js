const pool = require('../config/database');

// Get repositories with pagination, search and filtering
exports.getRepositories = async (req, res) => {
    try {
        const {
            filter = 'top',
            page = 1,
            pageSize = 50,
            search = ''
        } = req.query;

        const limit = Math.min(parseInt(pageSize), 100);
        const offset = (parseInt(page) - 1) * limit;

        let orderBy = 'stars DESC';
        let whereConditions = [];
        let params = [];

        // Apply filter
        if (filter === 'new') {
            orderBy = 'createddate DESC';
        } else if (filter === 'updated') {
            orderBy = 'updateddate DESC';
        }

        // Apply search
        if (search) {
            whereConditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
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
            // For top filter, calculate global place based on stars ranking
            query = `
                SELECT 
                    id, name, description, author, authorUrl, url, pic,
                    stars, forks, lang, license, createddate, updateddate,
                    (SELECT COUNT(*) + 1 FROM repos r2 WHERE r2.stars > r1.stars) as place
                FROM repos r1
                ${whereClause}
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `;
        } else {
            query = `
                SELECT 
                    id, name, description, author, authorUrl, url, pic,
                    stars, forks, lang, license, createddate, updateddate
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
                id, name, description, author, authorUrl, url, pic,
                stars, forks, lang, license, createddate, updateddate
            FROM repos 
            WHERE id = ?`,
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
