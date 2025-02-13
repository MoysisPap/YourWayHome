// Add a flag to track if the form has been submitted
let formSubmitted = false;

document.addEventListener("DOMContentLoaded", function () {
  const containers = [
    document.getElementById("info_Container"),
    document.getElementById("instructions_Container"),
    document.getElementById("locationDiv"),
    document.getElementById("ratingDiv"),
    document.getElementById("finalDiv"),
    document.getElementById("thanksDiv"),
  ];

  // Function to show the next container
  function showNextContainer(currentIndex) {
    if (currentIndex < containers.length - 1) {
      containers[currentIndex].style.display = "none";
      containers[currentIndex + 1].style.display = "flex";
    }
  }

  // Function to show the previous container
  function showPreviousContainer(currentIndex) {
    if (currentIndex > 0) {
      containers[currentIndex].style.display = "none";
      containers[currentIndex - 1].style.display = "flex";
    }
  }

  // Initially show the first container
  containers[0].style.display = "flex";

  document
    .getElementById("infoBtn")
    .addEventListener("click", () => showNextContainer(0));
  document
    .getElementById("instructions_Btn")
    .addEventListener("click", () => showNextContainer(1));

  // Next button for locationDiv
  document.getElementById("locationBtn").addEventListener("click", () => {
    const locationInput = document.getElementById("location");
    if (locationInput.value.trim() === "") {
      alert("Please enter your location before proceeding.");
    } else {
      showNextContainer(2);
      // Hide the install button on mobile view
      if (window.innerWidth <= 600) {
        document.getElementById("installButton").style.display = "none";
      }
    }
  });

  let ratingInteracted = false;

  document.getElementById("rating").addEventListener("input", () => {
    ratingInteracted = true;
  });

  document.getElementById("ratingBtn").addEventListener("click", () => {
    if (!ratingInteracted) {
      alert("Please move the rating slider before proceeding.");
    } else {
      showNextContainer(3);
    }
  });

  document.getElementById("nextRatingBtn").addEventListener("click", () => {
    if (!ratingInteracted) {
      alert("Please move the rating slider before proceeding.");
    } else {
      showNextContainer(3);
    }
  });

  document
    .getElementById("ratingDiv")
    .querySelector('button[type="button"]')
    .addEventListener("click", () => showPreviousContainer(3));

  initMap();
});

// Google Maps code
let map;
let marker;

function initMap() {
  const initialLocation = { lat: 59.33091976142107, lng: 18.060195177256297 };
  const markerOffset = 0.0021;

  map = new google.maps.Map(document.getElementById("map"), {
    center: initialLocation,
    zoom: 16,
  });

  marker = new google.maps.Marker({
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: {
      lat: initialLocation.lat + markerOffset,
      lng: initialLocation.lng,
    },
  });

  // Ask for location permission when user reaches the locationDiv
  document.getElementById("locationDiv").addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Move the marker to the user's location
          marker.setPosition(userLocation);
          map.setCenter(userLocation);
          updateLocationInput(userLocation); // Set the address input to the user's location
        },
        function () {
          alert("Geolocation permission denied. Using default location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });
}

function updateLocationInput(latLng) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: latLng }, function (results, status) {
    if (status === "OK" && results[0]) {
      document.getElementById("location").value = results[0].formatted_address;
    } else {
      console.error("Geocode was not successful: " + status);
    }
  });
}

// Function to handle next or previous div transition
function nextDiv(currentDivId, nextDivId) {
  const currentDiv = document.getElementById(currentDivId);

  // Check if required fields are filled
  if (!validateInputs(currentDiv)) {
    alert("Please fill out all required fields before proceeding.");
    return;
  }

  currentDiv.style.display = "none";
  document.getElementById(nextDivId).style.display = "block";
}

// Function to validate required inputs in the current div
function validateInputs(div) {
  const inputs = div.querySelectorAll("input[required], textarea[required]");
  for (const input of inputs) {
    if (!input.value || (input.type === "checkbox" && !input.checked)) {
      return false;
    }
  }
  return true;
}

