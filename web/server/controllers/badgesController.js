const pool = require('../config/database');

// SVG logo for badges
const logoSvg = '<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="768px" height="768px" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink"> <g><path style="opacity:0.997" fill="#eaa708" d="M 604.5,516.5 C 601.404,514.903 598.07,513.736 594.5,513C 544.785,505.415 496.119,509.415 448.5,525C 436.916,529.459 425.916,534.959 415.5,541.5C 398.66,537.967 381.66,535.133 364.5,533C 348.281,531.787 332.281,532.954 316.5,536.5C 299.453,519.752 284.287,501.418 271,481.5C 242.573,429.163 235.239,373.829 249,315.5C 265.646,256.357 301.479,213.19 356.5,186C 358.957,184.488 358.957,183.154 356.5,182C 349.131,181.383 341.798,181.717 334.5,183C 267.533,201.29 220.366,242.456 193,306.5C 167.424,382.358 177.424,453.025 223,518.5C 233.961,532.628 246.128,545.628 259.5,557.5C 258.933,559.03 258.267,560.53 257.5,562C 245.072,569.607 234.072,578.774 224.5,589.5C 155.368,532.865 122.868,459.532 127,369.5C 130.325,286.334 165.492,220.5 232.5,172C 284.106,135.763 341.44,120.763 404.5,127C 494.695,136.821 563.195,180.321 610,257.5C 640.612,314.386 648.612,374.386 634,437.5C 627.999,465.344 618.166,491.678 604.5,516.5 Z"/></g> <g><path style="opacity:1" fill="#fefefd" d="M 316.5,536.5 C 316.063,538.074 315.063,539.241 313.5,540C 296.593,544.123 280.593,550.456 265.5,559C 263.305,559.409 261.305,558.909 259.5,557.5C 246.128,545.628 233.961,532.628 223,518.5C 177.424,453.025 167.424,382.358 193,306.5C 220.366,242.456 267.533,201.29 334.5,183C 341.798,181.717 349.131,181.383 356.5,182C 358.957,183.154 358.957,184.488 356.5,186C 301.479,213.19 265.646,256.357 249,315.5C 235.239,373.829 242.573,429.163 271,481.5C 284.287,501.418 299.453,519.752 316.5,536.5 Z"/></g> <g><path style="opacity:0.989" fill="#40403f" d="M 604.5,516.5 C 561.483,587.723 498.483,629.556 415.5,642C 360.365,649.089 308.032,640.089 258.5,615C 253.906,612.882 249.906,610.048 246.5,606.5C 246.414,605.504 246.748,604.671 247.5,604C 260.545,599.319 273.878,595.652 287.5,593C 314.112,589.907 340.779,587.574 367.5,586C 370.562,584.939 373.062,583.106 375,580.5C 386.112,564.886 399.612,551.886 415.5,541.5C 425.916,534.959 436.916,529.459 448.5,525C 496.119,509.415 544.785,505.415 594.5,513C 598.07,513.736 601.404,514.903 604.5,516.5 Z"/></g> <g><path style="opacity:0.997" fill="#cb7810" d="M 415.5,541.5 C 399.612,551.886 386.112,564.886 375,580.5C 373.062,583.106 370.562,584.939 367.5,586C 340.779,587.574 314.112,589.907 287.5,593C 273.878,595.652 260.545,599.319 247.5,604C 246.748,604.671 246.414,605.504 246.5,606.5C 238.406,601.79 231.072,596.123 224.5,589.5C 234.072,578.774 245.072,569.607 257.5,562C 258.267,560.53 258.933,559.03 259.5,557.5C 261.305,558.909 263.305,559.409 265.5,559C 280.593,550.456 296.593,544.123 313.5,540C 315.063,539.241 316.063,538.074 316.5,536.5C 332.281,532.954 348.281,531.787 364.5,533C 381.66,535.133 398.66,537.967 415.5,541.5 Z"/></g> </svg>';

