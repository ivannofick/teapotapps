import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Renders a server-side view component as a minified HTML string.
 * 
 * @param {string} viewName - Name of the view file (without extension).
 * @param {object} props - Props/data to pass to the view component.
 * @returns {Promise<string>} - Minified HTML string.
 */
async function render(res, viewName, props = {}) {
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
    console.log("html", html)
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(minify(html));
}

export { render };
