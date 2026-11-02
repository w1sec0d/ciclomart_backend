# CicloMart — Backend Roadmap

Planned work for the CicloMart backend (Node.js/Express + MySQL). Rough effort estimates are in hours.

## Testing & quality
- [ ] Raise Jest coverage across controllers, middleware, and routes (unit + integration with a test DB) (~10h)
- [ ] Add CI that runs `npm test` and lint on every push (currently only deploys) (~2h)

## Validation & security
- [ ] Add request validation (Joi/Zod) to every route, replacing ad-hoc checks (~5h)
- [ ] Add `helmet`, `express-rate-limit`, and stricter CORS configuration (~3h)
- [ ] Audit and update dependencies (`npm audit`) and replace the deprecated `crypto` npm package (~2h)
- [ ] Rotate JWT refresh tokens and support session revocation (~4h)

## Observability
- [ ] Structured logging (pino) replacing `console`/`morgan` (~3h)
- [ ] Add a `/health` endpoint and graceful shutdown (~2h)

## API & documentation
- [ ] Publish an OpenAPI/Swagger spec for all endpoints (~5h)
- [ ] Document the MercadoPago webhook contract (~2h)

## Data & operations
- [ ] Introduce versioned database migrations (currently a single `dbCreation.sql`) (~5h)
- [ ] Add a Dockerfile and `docker-compose` with MySQL for local development (~3h)
- [ ] Finish AWS KMS integration in production and document key rotation (~5h)

## Product features
- [ ] Saved searches and price-drop notification jobs (~8h)
- [ ] In-app messaging endpoints (~8h)
- [ ] Seller analytics endpoints (~6h)
