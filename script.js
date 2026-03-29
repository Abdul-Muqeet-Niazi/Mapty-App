"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  Date = new Date();
  // Creating random ID for each User (More Modern Way)
  ID = self.crypto.randomUUID();

  constructor(coords, distance, duration) {
    this.coords = coords; // coords = [lat, lng]
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.Date.getMonth()]} ${this.Date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

// For Experiment Purpose
// const running1 = new Running([12, -2], 22, 180, 458);
// const cycling1 = new Cycling([35, -25], 6, 30, 30);
// console.log(running1);
// console.log(cycling1);

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Submittimg form to create new Workout
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Switching Options
    inputType.addEventListener("change", this._toggleElevationField);

    // Event Delegation on containerWorkouts("workouts" in HTML) - Locate the event on Map
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  // Implementing the Map using the Geolocation API
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

    // Comes from _getLocalStorage method
    this.#workouts.forEach((work) => {
      this._renderWorkoutMarker(work);
    });
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

    // ---------- Helper classes ----------;
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
    // ------------------------------------;

    // Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // if workout is Running, create Running Object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert(`All inputs must be legitimate, positive numbers!`);
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout is Cycling, create Cycling Object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert(`All inputs must be legitimate, positive numbers!`);
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new Objects(made from above) to workout Array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on the list
    this._renderWorkoutList(workout);

    // Hide form + clear input fields
    this._hideForm();
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        " ";

    // Set local storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    // ---Display marker---
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }),
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`,
      )
      .openPopup();
  }

  _renderWorkoutList(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.ID}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === "running") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === "cycling") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _hideForm() {
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 1000);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    // Guard Clause
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.ID === workoutEl.dataset.id,
    );

    this.#map.setView(workout.coords, 12, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts", this.#workouts));

    // If data is not present!
    if (!data) return;

    // Logic: Insert the local storage data in the "this.#workouts" array
    this.#workouts = data;
    this.#workouts.forEach((work) => {
      this._renderWorkoutList(work);
      // this._renderWorkoutMarker(work);
      // So here, Right after the page loads, we try to add a marker to the map, but the map hasn’t been loaded or defined yet, so the marker cannot be added. So, we will add this method to upper method "_loadMap" where right after the map loads.
    });
  }

  // Public Interface
  // This method will allow us to programmatically reset our local storage through console!
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
