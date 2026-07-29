/**
 * Portfolio — receives the contact-form submission from the site and
 * forwards it to Telegram.
 *
 * SETUP (do this once when deploying):
 * 1. Create a bot with @BotFather in Telegram → you'll get a BOT_TOKEN.
 * 2. Send the bot any message (or add it to the chat/channel you want).
 * 3. Find your CHAT_ID:
 *      open https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
 *      and look for "chat":{"id":...}
 * 4. In Cloudflare Workers → Settings → Variables, add secrets:
 *      BOT_TOKEN = your bot token
 *      CHAT_ID   = the chat/channel id to send inquiries to
 *      ALLOWED_ORIGIN = your site's address (e.g. https://username.github.io)
 *
 * TO POINT THIS AT A DIFFERENT PERSON/BUSINESS:
 * Just change the CHAT_ID (and optionally BOT_TOKEN) value in Variables —
 * no need to touch the code below. You can also run several Workers with
 * different CHAT_IDs for different clients and switch a site between them
 * by changing TELEGRAM_ENDPOINT in that site's script.
 */

export default {
  async fetch(request, env) {
    // Only allow requests from your site (CORS)
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders });
    }

    const name = (data.name || '').toString().trim().slice(0, 200);
    const phone = (data.phone || '').toString().trim().slice(0, 60);
    const message = (data.message || '').toString().trim().slice(0, 1000);

    // Server-side phone check (mirrors the client-side one, since the
    // client-side check is easy to bypass) — requires 10-15 digits,
    // not all identical.
    const digitsOnly = phone.replace(/[^\d]/g, '');
    const looksLikePhone =
      /^[\d\s()+-]+$/.test(phone) &&
      digitsOnly.length >= 10 &&
      digitsOnly.length <= 15 &&
      !/^(\d)\1+$/.test(digitsOnly);

    if (!name || !looksLikePhone) {
      return new Response('Invalid data', { status: 422, headers: corsHeaders });
    }

    const text =
      `📩 New portfolio inquiry\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      (message ? `💬 Message: ${message}\n` : '');

    const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
      }),
    });

    if (!tgRes.ok) {
      return new Response('Failed to notify', { status: 502, headers: corsHeaders });
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  },
};
