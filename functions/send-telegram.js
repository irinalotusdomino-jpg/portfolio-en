// Cloudflare Pages Function: /send-telegram
// (this file's path, functions/send-telegram.js, is automatically mapped
// by Cloudflare Pages to the route /send-telegram — no extra config needed)
//
// This keeps the Telegram bot token out of the browser entirely.
// The token and chat ID live only here, read from Cloudflare environment
// variables — never shipped to the client.
//
// SETUP (do this once in the Cloudflare dashboard for this Pages project):
// 1. Workers & Pages → your project → Settings → Environment variables
//    → Add variable (for both "Production" and "Preview"):
//      TELEGRAM_BOT_TOKEN = <your bot token from @BotFather>
//      TELEGRAM_CHAT_ID   = <your chat id>
// 2. Redeploy the site (Cloudflare picks up files under functions/
//    automatically on the next deploy).
// 3. No changes needed in index.html — it already calls /send-telegram

export async function onRequestPost(context) {
  const { request, env } = context;

  const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response(
      JSON.stringify({ ok: false, description: 'Server is missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, description: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const name = (data.name || '').toString().trim().slice(0, 200);
  const phone = (data.phone || '').toString().trim().slice(0, 50);
  const message = (data.message || '').toString().trim().slice(0, 1000);

  if (!name || !phone) {
    return new Response(
      JSON.stringify({ ok: false, description: 'Name and phone are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const text =
    'Portfolio inquiry\n' +
    'Name: ' + name + '\n' +
    'Phone: ' + phone + '\n' +
    'Message: ' + (message || '—');

  try {
    const res = await fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
    });
    const result = await res.json();

    if (result.ok) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(
      JSON.stringify({ ok: false, description: result.description || 'Telegram API error' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, description: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
