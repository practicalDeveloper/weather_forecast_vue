<template>
  <div class="tab">
     <button  
        v-for="item in forecastTypes" 
        class="tablinks" 
        @click = "changeForecast($event, item)">
        {{ item }}
     </button>
  </div>
</template>

<script> 
import { extensionsMixin } from '../../js/extensionsMixin.js'
import { resourcesMixin } from '../../js/resourcesMixin.js'

  export default {
    mixins: [extensionsMixin, resourcesMixin],

      methods : {

          /**
          * Changes forecast type 
          */
        changeForecast(evt, type) {
              let i,  tablinks;

              tablinks = document.getElementsByClassName("tablinks");
              for (i = 0; i < tablinks.length; i++) {
                  tablinks[i].className = tablinks[i].className.replace("active", "");
              }

              evt.currentTarget.className += " active";
              this.$emit('getForecastType',  type);
          } 
      }
  }
</script>

<style>

@import "../../css/variables.css";

/* Style the tab */
.tab {
overflow: hidden;
border: 1px solid #000000;
background-color: #f1f1f1;
}

/* Style the buttons inside the tab */
.tab button {
background-color: inherit;
float: left;
border: none;
outline: none;
cursor: pointer;
padding: 14px 16px;
transition: 0.3s;
font-size: 17px;
}

/* Change background color of buttons on hover */
.tab button:hover {
background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
display: none;
padding: 6px 12px;
border: 1px solid #ccc;
border-top: none;
}

</style>
