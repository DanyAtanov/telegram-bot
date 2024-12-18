const testCommands = (bot) => {
	bot.command('reset', async (ctx) => {
		ctx.session.lastTime = 0;
		ctx.session.userList = [];
		ctx.session.winList = [];
		ctx.session.todayPidor = null;

		await ctx.reply('Очистка сессии. Данные игры обнулены.');
	});

	bot.command('user', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();

		await ctx.reply(chatMember.user);
	});

	bot.command('testList', async (ctx) => {
		ctx.session.todayPidor = null;
		ctx.session.winList = [];
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

	bot.command('listLength', async (ctx) => {
		await ctx.reply(`userList.length: ${ctx.session.userList.length}`);
	});

	bot.command('lastItem', async (ctx) => {
		await ctx.reply(
			`userList[last]: ${
				ctx.session.userList[ctx.session.userList.length - 1].name
			}`
		);
	});

	bot.command('lastTime', async (ctx) => {
		await ctx.reply(`lastTime: ${ctx.session.lastTime}`);
	});

	bot.command('todayPidor', async (ctx) => {
		await ctx.reply(`TodayPidor: ${ctx.session.todayPidor.name}`);
	});

	bot.command('getSessionKey', async (ctx) => {
		await ctx.reply(`SessionKey: ${ctx.chat?.id.toString()}`);
	});
};

module.exports.testCommands = testCommands;
