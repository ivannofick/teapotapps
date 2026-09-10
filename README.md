# ☕ TeapotApps Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/teapotapps.svg)](https://www.npmjs.com/package/teapotapps)

TeapotApps is a lightweight Node.js framework built with ECMAScript Modules (ESM). It provides a structured foundation for building backend APIs and server-rendered web applications.

---

## ✨ Features

- Native ESM support
- Modular layout: controllers, routes, middlewares, services, and views
- Route grouping support
- Built-in CORS and request logging
- PostgreSQL and Nodemailer scaffolding options
- Ready-to-use development server on port 3010

---

## 📦 Getting Started

You can scaffold a new project directly without installing anything globally:

### Option 1: Using `npm create` (Recommended)

```bash
npm create teapotapps@latest my-app
```

### Option 2: Using `npx`

```bash
npx create-teapotapps my-app
```

### Option 3: Global CLI Installation

```bash
npm install -g teapotapps
teapotapps create my-app
```

*(You can also use `create-teapotapps my-app` or `teapotapps my-app`)*

---

## ▶️ Running Development Server

Once your project has been generated:

```bash
cd my-app
npm run dev
```

Or using the CLI:

```bash
teapotapps dev
```

The application will start at:

```
http://localhost:3010
```

---

## 🤝 Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request.

### Contributors

[![Contributor](https://github.com/ivannofick.png?size=40)](https://github.com/ivannofick)

---

## 📄 License

This project is licensed under the MIT License.
