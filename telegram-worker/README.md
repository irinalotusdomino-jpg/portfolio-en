# Connecting the site's contact form to Telegram

The site is static (GitHub Pages / Netlify / any static host), so the form
can't send anything on its own. `worker.js` is a small, free "bridge" on
Cloudflare Workers that receives the form data and forwards it to Telegram.

## Step 1. Create a bot
1. In Telegram, open **@BotFather** → `/newbot` → give it a name.
2. You'll get a **BOT_TOKEN** (looks like `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxx`).
3. Send the new bot any message (e.g. "hi") — this lets the bot "see" your chat.

## Step 2. Find your CHAT_ID
Open in your browser:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```
In the response, find `"chat":{"id": 123456789, ...}` — that's your **CHAT_ID**.

(If you want inquiries to land in a group chat instead — add the bot to the
group, send something there, and the group's id will be a negative number
like `-100123456789`.)

## Step 3. Deploy the Worker on Cloudflare (free)
1. Sign up at https://dash.cloudflare.com (free plan works fine).
2. Workers & Pages → Create → Create Worker.
3. Give it a name, e.g. `portfolio-contact-form`.
4. Open the Worker's code editor, paste in the contents of `worker.js`
   from this folder. Deploy.
5. Settings → Variables and Secrets → add:
   - `BOT_TOKEN` = the token from Step 1
   - `CHAT_ID` = the id from Step 2
   - `ALLOWED_ORIGIN` = your site's address, e.g. `https://username.github.io`
     (or `*` while testing)
6. Save and redeploy if prompted.

After deploying, Cloudflare gives you a URL like:
```
https://portfolio-contact-form.YOUR-SUBDOMAIN.workers.dev
```

## Step 4. Point the site at the URL
In `index.html`, find the line:
```js
const TELEGRAM_ENDPOINT = 'https://portfolio-contact-form.YOUR-SUBDOMAIN.workers.dev';
```
and replace it with the URL Cloudflare gave you. That's it — the form is
ready, and inquiries will land in Telegram instantly.

## Switching to a different person/business later
Two options — use whichever fits:

- **Simplest:** in Cloudflare Workers → Settings → Variables, change the
  `CHAT_ID` value (and `BOT_TOKEN` if needed). No need to touch the code or
  the site — new inquiries start landing in the new chat right away.

- **If you need to run several clients at once:** deploy another Worker
  with the same code but a different `BOT_TOKEN`/`CHAT_ID`, and point that
  client's `index.html` at its own `TELEGRAM_ENDPOINT`.

## Phone number check
The form (both on the site and in the Worker, for reliability) checks that
the "Phone" field has 10-15 digits (with `+`, spaces, parentheses, and
dashes allowed) and that it isn't a run of identical digits. Clearly
invalid values (letters, "1111111111", short strings like "123") are
rejected with an error message, and nothing is sent.
