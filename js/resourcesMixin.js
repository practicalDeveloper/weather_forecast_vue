export const resourcesMixin = {
    data() {
        return {
            forecastTypes: {  
                now: "Сейчас", 
                today: "Сегодня" , 
                fiveDays : "5 дней"
            }, 

            weatherForecast: 'Прогноз погоды',
            notFoundForecast: 'Прогноз не найден',
            forecastNow: 'Прогноз погоды сейчас в ',
            wind: 'Ветер',
            ms: 'м/с',
            pressure: 'Давление',
            pressureValue: 'мм рт. ст.',
            humidity: 'Влажность',
            cloudiness: 'Облачность',
            forecastFiveDays: 'Прогноз погоды на 5 дней в ',
            temperature: 'Температура:',
            forecastToday: 'Прогноз погоды сегодня в ',
            windSpeed: 'Скорость ветра:',
            searchPlace: 'Поиск места',
            location: 'Местоположение',

          }
    }
}