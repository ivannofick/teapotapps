import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

/**
 * Renders a server-side view component as a minified HTML string.
 * 
 * @param {string} viewName - Name of the view file (without extension).
 * @param {object} props - Props/data to pass to the view component.
 * @returns {Promise<string>} - Minified HTML string.
 */
async function render(res, viewName, props = {}) {
    const defaultSrcViews = path.resolve(process.cwd(), 'src/views');
    const defaultViews = path.resolve(process.cwd(), 'views');
    const viewsPath = props.viewsDir || defaultSrcViews;
    function minify(html) {
        return html
            .replace(/\n/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    const viewPath = path.join(viewsPath, `${viewName}.js`);
    const { default: ViewComponent } = await import(pathToFileURL(viewPath).href);
    const html = ViewComponent(props);
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(minify(html));
}

export { render };
