require('dotenv').config();
const { Bot, MemorySessionStorage, session } = require('grammy');
const { chatMembers } = require('@grammyjs/chat-members');
const { freeStorage } = require('@grammyjs/storage-free');
const adapter = new MemorySessionStorage();
const bot = new Bot(process.env.BOT_API_KEY);
const { commands } = require('./commands');
const { testCommands } = require('./testCommands');

bot.use(
	chatMembers(adapter),
	session({
		initial: () => ({ userList: [], winList: [], lastTime: 0 }),
		storage: freeStorage(bot.token),
	})
);

bot.start({
	// Make sure to specify the desired update types
	allowed_updates: ['chat_member', 'message'],
});

bot.catch((err) => console.error(err));

commands(bot);
testCommands(bot);
