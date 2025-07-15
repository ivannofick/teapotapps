const minifyHtml = (html) => {
  return html
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

const generateHtml = () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>I'm a ${APP_NAME}</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕️</text></svg>">
        <style>
          body {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background-color: #f2f2f2;
            text-align: center;
            padding: 50px;
            color: #555;
          }
          h1 {
            font-size: 3em;
            color: #d2691e;
          }
          p {
            font-size: 1.2em;
          }
          .teapot {
            margin-top: 20px;
            font-size: 5em;
          }
        </style>
      </head>
      <body>
        <h1>418 I'm a ${APP_NAME} ☕️</h1>
        <p>Sorry, I cannot brew coffee because I'm a teapot.</p>
        <div class="teapot">🫖</div>
      </body>
    </html>
  `;
}

export const wellcome = (req, res) => {
  const html = minifyHtml(generateHtml());
  res.status(200).send(html);
};

const WelcomeController = {
  wellcome
};

export default WelcomeController;