// Function to handle back div transition
function backDiv(currentDivId, previousDivId) {
  document.getElementById(currentDivId).style.display = "none";
  document.getElementById(previousDivId).style.display = "flex";
}

document.getElementById("rating").addEventListener("input", function () {
  this.style.setProperty(
    "--value",
    ((this.value - this.min) / (this.max - this.min)) * 100 + "%"
  );
});

// Function to handle form submission
function submitForm() {
  if (!validateForm() || formSubmitted) {
    return;
  }

  // Set the flag to indicate that the form is submitted
  formSubmitted = true;

  // Gathering form data
  let location = document.getElementById("location").value;
  let rating = document.getElementById("rating").value;
  let comments = document.getElementById("comments").value;
  let email = document.getElementById("email").value;
  let contact = document.getElementById("contact").checked ? "Yes" : "No";

  let timeOfDayCheckboxes = document.querySelectorAll(
    'input[name="timeOfDay"]:checked'
  );
  let timeOfDay = Array.from(timeOfDayCheckboxes).map((cb) => cb.value);

  let optionsCheckboxes = document.querySelectorAll(
    'input[name="options"]:checked'
  );
  let selectedOptions = Array.from(optionsCheckboxes).map((cb) => cb.value);

  // Prepare data for submission
  let data = new URLSearchParams({
    location: location,
    rating: rating,
    comments: comments,
    email: email,
    timeOfDay: timeOfDay.join(", "),
    options: selectedOptions.join(", "),
    timeStamp: new Date().toLocaleString(),
    contact: contact,
  });

  document.getElementById("finalDiv").style.display = "none";
  document.getElementById("thanksDiv").style.display = "flex";

  fetch(
    "https://script.google.com/macros/s/AKfycbwKK4XJO9GrbrM5XpaeJip6lI5P_-SF3_SUMhO-pGvl1FnLsHheK_0Hy78otZS1SGz6lQ/exec",
    {
      method: "POST",
      body: data,
    }
  )
    .then((response) => response.json())
    .then((result) => {
      console.log("Success:", result);
      formSubmitted = false;
    })
    .catch((error) => {
      console.error("Error:", error);
      formSubmitted = false;
    });

  console.log("Form submitted");
}

// Function to validate the form before submission
function validateForm() {
  let isValid = true;

  let locationInput = document.getElementById("location");
  if (!locationInput.value) {
    alert("Please enter your location.");
    isValid = false;
  }

  let ratingInput = document.getElementById("rating");
  if (!ratingInput.value) {
    alert("Please provide a rating.");
    isValid = false;
  }

  let emailInput = document.getElementById("email");
  // Regular expression for validating email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value || !emailPattern.test(emailInput.value)) {
    alert("Please enter a valid email address.");
    isValid = false;
  }

  let checkBox = document.getElementById("terms");
  if (!checkBox.checked) {
    alert("Please accept the terms and privacy policy.");
    isValid = false;
  }

  return isValid;
}
// Add event listener for form submission
document
  .getElementById("feedbackForm")
  .addEventListener("submit", function (event) {
    if (!validateForm()) {
      event.preventDefault();
    } else {
      submitForm();
      event.preventDefault();
    }
  });

function updateValue(value) {
  document.getElementById("currentValue").innerText = value;
}

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker Registered!"))
      .catch(console.error);
  }

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById("installButton").style.display = "block";
  });

  document
    .getElementById("installButton")
    .addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
    });
});

function togglePopup(event) {
  event.stopPropagation();
  const popup = document.getElementById("emailPopup");
  popup.classList.toggle("show");
}

// Close the popup when clicking outside of it
document.addEventListener("click", function (event) {
  const popup = document.getElementById("emailPopup");
  if (
    !popup.contains(event.target) &&
    !event.target.classList.contains("info-icon")
  ) {
    popup.classList.remove("show");
  }
});
