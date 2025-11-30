const pool = require('../config/database');

// Get authors sorted by stars
exports.getAuthors = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 100,
            search = ''
        } = req.query;

        const limit = Math.min(parseInt(pageSize), 200);
        const offset = (parseInt(page) - 1) * limit;

        let whereConditions = [];
        let params = [];

        // Apply search
        if (search) {
            whereConditions.push('name LIKE ?');
            params.push(`%${search}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM authors ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get paginated data sorted by stars
        const [rows] = await pool.query(
            `SELECT 
                name as username,
                name as author,
                url,
                url as authorUrl,
                pic,
                pic as avatar,
                repos,
                stars as totalStars,
                stars
            FROM authors 
            ${whereClause}
            ORDER BY stars DESC, repos DESC
            LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

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
        console.error('Error fetching authors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch authors'
        });
    }
};

// Get author by name
exports.getAuthorByName = async (req, res) => {
    try {
        const { name } = req.params;

        const [rows] = await pool.query(
            `SELECT 
                name as username,
                name as author,
                url,
                url as authorUrl,
                pic,
                pic as avatar,
                repos,
                stars as totalStars,
                stars
            FROM authors 
            WHERE name = ?`,
            [name]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Author not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error fetching author:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch author'
        });
    }
};
