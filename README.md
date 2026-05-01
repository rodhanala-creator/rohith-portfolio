# Rohith Dhanala — Portfolio

One-page portfolio for AI automation and digital operations services for small businesses.

## Live

- **GitHub Pages:** https://rohithdhanala.github.io/rohith-portfolio/
- **Netlify:** https://rohithdhanala-portfolio.netlify.app/

## Stack

Static HTML + CSS + a touch of vanilla JS. No build step — just open `index.html`.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

- Pushes to `main` are automatically published by GitHub Pages.
- Netlify is connected to the same repo and redeploys on every push.

## Custom domain

See `DOMAIN.md` for full step-by-step instructions to point `rohithdhanala.com`
(or any domain) at GitHub Pages and/or Netlify with automatic HTTPS.

## Structure

```
.
├── index.html      # all sections (hero, services, work, about, process, contact)
├── styles.css      # design system + layout
├── netlify.toml    # Netlify config (HTTPS, security headers, redirects)
└── README.md
```
