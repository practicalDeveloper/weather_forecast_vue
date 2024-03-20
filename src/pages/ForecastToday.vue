<template>
    <div>
        <h1>{{forecastToday}} {{ $route.params.currentCity }} </h1>
    </div>

    <div class="weatherInfo">

        <!-- Time and weather icon-->
        <div class="weatherDescriptionToday">
            <div v-for="item in getForecastData" class="flex-item today-item">
                <div>
                    {{ item.time }}<sup> 00</sup>
                </div>

                <div>
                    <img :src="item.icon" width="60" height="60">
                </div>
            </div>
        </div>

        <div class="weatherHeader">
            {{temperature}}
        </div>

        <!-- Temperature-->
        <div class="weatherDescriptionToday" style="padding-bottom: var(--weatherPadding)">
            <div v-for="item in getForecastData" class="flex-item today-item">
                <div>
                    {{ item.temperature }}&deg;C
                </div>
            </div>

        </div>

        <div class="weatherHeader">
            {{windSpeed}}
        </div>

        <!-- Wind speed -->
        <div class="weatherDescriptionToday" style="padding-bottom: var(--weatherPadding)">
            <div v-for="item in getForecastData" class="flex-item today-item">

                <div>
                    {{ item.wind }} {{ms}}
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

        /** Returns data about weather forecast from openweathermap */
        getData: function () {
            let data = this.$route.params.forecastData;
            if (data == undefined || data == '""') {
                return "";
            }
            else {
                return JSON.parse(data);
            }
        },
    },

    computed: {
        /**
        * Gets weather forecast data
        */
        getForecastData: function () {

            let forecastData = [{
                time: "",
                temperature: "",
                wind: "",
                icon: ""
            }];
            forecastData = [];

            if (this.getData() != "") {
                let convert = this.convertToCelsius;
                this.getData().forEach(function (item, index, array) {
                    if (index < 7) {
                        let temp = convert(item['main']['temp']);
                        let windSpeed = item['wind']['speed'];
                        let iconData = String(item['weather'][0]['icon']);
                        let iconPic = "https://openweathermap.org/img/wn/" + iconData + "@2x.png";
                        let itemDate = new Date(item['dt_txt']);
                        let dateWithoutTime = itemDate.getHours();

                        let forecastItem = {
                            time: dateWithoutTime,
                            temperature: temp,
                            wind: windSpeed,
                            icon: iconPic
                        };

                        forecastData.push(forecastItem);
                    }

                });
            }
            return forecastData;
        }, //getForecastData 

    }, //computed 
}
</script>

<style>
@import "../../css/variables.css";

.weatherDescriptionToday {
    display: flex;

}

.weatherHeader {
    padding: 0 0 0 var(--weatherPadding);
    color: white;
}

.today-item {
    padding: var(--weatherPadding) 0 0 0;
    width: 50px;
}
</style>
