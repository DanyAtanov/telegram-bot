const commands = (bot) => {
	bot.api.setMyCommands([
		{ command: 'reg', description: 'Учавствовать в розыгрыше' },
		{ command: 'pidor', description: 'Запустить лоттерею' },
		{ command: 'stats', description: 'Статистика' },
		{ command: 'delete', description: 'Сбежать с поля боя' },
	]);

	bot.command('start', async (ctx) => {
		await ctx.reply(
			'Узнаем кто пидор дня. Добавь бота в чат и присоединяйся к лотерее! 😎'
		);
	});

	bot.command('help', async (ctx) => {
		await ctx.reply('/reg - войти в игру \n /players - список игроков');
	});

	bot.command('reg', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();
		if (ctx.session.userList.includes(chatMember.user.first_name)) {
			await ctx.reply('Вы уже в игре!');
		} else {
			ctx.session.userList.push(chatMember.user.first_name);
			await ctx.reply(
				`Игрок ${chatMember.user.first_name} присоединяется к игре!`
			);
		}
	});

	bot.command('players', async (ctx) => {
		if (ctx.session.userList.length) {
			await ctx.reply(`Список игроков: ${ctx.session.userList}.`);
		} else {
			await ctx.reply('Еще никто не вступил в игру 🥺 \n /reg - войти в игру');
		}
	});

	bot.hears('пидор', async (ctx) => {
		await ctx.reply('А знаешь кто еще пидор дня?');
	});
};

module.exports.commands = commands;
