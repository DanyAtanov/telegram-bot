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

		if (!ctx.session.userList.length) {
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
			let isOldPlayer;

			for (let i = 0; i <= ctx.session.userList.length - 1; i++) {
				if (+chatMember.user.id === +ctx.session.userList[i].id) {
					isOldPlayer = true;
				}
			}

			if (isOldPlayer) {
				await ctx.reply('Вы уже в игре!');
			} else {
				ctx.session.userList.push({
					id: chatMember.user.id,
					name: chatMember.user.first_name,
					nickName: chatMember.user.username,
					wins: 0,
				});
				await ctx.reply(
					`Игрок ${chatMember.user.first_name} (@${chatMember.user.username}) присоединяется к игре!`
				);
			}
		}
	});

	bot.hears('пидор', async (ctx) => {
		await ctx.reply('А знаешь кто еще пидор дня?');
	});

	bot.command('pidor', async (ctx) => {
		let todayPidor = choosePidor(ctx, ctx.session.userList);
		todayPidor.wins += 1;
		ctx.session.winList.push(todayPidor);

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
		let winArr = ctx.session.winList;

		const sortedArr = winArr.sort((a, b) => {
			return b.wins - a.wins;
		});

		await ctx.reply(`Результаты 🌈ПИДОР Дня: \n ${generateStats(sortedArr)}`);
	});

	function randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function choosePidor(ctx, arr) {
		let indexPidor = randomNumber(0, arr.length - 1);
		let pidor = ctx.session.userList[indexPidor];

		return pidor;
	}

	function generateStats(arr) {
		let message = '';
		const gold = ' 🥇';
		const silver = ' 🥈';
		const bronze = ' 🥉';

		for (let i = 0; i <= arr.length - 1; i++) {
			message += `\n (${i + 1}) ${arr[i].name} (@${arr[i].nickName}) - ${
				arr[i].wins
			} раз(а)`;

			if (i === 0) {
				message += gold;
			} else if (i === 1) {
				message += silver;
			} else if (i === 2) {
				message += bronze;
			}
		}

		return message;
	}
};

module.exports.commands = commands;
