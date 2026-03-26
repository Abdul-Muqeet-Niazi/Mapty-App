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

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    // Submittimg form to create new Workout
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Switching Options
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    // Use an 'if' statement to handle errors in older browsers that don't support this method
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success Callback
        this._loadMap.bind(this),
        // Error Callback
        function () {
          console.log("Permission is denied or location is unavailable");
        },
      );
    }
  }

  _loadMap(position) {
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    const coord = [latitude, longitude];

    // Implementing the leaflet library
    this.#map = L.map("map").setView(coord, 12);

    // Tile layers (the UI of a map) can be changed by copying the tile layer code from the Leaflet Providers preview website
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap & CARTO",
      },
    ).addTo(this.#map);

    // Handling click on the map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    // We implement the value of "mapE" to global variable "mapEvent" in order to use this global variable below
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // Clear Input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        " ";

    // Display marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

const app = new App();
