const commands = (bot) => {
	bot.api.setMyCommands([
		{ command: 'reg', description: 'Учавствовать в розыгрыше' },
		{ command: 'pidor', description: 'Запустить лотерею' },
		{ command: 'pidorstats', description: 'Результаты игры' },
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
		let isNewPlayer = true;

		if (!ctx.session.userList.length) {
			isNewPlayer = true;
		} else {
			for (let i = 0; i < ctx.session.userList.length - 1; i++) {
				if (+chatMember.user.id === +ctx.session.userList[i].id) {
					isNewPlayer = false;
				}
			}
		}

		if (isNewPlayer) {
			ctx.session.userList.push({
				id: chatMember.user.id,
				name: chatMember.user.first_name,
				nickName: chatMember.user.username,
				wins: 0,
			});
			await ctx.reply(
				`Игрок ${chatMember.user.first_name} (@${chatMember.user.username}) присоединяется к игре!`
			);
		} else {
			await ctx.reply('Вы уже в игре!');
		}
	});

	bot.hears('пидор', async (ctx) => {
		await ctx.reply('А знаешь кто еще пидор дня?');
	});

	bot.command('pidor', async (ctx) => {
		let todayPidor = choosePidor(ctx, ctx.session.userList);
		todayPidor.wins += 1;

		await ctx.reply('ВНИМАНИЕ 🔥').then(() => {
			setTimeout(() => {
				ctx.reply('ФЕДЕРАЛЬНЫЙ РОЗЫСК ПИДОРА 🚨');
			}, 1500);

			setTimeout(() => {
				ctx.reply('4 - спутник запущен 🛰️');
			}, 3000);

			setTimeout(() => {
				ctx.reply('3 - сводки ФСБ проверены 🚔');
			}, 4500);

			setTimeout(() => {
				ctx.reply('2 - твои друзья опрошены 🙅‍♂️');
			}, 6000);

			setTimeout(() => {
				ctx.reply('1 - Пидор найден! 🐤');
			}, 7500);

			setTimeout(() => {
				ctx.reply(
					`🌈 Сегодня ПИДОР дня - ${todayPidor.name} (@${todayPidor.nickName})(${todayPidor.wins}) 🥳`
				);
			}, 9000);
		});
	});

	bot.command('pidorstats', async (ctx) => {
		await ctx.reply(`Результаты 🌈ПИДОР Дня: \n  `);
	});

	function randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function choosePidor(ctx, arr) {
		let indexPidor = randomNumber(0, arr.length - 1);
		let pidor = ctx.session.userList[indexPidor];

		return pidor;
	}
};

module.exports.commands = commands;
