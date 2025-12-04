/**
 * Сессия
 * @param {object} ctx.session - Хранилище данных сессии
 *
 * @param {array} ctx.session.userList - Массив объектов зарегистрированных игроков
 * @param {array} ctx.session.winList - Массив объектов победителей
 * @param {array} ctx.session.currentMonthWinList - Массив объектов победителей за ТЕКУЩИЙ месяц
 * @param {array} ctx.session.lastMonthWinList - Массив объектов победителей за ПРОШЛЫЙ месяц
 * @param {number} ctx.session.lastTime - Количество мс прошедших с 1 января 1970 года 00:00:00 до прошлого розыгрыша Пидора Дня
 * @param {number} ctx.session.lastTimeRage - Количество мс прошедших с 1 января 1970 года 00:00:00 до прошлой Трехблядской ярости
 * @param {number} ctx.session.currentMonth - Номер месяца (0 - январь)
 * @param {object} ctx.session.todayPidor - Объект с данными пидора дня
 * @param {object} ctx.session.ragePidor - Объект с данными пидора дня
 *
 * Объект пользователя в userList
 * @param {object} ctx.session.userList[i] - Хранилище данных пользователя
 * @param {number} ctx.session.userList[i].id - индентификатор пользователя
 * @param {string} ctx.session.userList[i].user - имя
 * @param {string} ctx.session.userList[i].userName - никнейм
 * @param {number} ctx.session.userList[i].wins - общее количество побед
 * @param {number} ctx.session.userList[i].monthWins - количество побед за месяц
 */

require('dotenv').config();

