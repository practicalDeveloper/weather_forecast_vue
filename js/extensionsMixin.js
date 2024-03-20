export const extensionsMixin = {
    created() {

    },
    data() {
        return {

        }
      },
      methods: {
        elementById(id) {
            return this.$el.querySelector(id);
          },

         /**
         * converts Kelvin degrees into Celsius
         */
          convertToCelsius(val)
          {
              return Math.round((val - 273).toFixed(2));
          },

         /**
         * adds count of days to the date
         */
          addDays (date, days) {
              var date = new Date(date);
              date.setDate(date.getDate() + days);
              return date;
          },

          /**
           * date without time
           */
          dateWithoutTime (date) {
            var date = new Date(date);
            return date.setHours(0,0,0,0);
          }
      }
  }