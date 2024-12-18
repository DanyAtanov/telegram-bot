/**
 * Сессия
 * @param {object} ctx.session - Хранилище данных сессии
 * 
 * @param {array} ctx.session.userList - Массив объектов зарегистрированных игроков
 * @param {array} ctx.session.winList - Массив объектов победителей
 * @param {number} ctx.session.lastTime - Количество мс прошедших с 1 января 1970 года 00:00:00 до прошлого розыгрыша
 * @param {object} ctx.session.todayPidor - Объект с данными пидора дня
 * 
 * Объект пользователя в userList
 * @param {object} ctx.session.userList[i] - Хранилище данных пользователя
 * 
 * @param {number} ctx.session.userList[i].id - индентификатор пользователя
 * @param {string} ctx.session.userList[i].user - имя
 * @param {string} ctx.session.userList[i].userName - никнейм
 * @param {number} ctx.session.userList[i].wins - количество побед
 * 
 */

const commands = (bot) => {
	// Команды, которые отображаются в меню бота
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
		await ctx.reply(
			`А знаешь кто еще пидор? Правильно! ${ctx.session.todayPidor.name}(@${ctx.session.todayPidor.nickName}) 😎!`
		);
	});

	bot.command('pidor', async (ctx) => {
		const now = Date.now();
		if (!isOK(ctx, now)) {
			await ctx.reply(
				`Сегодня 🌈ПИДОР дня - ${ctx.session.todayPidor.name}(@${ctx.session.todayPidor.nickName})`
			);
			return;
		}
		ctx.session.lastTime = now;

		let todayPidor = await choosePidor(ctx, ctx.session.userList);
		ctx.session.todayPidor = todayPidor;

		if (ctx.session.winList.length) {
			let newWinner;
			for (let i = 0; i <= ctx.session.winList.length - 1; i++) {
				if (+todayPidor.id === +ctx.session.winList[i].id) {
					ctx.session.winList[i].wins += 1;
					newWinner = false;
					break;
				} else {
					newWinner = true;
				}
			}

			if (newWinner) {
				todayPidor.wins += 1;
				ctx.session.winList.push(todayPidor);
			}
		} else {
			todayPidor.wins += 1;
			ctx.session.winList.push(todayPidor);
		}

		await ctx.reply('ВНИМАНИЕ 🔥').then(() => {
			setTimeout(() => {
				ctx.reply('ФЕДЕРАЛЬНЫЙ РОЗЫСК ПИДОРА 🚨');
			}, 1500);

			setTimeout(() => {
				ctx.reply('4 - спутники запущены 🛰️');
			}, 3000);

			setTimeout(() => {
				ctx.reply('3 - сводки ФСБ проверены 🚔');
			}, 4500);

			setTimeout(() => {
				ctx.reply('2 - соцсети просканированы 🙅‍♂️');
			}, 6000);

			setTimeout(() => {
				ctx.reply('1 - Пидор найден! 🐔');
			}, 7500);

			setTimeout(() => {
				ctx.reply(
					`🌈 Сегодня ПИДОР дня - ${todayPidor.name} (@${todayPidor.nickName}) 🥳`
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

	bot.command('delete', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();
		let isOldPlayer;

		for (let i = 0; i <= ctx.session.userList.length - 1; i++) {
			if (+chatMember.user.id === +ctx.session.userList[i].id) {
				isOldPlayer = true;
			}
		}

		if (isOldPlayer) {
			await ctx.reply(`Собрался сбежать с поля боя? Но не тут то было. Терпи! Ты в игре!`);
		} else {
			await ctx.reply(`В игру не вступил, а уже собрался бежать? ${chatMember.user.first_name} (@${chatMember.user.username}) - настоящий пидор! 🤡`);
		}
	});

	// от min (включительно) до max (невключительно)
	function randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function choosePidor(ctx, arr) {
		// берем длину массива, т.к. max - не включительно
		let indexPidor = randomNumber(0, arr.length);
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

	function isOK(ctx, time) {
		const lastTime = ctx.session.lastTime;
		const nowTime = Date.now();

		if (nowTime - lastTime > 6.48e7) {
			return true;
		} else {
			return false;
		}
	}
};

module.exports.commands = commands;
