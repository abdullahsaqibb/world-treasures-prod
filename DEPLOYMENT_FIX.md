# Fix: missing lucide-react / old storefront.tsx build

The build error `src/components/storefront.tsx: Cannot find module lucide-react` is from the obsolete **Phase 1 Starter**, not this approved HTML parity project. This package deliberately does not include `src/components/storefront.tsx` or depend on lucide-react.

## Correct deployment procedure
1. In the GitHub production repository, remove all old starter files (especially `src/components/storefront.tsx`, `src/lib/catalog.ts`, `src/data/products.json`, obsolete `vercel.json`, and previous source files). Replacing files without deleting old ones leaves TypeScript compiling stale files.
2. Upload **all** files from the root of this package, with `src/`, `public/`, `package.json`, and `next.config.ts` at the repository root.
3. In Vercel set Framework Preset to Next.js and Root Directory to the repository root. Do not use the static HTML prototype build/output settings.
4. Redeploy with a clean build cache (or run `npm install && npm run build` locally).

## Expected files
- `src/app/page.tsx` imports `ApprovedRegions` and `LegacyRuntime`.
- `src/components/ApprovedRegions.tsx`
- `src/components/LegacyRuntime.tsx`
- `public/legacy/*`
- `src/app/globals.css`

If Vercel still reports an error in `src/components/storefront.tsx`, the old file remains in the GitHub branch that Vercel is building, or Vercel points at a different repository/branch. This ZIP does not contain that file.

Note: The package has been checked structurally, but a full Next.js build could not be run in this workspace because npm dependencies are not installed.
