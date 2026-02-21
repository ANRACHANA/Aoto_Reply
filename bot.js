// ================== IMPORTS ==================
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// ================== CONFIG ==================
const TOKEN       = process.env.TOKEN;
const PORT        = process.env.PORT || 3000;
const FB_PAGE     = process.env.FB_PAGE;
const ADMIN_LINK  = process.env.ADMIN_LINK; // mini-app link (HTTPS)
const REPLY_DELAY = Number(process.env.REPLY_DELAY) || 5000; // 5s default

if (!TOKEN) {
  console.error('❌ TOKEN is missing');
  process.exit(1);
}

// ================== EXPRESS (Health Check) ==================
const app = express();
app.get('/', (req, res) => res.send('✅ Telegram Bot is running'));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ================== TELEGRAM BOT ==================
const bot = new TelegramBot(TOKEN, { polling: true });

// Delay helper
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ================== ACTIVE CHAT TRACKER ==================
const activeChats = new Set();

// ================== MESSAGE HANDLER ==================
bot.on('message', async (msg) => {
  // Only respond to text messages
  if (!msg.text) return;

  const chatId = msg.chat.id;

  // Prevent spamming if user sends multiple messages fast
  if (activeChats.has(chatId)) return;
  activeChats.add(chatId);

  const username = msg.from.username ? '@' + msg.from.username : msg.from.first_name;

  try {
    // 1️⃣ Show typing
    await bot.sendChatAction(chatId, 'typing');

    // 2️⃣ Wait delay
    await delay(REPLY_DELAY);

    // 3️⃣ Build buttons safely
    const buttonsArray = [];
    if (FB_PAGE) buttonsArray.push({ text: '📘 Facebook Page', url: FB_PAGE });
    if (ADMIN_LINK) buttonsArray.push({ text: '👤 Admin', web_app: { url: ADMIN_LINK } });

    const BUTTONS = {
      reply_markup: buttonsArray.length ? { inline_keyboard: [buttonsArray] } : undefined
    };

    // 4️⃣ Send reply
    await bot.sendMessage(
      chatId,
      `សួស្តី! ${username} 👋
យើងខ្ញុំនឹងតបសារឆាប់ៗនេះ សូមអធ្យាស្រ័យចំពោះការឆ្លើយយឺត។
I will reply shortly. Thank you 💙🙏`,
      BUTTONS
    );

    console.log(`✅ Replied to ${username}`);

  } catch (err) {
    console.error('❌ Error sending message:', err);
  } finally {
    // Allow next message from user to trigger reply
    activeChats.delete(chatId);
  }
});
