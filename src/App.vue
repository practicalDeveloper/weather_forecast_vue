<template>
    <div class="grid-container">
        
        <div class="header">
            <div class="Title">
                <p>{{weatherForecast}}</p>
            </div>

            <!-- Text area to search place -->
            <div class="textSearchArea">
                <countries-text-box v-bind:countriesCodesFilter="countriesCodes" 
                    v-bind:countriesCitiesFilter="countriesCities"
                    @getLocation="getLocation" @searchClick="searchLocationClick"
                    @clearClick="clearClick" />
            </div>
        </div>

        <!-- Text area and map -->
        <div class="content">
            <!-- OpenStreet map -->
            <div class="mapArea" id="gMapArea">
                <div ref="map-root" style="width: 100%; height: 100%">
                </div>
            </div>
        </div>

        <!-- Weather forecast-->
        <div class="sidebar">

            <!-- Menu (Now, today, 5 days) -->
            <forecast-type-tabs @getForecastType="getForecastType" />
            <!-- Found location -->
            <div id="forecastCountry" v-show="this.locationCity != ''">
                <p id="countryCity">{{ currentLocation() }}</p>

            </div>

            <div v-show="this.locationCity != '' && this.locationCity != this.notFoundForecast">
                <router-view></router-view>
            </div>

        </div>
    </div>

    <countries-codes @getCodes="getCountriesCodes" />
</template>

<script>

import Papa from 'papaparse';
import { extensionsMixin } from '../js/extensionsMixin.js'
import { resourcesMixin } from '../js/resourcesMixin.js'
import CountriesCodes from "./components/CountriesCodes";
import CountriesTextBox from "./components/CountriesTextBox";
import ForecastTypeTabs from "./components/ForecastTypeTabs";

import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import Feature from 'ol/Feature'
import OSM from 'ol/source/OSM'

import VectorSource from "ol/source/Vector";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";

import { fromLonLat } from 'ol/proj'

// importing the OpenLayers stylesheet
import 'ol/ol.css'

