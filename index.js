const { Bot, GrammyError, HttpError } = require("grammy");
const moment = require("moment-timezone");
const config = require("./config"); 

const bot = new Bot(config.BOT_TOKEN);

console.log("Bot Token:", config.BOT_TOKEN);

let flag = false;

bot.catch((error) => {
    console.log(`Error while handling update ${error.ctx.update.update_id}:`);
    if (error.error instanceof GrammyError) {
        console.log("Error in request:", error.error.description);
    } else if (error.error instanceof HttpError) {
        console.log("Could not contact Telegram:", error.error);
    } else {
        console.log("Unknown error:", error.error);
    }
});

bot.use(async (ctx, next) => {
    if (ctx.chat.type === "private") return await next();
});

bot.command("start", async (ctx) => {
    if (ctx.from.id === config.ADMIN_ID) {
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
            reply_parameters: { message_id: ctx.message.message_id },
        });
    }
});

bot.callbackQuery(/^process (start|stop)$/, async (ctx) => {
    flag = ctx.callbackQuery.data.split(" ")[1] === "start";
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



function getPrediction() {
    const array = ["BIG", "SMALL"];
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function getTime() {
    const currentDate = moment.tz("India/Kolkata");
    return currentDate.format("yyyy-MM-dd HH:mm");
}

async function sendMessage() {
    const period = getPeriod();
    const prediction = getPrediction();
    const time = getTime();

    await bot.api.sendMessage(
        config.CHANNEL,
        `<b>❤️ DM WIN PREDICTION:</b>\n<b>🕹 Gᴀᴍᴇ :</b> Wɪɴɢᴏ 1 Mɪɴ \n<b>📟 Pᴇʀɪᴏᴅ Nᴏ :</b> ${period}\n<b>🎰 Pʀᴇᴅɪᴄᴛɪᴏɴ </b>: ${prediction}\n<b>✅ MANAGE FUND UP TO LEVEL 7</b>`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Register This Link", url: "https://www.dmwin3.com/#/register?invitationCode=15256898639" }],
                    [{ text: "DmWin Register Link", url: "https://www.dmwin3.com/#/register?invitationCode=15256898639" }]
                ]
            }
        }
    );
}


async function startProcess() {
    const currentTime = moment.tz("Asia/Kolkata");
    const currentSeconds = currentTime.seconds();
    const msUntilNextMinute = (60 - currentSeconds) * 1000;
    await new Promise((resolve) => setTimeout(resolve, msUntilNextMinute));
    setInterval(async () => {
        if (flag) await sendMessage();
    }, 60000);
}

bot.start({
    drop_pending_updates: true,
    onStart: async () => {
        await startProcess();
        console.log("Bot Started...");
    },
});
