/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337// Point to Node development server running at 1337
    return `http://localhost:${port}/restaurants`; // Calling Restaurants API to fetch data from the server
    //return `http://192.168.126.1:${port}/data/restaurants.json`;
  }

  /* In openIndexedDb - we are creating the restaurantReview idb
    we are opening the db and returning the Promise 
 */
static openIndexedDB(){
  return idb.open('restaurantReview', 1, function(upgradeDb){
  switch(upgradeDb.oldVersion) {
    case 0:
    case 1:
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        //add the fetched restaurants to the idb
        //addRestaurantsToIdb();
       }      
   });
}//end function openIndexedDB()

/* Function to add/put the restaurants json to Idb
*/
static addRestaurantsToIdb(){
  let fetchRestURL= DBHelper.DATABASE_URL;
  let dbPromise = DBHelper. openIndexedDB();
  fetch(fetchRestURL) // fetch the restaurants json
  .then(function(response) {
      return response.json();
    }) //put the restaurants json into idb
   .then(function(restaurants){
          //console.log("Restaurants JSON: ", restaurants);
           dbPromise.then(function(db) {
              if(!idb) return;
              let tx = db.transaction('restaurants','readwrite');
              let restaurantStore = tx.objectStore('restaurants');
              for(let restaurant of restaurants){ //put each restaurant one by one into the idbstore
                  restaurantStore.put(restaurant);
                  //console.log(`restaurant${restaurant}`);
                }//end for
            });//end function(db)
          //callback  
      })//end .then(function(restaurants)
    .catch(function(error){
      console.log(error);
    });  
}//end function addRestaurantsToIdb()

static getRestaurantsFromIdb(callback) {
  let dbPromise = DBHelper.openIndexedDB();
  dbPromise.then(function(db) {
    if(!idb) return;
    let tx = db.transaction(['restaurants'], 'readonly');
    let restaurantStore = tx.objectStore('restaurants');
    //console.log(restaurantStore.getAll());
    return restaurantStore.getAll();
  }).then(function(restaurants) {
    // Use restaurants data
    //console.log(`why is it undefined ${restaurants}`);
    return restaurants;
  });
}//end function getRestaurantsFromIdb(callback)

/**
  * TODO
  *  New fetchRestaurants using fetch 
  *  Get the restaurants from IDB first, if there are no restaturants in IDB
  *  then Fetch and then store them in the IDB and also return the results
 */
static fetchRestaurants(callback) {
  let fetchRestURL= DBHelper.DATABASE_URL;
  //add the restaurants to idb and Fetch the restaurants from the server
  //DBHelper.addRestaurantsToIdb();
  fetch(fetchRestURL)
    .then( function(response){
        DBHelper.addRestaurantsToIdb();
        return response.json() //the response is restaurants json obj which again returns a promise
          .then( function(restaurants){
            //DBHelper.addRestaurantsToIdb(); //also add it to the idb
            callback(null, restaurants); //we are handling the jsondata here by passing it to the callback
                                        //err is the first param of a callback , here we are handling the error , so passing null
      });
    })
    .catch(error => {
      //if the server is down..try in the idb
      DBHelper.getRestaurantsFromIdb(callback);
      if (!restaurants){ //If there is nothing in IndexedDb then fetch from the server and also put it in the idb
        DBHelper.addRestaurantsToIdb();
      }
      callback(`Fetch request failed, Returned status of ${error}`, null);
    });
}

  /**
   * Fetch a restaurant by its ID.
   * No change in stage2
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   * No change in stage 2
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   * No Change in stage2
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   * No Change in stage2
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * TODO
   * Fetch all neighborhoods with proper error handling.
   * Get the neighborhoods from IDB first.
   * If there are no neighborhoods in IDB, then
   * Fetch and then store it in the IDB
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   * No change in stage 2
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    //Addding the if condition to check if there is a photograph attribute
    //If not get it from the id attribute
    if (restaurant.photograph){
      return (`/img/${restaurant.photograph}.jpg`);
    }
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * TODO
   * Restaurant Image file name
   */
  static imageFileNameOfRestaurant(restaurant) {
    if (restaurant.photograph){
      return (restaurant.photograph); //removing the slice , at this does not have the extension return (restaurant.photograph.slice(0,-4))
    }
    return (restaurant.id);
  }
/**
 * TODO
 * Restaurant image ALT text.
 */
static imageAltForRestaurant(restaurant) {
  return(restaurant.alt);
}


  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
