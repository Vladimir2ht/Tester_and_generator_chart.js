// Выведено в константы вне функций для быстрого многократного использования.
// Необязательная часть. Можно по id тегов к ним обращаться как к переменным.
// Используемый подход повышает поддерживаемость системы.
// Можно это обернуть в Promice, чтоб страница не залипала при загрузке.
const startX = document.getElementById('x1'),
			dotsCounter = document.getElementById('dotsCount'),
			checkboxToSecondGraph = document.getElementById('secondGraph'),
			inGraphChecker = document.getElementById('checkInGraph'),
			betweenGraphChecker = document.getElementById('checkBetweenGraph'),
			permissibleValueGetter = document.getElementById('permissible'),
			startY = document.querySelectorAll('.y1'),
			endY = document.querySelectorAll('.y2'),
			deltaHolders = document.querySelectorAll('.delta'),
			tables = document.querySelectorAll('tbody'),
			messages = document.querySelectorAll('.message'),
			selects = document.querySelectorAll('select');

			
const ctx = document.getElementById('myChart').getContext('2d');

const chart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			label: 'Гоафик 1',
			data: [],
			borderColor: 'rgb(0, 200, 0)',
			fill: false
		}, {
			label: 'Гоафик 2',
			data: [],
			borderColor: 'rgb(54, 162, 235)',
			fill: false
		}]
	},
	options: {
		scales: {
			x: {
				ticks: {
					autoSkip: true,
					maxRotation: 0,
				}
			}
		}
	}
});


function AddDot() {
	this.parentNode.querySelector('tbody').insertRow()
  	.innerHTML = '<td><input type="number"></td><td><input type="number"></td><td class="withTwoParts"><input type="checkbox"><span>&#10060;</span></td>';
}


function DleteDot(e) {
	if (e.target.tagName === 'SPAN') e.target.parentNode.parentNode.remove();
}


function UpdateChart() {
	let startXValue = startX.value;
	let length = dotsCounter.value;
	if (!(startXValue && length && startY[0].value && endY[0].value)) return
	length = +length;
	
	const xValues = [];
	// Формируем первый массив с элементами-временем
	if (typeof +startXValue === "number") { // Переработать
		startXValue = parseFloat(startXValue)
		for (let i = 0; i < length; i++) {
			xValues[i] = i + startXValue;
		}
	} else {
		for (let i = 0; i < length; i++) {
			xValues[i] = `${startXValue + i}:00`;
		}
	}
	chart.data.labels = xValues;

	// Формируем второй массив
	GraphicFormer(0, length, xValues[0])
	// формируем третий массив
	if (startY[1].value && endY[1].value && checkboxToSecondGraph.checked) {
		GraphicFormer(1, length, xValues[0])
	} else {
		chart.data.datasets[1].data = [];
	};
	
	messages.forEach(m => m.classList.remove('active'));
	chart.update();
}


function GraphicFormer(num, length, firstX) {
	const arrayYs = [+startY[num].value];
	let end = +endY[num].value;
	let delta = deltaHolders[num].value;
	
	let array = [];
	tables[num].querySelectorAll('input').forEach((input, i) => {
		if ((i + 1) % 3) array[i] = input.value;
		else array[i] = input.checked;
	})
	let result = [];
	while(array.length) {
		// reverse Для простоты представления, можно убрать.
		const dot = [array.pop(), array.pop(), array.pop()].reverse();
		if (!(dot[0] && dot[1])) continue;
		dot[1] = +dot[1];
		dot[0] = +dot[0];
		result.push(dot);
	};
	array = result.filter(dot => dot[2]);
	result = result.filter(dot => !dot[2]);
	result = [[firstX, arrayYs[0]], ...result, [length + firstX - 1, end]]
		.sort((a, b) => a[0] - b[0]);

	length = length + result[0][0];
	end = 1;
	for (let i = 1; i < result.length; i++) {
		if (result[i - 1][0] < firstX) continue;
		rangeLength = (result[i][0] - result[i - 1][0]);
		if (rangeLength === 0 ) continue;
		if (result[i][0] > length) break;
		const step = (result[i][1] - arrayYs[arrayYs.length - 1]) / rangeLength;
		
		for (let j = 1; j <= rangeLength; j++) {
			arrayYs.push(arrayYs[end - 1] + step);
			end++
		}
	}

	if (delta) { // Добавление случайного изменения значений.
		delta = +delta;
		function Randomiser() {
			return (1 - Math.random()) * ((Math.random() < 0.5) ? -1 : 1) * delta;
		};
		
		if (selects[num].value === '%') {
			delta = delta / 100;
			
			arrayYs.forEach((el, i) => {
				arrayYs[i] = el + Randomiser() * el;
			});

		} else {
			arrayYs.forEach((el, i) => {
				arrayYs[i] = el + Randomiser();
			});
		}
	}

	array.forEach(dot => {
		let xIndex = dot[0] - firstX;
		arrayYs[xIndex] = dot[1];
	});

	chart.data.datasets[num].data = arrayYs;
}


function Check() {
	messages.forEach(m => m.classList.remove('active'));

	let permissibleValue = permissibleValueGetter.value;
	let isCheckBetweenGraph = betweenGraphChecker.checked;
	const secondGraph = chart.data.datasets[1].data;
	const firstGraph = chart.data.datasets[0].data;
	const isCheckInGraph = inGraphChecker.checked;
	
	if (!(
		permissibleValue && firstGraph[0] &&
		(isCheckInGraph || (isCheckBetweenGraph && secondGraph[0]))
	)) return;
	permissibleValue = Math.abs(+permissibleValue); // Необязательно

	function TestFalse() {messages[0].classList.add('active')};
	function AbsDifferenceCompare(first, second, test) {return Math.abs(first - second) > test};

	let comparer;
	if (selects[2].value === '%') {
		permissibleValue = permissibleValue / 100

		comparer = (first, second) => {
			let result = Math.abs(first);
			result = (result > Math.abs(second)) ? Math.abs(second) : result;
			result = result * permissibleValue;
			return AbsDifferenceCompare(first, second, result);
		}
	} else {
		comparer = (first, second) => {
			return AbsDifferenceCompare(first, second, permissibleValue);
		}
	}
	
	if (!secondGraph[0]) isCheckBetweenGraph = false;
	
	if (isCheckBetweenGraph) {
		for (let i in firstGraph) {
			if (comparer(firstGraph[i], secondGraph[i])) return TestFalse();
		}
	}
		
	if (isCheckInGraph) {
		function ArrTester(array, i) {return comparer(array[i - 1], array[i])}
		for (let i = 1; i < firstGraph.length; i++) {
			if (ArrTester(firstGraph, i)) return TestFalse();
			if (secondGraph[0]) {
				if (ArrTester(secondGraph, i)) return TestFalse();
			}
		}
	}

	messages[1].classList.add('active')
}


tables.forEach(table => table.addEventListener('click', DleteDot));
document.querySelectorAll('.addPoint')
	.forEach(button => button.addEventListener('click', AddDot));
document.getElementById('updateChart').addEventListener('click', UpdateChart)
document.getElementById('checkButton').addEventListener('click', Check)
