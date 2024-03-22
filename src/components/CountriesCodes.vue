<template></template>

<script>
import Papa from 'papaparse';

export default {

    data() {
        return {
            file: '',
            allCountriesCities: [], // all countries and their data from the CSV file
            codes: [{ countryCode: "", countryName: "" }], // countries codes and countries names
        }
    },

    async beforeMount() {
        await this.initialInit();
        this.$emit('getCodes', this.codes, this.allCountriesCities);
    },


    methods: {
        async initialInit() {

            //let cities = await this.parseCSV('https://dl.dropboxusercontent.com/s/ioz7sdywe4ee4vvqc1tbh/allCitiesWithRus_Last.csv?rlkey=ut5dqws3mg2v7c7knkuj6nnqv&dl=0');
            //let countries = await this.parseCSV('https://dl.dropboxusercontent.com/s/x8cmbhyr6slhkfgpahwls/allCountriesWithRus.csv?rlkey=s3as2lfphwd2arf050308hmp2&dl=0');
            let cities = await this.parseCSV('https://practicaldeveloper.github.io/parseCsvCities/files/allCitiesWithRus.csv');
            let countries = await this.parseCSV('https://practicaldeveloper.github.io/parseCsvCities/files/allCountriesWithRus.csv');
            debugger;
            this.allCountriesCities = cities;
            this.codes = [];
            this.codes = countries;
        },

        async parseCSV(fileCSV) {
            this.file = fileCSV;
            await this.parseFile();
            return this.content;
        },


        async parseFile() {
            return new Promise(resolve => {
                Papa.parse(this.file, {
                    header: false,
                    download: true,
                    complete: (results) => {
                        this.content = results.data;
                        resolve(results.data);
                    }
                });
            });
        }
    }

}
</script>

<style></style>