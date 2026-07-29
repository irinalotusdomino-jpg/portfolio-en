# Portfolio

A simple static portfolio site (HTML/CSS, no build step) for GitHub Pages, Netlify, or any static host.

## Structure

```
index.html                          — homepage with the project list
style.css                           — styles
telegram-worker/worker.js           — Cloudflare Worker: receives the contact form and forwards it to Telegram
telegram-worker/README.md           — setup instructions for the Worker
cases/ai-reels-creator.html         — case study: AI Reels Creator
cases/dr-macaron.html               — case study: Dr. Macaron
cases/englishgo.html                — case study: EnglishGo
cases/flight-dream.html             — case study: Flight Dream
cases/sensoryiq.html                — case study: sensoryIQ (children's development center)
cases/cleaning-service.html         — case study: cleaning service
cases/pip-orchard.html              — case study: Pip's Orchard (kids' site)
cases/sushi-delivery.html           — case study: sushi delivery
assets/screenshots/                 — project screenshots
```

## Publishing to GitHub Pages

1. Create a new **empty** repository on GitHub (no README, no .gitignore, to avoid conflicts), e.g. `portfolio`.
2. From this folder:
   ```
   git init
   git add -A
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/portfolio.git
   git push -u origin main
   ```
3. In the GitHub repository, open **Settings → Pages**.
4. Under **Source**, choose branch `main` and folder `/ (root)`, then **Save**.
5. In a minute or two, the site will be live at:
   `https://your-username.github.io/portfolio/`

**No git on your machine?** Use the web interface instead: in the empty GitHub repository, click "uploading an existing file" and drag in all the files from this folder (except `.git`), then repeat steps 3-5.

## "Discuss a project" / "Send" contact form

On the homepage, the "Discuss a project" button (hero section) and "Get in touch" (footer) open a
form with Name, Phone (format-checked), and a message field. The form posts to a small Cloudflare
Worker, which forwards the inquiry to Telegram — see `telegram-worker/README.md` for the full setup.

**Why not send straight from the site:** the Telegram bot token can't safely live in the site's
own code (anyone could view it in the page source). So the token lives only in Cloudflare's
environment variables, and the static site just calls a small serverless function that holds it.

**To get the form working, follow `telegram-worker/README.md`** — it walks through creating a
bot with @BotFather, deploying the Worker on Cloudflare (free), and adding the `TELEGRAM_ENDPOINT`
URL to `index.html`.

## Before publishing

- [ ] Set up the contact form per `telegram-worker/README.md` and update `TELEGRAM_ENDPOINT` in `index.html`.
- [ ] Optionally add more projects to the `.projects` section in `index.html` (copy a `.project-card` block).

## Current projects in the portfolio

1. AI Reels Creator — landing page for an AI content studio
2. Dr. Macaron — patisserie website
3. EnglishGo — English course
4. Pip's Orchard — interactive site for teaching English to children
5. Flight Dream — hot-air balloon flights
6. sensoryIQ — children's development center
7. Cleaning Service — apartment and office cleaning
8. Sushi Delivery — Japanese food delivery
