const pool = require('../config/database');

// SVG logo for badges
const logoSvg = '<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="768px" height="768px" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink"> <g><path style="opacity:0.997" fill="#eaa708" d="M 604.5,516.5 C 601.404,514.903 598.07,513.736 594.5,513C 544.785,505.415 496.119,509.415 448.5,525C 436.916,529.459 425.916,534.959 415.5,541.5C 398.66,537.967 381.66,535.133 364.5,533C 348.281,531.787 332.281,532.954 316.5,536.5C 299.453,519.752 284.287,501.418 271,481.5C 242.573,429.163 235.239,373.829 249,315.5C 265.646,256.357 301.479,213.19 356.5,186C 358.957,184.488 358.957,183.154 356.5,182C 349.131,181.383 341.798,181.717 334.5,183C 267.533,201.29 220.366,242.456 193,306.5C 167.424,382.358 177.424,453.025 223,518.5C 233.961,532.628 246.128,545.628 259.5,557.5C 258.933,559.03 258.267,560.53 257.5,562C 245.072,569.607 234.072,578.774 224.5,589.5C 155.368,532.865 122.868,459.532 127,369.5C 130.325,286.334 165.492,220.5 232.5,172C 284.106,135.763 341.44,120.763 404.5,127C 494.695,136.821 563.195,180.321 610,257.5C 640.612,314.386 648.612,374.386 634,437.5C 627.999,465.344 618.166,491.678 604.5,516.5 Z"/></g> <g><path style="opacity:1" fill="#fefefd" d="M 316.5,536.5 C 316.063,538.074 315.063,539.241 313.5,540C 296.593,544.123 280.593,550.456 265.5,559C 263.305,559.409 261.305,558.909 259.5,557.5C 246.128,545.628 233.961,532.628 223,518.5C 177.424,453.025 167.424,382.358 193,306.5C 220.366,242.456 267.533,201.29 334.5,183C 341.798,181.717 349.131,181.383 356.5,182C 358.957,183.154 358.957,184.488 356.5,186C 301.479,213.19 265.646,256.357 249,315.5C 235.239,373.829 242.573,429.163 271,481.5C 284.287,501.418 299.453,519.752 316.5,536.5 Z"/></g> <g><path style="opacity:0.989" fill="#40403f" d="M 604.5,516.5 C 561.483,587.723 498.483,629.556 415.5,642C 360.365,649.089 308.032,640.089 258.5,615C 253.906,612.882 249.906,610.048 246.5,606.5C 246.414,605.504 246.748,604.671 247.5,604C 260.545,599.319 273.878,595.652 287.5,593C 314.112,589.907 340.779,587.574 367.5,586C 370.562,584.939 373.062,583.106 375,580.5C 386.112,564.886 399.612,551.886 415.5,541.5C 425.916,534.959 436.916,529.459 448.5,525C 496.119,509.415 544.785,505.415 594.5,513C 598.07,513.736 601.404,514.903 604.5,516.5 Z"/></g> <g><path style="opacity:0.997" fill="#cb7810" d="M 415.5,541.5 C 399.612,551.886 386.112,564.886 375,580.5C 373.062,583.106 370.562,584.939 367.5,586C 340.779,587.574 314.112,589.907 287.5,593C 273.878,595.652 260.545,599.319 247.5,604C 246.748,604.671 246.414,605.504 246.5,606.5C 238.406,601.79 231.072,596.123 224.5,589.5C 234.072,578.774 245.072,569.607 257.5,562C 258.267,560.53 258.933,559.03 259.5,557.5C 261.305,558.909 263.305,559.409 265.5,559C 280.593,550.456 296.593,544.123 313.5,540C 315.063,539.241 316.063,538.074 316.5,536.5C 332.281,532.954 348.281,531.787 364.5,533C 381.66,535.133 398.66,537.967 415.5,541.5 Z"/></g> </svg>';

// Get badge JSON for repository
exports.getBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const { group = '2' } = req.query; // group parameter for compatibility

        // Get repository place in ranking
        const [rows] = await pool.query(`
            SELECT 
                id,
                name,
                (SELECT COUNT(*) + 1 FROM repos r2 WHERE r2.stars > r1.stars) as place
            FROM repos r1
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                schemaVersion: 1,
                label: 'OpenYellow',
                message: 'not found',
                color: 'red'
            });
        }

        const repo = rows[0];
        const place = repo.place;

        // Generate badge JSON
        const badge = {
            schemaVersion: 1,
            label: 'OpenYellow',
            message: `#${place}`,
            color: 'yellow',
            logoSvg: logoSvg
        };

        // Set cache headers (cache for 1 hour)
        res.set({
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
        });

        res.json(badge);

    } catch (error) {
        console.error('Error generating badge:', error);
        res.status(500).json({
            schemaVersion: 1,
            label: 'OpenYellow',
            message: 'error',
            color: 'red'
        });
    }
};
