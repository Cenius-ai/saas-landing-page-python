# INSTALL.md — Loom Landing Page

This is a static site with **zero dependencies**. No package manager, no build step.

## 1. Serve the site

```bash
python3 -m http.server 8000
```

Then visit **http://localhost:8000**.

Any static file server works — `npx serve .`, `python3 -m http.server`, or deploy to Netlify/Vercel/GitHub Pages.

## 2. Production deployment

Upload the entire directory to any static hosting provider. The entry point is `index.html` at the project root. All asset paths are relative.

No environment variables, no database, no secrets are required.
