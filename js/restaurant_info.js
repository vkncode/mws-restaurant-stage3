let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {  
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  
  const imgFileName = DBHelper.imageFileNameOfRestaurant(restaurant);// Just the Image name without extension
  const cropImgPath = '/destimg'; // Folder where the cropped images are
  image.srcset = (`${cropImgPath}/${imgFileName}_medium.jpg 1000w, ${cropImgPath}/${imgFileName}_small.jpg 500w`);
  image.alt = DBHelper.imageAltForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  /* TODO
     Pass the restaurant id to the reviews server and fill the reviews
     following just like self.restaurant.operating_hours
     and fetchCuisines (in main.js)
   */
  const id = self.restaurant.id;
  DBHelper.fetchRestaurantReview(id, (error,reviews) => {
    self.reviews = reviews;
    // fill reviews
  fillReviewsHTML(reviews);
  });
};

/**
 * In stage3 we create the addReview() function 
 * (following just like the other functions written here)
 * this is called on click of the addReview button
 * we get all the form objects here and pass it to dbhelper
 */
addReview = () => {
  event.preventDefault(); //to prevent the default click event of the button
  let restaurant_id = getParameterByName('id');
  let name = document.getElementById('user-name').value;
  let rating = document.getElementById('rating-select').value;
  let comments = document.getElementById('review-comments').value;
  let user_review = [restaurant_id,name,rating,comments];
  console.log(user_review);
  // Map the user-review array to the json review obj of the server
  //we will use it to send it to dbhelper and also to show it on the restaurant page
  const newReview = {
    restaurant_id: parseInt(user_review[0]),
    name: user_review[1],
    //converting the date to unix timestamp
    createdAt: parseInt((new Date().getTime() / 1000).toFixed(0)),
    updatedAt: parseInt((new Date().getTime() / 1000).toFixed(0)),
    //rating: parseInt(user_review[2].substring(0,300)),
    rating: parseInt(user_review[2]),
    comments: user_review[3],
   
  };
  console.log(newReview);
  DBHelper.addReview(newReview);
  //addReviewOnPage(newReview);
  document.getElementById('reviewAdd-form').reset();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.tabIndex = 0;
  li.appendChild(name);

  const date = document.createElement('p');
  let reviewDate = review.createdAt;
  reviewDate = new Date(reviewDate*1000);
 // coverting the unix timestamp to normal date;
 //need to work on this (not sure if this is displaying right)
  let hours = reviewDate.getHours();
  let minutes = "0" + reviewDate.getMinutes();
  let seconds = "0" + reviewDate.getSeconds();
  reviewDate = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  date.innerHTML = reviewDate;
  li.tabIndex = 0;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
