const timeStringWithSeconds = "12:30:45";
const timeStringWithoutSeconds = "12:30";


function TimeIncrement(timeString) {


	timeString = timeString.split(":")
	const hasSeconds = timeString.length === 3;

	function z() {
		console.log(25);
	}

	// определяем формат строки и извлекаем данные о времени
	const timeParts = timeStringWithSeconds.split(":").map(part => parseInt(part));
	const hours = timeParts[0];
	const minutes = timeParts[1];
	const seconds = hasSeconds ? timeParts[2] : 0;
	
	// добавляем 1 к времени
	let newSeconds = seconds + 1;
	let newMinutes = minutes;
	let newHours = hours;
	
	if (newSeconds === 60) {
		newSeconds = 0;
		newMinutes++;
	}
	
	if (newMinutes === 60) {
		newMinutes = 0;
		newHours++;
	}
	
	// форматируем новое время и выводим результат
	const newTime = `${newHours < 10 ? "0" : ""}${newHours}:${newMinutes < 10 ? "0" : ""}${newMinutes}:${newSeconds < 10 ? "0" : ""}${newSeconds}`;
	console.log(newTime);
	
}