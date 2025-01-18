require("dotenv/config");
const { Bot, GrammyError, HttpError } = require("grammy");
const moment = require("moment-timezone");

const bot = new Bot(process.env.BOT_TOKEN);

let flag = false;

// Error handling
bot.catch((error) => {
    console.error(`Error while handling update ${error.ctx.update.update_id}:`, error.error);
});

// Middleware for private chats
bot.use(async (ctx, next) => {
    if (ctx.chat.type === "private") return await next();
});

// Start command
bot.command("start", async (ctx) => {
    if (ctx.from.id === parseInt(process.env.ADMIN_ID, 10)) {
        await ctx.reply("<b>🎛 Admin Panel</b>", {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `${flag ? "🛑 Stop" : "🚀 Start"}`,
                            callback_data: `process ${flag ? "stop" : "start"}`,
                        },
                    ],
                ],
            },
        });
    } else {
        await ctx.reply("<b>❗ You can't use this bot</b>", {
            parse_mode: "HTML",
        });
    }
});

// Handle inline button callbacks
bot.callbackQuery(/^process (start|stop)$/, async (ctx) => {
    flag = ctx.callbackQuery.data.includes("start");
    await ctx.editMessageText("<b>🎛 Admin Panel</b>", {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `${flag ? "🛑 Stop" : "🚀 Start"}`,
                        callback_data: `process ${flag ? "stop" : "start"}`,
                    },
                ],
            ],
        },
    });
});

// Function to send predictions
async function sendMessage() {
    const period = getPeriod();
    const prediction = getPrediction();
    const time = getTime();

    await bot.api.sendMessage(
        process.env.CHANNEL,
        `<b>❤️ 91 CLUB PREDICTION:</b>\n<b>🕹 Gᴀᴍᴇ :</b> Wɪɴɢᴏ 1 Mɪɴ\n<b>📟 Pᴇʀɪᴏᴅ Nᴏ :</b> ${period}\n<b>🎰 Pʀᴇᴅɪᴄᴛɪᴏɴ </b>: ${prediction}\n<b>✅ MANAGE FUND UP TO LEVEL 7</b>`,
        { parse_mode: "HTML" }
    );
}

// Start periodic messaging
async function startProcess() {
    const currentTime = moment.tz("Asia/Kolkata");
    const currentSeconds = currentTime.seconds();
    const msUntilNextMinute = (60 - currentSeconds) * 1000;

    await new Promise((resolve) => setTimeout(resolve, msUntilNextMinute));

    setInterval(async () => {
        if (flag) await sendMessage();
    }, 60000);
}

// Bot initialization
bot.start({
    drop_pending_updates: true,
    onStart: async () => {
        await startProcess();
        console.log("Bot started...");
    },
});
