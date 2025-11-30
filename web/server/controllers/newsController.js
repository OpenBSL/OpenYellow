const pool = require('../config/database');

// Get news with pagination
exports.getNews = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10
        } = req.query;

        const limit = Math.min(parseInt(pageSize), 50);
        const offset = (parseInt(page) - 1) * limit;

        // Get total count
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM news'
        );
        const total = countResult[0].total;

        // Get paginated news
        const [rows] = await pool.query(`
            SELECT 
                id, created_at, title, text, icon, link
            FROM news 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

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
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news'
        });
    }
};

// Get single news item
exports.getNewsById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                id, created_at, title, text, icon, link
            FROM news 
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'News not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news'
        });
    }
};
