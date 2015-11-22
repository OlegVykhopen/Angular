// Closures have access to the outer function’s variable even after the outer function returns

var celebrityName = function (firstName) {
    var nameIntro = "This celebrity is ";

    // closure
    return function (theLastName) {
        return nameIntro + firstName + " " + theLastName;
    };
};
var mjName = celebrityName("Michael")("Jackson");
console.log(mjName);


// Closures store references to the outer function’s variables;

function celebrityID() {
    var celebrityID = 999;
    // We are returning an object with some inner functions​
    // All the inner functions have access to the outer function's variables​
    return {
        getID: function () {
            // This inner function will return the UPDATED celebrityID variable​
            // It will return the current value of celebrityID, even after the changeTheID function changes it​
            return celebrityID;
        },
        setID: function (theNewID) {
            // This inner function will change the outer function's variable anytime​
            celebrityID = theNewID;
        }
    }
}

var mjID = celebrityID(); // At this juncture, the celebrityID outer function has returned.​
mjID.getID(); // 999​
mjID.setID(567); // Changes the outer function's variable​
mjID.getID(); // 567: It returns the updated celebrityId variable 

// Closures Gone Awry

function celebrityIDCreator(theCelebrities) {
    var i;
    var uniqueID = 100;
    for (i = 0; i < theCelebrities.length; i++) {
        theCelebrities[i]["id"] = function (j) { // the j parametric variable is the i passed in on invocation of this IIFE​ - Immediately Invoked Function Expression
            return function () {
                return uniqueID + j; // each iteration of the for loop passes the current value of i into this IIFE and it saves the correct value to the array​
            }(); // BY adding () at the end of this function, we are executing it immediately and returning just the value of uniqueID + j, instead of returning a function.​
        }(i); // immediately invoke the function passing the i variable as a parameter​
    }
    return theCelebrities;
}

var actionCelebs = [{name: "Stallone", id: 0}, {name: "Cruise", id: 0}, {name: "Willis", id: 0}];
var createIdForActionCelebs = celebrityIDCreator(actionCelebs);

var stalloneID = createIdForActionCelebs [0];
console.log(stalloneID.id); // 100​

var cruiseID = createIdForActionCelebs [1];
console.log(cruiseID.id); // 101