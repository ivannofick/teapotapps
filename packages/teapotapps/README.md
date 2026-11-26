# ☕ TeapotApps Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ivannofick/teapotapps/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/teapotapps.svg)](https://www.npmjs.com/package/teapotapps)

Official runtime framework and opinionated Express primitives for TeapotApps applications.

## Installation

```bash
npm install teapotapps
```

Want to scaffold a full TeapotApps project? Use the CLI package [`create-teapotapps`](https://www.npmjs.com/package/create-teapotapps):

```bash
npm create teapotapps@latest my-app
```

## Features

- **Express App Factory**: Pre-configured Express setup (`createTeapotApp`) and global error handler (`defaultErrorHandler`).
- **Standard REST API Response**: Consistent `{ data, meta, status }` response structure via `responseApi`.
- **Routing Group**: Modular route prefixes and middleware grouping via `routeGroup`.
- **Declarative Validator**: Request schema validation with `validate` and built-in `rules`.
- **Async Handler**: Automatic promise error forwarding with `asyncHandler`.
- **JWT & Auth Middlewares**: Built-in `validateApiKey`, `verifyToken`, `verifyTokenVisitor`, `checkRole`, and `signVisitorToken`.
- **Utilities**: Pagination (`paginate`, `paginateQuery`), timezone helper (`TimeHandler`), request `logger`, and lightweight SSR `render`.

## Usage Example

```javascript
import { Router } from 'express';
import {
  createTeapotApp,
  defaultErrorHandler,
  routeGroup,
  responseApi,
  asyncHandler,
  verifyToken,
  checkRole
} from 'teapotapps';

const app = createTeapotApp();
const router = Router();

routeGroup(router, '/api/v1', [], (api) => {
  api.get('/health', asyncHandler(async (req, res) => {
    return responseApi(res, { status: 'healthy' }, null, 'System is operational');
  }));

  api.get('/admin', verifyToken, checkRole([1]), asyncHandler(async (req, res) => {
    return responseApi(res, { user: req.user }, null, 'Authorized');
  }));
});

app.use(router);
app.use(defaultErrorHandler);
```

## Repository

Source code, CLI scaffolder, and starter templates live in the [ivannofick/teapotapps](https://github.com/ivannofick/teapotapps) monorepo.
