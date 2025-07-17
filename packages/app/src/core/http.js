import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Renders a server-side view component as a minified HTML string.
 * 
 * @param {string} viewName - Name of the view file (without extension).
 * @param {object} props - Props/data to pass to the view component.
 * @returns {Promise<string>} - Minified HTML string.
 */
async function render(viewName, props = {}) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const viewsPath = path.resolve(__dirname, '../views');
    function minify(html) {
        return html
            .replace(/\n/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    const viewPath = path.join(viewsPath, `${viewName}.js`);
    const { default: ViewComponent } = await import(viewPath);
    const html = ViewComponent(props);
    return minify(html);
}

/**
 * Wraps an async route handler to standardize HTTP responses.
 *
 * Supported return types from handler:
 * - `string`: Sent as plain text response (HTTP 200).
 * - `object`: Interpreted as a response object with optional fields:
 *    - `data`: If present, will be used; otherwise, the full object is treated as data.
 *    - `meta`: Optional metadata (e.g., pagination info), defaults to `null`.
 *    - `status`: Optional object with `{ code: number, message_client: string }`, 
 *      defaults to `{ code: 0, message_client: 'OK' }`.
 * - `null` or `undefined`: Responds with HTTP 204 No Content.
 *
 * @param {Function} handler - Async function `(req, res)` returning one of the supported types.
 * @returns {Function} Wrapped Express-compatible route handler with standardized response logic.
 */
function route(handler) {
    return async function (req, res, next) {
        try {
            const result = await handler(req, res);

            if (res.headersSent) return;

            if (typeof result === 'string') {
                res.status(200).send(result);
            } else if (typeof result === 'object' && result !== null) {
                const data = 'data' in result ? result.data : result;
                const meta = 'meta' in result ? result.meta : null;
                const status = 'status' in result ? result.status : {
                    code: 0,
                    message_client: 'OK',
                };

                res.status(200).json({ data, meta, status });
            } else if (result == null) {
                res.status(204).end();
            } else {
                res.status(200).send(String(result));
            }
        } catch (err) {
            next(err);
        }
    };
}


/**
 * Wraps all functions in a controller with the `route` helper.
 * 
 * @param {object} controller - Object containing multiple handler functions.
 * @returns {object} - Controller with each handler wrapped by `route`.
 */
function controller(controller) {
    const wrapped = {};
    for (const key in controller) {
        if (typeof controller[key] === 'function') {
            wrapped[key] = route(controller[key]);
        }
    }

    return wrapped;
}

export { render, route, controller };
