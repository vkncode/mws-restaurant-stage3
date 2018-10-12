let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const picture = document.createElement('picture');
  const image = document.createElement('img');
  //3 different source tags
  const sourceLarge = document.createElement('source');
  const sourceMedium = document.createElement('source');
  const sourceSmall = document.createElement('source');
  const cropImgPath = '/destimg'; // Folder where the cropped images are
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = DBHelper.imageAltForRestaurant(restaurant);
  image.tabIndex = 0;
  const imgFileName = DBHelper.imageFileNameOfRestaurant(restaurant); // Just the Image name without extension
  //Large,Medium and Small Image path
  const imgLarge = (`${cropImgPath}/${imgFileName}_large.jpg`);
  const imgMedium = (`${cropImgPath}/${imgFileName}_medium.jpg`);
  const imgSmall = (`${cropImgPath}/${imgFileName}_small.jpg`);
  //3 different viewports - 3 different media attribute for source
  const mediaLarge = '(min-width: 960px)';
  const mediaMedium = '(min-width: 600px)';
  const mediaSmall = '(min-width: 300px)';
  //adding attributes to source tag
  sourceLarge.media = mediaLarge;
  sourceLarge.srcset = imgLarge;
  sourceMedium.media = mediaMedium;
  sourceMedium.srcset = imgMedium;
  sourceSmall.media = mediaSmall;
  sourceSmall.srcset = imgSmall;
  
  li.role = 'listitem';
  li.append(picture);
  picture.append(sourceLarge);
  picture.append(sourceMedium);
  picture.append(sourceSmall);
  picture.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  name.role = 'heading';
  name.tabIndex = 0;
  li.append(name);

  /**
   * Adding the favorites button in stage 3
   */
const favorite = document.createElement('button');
const favoriteHeartNo = '\u2661';
const favoriteHeartYes = '\u2665';
//get the current restaurant status
let favoriteStatus = DBHelper.favoriteStatusForRestaurant(restaurant);
console.log(`favorite status: ${favoriteStatus}`);
if(favoriteStatus === 'true'){
  DBHelper.setRedHeart(favorite,favoriteHeartYes);
}
else{
  DBHelper.setBlackHeart(favorite,favoriteHeartNo);
}
favorite.tabIndex = 0;
//toggle the status on click
favorite.addEventListener('click', toggle);
function toggle() {
  const like = favorite.innerHTML;
  if(like==favoriteHeartNo) {
    DBHelper.setRedHeart(favorite,favoriteHeartYes);
    favoriteStatus = true;
  } else {
    DBHelper.setBlackHeart(favorite,favoriteHeartNo);
    favoriteStatus = false;
  }
  DBHelper.updateFavoriteStatus(restaurant.id,favoriteStatus);
}
li.append(favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.tabIndex = 0;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.tabIndex = 0;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/*function setRedHeart(favorite,favoriteHeartYes){
  favorite.innerHTML = favoriteHeartYes;
  favorite.style.color ='red';
  favorite.style.borderColor = 'red';
  favorite.setAttribute('aria-label','set as favorite');
  
}

function setBlackHeart(favorite,favoriteHeartNo){
  favorite.style.color ='black';
  favorite.style.borderColor = 'white'
  favorite.innerHTML = favoriteHeartNo;
  favorite.setAttribute('aria-label','remove favorite status');
  
}*/
/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
