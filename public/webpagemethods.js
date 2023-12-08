

//Test: Kat Car
async function carbonCar() {
    var distancetraveled = $("#carDistance").val();
    const url = 'https://tracker-for-carbon-footprint-api.p.rapidapi.com/carTravel';
const options = {
	method: 'POST',
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'X-RapidAPI-Key': '3645ae26c8msh8955484049ad833p122f09jsnf260525158c9',
		'X-RapidAPI-Host': 'tracker-for-carbon-footprint-api.p.rapidapi.com'
	},
	body: new URLSearchParams({
		distance: distancetraveled,
		vehicle: 'SmallDieselCar'
        // The type of car (SmallDieselCar, MediumDieselCar, LargeDieselCar, MediumHybridCar, LargeHybridCar, MediumLPGCar, LargeLPGCar, MediumCNGCar, LargeCNGCar, SmallPetrolVan, LargePetrolVan, SmallDielselVan, MediumDielselVan, LargeDielselVan, LPGVan, CNGVan, SmallPetrolCar, MediumPetrolCar, LargePetrolCar).
	})
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
    document.getElementById("carbuttonresults1").innerHTML="Carbon in kg" + JSON.parse(result).carbon;
} catch (error) {
	console.error(error);
}

}

// carbonCar();

//Test: Kat MotorBike
async function carbonBike() {
    var distancetraveled = $("#motorbikeDistance").val();
    const url = 'https://tracker-for-carbon-footprint-api.p.rapidapi.com/motorBike';
const options = {
	method: 'POST',
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'X-RapidAPI-Key': '3645ae26c8msh8955484049ad833p122f09jsnf260525158c9',
		'X-RapidAPI-Host': 'tracker-for-carbon-footprint-api.p.rapidapi.com'
	},
	body: new URLSearchParams({
		distance: distancetraveled,
		type: 'SmallMotorBike'
        // The type of motorbike (SmallMotorBike, MediumMotorBike, LargeMotorBike).

	})
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
    document.getElementById("carbuttonresults2").innerHTML="Carbon in kg" + JSON.parse(result).carbon;

} catch (error) {
	console.error(error);
}

}

//Test: Kat Bus
async function carbonBus() {
    var distancetraveled = $("#busDistance").val();
    const url = 'https://tracker-for-carbon-footprint-api.p.rapidapi.com/publicTransit';
const options = {
	method: 'POST',
	headers: {
		'content-type': 'application/x-www-form-urlencoded',
		'X-RapidAPI-Key': '3645ae26c8msh8955484049ad833p122f09jsnf260525158c9',
		'X-RapidAPI-Host': 'tracker-for-carbon-footprint-api.p.rapidapi.com'
	},
	body: new URLSearchParams({
		distance: distancetraveled,
		type: 'ClassicBus'

        // The type of transportation (Taxi, ClassicBus, EcoBus, Coach, NationalTrain, LightRail, Subway, FerryOnFoot, FerryInCar).
	})
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
    document.getElementById("carbuttonresults3").innerHTML="Carbon in kg" + JSON.parse(result).carbon;

} catch (error) {
	console.error(error);
}

}

function loginUser(callback) {
    var username = $("#uname").val();
    var password = $("#pswd").val();

    fetch(`/users/search/${username}/${password}`)
        .then(response => {
            if (!response.ok) {
                console.log(response)
                throw new Error("Entered incorrect credentials. Try Again");
            }
            return response.json();
        })
        .then(data => {
            console.log("Success:", data);
            localStorage.setItem
            $("#mydiv").text("Greetings " + data.full_name + "! Logging in...");
            sessionStorage.setItem("currentuser", data);
            window.location.href = "main.html";
            if (callback) {
              callback();
            }
            window.location.href = "main.html";
        })
        .catch(error => {
            console.error("Error:", error.message);
            // Handle errors
            $("#mydiv").text('Sorry, incorrect Username or password.');
        });
}

function logoutUser() {
    console.log("Inside Current user info function");
    // Add your fetch request here
    fetch("/currentuser/delete-all", {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Assuming you want to redirect after successful logout
        window.location.href = "index.html";
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// async function getCurrentUserInfoRyan() {
//     try {
//         const response = await fetch('/currentuser/last');
//         const data = await response.json();

//         if (response.ok) {
//             console.log('API Response:', data);
            
//             $("#username").text("Now viewing "+data.username + "'s search points.");
//             $("#points").text("You have a total of "+ data.point_num + " search points!");
   
//         } else {
//             console.error('API Error:', data.message || 'Unknown error');
//         }
//     } catch (error) {
//         console.error('Fetch Error:', error.message || 'Unknown error');
//     }
// }

async function getCurrentUserInfo(page) {
    try {
        const response = await fetch('/currentuser/last');
        const data = await response.json();

        if (response.ok) {
            console.log('API Response:', data);
            
            if(page == "Map"){
            $("#username").text("Now viewing "+data.username + "'s search points.");
            $("#points").text("You have a total of "+ data.point_num + " search points!");
            }
            else if (page == "Profile"){
                console.log("data: ", data);
                return data;
            }
   
        } else {
            console.error('API Error:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Fetch Error:', error.message || 'Unknown error');
    }
}

function swap(arr,xp, yp)
{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
}
 
function selectionSort(arr,  n)
{
    var i, j, max_idx;
 
    // One by one move boundary of unsorted subarray
    for (i = 0; i < n-1; i++)
    {
        // Find the minimum element in unsorted array
        max_idx = i;
        for (j = i + 1; j < n; j++)
        if (arr[j].point_num > arr[max_idx].point_num)
            max_idx = j;
 
        // Swap the found minimum element with the first element
        swap(arr,max_idx, i);
    }
}


async function mapscore() {
    try {
        const response = await fetch('/currentuser/last');
        const data = await response.json();

        if (response.ok) {
            console.log('API Response:', data);
            incrementPoints(data.username);
            $("#username").text("Now viewing "+data.username + "'s search points.'");
            $("#points").text("You have a total of "+ data.point_num + " search points!'");

            console.log("Map Score was Here!!")
   
        } else {
            console.error('API Error:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Fetch Error:', error.message || 'Unknown error');
    }
}

async function incrementPoints(user) {
    const username = user

    try {
        const response = await fetch(`/users/increment-points/${username}`, {
            method: 'PUT',
        });

        const data = await response.json();

        if (response.ok) {
            console.log('API Response:', data.message);
            // Optionally update the UI or display a success message
        } else {
            console.error('API Error:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Fetch Error:', error.message || 'Unknown error');
    }
}



function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: -33.00, lng: 151 },
    });

    var input = document.getElementById('searchInput');
    var searchButton = document.getElementById('searchButton');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);

        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("No Geo");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
            mapscore();//Update their points when a search is made
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setIcon({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        });

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join('');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);

        for (var i = 0; i < place.address_components.length; i++) {
            if (place.address_components[i].types[0] == 'postal_code') {
                document.getElementById('postal_code').innerHTML = place.address_components[i].long_name;
            }
            if (place.address_components[i].types[0] == 'country') {
                document.getElementById('country').innerHTML = place.address_components[i].long_name;
            }
        }
    });

    searchButton.addEventListener('click', function () {
        // Get the location from the input field and perform the search
        var location = input.value;
        if (location) {
            // Use the geocoding service to get the coordinates
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': location }, function (results, status) {
                if (status === 'OK') {
                    // Set the map center to the first result's coordinates
                    map.setCenter(results[0].geometry.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    });
}


