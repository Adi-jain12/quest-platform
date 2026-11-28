# Quest client

The Quest client is a Next.js app with an Explore experience and email-first authentication backed by the existing GraphQL API.

## Getting started

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GRAPHQL_URL` to the server's GraphQL endpoint. The server defaults to `http://localhost:4000/graphql`.

Then start the client:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore activities. Sign in at `/login`. Apollo Client sends credentials so the server-managed refresh-token cookie can be used. Access tokens are kept in memory only.

The server's `CLIENT_URL` must allow the client origin with credentials enabled for refresh-cookie requests to work.

Explore currently uses mock activity data shaped around the server's `Activity` fields. Demo pricing and popularity values are presentation-only because the current GraphQL schema does not expose them.
