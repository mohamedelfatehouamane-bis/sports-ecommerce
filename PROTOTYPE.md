# Database-Free Prototype Documentation

## 1. Applications Found
- **Online Sport Shop** - A Next.js 14 based e-commerce storefront with an admin dashboard.

## 2. Database Dependencies Removed
The following dependencies were successfully removed from `package.json` to ensure the prototype runs entirely in-memory:
- `prisma` (and all generated clients: `@prisma/client`, `@prisma/adapter-pg`)
- `pg` (and `@types/pg`)
- `@supabase/ssr`
- `@supabase/supabase-js`

## 3. Configuration or API Keys Replaced
- The `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables are no longer required to run the prototype.
- Supabase storage logic in `app/actions/media.ts` was mocked to return a placeholder image url (`/logo.png`) or `mock.png`.
- The Firebase initialization still runs for push notifications, but will gracefully skip if no credentials are provided.

## 4. Workarounds Implemented
A completely in-memory mock data layer was constructed in `lib/data/` and `lib/mock/` to emulate database functionality while staying within Next.js API constraints.

Key aspects of the workaround include:
1. **In-Memory Store:**
   - Static lists of Categories, Products, and Orders are loaded from `lib/mock/`.
   - Reusable CRUD functions (e.g., `db.getProducts`, `db.upsertProduct`, `db.createOrder`) are exported from `lib/data/index.ts`.

2. **Decoupled API Routes & Server Actions:**
   - Instead of importing `prisma` from `lib/db.ts`, files now import the data layer module: `import * as db from '@/lib/data'`.
   - The original Prisma syntax (like `$transaction`, `findMany({ include: { ... } })`, `updateMany`) was replaced with specialized synchronous and asynchronous array logic that mimics real SQL relations.

3. **Complex Transactions Mocked:**
   - Deep nested updates, like creating an order and decrementing stock simultaneously (`app/actions/guest-checkout.ts`), are replicated in the mock data layer using array mutations.

4. **Testing and Verification:**
   - Verified that `tsc --noEmit` and `npm run lint` execute successfully without any unresolved Prisma types.
   - Built the app using `npm run build` without the `npx prisma generate` step.

This ensures the repository can be used purely as a UI prototype/template without requiring any external cloud resources.
