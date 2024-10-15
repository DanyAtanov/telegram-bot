const commands = (bot) => {
	bot.command('start', async (ctx) => {
		await ctx.reply('Узнаем кто пидор дня. Присоединяйся к лотерее! 😎 \n\n /reg - войти в игру');
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
};

module.exports.commands = commands;
