<template>
    <div>
        <h1>{{forecastFiveDays}} {{ $route.params.currentCity }} </h1>
    </div>

    <div class="weatherInfo">

        <div class="weatherInfoMain">
            <div v-for="item in getForecastData" class="flex-item">

                <!-- Day of week -->
                <div style="padding-top: var(--weatherPadding)">
                    {{ item.day }}
                </div>

                <div>
                    {{ item.date }} {{ item.month }}
                    <!-- Time of forecast -->
                    <div class="weatherInfoSub" style="padding-top: var(--weatherPadding)">
                        <div class="flex-item">
                            {{ item.forecastItem.time }}<sup> 00</sup>
                        </div>

                        <div class="flex-item" v-show="item.prevForecastItem != undefined">
                            <span v-if="item.prevForecastItem != undefined">
                                {{ item.prevForecastItem.time }}<sup> 00</sup>
                            </span>
                        </div>
                    </div>


                    <!-- Weather icon -->
                    <div class="weatherInfoSub">
                        <div class="flex-item">
                            <img :src="item.forecastItem.icon" width="40" height="40">
                        </div>

                        <div class="flex-item" v-show="item.prevForecastItem != undefined">
                            <span v-if="item.prevForecastItem != undefined">
                                <img :src="item.prevForecastItem.icon" width="40" height="40">
                            </span>
                        </div>

                    </div>

                </div>
            </div>

        </div>


        <div class="weatherHeader" style="padding-bottom: var(--weatherPadding)">
            {{ temperature }}
        </div>

        <div class="weatherInfoMain">
            <div v-for="item in getForecastData" class="flex-item">
                <!-- Temperature -->
                <div class="weatherInfoSub">
                    <div class="flex-item">
                        {{ item.forecastItem.temperature }}&deg;C
                    </div>

                    <div class="flex-item" style="padding-bottom: var(--weatherPadding)"
                        v-show="item.prevForecastItem != undefined">
                        <span v-if="item.prevForecastItem != undefined">
                            {{ item.prevForecastItem.temperature }}&deg;C
                        </span>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { extensionsMixin } from '../../js/extensionsMixin.js'
import { resourcesMixin } from '../../js/resourcesMixin.js'

export default {
    mixins: [extensionsMixin, resourcesMixin],
    props: ['currentCity', 'currentCountry', 'forecastData'],

    async beforeMount() {

    },
    methods: {

        /** Gets weather data from openweathermap */
        getData: function () {
            let data = this.$route.params.forecastData;
            if (data == undefined || data == '""') {
                return "";
            }
            else {
                return JSON.parse(data);
            }
        },

        /**
        * Gets weather data for the element
        */
        getItemForecastData: function (item) {
            let itemDate = new Date(item['dt_txt']);
            let temp = this.convertToCelsius(item['main']['temp']);
            let windSpeed = item['wind']['speed'];
            let iconData = String(item['weather'][0]['icon']);
            let iconPic = "https://openweathermap.org/img/wn/" + iconData + "@2x.png";

            let dateWithoutTime = itemDate.getHours();

            let forecastItem = {
                time: dateWithoutTime,
                temperature: temp,
                wind: windSpeed,
                icon: iconPic
            };

            return forecastItem;
        },
    },

    computed: {
        /**
        * Gets data about weather in the required format
        */
        getForecastData: function () {

            let forecastData = [];

            if (this.getData() != "") {
                let getForecastItem = this.getItemForecastData;
                let prevDate = 0; //prev. date of the weather item
                let prevItem = undefined; // prev. weather item
                this.getData().forEach(function (item, index, array) {
                    const weekday =
                        ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

                    let itemDate = new Date(item['dt_txt']);
                    let monthName = itemDate.toLocaleString('ru-RU', {
                        month: 'short'
                    });
                    let dayName = weekday[itemDate.getDay()];

                    //  splitting elements to 15.00 and 0.00
                    if (prevDate == itemDate.getDate() || prevDate == 0) {
                        let dateItem = {};

                        let forecastItemData = getForecastItem(item);
                        let forecastPrevItemData = prevItem != undefined ?
                            getForecastItem(prevItem) : undefined;

                        if (index == 0 || itemDate.getDate() == 1) {
                            // show month name
                            dateItem = {
                                date: itemDate.getDate(),
                                month: monthName,
                                day: dayName,
                                forecastItem: forecastItemData,
                                prevForecastItem: forecastPrevItemData
                            };
                        }
                        else {
                            // don't show month name
                            dateItem = {
                                date: itemDate.getDate(),
                                month: "",
                                day: dayName,
                                forecastItem: forecastItemData,
                                prevForecastItem: forecastPrevItemData
                            };
                        }

                        forecastData.push(dateItem);
                    }

                    prevDate = itemDate.getDate();
                    prevItem = item;

                });
            }

            return forecastData;
        }, //getForecastData 

    }, //computed 

}
</script>

<style>
@import "../../css/variables.css";

.weatherInfoMain,
.weatherInfoSub {
    display: flex;
}

.weatherInfoSub {
    padding: 0;
}
</style>