export default {
    components: {
        CountriesCodes,
        CountriesTextBox,
        ForecastTypeTabs
    },

    mixins: [extensionsMixin, resourcesMixin],
    data() {
        return {
            countriesCodes: [], // all countries with codes from the CSV file
            countriesCities: [], // countries codes, cities and coordinates from the CSV file
            mapObject: undefined, // OpenStreetMap map
            locationCity: '', // city name in the text area to find a place  
            locationCityEng: '', // city name in English in the text area to find a place 
            locationCountry: '', // country name in the text area for looking a place  
            locationCountryCode: '',
            locationCoord: '', // coordinates of place
            weatherApi: "49698eb024149b3ee8492a86f8df67ec",  // api Open Weather Map
            forecastType: '', // chosen weather forecast type

        }
    }, //data 


    created() {
        window.addEventListener("resize", this.resizeHandler);
    },
    destroyed() {
        window.removeEventListener("resize", this.resizeHandler);
    },
    mounted() {
        this.setShortWeatherArea();

        //this is where is created the OpenLayers map
        this.mapObject = new Map({
            // the map will be created using the 'map-root' ref
            target: this.$refs['map-root'],
            layers: [
                // adding a background tiled layer
                new TileLayer({
                    source: new OSM() // tiles are served by OpenStreetMap
                }),
            ],

            // the map view will initially show the whole world
            view: new View({
                zoom: 0,
                center: [0, 0],
                constrainResolution: true
            }),
        });

        this.forecastType = this.forecastTypes.now;
    }, //mounted 

    computed: {

    }, //computed 

    methods: {

        searchLocationClick() {
            this.proceedForecastType();
            this.setNormalWeatherArea();
        }, //searchLocationClick 

        getCountriesCodes(codeName, cityName) {
            this.countriesCodes = codeName;
            this.countriesCities = cityName;
        },


        /**
         * Navigation and applying type of weather
         */
        async getForecastType(type) {
            this.forecastType = type;
            await this.proceedForecastType();
        }, //getForecastType

        /**
         * Forecast for now
         */
        async getNowWeather() {
            this.calculateCoordinates();
            let foundData = await this.isFoundLocation(this.locationCityEng, this.locationCountryCode);
            if (foundData != undefined) {
                if (this.locationCoord == '') {
                    this.reCenterMap(foundData['coord']['lat'], foundData['coord']['lon']);
                }
                this.$router.push({
                    name: 'Now',
                    params: {
                        currentCity: this.locationCity,
                        currentCountry: this.locationCountry,
                        forecastData: JSON.stringify(foundData)
                    }
                });
            }
            else {
                if (this.locationCoord == '') {
                    this.resetMap();
                }
            }
        }, //getNowWeather

        /**
         * Weather forecast for today
         */
        async getTodayWeather() {

            this.calculateCoordinates();

            let foundData = await this.isFoundLocation(this.locationCityEng, this.locationCountryCode);

            if (foundData != undefined) {

                if (this.locationCoord == '') {
                    this.reCenterMap(foundData['city']['coord']['lat'], foundData['city']['coord']['lon']);
                }
                let woTime = this.dateWithoutTime;
                let today = woTime(new Date());
                let resultsData = foundData.list.filter(function (item) {
                    let itemDate = new Date(item['dt_txt']);
                    let dateWithoutTime = woTime(itemDate);
                    if (dateWithoutTime.valueOf() == today.valueOf()) {
                        return true;
                    }
                });

                this.$router.push({
                    name: 'Today',
                    params: {
                        currentCity: this.locationCity,
                        currentCountry: this.locationCountry,
                        forecastData: JSON.stringify(resultsData)
                    }
                });
            }
            else {
                if (this.locationCoord == '') {
                    this.resetMap();
                }
            }
        }, //getTodayWeather

        /**
         * Forecast for 5 days
         */
        async getFiveDaysWeather() {

            this.calculateCoordinates();

            let foundData = await this.isFoundLocation(this.locationCityEng, this.locationCountryCode);
            if (foundData != undefined) {

                if (this.locationCoord == '') {
                    this.reCenterMap(foundData['city']['coord']['lat'], foundData['city']['coord']['lon']);
                }
                // data about forecast for every day at 15.00 and 0.00
                let resultsData = foundData.list.filter(function (item) {
                    let itemDate = new Date(item['dt_txt']);

                    if (itemDate.getHours() == 15 || itemDate.getHours() == 0) {
                        return true;
                    }
                });

                this.$router.push({
                    name: 'FiveDays',
                    params: {
                        currentCity: this.locationCity,
                        currentCountry: this.locationCountry,
                        forecastData: JSON.stringify(resultsData)
                    }
                });
            }
            else {
                if (this.locationCoord == '') {
                    this.resetMap();
                }
            }
        }, //getFiveDaysWeather


        /**
         *  navigation in the tab depending on the forecast type
         */
        async proceedForecastType() {

            switch (this.forecastType) {
                case this.forecastTypes.now:
                    await this.getNowWeather();
                    break;
                case this.forecastTypes.today:
                    await this.getTodayWeather();
                    break;

                case this.forecastTypes.fiveDays:
                    await this.getFiveDaysWeather();
                    break;
                default:
                // no topic provided

            }
        }, //proceedForecastType

        /**
        * convertion of the coordinates from DDDMM  format into decimal degrees
        */
        calculateCoordinates() {
            if (this.locationCoord != '') {
                // splits string with coordinates by space
                let locodeCoord = this.locationCoord.split(" ");
                let a = locodeCoord[0].slice(0, -1);
                let b = locodeCoord[1].slice(0, -1);
                let quotientA = Math.floor(a / 100);
                let quotientB = Math.floor(b / 100);

                let remainderA = (a / 100) % 1;
                let remainderB = (b / 100) % 1;

                let lat = quotientA + (remainderA / 0.6);
                let long = quotientB + (remainderB / 0.6);

                if (locodeCoord[0].includes('S') || locodeCoord[0].includes('W')) {
                    lat *= (-1);
                }

                if (locodeCoord[1].includes('S') || locodeCoord[1].includes('W')) {
                    long *= (-1);
                }

                this.reCenterMap(lat, long);
            }

        }, //calculateCoordinates 

        /**
        * centers the map
        */
        reCenterMap(latitude, longitude) {

            //centers the map on the cooordinate
            this.mapObject.getView().setZoom(12);
            this.mapObject.getView().setCenter(fromLonLat([longitude, latitude]));

            // removes previous marker
            this.removeMapMarker();

            // puts the marker dot
            const source = new VectorSource();
            source.addFeatures([new Feature(new Point(fromLonLat([longitude, latitude])))]);

            const layer = new VectorLayer({
                source: source,
                name : "Marker",
                style: {
                    'circle-radius': 10,
                    'circle-fill-color': 'rgba(20, 100, 240, 0.3)',
                    'circle-stroke-color': 'rgba(20, 100, 240, 0.7)',
                },
            });
            
            this.mapObject.addLayer(layer);

        }, //reCenterMap  

        // removes dot marker on the map
        removeMapMarker() {
            this.mapObject.getLayers().getArray()
                .filter(layer => layer.get('name') === 'Marker')
                .forEach(layer => this.mapObject.removeLayer(layer));
        },

        /**
        * resets map zoom and coordinates to zero
        */
        resetMap() {
            this.mapObject.getView().setZoom(0);
            this.mapObject.getView().setCenter([0, 0]);
        }, //resetMap  


        setShortWeatherArea() {
            let value = this.getRootVarCSS('--shortAreaHeight');
            this.setRootVarCSS('--weatherAreaHeight', value)
        }, //setShortWeatherArea  

        setNormalWeatherArea() {
            let value = this.getRootVarCSS('--normalAreaHeight');
            this.setRootVarCSS('--weatherAreaHeight', value)
        }, //setNormalWeatherArea  


        clearClick() {
            this.locationCity = '';
            this.locationCountryCode = '';
            this.locationCountry = '';
            this.locationCoord = '';
            this.removeMapMarker();

            this.proceedForecastType();
            this.setShortWeatherArea();
        },

        /**
         * checks whether found coordinates on  openweathermap
         */
        async isFoundLocation(place, code) {
            if (place != '' && code != '') {
                // forecast type for today and 5 days
                let openWeatherType = '';
                if (this.forecastType == this.forecastTypes.now) {
                    openWeatherType = 'https://api.openweathermap.org/data/2.5/weather?q=' + place +
                        ',' + code + '&appid=' + this.weatherApi + "&lang=ru";
                }
                else {
                    openWeatherType = 'https://api.openweathermap.org/data/2.5/forecast?q=' + place +
                        ',' + code + '&appid=' + this.weatherApi + "&lang=ru";
                }

                return await fetch(openWeatherType)
                    .then(res => res.json())
                    .then(data => {
                        if (data['cod'] == '404' || data['cod'] == undefined) {
                            return undefined;
                        }
                        else {
                            return data;
                        }
                    })
            }
            else {
                return undefined;
            }
        }, //isFoundLocation

        /**
        * finds openweathermap location though text search area
        * paramCity - city in the textbox
        * paramCityEng - city in English
        * paramCountry - country name
        * paramCountryCode - country code
        * paramCoord - coordinates of the city
        */
        async getLocation(paramCity, paramCityEng, paramCountry, paramCountryCode, paramCoord) {

            if (paramCity != '') {
                let isFound = false; // found coordinates
                let isFoundSecond = false; // found coordinates

                // if city name contains '=' (for example, Leningrad = Saint Petersburg)
                if (paramCityEng.indexOf('=') > -1) {
                    const substr = paramCity.split("=");
                    const substrEng = paramCityEng.split("=");
                    
                    // search of the left part of '=' (for example, Leningrad)
                    let substrBrackets = substrEng[0].split("(")[0].trim(); // if city name contains '(' (in instance, Rome (Roma) ) 
                    let substrBrackets2 = substrEng[1].split("(")[0].trim(); // if city name contains '(' (in instance, Rome (Roma) ) 
                    isFound = await this.isFoundLocation(substrBrackets, paramCountryCode);

                    if (isFound != undefined) {
                        this.locationCity = substr[0];
                        this.locationCityEng = substrBrackets;
                    }
                    else {
                        // search of the right part of '=' (for example, Saint Petersburg)
                        isFoundSecond = await this.isFoundLocation(substrBrackets2, paramCountryCode);

                        if (isFoundSecond != undefined) {
                            this.locationCity = substr[1];
                            this.locationCityEng = substrBrackets2;
                        }
                        else {
                            this.locationCity = this.notFoundForecast;
                            this.locationCityEng = this.notFoundForecast;
                        }
                    }
                }
                else {

                    let substrBrackets = paramCityEng.split("(")[0].trim(); // if city name contains '(' (in instance, Rome (Roma) ) 
                    isFound = await this.isFoundLocation(substrBrackets, paramCountryCode);

                    this.locationCity = isFound != undefined ? paramCity : this.notFoundForecast;
                    this.locationCityEng = isFound != undefined ? substrBrackets : this.notFoundForecast;
                }

                this.locationCountry = paramCountry;
                this.locationCountryCode = paramCountryCode;
                this.locationCoord = paramCoord;
                this.setNormalWeatherArea();
                await this.proceedForecastType();
            }
        },

        /**
         * returns current place/country
         */
        currentLocation: function () {
            if (this.locationCity == '') {
                return " ";
            }
            else {
                if (this.locationCity == this.notFoundForecast) {
                    return this.notFoundForecast;
                }
                else {
                    return this.locationCity + "/" + this.locationCountry;
                }
            }
        },

        /**
        * changing window size
        */
        resizeHandler(e) {

        },

    }, //methods 
} // export default 
</script>



<style >
@import "../css/variables.css";
@import "../css/main.css";
</style>

