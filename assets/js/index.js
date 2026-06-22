var launches = document.querySelector("#launches");
var launchesBtn = document.querySelector(`[data-section="launches"]`);
var todayInSpace = document.querySelector("#today-in-space");
var todayInSpaceBtn = document.querySelector(`[data-section="today-in-space"]`);
var planetsBtn = document.querySelector(`[data-section="planets"]`);
var planetsSection = document.querySelector("#planets");
var planetsCard = document.querySelectorAll(".planet-card");

function setActiveBtn(activeBtn) {
  [launchesBtn, todayInSpaceBtn, planetsBtn].forEach((btn) => {
    btn.classList.remove("bg-blue-500/10", "text-blue-400");
    btn.classList.add("text-slate-300");
  });
  activeBtn.classList.add("bg-blue-500/10", "text-blue-400");
  activeBtn.classList.remove("text-slate-300");
}

launchesBtn.addEventListener("click", () => {
  launches.classList.remove("hidden");
  todayInSpace.classList.add("hidden");
  planetsSection.classList.add("hidden");
  setActiveBtn(launchesBtn);
});

todayInSpaceBtn.addEventListener("click", () => {
  launches.classList.add("hidden");
  todayInSpace.classList.remove("hidden");
  planetsSection.classList.add("hidden");
  setActiveBtn(todayInSpaceBtn);
});

planetsBtn.addEventListener("click", () => {
  launches.classList.add("hidden");
  todayInSpace.classList.add("hidden");
  planetsSection.classList.remove("hidden");
  setActiveBtn(planetsBtn);
});

// ==============================
// Fetching Planet Data
// ==============================

var planetIdMap = {
  mercury: "mercury",
  venus: "venus",
  earth: "earth",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturn",
  uranus: "uranus",
  neptune: "neptune",
};

var planetsData = {};

