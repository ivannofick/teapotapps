export default async function () {
  console.log(`
🫖 TeapotApps CLI Help

Usage:
  teapotapps create <project-name>   Create a new TeapotApp project
  teapotapps dev                     Start the development server
  teapotapps generate <KEY>          Generate a secret for a specific key in .env
  teapotapps generate ALL            Create or update .env with default values
  teapotapps help                    Show this help message
  teapotapps --version, -v           Show version info

Happy brewing! ☕
  `);
}
