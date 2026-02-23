require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// ================== CONFIG ==================
const TOKEN       = process.env.TOKEN;
const PORT        = process.env.PORT || 3000;
const FB_PAGE     = process.env.FB_PAGE;
const ADMIN_LINK  = process.env.ADMIN_LINK;
const WEB_APP_URL = process.env.WEB_APP_URL;
const REPLY_DELAY = Number(process.env.REPLY_DELAY) || 5000; // ms

if (!TOKEN) {
  console.error('❌ TOKEN is missing');
  process.exit(1);
}

// ================== EXPRESS ==================
const app = express();
app.get('/', (req, res) => res.send('✅ Telegram Bot is running'));
app.listen(PORT, () =>
  console.log(`🌐 Web server running on port ${PORT}`)
);

// ================== TELEGRAM BOT ==================
const bot = new TelegramBot(TOKEN, { polling: true });

// ================== HELPERS ==================
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Typing loop helper
const startTyping = (chatId, interval = 4000) => {
  const timer = setInterval(() => {
    bot.sendChatAction(chatId, 'typing').catch(() => {});
  }, interval);
  return timer;
};

// ================== BUTTONS ==================
const BUTTONS = {
  reply_markup: {
    inline_keyboard: [
      ...(WEB_APP_URL
        ? [[{ text: '🌐 Open App', web_app: { url: WEB_APP_URL } }]]
        : []),
      [
        ...(FB_PAGE ? [{ text: '📘 Facebook Page', url: FB_PAGE }] : []),
        ...(ADMIN_LINK ? [{ text: '👤 Admin', url: ADMIN_LINK }] : [])
      ]
    ]
  }
};

// ================== MESSAGE HANDLER ==================
bot.on('message', async (msg) => {
  if (!msg.text) return;
  if (msg.from.is_bot) return;

  const chatId = msg.chat.id;
  const username = msg.from.username
    ? '@' + msg.from.username
    : msg.from.first_name;

  let typingTimer;

  try {
    // ▶️ Start typing animation
    typingTimer = startTyping(chatId);

    // ⏳ Wait delay
    await delay(REPLY_DELAY);

    // ⏹ Stop typing
    clearInterval(typingTimer);

    // 📩 Send auto reply
    await bot.sendMessage(
      chatId,
`សួស្តី! ${username} 👋
យើងខ្ញុំនឹងតបសារឆាប់ៗនេះ សូមអធ្យាស្រ័យចំពោះការឆ្លើយយឺត។
I will reply shortly. Thank you 💙🙏`,
      BUTTONS
    );

    console.log(`✅ Replied to ${username}`);

  } catch (err) {
    if (typingTimer) clearInterval(typingTimer);
    console.error('❌ Error:', err.message);
  }
});
