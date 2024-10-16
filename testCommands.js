const testCommands = (bot) => {
	bot.command('reset', async (ctx) => {
		ctx.session.lastTime = 0;
		ctx.session.userList = [];
		ctx.session.winList = [];

		await ctx.reply('Очистка сессии. Данные игры обнулены.');
	});

	bot.command('user', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();

		await ctx.reply(chatMember.user);
	});

	bot.command('players', async (ctx) => {
		await ctx.reply(`userList: ${ctx.session.userList}`);
	});

	bot.command('testList', async (ctx) => {
		ctx.session.lastTime = 0;
		ctx.session.userList = [
			{ id: 0, name: 'Владимир Путин', nickName: 'putin_test_2024', wins: 0 },
			{
				id: 1,
				name: 'Виталька Милонов',
				nickName: 'milonov_test_2024',
				wins: 0,
			},
			{ id: 2, name: 'Лоза', nickName: 'loza_loza_test_2024', wins: 0 },
			{ id: 3, name: 'Катюшка', nickName: 'katka_test_2024', wins: 0 },
			{ id: 4, name: 'Валентина', nickName: 'valya_test_2024', wins: 0 },
		];

		await ctx.reply('Сгенерирован список игроков для тестирования');
	});

	bot.command('test', async (ctx) => {
		await ctx.reply(`userList.length: ${ctx.session.userList.length}`);
	});
};

module.exports.testCommands = testCommands;
