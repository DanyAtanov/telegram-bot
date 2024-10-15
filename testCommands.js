const testCommands = (bot) => {
	bot.command('test@reset', async (ctx) => {
		ctx.session.count = 0;
		ctx.session.userList = [];

		await ctx.reply('Очистка сессии. Данные игры обнулены.');
	});

	bot.command('test@user', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();

		await ctx.reply(chatMember.user);
	});

	bot.command('test@name', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();

		await ctx.reply(chatMember.user.first_name);
	});
};

module.exports.testCommands = testCommands;
