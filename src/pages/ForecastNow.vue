<template>
  <div>
    <h1>{{forecastNow}} {{ $route.params.currentCity }} </h1>
  </div>
  <div id="weatherInfoNow" class="weatherInfo">
    <div id="weatherDescription">
      <div id="temperature">
        <img v-bind:src="getIcon" width="90" height="90">
        <p>{{ getTemperature }}&deg;C</p>
      </div>

      <div id="description">
        <p>{{ getDescription }}</p>
      </div>
    </div>

    <div id="info">
      <div class="flex-item now-item">{{wind}}
        <div>
          {{ getWind }} {{ms}}
        </div>
      </div>
      <div class="flex-item now-item">{{pressure}}
        <div>
          {{ getPressure }} {{pressureValue}}
        </div>
      </div>
      <div class="flex-item now-item">{{humidity}}
        <div>
          {{ getHumidity }} %
        </div>
      </div>
      <div class="flex-item now-item">{{cloudiness}}
        <div>
          {{ getClouds }} %
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

    /** Returns data about weather from  openweathermap */
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
     * 
    * Returns data about temperature as string
    */
    getTemperature: function () {
      let data = this.getData() != "" ?
        this.convertToCelsius(this.getData()['main']['temp']) : this.getData();
      return data;
    }, //getTemperature 

    /**
    * Returns data about wind
    */
    getWind: function () {
      let data = this.getData() != "" ? this.getData()['wind']['speed'] : this.getData();
      return data;
    }, //getWind 

    /**
    * Returns data about pressure
    */
    getPressure: function () {
      let data = this.getData() != "" ? this.getData()['main']['pressure'] : this.getData();
      return data;
    }, //getPressure 

    /**
    * Returns data about clouds
    */
    getClouds: function () {
      let data = this.getData() != "" ? this.getData()['clouds']['all'] : this.getData();
      return data;
    }, //getClouds 

    /**
    * Returns data about humidity
    */
    getHumidity: function () {
      let data = this.getData() != "" ? this.getData()['main']['humidity'] : this.getData();
      return data;
    }, //getHumidity 

    /**
    * Returns data weather description
    */
    getDescription: function () {
      let data = this.getData() != "" ? this.getData()['weather'][0]['description'] : this.getData();
      return data;
    }, //getDescription 

    /**
    * Returns data weather icon
    */
    getIcon: function () {
      let data = "";
      let icon = "";

      if (this.getData() != "") {
        data = String(this.getData()['weather'][0]['icon']);
        icon = "https://openweathermap.org/img/wn/" + data + "@2x.png";
      }
      else {
        icon = "";
      }

      return icon;
    }, //getIcon 

  }, //computed 



}
</script>

<style>
#weatherInfoNow {
  height: 300px;
  position: relative;
}

#weatherDescription {
  color: white;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-45%, -50%);
  line-height: 0px;
  font-family: "Bookman Old Style", serif;
}

#temperature {
  font-size: 60px;
  text-align: center;
  display: flex;
}

img {
  margin: auto;
}

#description {
  text-align: center;
  font-size: 20px;
}

#info {
  height: 70px;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
}

.now-item {
  padding: 10px;
}
</style>
