"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// Implementing the Map using the Geolocation API

let map, mapEvent;

// Use an 'if' statement to handle errors in older browsers that don't support this method
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    // Success Callback
    function (position) {
      const { longitude } = position.coords;
      const { latitude } = position.coords;
      const coord = [latitude, longitude];

      // Implementing the leaflet library
      map = L.map("map").setView(coord, 12);

      // Tile layers (the UI of a map) can be changed by copying the tile layer code from the Leaflet Providers preview website
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap & CARTO",
        },
      ).addTo(map);

      // Handling click on the map
      map.on("click", function (mapE) {
        // We implement the value of "mapE" to global variable "mapEvent" in order to use this global variable below
        mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    // Error Callback
    function () {
      console.log("Permission is denied or location is unavailable");
    },
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Clear Input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      " ";

  // Display marker
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 50,
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      }),
    )
    .setPopupContent("Workout")
    .openPopup();
});

// Switching Options
inputType.addEventListener("change", function () {
  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
});