const commands = (bot) => {
	// Команды, которые отображаются в меню бота
	bot.api.setMyCommands([
		{ command: 'reg', description: 'Присоединиться к вечеринке' },
		{ command: 'pidor', description: 'Крутить барабан' },
		{ command: 'pidorrage', description: 'Вызвать трёхбядскую ярость (+3)' },
		{ command: 'monthstats', description: 'Топ за МЕСЯЦ' },
		{ command: 'lastmonthstats', description: 'Топ предыдущего месяца' },
		{ command: 'pidorstats', description: 'Пидорская летопись' },
		{ command: 'players', description: 'Список игроков' },
		{ command: 'escape', description: 'Сбежать с поля боя' },
	]);

	bot.command('start', async (ctx) => {
		await ctx.reply(
			'Определяем ПИДОРА ДНЯ! Добавь бота в любую конфу и присоединяйся к лотерее! 😎 \n \n /reg - присоединиться к вечеринке \n /pidor - крутить барабан \n /pidorrage - Вызвать трёхбядскую ярость (+3) \n /monthstats - топ за месяц \n /lastmonthstats - Топ предыдущего месяца \n /pidorstats - общая статистика \n /escape - сбежать с поля боя'
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
				`Пидоров пока нет 😔 \n \n /reg - присоединиться к вечеринке`
			);

			return;
		}

		checkMonth(ctx, now);

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

		//за месяц
		if (ctx.session.currentMonthWinList.length) {
			let newWinner;

			for (let i = 0; i <= ctx.session.currentMonthWinList.length - 1; i++) {
				if (+todayPidor.id === +ctx.session.currentMonthWinList[i].id) {
					if (!ctx.session.currentMonthWinList[i].monthWins) {
						todayPidor.monthWins = 0;
					}
					ctx.session.currentMonthWinList[i].monthWins += 1;
					newWinner = false;
					break;
				} else {
					newWinner = true;
				}
			}

			if (newWinner) {
				todayPidor.monthWins += 1;
				ctx.session.currentMonthWinList.push(todayPidor);
			}
		} else {
			todayPidor.monthWins += 1;
			ctx.session.currentMonthWinList.push(todayPidor);
		}

		await ctx.reply('ВНИМАНИЕ 🔥').then(() => {
			if (ctx.chat?.id.toString() === process.env.TEST_SESSION_KEY) {
				ctx.reply(
					`🌈 Сегодня ПИДОР дня - ${todayPidor.name} (@${todayPidor.nickName}) 🥳`
				);
			} else {
				const randomNum = randomNumber(0, pidorMessages().length);

				setTimeout(() => {
					ctx.reply(`${pidorMessages()[randomNum][0]}`);
				}, 1500);

				setTimeout(() => {
					ctx.reply(`4 - ${pidorMessages()[randomNum][1]}`);
				}, 3000);

				setTimeout(() => {
					ctx.reply(`3 - ${pidorMessages()[randomNum][2]}`);
				}, 4500);

				setTimeout(() => {
					ctx.reply(`2 - ${pidorMessages()[randomNum][3]}`);
				}, 6000);

				setTimeout(() => {
					ctx.reply(`1 - ${pidorMessages()[randomNum][4]}`);
				}, 7500);

				setTimeout(() => {
					ctx.reply(
						`🌈 Сегодня ПИДОР дня - ${todayPidor.name} (@${todayPidor.nickName}) 🥳`
					);
				}, 9000);
			}
		});
	});

	//! 🔥 Трехблядская ярость 🔥
	bot.command('pidorrage', async (ctx) => {
		const now = Date.now();

		if (!ctx.session.userList.length) {
			await ctx.reply(
				`Пидоров пока нет 😔 \n \n /reg - присоединиться к вечеринке`
			);

			return;
		}

		checkMonth(ctx, now);

		if (!rageIsOK(ctx, now)) {
			wheniIsRage(ctx, now);
			return;
		}

		ctx.session.lastTimeRage = now;

		let ragePidor = await choosePidor(ctx, ctx.session.userList);

		ctx.session.ragePidor = ragePidor;

		if (ctx.session.winList.length) {
			let newWinner;
			for (let i = 0; i <= ctx.session.winList.length - 1; i++) {
				if (+ragePidor.id === +ctx.session.winList[i].id) {
					ctx.session.winList[i].wins += 3;
					newWinner = false;
					break;
				} else {
					newWinner = true;
				}
			}

			if (newWinner) {
				ragePidor.wins += 3;
				ctx.session.winList.push(ragePidor);
			}
		} else {
			ragePidor.wins += 3;
			ctx.session.winList.push(ragePidor);
		}

		//за месяц
		if (ctx.session.currentMonthWinList.length) {
			let newWinner;
			for (let i = 0; i <= ctx.session.currentMonthWinList.length - 1; i++) {
				if (+ragePidor.id === +ctx.session.currentMonthWinList[i].id) {
					if (!ctx.session.currentMonthWinList[i].monthWins) {
						ragePidor.monthWins = 0;
					}
					ctx.session.currentMonthWinList[i].monthWins += 3;
					newWinner = false;
					break;
				} else {
					newWinner = true;
				}
			}

			if (newWinner) {
				if (!ragePidor.monthWins) {
					ragePidor.monthWins = 0;
				}
				ragePidor.monthWins += 3;
				ctx.session.currentMonthWinList.push(ragePidor);
			}
		} else {
			if (!ragePidor.monthWins) {
				ragePidor.monthWins = 0;
			}
			ragePidor.monthWins += 3;
			ctx.session.currentMonthWinList.push(ragePidor);
		}

		await ctx.reply('БЕРЕГИТЕСЬ! 🆘').then(() => {
			if (ctx.chat?.id.toString() === process.env.TEST_SESSION_KEY) {
				ctx.reply(
					`🌈 На этой неделе жертва треблядской ярости (+3 пидор-коина) - ${ragePidor.name} (@${ragePidor.nickName}) 🥳`
				);
			} else {
				setTimeout(() => {
					ctx.reply('РАЗГОРАЕТСЯ ТРЕХБЛЯДСКАЯ ЯРОСТЬ 🔥');
				}, 1500);

				setTimeout(() => {
					ctx.reply('4 - удаляйте историю поиска 🤳 ');
				}, 3000);

				setTimeout(() => {
					ctx.reply('3 - прячьте жен и детей 👬');
				}, 4500);

				setTimeout(() => {
					ctx.reply('2 - молитесь Аллаху 👳‍♂️');
				}, 6000);

				setTimeout(() => {
					ctx.reply('1 - Пязда пришла! 🐔');
				}, 7500);

				setTimeout(() => {
					ctx.reply(
						`🌈🌈🌈 На этой неделе ТРЕХБЛЯДСКАЯ ЯРОСТЬ (+3 пидор-коина) обрушилась на ${ragePidor.name} (@${ragePidor.nickName}) 🥳`
					);
				}, 9000);
			}
		});
	});
	//! /Трехблядская ярость

	bot.command('pidorstats', async (ctx) => {
		let winArr = ctx.session.winList;

		const sortedArr = winArr.sort((a, b) => {
			return b.wins - a.wins;
		});

		await ctx.reply(`Результаты 🌈ПИДОР Дня: \n ${generateStats(sortedArr)}`);
	});

	bot.command('monthstats', async (ctx) => {
		checkMonth(ctx);

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
		checkMonth(ctx);

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
			await ctx.reply(`Статистика за прошлый месяц пока не доступна`);
		}
	});

	bot.command('players', async (ctx) => {
		let userList = ctx.session.userList;

		if (userList.length) {
			await ctx.reply(
				`За звание Пидора Дня борятся: \n ${whoIsInTheGame(userList)}`
			);
		} else {
			await ctx.reply(`Еще никто не вошел в игру...`);
		}
	});

	bot.command('escape', async (ctx) => {
		const chatMember = await ctx.chatMembers.getChatMember();
		let isOldPlayer;

		for (let i = 0; i <= ctx.session.userList.length - 1; i++) {
			if (+chatMember.user.id === +ctx.session.userList[i].id) {
				isOldPlayer = true;
			}
		}

		if (isOldPlayer) {
			// удаляем его нахуй
			ctx.session.userList = ctx.session.userList.filter(
				(item) => item.id !== chatMember.user.id
			);
			await ctx.reply(
				`${chatMember.user.first_name} ведёт себя по-пидорски и сбегает с поля боя`
			);
		} else {
			await ctx.reply(
				`В игру не вступил, а уже собрался бежать? ${chatMember.user.first_name}, ты случаем не пидор? Тогда присоединяйся -  /reg`
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
			} ${setEndings(arr[i].wins)}`;

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

	function rageIsOK(ctx, time) {
		//if (ctx.chat?.id.toString() === process.env.TEST_SESSION_KEY) return true;

		const lastTimeRage = ctx.session.lastTimeRage
			? ctx.session.lastTimeRage
			: 0;
		const nowTime = Date.now();

		/* Прошло больше 162 часов */
		if (nowTime - lastTimeRage > 5.832e8) {
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
			lastMonth:
				new Date(Date.now()).getUTCMonth() !== 0
					? monthList[new Date(Date.now()).getUTCMonth() - 1]
					: 11,
		};

		return month;
	}

	function checkMonth(ctx, now = Date.now()) {
		if (ctx.session.currentMonth || ctx.session.currentMonth === 0) {
			// Если новый месяц
			if (ctx.session.currentMonth !== getMonth().monthIndex) {
				ctx.session.currentMonth = new Date(now).getUTCMonth();
				ctx.session.lastMonthWinList = structuredClone(
					ctx.session.currentMonthWinList
				);
				ctx.session.currentMonthWinList.length = 0;

				for (let i = 0; i < ctx.session.userList.length; i++) {
					const user = ctx.session.userList[i];

					user.monthWins = 0;
				}
			}
		} else {
			ctx.session.currentMonth = new Date(now).getUTCMonth();
			ctx.session.currentMonthWinList = [];
			ctx.session.lastMonthWinList = [];

			//test
			for (let i = 0; i < ctx.session.userList.length; i++) {
				const user = ctx.session.userList[i];

				user.monthWins = 0;
			}
		}
	}

	function wheniIsRage(ctx, time) {
		const lastTimeRage = ctx.session.lastTimeRage;
		const nowTime = time;

		/* прошло больше 161 часов  */
		if (nowTime - lastTimeRage > 5.796e8) {
			ctx.reply(
				`Трехблядская ярость будет доступна в течении часа!!!. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* прошло больше 144 часов  */
		} else if (nowTime - lastTimeRage > 5.184e8) {
			ctx.reply(
				`Трехблядская ярость будет доступна в течении 24х часов. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 120 часов  */
		} else if (nowTime - lastTimeRage > 4.32e8) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Остался 1 день. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 96 часов  */
		} else if (nowTime - lastTimeRage > 3.456e8) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Осталось 2 дня. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 72 часов  */
		} else if (nowTime - lastTimeRage > 2.592e8) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Осталось 3 дня. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 48 часов  */
		} else if (nowTime - lastTimeRage > 1.728e8) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Осталось 4 дня. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 24 часов  */
		} else if (nowTime - lastTimeRage > 8.64e7) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Осталось 5 дней. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
			/* больше 18 часов  */
		} else if (nowTime - lastTimeRage > 6.48e7) {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Осталось 6 дней. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
		} else {
			ctx.reply(
				`Трехблядская ярость доступна раз в неделю. Потерпите еще неделю. Последняя жертва: ${ctx.session.ragePidor.name}(@${ctx.session.ragePidor.nickName})`
			);
		}
	}

	function setEndings(wins) {
		const number = Math.abs(+wins);
		const lastDigit = number % 10;
		const lastTwoDigits = number % 100;

		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'раз';
		if (lastDigit >= 2 && lastDigit <= 4) return 'раза';
		return 'раз';
	}

	function pidorMessages() {
		const pidorMessages = [
			[
				'ФЕДЕРАЛЬНЫЙ РОЗЫСК ПИДОРА 🚨',
				'Спутники запущены... 🛰️',
				'Сводки ФСБ проверены... 🚔',
				'Соцсети просканированы... 🙅‍♂️',
				'Пидор найден! 🐔',
			],
			[
				'ПРОВЕРКА АУРЫ ЧАТА ✨',
				'Аура зелёная… 🟩',
				'Потом жёлтая… 🟨',
				'Потом какая-то тухлая… 🟫',
				'Нет, это не аура. Это пидор.',
			],
			[
				'ЗАПУСК МЕХАНИЗМА "ПОШЁЛ НАХ*" 🤬',
				'Сканируем чат на тупость… 🧪',
				'Фильтруем излишних гениев… 🌀',
				'Отсеиваем умных… 🚫',
				'Остаётся один. Пидор.',
			],
			[
				'АЛГОРИТМ ФИЛЬТРАЦИИ ДЕБИЛОВ 💀',
				'Удаляем шум… 🗑️',
				'Удаляем смысл… 🗑️🗑️',
				'Удаляем надежду… 🗑️🗑️🗑️',
				'Остался лишь пидор...',
			],
			[
				'ПРОВЕРКА НА ЛОЯЛЬНОСТЬ К ДЕЙСТВУЮЩЕЙ ВЛАСТИ ⚖️',
				'Анализируем каналы в Телеграме... 📊',
				'Смотрим обращения Путина 👴🏻',
				'Включаем песню Я - РУССКИЙ 🌐',
				'Поддерживает власть. Вердикт - Пидор! ⚖️',
			],
		];

		return pidorMessages;
	}

	function whoIsInTheGame(arr) {
		let message = '';

		for (let i = 0; i <= arr.length - 1; i++) {
			message += `\n 🧔🏻‍♀️ ${arr[i].name} (@${arr[i].nickName})`;
		}

		return message;
	}
};

module.exports.commands = commands;
