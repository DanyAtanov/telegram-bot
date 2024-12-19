/**
 * Сессия
 * @param {object} ctx.session - Хранилище данных сессии
 *
 * @param {array} ctx.session.userList - Массив объектов зарегистрированных игроков
 * @param {array} ctx.session.winList - Массив объектов победителей
 * currentMonthWinList
 * lastMonthWinList
 * @param {number} ctx.session.lastTime - Количество мс прошедших с 1 января 1970 года 00:00:00 до прошлого розыгрыша
 * currentMonth
 * @param {object} ctx.session.todayPidor - Объект с данными пидора дня
 *
 * Объект пользователя в userList
 * @param {object} ctx.session.userList[i] - Хранилище данных пользователя
 *
 * @param {number} ctx.session.userList[i].id - индентификатор пользователя
 * @param {string} ctx.session.userList[i].user - имя
 * @param {string} ctx.session.userList[i].userName - никнейм
 * @param {number} ctx.session.userList[i].wins - количество побед
 * monthWins
 */

require('dotenv').config();

const commands = (bot) => {
	// Команды, которые отображаются в меню бота
	bot.api.setMyCommands([
		{ command: 'reg', description: 'Присоединиться к вечеринки' },
		{ command: 'pidor', description: 'Крутить барабан' },
		{ command: 'monthstats', description: 'Топ пидоров за месяц' },
		{ command: 'pidorstats', description: 'Доска почета' },
		{ command: 'delete', description: 'Сбежать с поля боя' },
	]);

	bot.command('start', async (ctx) => {
		await ctx.reply(
			'Определяем ПИДОРА ДНЯ! Добавь бота в любую конфу и присоединяйся к лотерее! 😎 \n \n /reg - присоединиться к вечеринки \n /pidor - крутить барабан \n /pidorstats - доска почета \n /delete - сбежать с поля боя'
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
				monthWins: 0,
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
					monthWins: 0,
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

		if (!ctx.session.userList.length) {
			await ctx.reply(
				`Пидоров пока нет 😔 \n \n /reg - присоединиться к вечеринки`
			);

			return;
		}

		if (ctx.session.currentMonth) {
			if (ctx.session.currentMonth !== getMonth().monthIndex) {
				ctx.session.currentMonth = new Date(now).getUTCMonth();
				ctx.session.lastMonthWinList = structuredClone(currentMonthWinList);
				ctx.session.currentMonthWinList.length = 0;
			}
		} else {
			ctx.session.currentMonth = new Date(now).getUTCMonth();
			ctx.session.currentMonthWinList = [];
			ctx.session.lastMonthWinList = [];
		}

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
					if (!ctx.session.currentMonthWinList[i].monthWins) {
						ctx.session.currentMonthWinList[i].monthWins = 0;
					}
					ctx.session.currentMonthWinList[i].monthWins += 1;
					newWinner = false;
					break;
				} else {
					newWinner = true;
				}
			}

			if (newWinner) {
				todayPidor.wins += 1;
				todayPidor.monthWins += 1;
				ctx.session.winList.push(todayPidor);
				ctx.session.currentMonthWinList.push(todayPidor);
			}
		} else {
			todayPidor.wins += 1;
			todayPidor.monthWins += 1;
			ctx.session.winList.push(todayPidor);
			ctx.session.currentMonthWinList.push(todayPidor);
		}

		await ctx.reply('ВНИМАНИЕ 🔥').then(() => {
			if (ctx.chat?.id.toString() === process.env.TEST_SESSION_KEY) {
				ctx.reply(
					`🌈 Сегодня ПИДОР дня - ${todayPidor.name} (@${todayPidor.nickName}) 🥳`
				);
			} else {
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
			}
		});
	});

	bot.command('pidorstats', async (ctx) => {
		let winArr = ctx.session.winList;

		const sortedArr = winArr.sort((a, b) => {
			return b.wins - a.wins;
		});

		await ctx.reply(`Результаты 🌈ПИДОР Дня: \n ${generateStats(sortedArr)}`);
	});

	bot.command('monthstats', async (ctx) => {
		let winArr = ctx.session.currentMonthWinList;

		const sortedArr = winArr.sort((a, b) => {
			return b.monthWins - a.monthWins;
		});

		await ctx.reply(
			`Топ пидоров за ${getMonth().monthString}: \n ${generateMonthStats(
				sortedArr
			)}`
		);
	});

	bot.command('lastmonthstats', async (ctx) => {
		let winArr = ctx.session.lastMonthWinList;

		if (winArr.length) {
			const sortedArr = winArr.sort((a, b) => {
				return b.monthWins - a.monthWins;
			});

			await ctx.reply(
				`Топ пидоров за ${getMonth().lastMonth}: \n ${generateMonthStats(
					sortedArr
				)}`
			);
		} else {
			await ctx.reply(
				`Статистика за прошлый месяц пока не доступна`
			);
		}
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
			await ctx.reply(
				`Собрался сбежать с поля боя? Но не тут то было. Терпи! Ты в игре!`
			);
		} else {
			await ctx.reply(
				`В игру не вступил, а уже собрался бежать? ${chatMember.user.first_name} (@${chatMember.user.username}) - настоящий пидор! 🤡`
			);
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

	function generateMonthStats(arr) {
		let message = '';
		const gold = ' 🥇';
		const silver = ' 🥈';
		const bronze = ' 🥉';

		for (let i = 0; i <= arr.length - 1; i++) {
			message += `\n (${i + 1}) ${arr[i].name} (@${arr[i].nickName}) - ${
				arr[i].monthWins
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
		if (ctx.chat?.id.toString() === process.env.TEST_SESSION_KEY) return true;

		const lastTime = ctx.session.lastTime;
		const nowTime = Date.now();

		if (nowTime - lastTime > 6.48e7) {
			return true;
		} else {
			return false;
		}
	}

	function getMonth() {
		const monthList = [
			'Январь',
			'Февраль',
			'Март',
			'Апрель',
			'Май',
			'Июнь',
			'Июль',
			'Август',
			'Сентябрь',
			'Октябрь',
			'Ноябрь',
			'Декабрь',
		];
		let month = {
			monthString: monthList[new Date(Date.now()).getUTCMonth()],
			monthIndex: new Date(Date.now()).getUTCMonth(),
			lastMonth: monthList[new Date(Date.now()).getUTCMonth() - 1],
		};

		return month;
	}
};

module.exports.commands = commands;
