<template>
    <div id="searchArea">

        <form autocomplete="off" id="inputForm">

            <div class="autocomplete">
                <input id="cityinput" type="text" class="searchTerm" 
                    :placeholder="searchPlace" autocomplete="off"
                    @input="updateInput" @keydown="keyDownInput" 
                    data-country="" data-countryCode="" />

                <button type="button">
                    <div class="flex-container">
                        <i class="fa fa-times" @click="clearClick"></i>
                        <div style="width:5px"></div>
                        <i class="fa fa-search" @click="searchClick"></i>
                    </div>

                </button>
            </div>

        </form>

    </div>
</template>

<script>
import { extensionsMixin } from '../../js/extensionsMixin.js'
import { resourcesMixin } from '../../js/resourcesMixin.js'
import ArraySort from 'array-sort'

export default {
    mixins: [extensionsMixin, resourcesMixin],

    data() {
        return {
            currentFocus: 0, // current position of an item in the container with cities 
            cityItemsCount: 0, // count of elements with cities 
            firstDivPosition: 0, // y - position of the first element inside DIV of elements array 
            maxDivHeight: 600, // max height of the DIV container elements array
            totalDivPosition: 0, // y- lower position of the DIV container with elements array 
            selectedDivValue: "",
        }
    },

    props: {
        countriesCodesFilter: {
            type: Array,
            required: true
        },
        countriesCitiesFilter: {
            type: Array,
            required: true
        }
    },

    mounted() {
        document.addEventListener('click', this.documentOnClick);
    },

    beforeDestroy: function () {
        document.removeEventListener('click', this.documentOnClick)
    },

    async beforeMount() {

    },

    methods: {
        documentOnClick: function (e) {
            this.closeAllLists(e.target);
        },

        /**
        * Gets the text area for place searching 
        */
        getCityInput() {
            return this.elementById("#cityinput");
        },

        /**
        * Gets the form with the text area for place searching 
        */
        getInputForm() {
            return this.elementById("#inputForm");
        },

        searchClick() {
            this.$emit('searchClick');
        },

        clearClick() {
            this.getCityInput().value = '';
            this.getCityInput().focus();
            this.$emit('clearClick');
        },

        updateInput(event) {
            var cyrillicPattern = /^[а-яё-\s/(/ /)/]+$/i; // to detect cyrillic string 
            let foundCountriesCities = [{ countryName: "", cityName: "", countryCode: "" }];
            foundCountriesCities = [];
            let value = event.target.value;

            if (value.length > 2) {
                // checks for latin or cyrillic enter
                let isCyrrilic = cyrillicPattern.test(value);

                let getCountryName = this.GetCountryNameByCode.bind(this);
                
                
                // to filter all cities for entered value
                this.countriesCitiesFilter.filter(function (itemCountry) {
                    if (itemCountry.length > 1) {
                        let itemCountryCode = itemCountry[0];
                        let itemCityNameEng = itemCountry[1];
                        let itemCityNameRus = itemCountry[2];
                        let itemCoord = itemCountry[3];
                        let city = isCyrrilic ? itemCityNameRus.toLowerCase() : itemCityNameEng.toLowerCase();
                        // checks city name
                        if (city != '' && city.startsWith(value.toLowerCase())) {
                            let countryCode = itemCountry[0];
                            let country = isCyrrilic ? getCountryName(itemCountryCode)[2] : getCountryName(itemCountryCode)[1];
                            let cityName = isCyrrilic ? itemCityNameRus : itemCityNameEng;

                            let newItemCountry = {
                                countryName: country,
                                cityName: cityName,
                                cityNameEng: itemCityNameEng,
                                countryCode: countryCode,
                                cityCoord: itemCoord
                            };

                            // if there is no duplicate in array then to add it
                            let countriesFound = foundCountriesCities.find(item => (
                                item.countryName == country &&
                                item.cityName == cityName)
                            );

                            if (countriesFound == undefined) {
                                foundCountriesCities.push(newItemCountry);
                            }

                            return true;
                        }
                    }
                });


                ArraySort(foundCountriesCities, 'countryName', 'cityName');
                this.showPopupList(foundCountriesCities);
            }

            if (this.getCityInput().value == '') {
                this.$emit(
                    "getLocation",
                    this.getCityInput().value,
                    this.getCityInput().dataset.cityeng,
                    this.getCityInput().dataset.country,
                    this.getCityInput().dataset.countrycode,
                    this.getCityInput().dataset.coord
                );
            }
        }, //updateInput

        showPopupList(arr) {
            let val = this.getCityInput().value;

            let listDiv; // common DIV container for all array elements
            let listDivContainer; // DIV container with header
            let itemListDiv; //DIV container with particular array element

            //hides countries list 
            this.closeAllLists();
            if (!val) { return false; }
            this.currentFocus = -1;

            listDivContainer = document.createElement("DIV");
            listDivContainer.setAttribute("id", "itemsContainer");
            listDivContainer.innerHTML = "<span>" + this.location + "</span>";
            listDivContainer.setAttribute("class", "autocomplete-itemsContainer");
            this.getCityInput().parentNode.appendChild(listDivContainer);

            /*create a DIV element that will contain the items (values):*/
            listDiv = document.createElement("DIV");
            listDiv.setAttribute("id", this.getCityInput().id + "autocomplete-list");
            listDiv.setAttribute("class", "autocomplete-items");

            this.cityItemsCount = arr.length;

            listDiv.setAttribute('style', 'height: auto');

            /*append the DIV element as a child of the autocomplete container:*/
            listDivContainer.appendChild(listDiv);

            /*for each item in the array...*/
            for (let arrIndex = 0; arrIndex < arr.length; arrIndex++) {
                /*check if the item starts with the same letters as the text field value:*/
                /*create a DIV element for each matching element:*/
                itemListDiv = document.createElement("DIV");

                itemListDiv.innerHTML = `<span class='itemCity'> ${arr[arrIndex].cityName}</span>`;
                itemListDiv.innerHTML += `<span class='itemCountry'>   ${arr[arrIndex].countryName}</span>`;

                /*insert a input field that will hold the current array item's value:*/
                itemListDiv.innerHTML += `
                <input class='itemInput' 
                data-country= "${arr[arrIndex].countryName}"
                data-countrycode = "${arr[arrIndex].countryCode}" 
                data-cityeng = "${arr[arrIndex].cityNameEng}"
                data-coord = "${arr[arrIndex].cityCoord}"
                type='hidden' value= "${arr[arrIndex].cityName}">
                `;

                this.selectedDivValue = itemListDiv.getElementsByTagName("input")[0].value;


                let closeLists = this.closeAllLists;
                let city = this.getCityInput();
                let emit = this.$emit;
                itemListDiv.addEventListener('click', function (event) {
                    // sets selected value into the text field 
                    city.value =
                        this.getElementsByClassName('itemInput')[0].value;
                    city.dataset.country = this.getElementsByClassName('itemInput')[0].dataset.country;
                    city.dataset.countrycode = this.getElementsByClassName('itemInput')[0].dataset.countrycode;
                    city.dataset.cityeng = this.getElementsByClassName('itemInput')[0].dataset.cityeng;
                    city.dataset.coord = this.getElementsByClassName('itemInput')[0].dataset.coord;
                    emit("getLocation", city.value, city.dataset.cityeng, city.dataset.country,
                        city.dataset.countrycode, city.dataset.coord);
                    closeLists();
                });

                itemListDiv.style.cursor = "pointer";
                listDiv.appendChild(itemListDiv);

                // y-coordinate of the first element inside list of the cities
                if (arrIndex == 0) {
                    this.firstDivPosition = this.offset(itemListDiv).top;
                }
            }


            if (listDiv.clientHeight > this.maxDivHeight) {
                listDiv.setAttribute('style', 'height:' + this.maxDivHeight + 'px');
            }

            this.totalDivPosition = this.offset(listDiv).top + listDiv.clientHeight;


        }, //showPopupList

        /**
        * position of the element on the screen 
        */
        offset(el) {
            var rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
        }, //offset


        /**
        * Hides list of the countries and cities under the text field field 
        */
        closeAllLists(elt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            let x = document.getElementsByClassName("autocomplete-items");

            let items = document.getElementById("itemsContainer");
            if (items != undefined) {
                items.parentNode.removeChild(items);
            }

            for (let i = 0; i < x.length; i++) {
                if (elt != x[i] && elt != this.getCityInput()) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }

        }, //closeAllLists    

        GetCountryNameByCode(countryCode) {
            let countryName = this.countriesCodesFilter.filter(itemCountry => itemCountry[0] == countryCode);
            return countryName[0];
        }, //GetCountryNameByCode

        keyDownInput(e) {
            let cityDiv = document.getElementById(this.getCityInput().id + "autocomplete-list");
            if (cityDiv) cityDiv = cityDiv.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /* pressed button with arrow DOWN */
                this.currentFocus++;
                /* to make next item noticeable */
                this.addActive(cityDiv, "down");

            } else if (e.keyCode == 38) { //up
                /* pressed button with arrow UP */
                this.currentFocus--;
                /* to make current item noticeable */
                this.addActive(cityDiv, "up");

            } else if (e.keyCode == 13) {
                /*pressed button ENTER */
                e.preventDefault();
                if (this.currentFocus > -1) {
                    /* simulates click event of an "active" item */
                    if (cityDiv) cityDiv[this.currentFocus].click();
                }
            }
        }, //keyDownInput 


        /**
        * makes current item notable
        */
        addActive(cityDiv, direction) {
            /*a function to classify an item as "active":*/
            if (!cityDiv) return false;
            /*start by removing the "active" class on all items:*/
            this.removeActive(cityDiv);
            if (this.currentFocus >= cityDiv.length) this.currentFocus = 0;
            if (this.currentFocus < 0) {
                this.currentFocus = (cityDiv.length - 1);
            }

            //
            /*add class "autocomplete-active":*/
            cityDiv[this.currentFocus].classList.add("autocomplete-active");
            if (direction == "down") {
                // reached lower border of the cities list
                if (this.offset(cityDiv[this.currentFocus]).top + cityDiv[this.currentFocus].clientHeight >=
                    this.totalDivPosition) {
                    cityDiv[this.currentFocus].scrollIntoView(true);
                }
                if (this.currentFocus == 0) {
                    cityDiv[this.currentFocus].scrollIntoView(false);
                }
            }
            else {
                // reached upper border of the cities list
                if (this.offset(cityDiv[this.currentFocus]).top < this.firstDivPosition) {
                    cityDiv[this.currentFocus].scrollIntoView(false);
                }

                if (this.currentFocus == (this.cityItemsCount - 1)) {
                    cityDiv[this.currentFocus].scrollIntoView(true);
                }
            }
        }, //addActive

        removeActive(cityDiv) {

            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < cityDiv.length; i++) {
                cityDiv[i].classList.remove("autocomplete-active");
            }
        }, //removeActive

        /**
        * position of element on the screen
        */
        offset(el) {
            let rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
        }, //offset


    } //methods
} //export default
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
@import "../../css/variables.css";
@import "../../css/autocomplete.css";
@import "../../css/countriesInput.css";
</style>