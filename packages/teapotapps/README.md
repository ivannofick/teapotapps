# TeapotApps Framework

Official runtime framework and opinionated Express primitives for TeapotApps applications.

## Installation

```bash
npm install teapotapps
```

## Features

- **Standard REST API Response**: Consistent `{ data, meta, status }` response structure via `responseApi`.
- **Routing Group**: Modular route prefixes and middleware grouping via `routeGroup`.
- **Declarative Validator**: Request schema validation with `validate` and built-in `rules`.
- **Async Handler**: Automatic promise error forwarding with `asyncHandler`.
- **JWT & Auth Middlewares**: Built-in `verifyToken` and `JwtHandlers`.
- **SSR Helper**: Lightweight HTML rendering helper with `render`.

## Usage Example

```javascript
import { Router } from 'express';
import { routeGroup, responseApi, asyncHandler, validate, rules } from 'teapotapps';

const router = Router();

routeGroup(router, '/api/v1', [], (api) => {
  api.get('/health', asyncHandler(async (req, res) => {
    return responseApi(res, { status: 'healthy' }, null, 'System is operational');
  }));
});

export default router;
```