function getPlanets() {
  fetch("https://solar-system-opendata-proxy.vercel.app/api/planets")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }
      return response.json();
    })
    .then(function (resData) {
      var bodies = resData.bodies;

      for (var i = 0; i < bodies.length; i++) {
        var planet = bodies[i];
        var id = planet.englishName.toLowerCase();

        if (planetIdMap[id]) {
          planetsData[id] = planet;
        }
      }

      setupPlanetCards();
      updatePlanetDetail("earth");
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

function setupPlanetCards() {
  planetsCard.forEach(function (card) {
    card.addEventListener("click", function () {
      var planetId = this.getAttribute("data-planet-id");
      updatePlanetDetail(planetId);
    });
  });
}

function updatePlanetDetail(planetId) {
  var p = planetsData[planetId];
  if (!p) return;

  document.getElementById("planet-detail-image").src =
    `./assets/images/${planetId}.png`;
  document.getElementById("planet-detail-image").alt = p.englishName;
  document.getElementById("planet-detail-name").textContent = p.englishName;
  document.getElementById("planet-detail-description").textContent =
    p.description;

  document.getElementById("planet-distance").textContent = p.semimajorAxis
    ? p.semimajorAxis.toLocaleString() + " km"
    : "N/A";

  document.getElementById("planet-radius").textContent = p.meanRadius
    ? p.meanRadius.toLocaleString() + " km"
    : "N/A";

  document.getElementById("planet-mass").textContent = p.mass
    ? `${p.mass.massValue} × 10^${p.mass.massExponent} kg`
    : "N/A";

  document.getElementById("planet-density").textContent = p.density
    ? p.density + " g/cm³"
    : "N/A";

  document.getElementById("planet-orbital-period").textContent = p.sideralOrbit
    ? p.sideralOrbit + " days"
    : "N/A";

  document.getElementById("planet-rotation").textContent = p.sideralRotation
    ? p.sideralRotation + " hours"
    : "N/A";

  document.getElementById("planet-moons").textContent = p.moons
    ? p.moons.length
    : "0";

  document.getElementById("planet-gravity").textContent = p.gravity
    ? p.gravity + " m/s²"
    : "N/A";

  document.getElementById("planet-discoverer").textContent =
    p.discoveredBy || "Known since antiquity";

  document.getElementById("planet-discovery-date").textContent =
    p.discoveryDate || "Ancient";

  document.getElementById("planet-body-type").textContent =
    p.bodyType || "Planet";

  document.getElementById("planet-volume").textContent = p.vol
    ? `${p.vol.volValue} × 10^${p.vol.volExponent} km³`
    : "N/A";

  document.getElementById("planet-perihelion").textContent = p.perihelion
    ? p.perihelion.toLocaleString() + " km"
    : "N/A";

  document.getElementById("planet-aphelion").textContent = p.aphelion
    ? p.aphelion.toLocaleString() + " km"
    : "N/A";

  document.getElementById("planet-eccentricity").textContent =
    p.eccentricity ?? "N/A";

  document.getElementById("planet-inclination").textContent =
    p.inclination != null ? p.inclination + "°" : "N/A";

  document.getElementById("planet-axial-tilt").textContent =
    p.axialTilt != null ? p.axialTilt + "°" : "N/A";

  document.getElementById("planet-temp").textContent = p.avgTemp
    ? (p.avgTemp - 273.15).toFixed(1) + "°C"
    : "N/A";

  document.getElementById("planet-escape").textContent = p.escape
    ? (p.escape / 1000).toFixed(1) + " km/s"
    : "N/A";
}

getPlanets();

// ==============================
// Fetching Launches Data
// ==============================

var launchImageContainer = document.querySelector("#launchImage");
var launchStatus = document.querySelector("#launchStatus");
var launchName = document.querySelector("#launchName");
var launchServiceProvider = document.querySelector("#launchServiceProvider");
var rockConfigurationName = document.querySelector("#rockConfigurationName");
var launchDaysLeft = document.querySelector("#launchDaysLeft");
var launchDateElement = document.querySelector("#launchDateElement");
var launchTimeElement = document.querySelector("#launchTimeElement");
var launchLocation = document.querySelector("#launchLocation");
var locationCountry = document.querySelector("#locationCountry");
var launchDescription = document.querySelector("#launchDescription");

var loaderHtml = `
  <div class="relative w-full h-full min-h-[400px] bg-slate-800 flex items-center justify-center">
    <div class="flex items-center justify-center h-full">
      <i class="fas fa-rocket text-9xl text-slate-700/50 animate-pulse"></i>
    </div>
    <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
  </div>
`;

async function getLaunchData() {
  try {
    if (launchImageContainer) launchImageContainer.innerHTML = loaderHtml;

    var res = await fetch(
      "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10&",
    );

    if (!res.ok) throw new Error("Error at collecting data");

    res = (await res.json()).results;

    addLaunchDetails(res);
  } catch (error) {
    if (launchImageContainer) {
      launchImageContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-exclamation-triangle text-red-400 text-5xl mb-4"></i>
            <p class="text-slate-400 text-lg">Failed to load launches data</p>
            <p class="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>`;
    }
  }
}

function addLaunchDetails(allLaunchesData) {
  launchImageContainer.innerHTML = `<img src="${allLaunchesData[0].image.image_url}" class="w-full h-full object-cover" alt="${allLaunchesData[0].name}">`;
  launchStatus.innerHTML = allLaunchesData[0].status.abbrev;
  launchName.innerHTML = allLaunchesData[0].name;
  launchServiceProvider.innerHTML =
    allLaunchesData[0].launch_service_provider.name;
  rockConfigurationName.innerHTML =
    allLaunchesData[0].rocket.configuration.name;

  var launchDate = new Date(allLaunchesData[0].net);
  var today = new Date();
  var dayLeft = Math.ceil((launchDate - today) / 86400000);

  launchDaysLeft.innerHTML = dayLeft;
  var dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  launchDateElement.innerHTML = launchDate.toLocaleDateString(
    "en-US",
    dateOptions,
  );

  var timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };

  var formattedTime =
    launchDate.toLocaleTimeString("en-US", timeOptions) + " UTC";
  launchTimeElement.innerHTML = formattedTime;

  var cartona = "";
  for (var i = 1; i < allLaunchesData.length; i++) {
    cartona += `            <div
              class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer"
            >
              <div
                class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src="${allLaunchesData[i].image?.image_url || "./assets/images/launch-placeholder.png"}" 
                  onerror="this.onerror=null; this.src='./assets/images/launch-placeholder.png';"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div class="absolute top-3 right-3">
                  <span
                    class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold"
                  >
                    ${allLaunchesData[i].status.abbrev}
                  </span>
                </div>
              </div>
              <div class="p-5">
                <div class="mb-3">
                  <h4
                    class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
                  >
                    ${allLaunchesData[i].name}
                  </h4>
                  <p class="text-sm text-slate-400 flex items-center gap-2">
                    <i class="fas fa-building text-xs"></i>
                    ${allLaunchesData[i].rocket.configuration.name}
                  </p>
                </div>
                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-calendar text-slate-500 w-4"></i>
                    <span class="text-slate-300">${launchDate.toLocaleDateString(
                      "en-US",
                      dateOptions,
                    )}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-clock text-slate-500 w-4"></i>
                    <span class="text-slate-300">${formattedTime}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-rocket text-slate-500 w-4"></i>
                    <span class="text-slate-300">${allLaunchesData[i].rocket.configuration.name}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
                    <span class="text-slate-300 line-clamp-1">KSC, LC-39A</span>
                  </div>
                </div>
                <div
                  class="flex items-center gap-2 pt-4 border-t border-slate-700"
                >
                  <button
                    class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold"
                  >
                    Details
                  </button>
                  <button
                    class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <i class="far fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>`;
    document.querySelector("#launches-grid").innerHTML = cartona;
  }

  launchLocation.innerHTML = allLaunchesData[0].pad.location.name;
  locationCountry.innerHTML = allLaunchesData[0].pad.country.name;
  launchDescription.innerHTML = allLaunchesData[0].mission.description;

  if (allLaunchesData[0].status.abbrev.includes("Go") || allLaunchesData[0].status.abbrev.includes("Success")) {
    launchStatus.classList.add("text-green-400");
    launchStatus.classList.remove("text-yellow-400");
  } else {
    launchStatus.classList.add("text-yellow-400");
    launchStatus.classList.remove("text-green-400");
  }
}

getLaunchData();

// ==============================
// Fetching Today In Space Data
// ==============================

var todayDateElement = document.querySelector("#todayDate");
var apodDateInput = document.querySelector("#apod-date-input");
var apodDateSpan = document.querySelector("#apod-date-span")
var apodImageContainer = document.querySelector("#apod-image-container")
var apodTitle = document.querySelector("#apod-title")
var apodDateDetail = document.querySelector("#apod-date-detail")
var apodExplanation = document.querySelector("#apod-explanation")
var apodCopyright = document.querySelector("#apod-copyright")
var apodDateInfo = document.querySelector("#apod-date-info")
var todayApodBtn = document.querySelector("#today-apod-btn")

var API_KEY = "fhncl3LWWlPL3M4yMoaP1ge3rw183crwGHBxeZse"

async function getTodayData(chossenDate = "") {
  try {
    todayDateElement.innerHTML = "Loading...";
    apodDateSpan.innerHTML = "Loading..."
    apodDateInput.value = "";
    apodImageContainer.innerHTML = `<div id="apod-loading" class="text-center hidden">
                  <i
                    class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"
                  ></i>
                  <p class="text-slate-400">Loading today's image...</p>
                </div>`
    apodTitle.innerHTML= "Loading title..."
    apodDateDetail.innerHTML = "Loading Date..."
    apodExplanation.innerHTML = "Loading Description..."
    apodImageContainer.innerHTML = `<div id="apod-loading" class="text-center">
                  <i
                    class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"
                  ></i>
                  <p class="text-slate-400">Loading today's image...</p>
                </div>`
    apodDateInfo.innerHTML = "Loading..."
    apodCopyright.innerHTML = ""

    var url =`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`

    if(chossenDate){
      url+=`&date=${chossenDate}`
    }
    
    var res = await fetch(url);

    res = await res.json();
    displayTodayData(res);
  } catch (error) {
    console.log(error);
    
    document.querySelector("#apod-loading").innerHTML =`
            <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <p class="text-slate-400">Failed to load today's image</p>
            <p class="text-slate-500 text-sm mt-2">Please try again later</p>
        `
  }
}

function displayTodayData(allTodayData) {
  todayDateElement.innerHTML = allTodayData.date;
  apodDateInput.value = allTodayData.date;
  if(!apodDateInput.max){
    apodDateInput.max = allTodayData.date
  }
  apodDateSpan.innerHTML = allTodayData.date

  var imageSrc = allTodayData.hdurl || allTodayData.url || "./assets/images/placeholder.webp";

  apodImageContainer.innerHTML = `<img
                  id="apod-image"
                  class="w-full h-full object-cover"
                  src="${imageSrc}"
                  alt="Astronomy Picture of the Day"
                />
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div class="absolute bottom-6 left-6 right-6">
                    <button
                      class="w-full py-3 bg-white/10 backdrop-blur-md rounded-lg font-semibold hover:bg-white/20 transition-colors"
                    >
                      <i class="fas fa-expand mr-2"></i>View Full Resolution
                    </button>
                  </div>
                </div>`
  apodTitle.innerHTML = allTodayData.title
  apodDateDetail.innerHTML = allTodayData.date
  apodExplanation.innerHTML = allTodayData.explanation
  apodCopyright.innerHTML = `&copy; ${allTodayData.copyright}`
  apodDateInfo.innerHTML = allTodayData.date
}

if(apodDateInput){
  apodDateInput.addEventListener("change", function(e){
  var selectedDate = e.target.value
  if(selectedDate){
    getTodayData(selectedDate)
  }
})
}

if(todayApodBtn){
  todayApodBtn.addEventListener("click", function(){
    getTodayData()
  })
}

getTodayData();