// Generate SVG badge
exports.getBadgeSvg = async (req, res) => {
    try {
        const { id } = req.params;

        // Get repository place in ranking with multi-level sorting
        const [rows] = await pool.query(`
            SELECT 
                id,
                name,
                (SELECT COUNT(*) + 1 
                 FROM repos r2 
                 WHERE (r2.stars > r1.stars)
                    OR (r2.stars = r1.stars AND r2.forks > r1.forks)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate > r1.createddate)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate = r1.createddate AND r2.name < r1.name)
                ) as place
            FROM repos r1
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).send(
                '<svg xmlns="http://www.w3.org/2000/svg" width="117" height="20"><text x="10" y="15" fill="red">Not Found</text></svg>'
            );
        }

        const repo = rows[0];
        const place = `#${repo.place}`;
        
        // Calculate widths based on text length
        // Each character is approximately 7 pixels wide at font-size 110
        const labelWidth = 92;
        const charWidth = 7;
        const messageWidth = 10 + (place.length * charWidth); // Dynamic width based on actual text length
        const totalWidth = labelWidth + messageWidth;

        // Generate SVG badge
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="OpenYellow: ${place}"><title>OpenYellow: ${place}</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${labelWidth}" height="20" fill="#555"/><rect x="${labelWidth}" width="${messageWidth}" height="20" fill="#dfb317"/><rect width="${totalWidth}" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><image x="5" y="3" width="14" height="14" href="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4gPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4gPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9Ijc2OHB4IiBoZWlnaHQ9Ijc2OHB4IiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgdGV4dC1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uOyBpbWFnZS1yZW5kZXJpbmc6b3B0aW1pemVRdWFsaXR5OyBmaWxsLXJ1bGU6ZXZlbm9kZDsgY2xpcC1ydWxlOmV2ZW5vZGQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gPGc+PHBhdGggc3R5bGU9Im9wYWNpdHk6MC45OTciIGZpbGw9IiNlYWE3MDgiIGQ9Ik0gNjA0LjUsNTE2LjUgQyA2MDEuNDA0LDUxNC45MDMgNTk4LjA3LDUxMy43MzYgNTk0LjUsNTEzQyA1NDQuNzg1LDUwNS40MTUgNDk2LjExOSw1MDkuNDE1IDQ0OC41LDUyNUMgNDM2LjkxNiw1MjkuNDU5IDQyNS45MTYsNTM0Ljk1OSA0MTUuNSw1NDEuNUMgMzk4LjY2LDUzNy45NjcgMzgxLjY2LDUzNS4xMzMgMzY0LjUsNTMzQyAzNDguMjgxLDUzMS43ODcgMzMyLjI4MSw1MzIuOTU0IDMxNi41LDUzNi41QyAyOTkuNDUzLDUxOS43NTIgMjg0LjI4Nyw1MDEuNDE4IDI3MSw0ODEuNUMgMjQyLjU3Myw0MjkuMTYzIDIzNS4yMzksMzczLjgyOSAyNDksMzE1LjVDIDI2NS42NDYsMjU2LjM1NyAzMDEuNDc5LDIxMy4xOSAzNTYuNSwxODZDIDM1OC45NTcsMTg0LjQ4OCAzNTguOTU3LDE4My4xNTQgMzU2LjUsMTgyQyAzNDkuMTMxLDE4MS4zODMgMzQxLjc5OCwxODEuNzE3IDMzNC41LDE4M0MgMjY3LjUzMywyMDEuMjkgMjIwLjM2NiwyNDIuNDU2IDE5MywzMDYuNUMgMTY3LjQyNCwzODIuMzU4IDE3Ny40MjQsNDUzLjAyNSAyMjMsNTE4LjVDIDIzMy45NjEsNTMyLjYyOCAyNDYuMTI4LDU0NS42MjggMjU5LjUsNTU3LjVDIDI1OC45MzMsNTU5LjAzIDI1OC4yNjcsNTYwLjUzIDI1Ny41LDU2MkMgMjQ1LjA3Miw1NjkuNjA3IDIzNC4wNzIsNTc4Ljc3NCAyMjQuNSw1ODkuNUMgMTU1LjM2OCw1MzIuODY1IDEyMi44NjgsNDU5LjUzMiAxMjcsMzY5LjVDIDEzMC4zMjUsMjg2LjMzNCAxNjUuNDkyLDIyMC41IDIzMi41LDE3MkMgMjg0LjEwNiwxMzUuNzYzIDM0MS40NCwxMjAuNzYzIDQwNC41LDEyN0MgNDk0LjY5NSwxMzYuODIxIDU2My4xOTUsMTgwLjMyMSA2MTAsMjU3LjVDIDY0MC42MTIsMzE0LjM4NiA2NDguNjEyLDM3NC4zODYgNjM0LDQzNy41QyA2MjcuOTk5LDQ2NS4zNDQgNjE4LjE2Niw0OTEuNjc4IDYwNC41LDUxNi41IFoiLz48L2c+IDxnPjxwYXRoIHN0eWxlPSJvcGFjaXR5OjEiIGZpbGw9IiNmZWZlZmQiIGQ9Ik0gMzE2LjUsNTM2LjUgQyAzMTYuMDYzLDUzOC4wNzQgMzE1LjA2Myw1MzkuMjQxIDMxMy41LDU0MEMgMjk2LjU5Myw1NDQuMTIzIDI4MC41OTMsNTUwLjQ1NiAyNjUuNSw1NTlDIDI2My4zMDUsNTU5LjQwOSAyNjEuMzA1LDU1OC45MDkgMjU5LjUsNTU3LjVDIDI0Ni4xMjgsNTQ1LjYyOCAyMzMuOTYxLDUzMi42MjggMjIzLDUxOC41QyAxNzcuNDI0LDQ1My4wMjUgMTY3LjQyNCwzODIuMzU4IDE5MywzMDYuNUMgMjIwLjM2NiwyNDIuNDU2IDI2Ny41MzMsMjAxLjI5IDMzNC41LDE4M0MgMzQxLjc5OCwxODEuNzE3IDM0OS4xMzEsMTgxLjM4MyAzNTYuNSwxODJDIDM1OC45NTcsMTgzLjE1NCAzNTguOTU3LDE4NC40ODggMzU2LjUsMTg2QyAzMDEuNDc5LDIxMy4xOSAyNjUuNjQ2LDI1Ni4zNTcgMjQ5LDMxNS41QyAyMzUuMjM5LDM3My44MjkgMjQyLjU3Myw0MjkuMTYzIDI3MSw0ODEuNUMgMjg0LjI4Nyw1MDEuNDE4IDI5OS40NTMsNTE5Ljc1MiAzMTYuNSw1MzYuNSBaIi8+PC9nPiA8Zz48cGF0aCBzdHlsZT0ib3BhY2l0eTowLjk4OSIgZmlsbD0iIzQwNDAzZiIgZD0iTSA2MDQuNSw1MTYuNSBDIDU2MS40ODMsNTg3LjcyMyA0OTguNDgzLDYyOS41NTYgNDE1LjUsNjQyQyAzNjAuMzY1LDY0OS4wODkgMzA4LjAzMiw2NDAuMDg5IDI1OC41LDYxNUMgMjUzLjkwNiw2MTIuODgyIDI0OS45MDYsNjEwLjA0OCAyNDYuNSw2MDYuNUMgMjQ2LjQxNCw2MDUuNTA0IDI0Ni43NDgsNjA0LjY3MSAyNDcuNSw2MDRDIDI2MC41NDUsNTk5LjMxOSAyNzMuODc4LDU5NS42NTIgMjg3LjUsNTkzQyAzMTQuMTEyLDU4OS45MDcgMzQwLjc3OSw1ODcuNTc0IDM2Ny41LDU4NkMgMzcwLjU2Miw1ODQuOTM5IDM3My4wNjIsNTgzLjEwNiAzNzUsNTgwLjVDIDM4Ni4xMTIsNTY0Ljg4NiAzOTkuNjEyLDU1MS44ODYgNDE1LjUsNTQxLjVDIDQyNS45MTYsNTM0Ljk1OSA0MzYuOTE2LDUyOS40NTkgNDQ4LjUsNTI1QyA0OTYuMTE5LDUwOS40MTUgNTQ0Ljc4NSw1MDUuNDE1IDU5NC41LDUxM0MgNTk4LjA3LDUxMy43MzYgNjAxLjQwNCw1MTQuOTAzIDYwNC41LDUxNi41IFoiLz48L2c+IDxnPjxwYXRoIHN0eWxlPSJvcGFjaXR5OjAuOTk3IiBmaWxsPSIjY2I3ODEwIiBkPSJNIDQxNS41LDU0MS41IEMgMzk5LjYxMiw1NTEuODg2IDM4Ni4xMTIsNTY0Ljg4NiAzNzUsNTgwLjVDIDM3My4wNjIsNTgzLjEwNiAzNzAuNTYyLDU4NC45MzkgMzY3LjUsNTg2QyAzNDAuNzc5LDU4Ny41NzQgMzE0LjExMiw1ODkuOTA3IDI4Ny41LDU5M0MgMjczLjg3OCw1OTUuNjUyIDI2MC41NDUsNTk5LjMxOSAyNDcuNSw2MDRDIDI0Ni43NDgsNjA0LjY3MSAyNDYuNDE0LDYwNS41MDQgMjQ2LjUsNjA2LjVDIDIzOC40MDYsNjAxLjc5IDIzMS4wNzIsNTk2LjEyMyAyMjQuNSw1ODkuNUMgMjM0LjA3Miw1NzguNzc0IDI0NS4wNzIsNTY5LjYwNyAyNTcuNSw1NjJDIDI1OC4yNjcsNTYwLjUzIDI1OC45MzMsNTU5LjAzIDI1OS41LDU1Ny41QyAyNjEuMzA1LDU1OC45MDkgMjYzLjMwNSw1NTkuNDA5IDI2NS41LDU1OUMgMjgwLjU5Myw1NTAuNDU2IDI5Ni41OTMsNTQ0LjEyMyAzMTMuNSw1NDBDIDMxNS4wNjMsNTM5LjI0MSAzMTYuMDYzLDUzOC4wNzQgMzE2LjUsNTM2LjVDIDMzMi4yODEsNTMyLjk1NCAzNDguMjgxLDUzMS43ODcgMzY0LjUsNTMzQyAzODEuNjYsNTM1LjEzMyAzOTguNjYsNTM3Ljk2NyA0MTUuNSw1NDEuNSBaIi8+PC9nPiA8L3N2Zz4="/><text aria-hidden="true" x="555" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="650">OpenYellow</text><text x="555" y="140" transform="scale(.1)" fill="#fff" textLength="650">OpenYellow</text><text aria-hidden="true" x="${labelWidth * 10 + messageWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${place}</text><text x="${labelWidth * 10 + messageWidth * 5}" y="140" transform="scale(.1)" fill="#fff">${place}</text></g></svg>`;

        // Set cache headers (cache for 1 hour)
        res.set({
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600'
        });

        res.send(svg);

    } catch (error) {
        console.error('Error generating SVG badge:', error);
        res.status(500).send(
            '<svg xmlns="http://www.w3.org/2000/svg" width="117" height="20"><text x="10" y="15" fill="red">Error</text></svg>'
        );
    }
};

// Get badge JSON for repository (for shields.io compatibility)
exports.getBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const { group = '2' } = req.query; // group parameter for compatibility

        // Get repository place in ranking with multi-level sorting
        const [rows] = await pool.query(`
            SELECT 
                id,
                name,
                (SELECT COUNT(*) + 1 
                 FROM repos r2 
                 WHERE (r2.stars > r1.stars)
                    OR (r2.stars = r1.stars AND r2.forks > r1.forks)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate > r1.createddate)
                    OR (r2.stars = r1.stars AND r2.forks = r1.forks AND r2.createddate = r1.createddate AND r2.name < r1.name)
                ) as place
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
