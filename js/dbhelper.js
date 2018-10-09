//Following along the lines of proj3 walkthrough webinar by lorenzo and Elisa

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static DATABASE_URL(id) {
    const port = 1337// Point to Node development server running at 1337
    if (!id) {
        return `http://localhost:${port}/restaurants`; // Calling Restaurants API to fetch data from the server
      //return `http://192.168.126.1:${port}/data/restaurants.json`;
    } else{
            return `http://localhost:${port}/restaurants/${id}`;
    }
  }

  /* In openIndexedDb - we are creating the restaurantReview idb
    we are opening the db and returning the Promise 
    **In stage 3 we are creating the reviewsStore -objectstore in our idb
    *Also setting up the index to resturant_id in reviews(as id here is review id)
 */
static openIndexedDB(){
  return idb.open('restaurantReview', 3, function(upgradeDb){
      switch(upgradeDb.oldVersion) {
          case 0:
          case 1:
            upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
            //add the fetched restaurants to the idb
            //addRestaurantsToIdb();
          case 2:
            const reviewStore = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
            reviewStore.createIndex('reviewStore','restaurant_id');
      }      
  });
}//end function openIndexedDB()

/* Function to add/put the restaurants json to Idb
*/
static addRestaurantsToIdb(){
  let fetchRestURL= DBHelper.DATABASE_URL();
  let dbPromise = DBHelper.openIndexedDB();
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
    callback(null,restaurants);
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
  let fetchRestURL= DBHelper.DATABASE_URL();
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
      })
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
 * In stage3 we are creating this function to test
 * the status of the server
 */
static testServer(){
  const reviewsUrl="http://localhost:1337/reviews";
  return fetch(reviewsUrl).then(function(response) {
    console.dir(response.ok); // returns true if the response returned successfully
    return true;
  })
  .catch(function(error){
      console.log("I am down : server down :",error);
      return false;
    });//end catch
  
  return false;
}//end testServer



/**
 * In stage3 we are creating this function addReviewsToIdb
 * we are adding the reviews to reviewstore in idb
 */
static addReviewsToIdb(reviews){
  console.log(reviews);
  let dbPromise = DBHelper.openIndexedDB();
  dbPromise.then(function(db) {
    if(!idb) return;
    let tx = db.transaction('reviews','readwrite');
    let reviewStore = tx.objectStore('reviews');
    for(let review of reviews){ //put each review one by one into the idbstore
      reviewStore.put(review);
        //console.log(`restaurant${restaurant}`);
      }//end for
  });
}

/**
 * In stage 3 we are creating the function getReviewsFromIdb
 * When the server is down we try to get the reviwes from the idb obj store
 */
static getReviewsFromIdb(id,callback) {
  let dbPromise = DBHelper.openIndexedDB();
  dbPromise.then(function(db) {
    if(!idb) return;
    //let tx = db.transaction(['reviews'], 'readonly');
    //let reviewStore = tx.objectStore('reviews');
    const reviewIndex = db.transaction('reviews', 'readwrite')
        .objectStore('reviews').index('reviewStore');
      console.log(reviewIndex.getAll(id));
      return reviewIndex.getAll(id);
  }).then(function(reviews) {
    // Use reviews data
    callback(null,reviews);
    return reviews;
   
  });
}//end function getRestaurantsFromIdb(callback)

/**
 * In stage3 we are creating this function to add reviews to the server
 * If offline we package the review into a offline data object 
 * and send it to another function for processing
 */
static addReview(newReview){
  //Make an offline object
  let newReviewOffline ={
      name: 'addReview',
      data: newReview,
      object_type: 'review'
  };
  //Now check if the server is online
  //If offline send this offline obj for later processing
  //if(!navigator.onLine && (newReviewOffline.name === 'addReview')){
  //my navigator returns true even when server is down
  //this is also not working
  //if((serverStatus === false) && (newReviewOffline.name === 'addReview')){
  let serverStatus = DBHelper.testServer();
  console.log('Server status : ',serverStatus);
 
  if(!navigator.onLine && (newReviewOffline.name === 'addReview')){
        DBHelper.addReviewOnOnline(newReviewOffline);
        return;
  }

  let myRequest = "http://localhost:1337/reviews";
  let myFetchInit = {
    method: 'POST',
    body: JSON.stringify(newReview),//this is the form data
    headers: new Headers({'Content-Type':'application/json'})
  };
  fetch(myRequest,myFetchInit).then(function(response) {
    let contentType = response.headers.get("content-type");
    if(contentType && contentType.includes("application/json")) {
      return response.json();
    }
    throw new TypeError("Oops, we haven't got JSON!");
  })
  .then(function(json) { console.log("Post successful");/* process your JSON further */ })
  .catch(function(error) { console.log('fetch error',error); });
} // end addReview function

/**
 * In satge 3 we are creating the fn addReviewOnOnline(newReviewOffline)
 * to store the user data when offline and post it when online
 */
static addReviewOnOnline(newReviewOffline){
  console.log('offline object :', newReviewOffline);
  //storing the offline review object in localstorage
  localStorage.setItem('data',JSON.stringify(newReviewOffline.data));
  //let serverStatus = DBHelper.testServer();
  //add event listener to run in background to check is server is online
  window.addEventListener('online',function(event){
    //if(serverStatus === true){
      console.log('I am back : server online!')
      let data = JSON.parse(localStorage.getItem('data'));
      //do this part later --update the UI
      //if online send the data to server
      if(data !== null){
        console.log(data);
        if(newReviewOffline.name ==='addReview'){
          console.log(newReviewOffline.data);
          DBHelper.addReview(newReviewOffline.data);
        }
        //now remove it from local storage
        localStorage.removeItem(newReviewOffline.data);
        console.log(newReviewOffline.data ,': removed')
  
      }//if data
    //}//if test server
  });//end event listener fn
} // end addReviewOnOnline(newReviewOffline) function


/**
 * In stage 3 we are creating this function to fetch the reviews from reviews json
 * we put it in the idb.Here the id is the restaurant id
 * if server is down we try to get it from idb
 */
  static fetchRestaurantReview(id,callback){
    let fetchReviewsURL= "http://localhost:1337/reviews/?restaurant_id=" + id;
    //add the restaurants to idb and Fetch the restaurants from the server
    //DBHelper.addRestaurantsToIdb();
    let serverStatus = DBHelper.testServer();
    console.log("Testing the server status: ",serverStatus);
    fetch(fetchReviewsURL).then(function(response) {
                response.json().then(function(response){
                                let reviews = response;
                                DBHelper.addReviewsToIdb(reviews);
                                console.log(reviews);
                                callback(null,reviews);
                                
                                
                });
    }).catch(error => {
                      //if the server is down..try in the idb
                      DBHelper.getReviewsFromIdb(id,callback);
                      if (!reviews){ //If there is nothing in IndexedDb then fetch from the server and also put it in the idb
                        DBHelper.addReviewsToIdb();
                      }
      callback(`Fetch request failed, Returned status of ${error}`, null);
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
