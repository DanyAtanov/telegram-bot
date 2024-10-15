
require('dotenv').config();
const { Bot } = require('grammy');
const bot = new Bot(process.env.BOT_API_KEY);
bot.start();


const start = bot.command('start', async (ctx) => {
	await ctx.reply(
		'Привет! Я - Frontend Interview Prep Bot 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду'
	);
});

const commandHear = bot.hears('HTML', async (ctx) => {
	await ctx.reply('Какой тег используется для создания ссылки?');
});

const help = bot.command('help', async (ctx) => {
	await ctx.reply('Вам требуется помощь?');
});
