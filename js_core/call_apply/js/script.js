/** Curry a Function  */

function greet(gender, age, name) {
    // if a male, use Mr., else use Ms.​
    var salutation = gender === "male" ? "Mr. " : "Ms. ";
    if (age > 25) {
        return "Hello, " + salutation + name + ".";
    } else {
        return "Hey, " + name + ".";
    }
}

// So we are passing null because we are not using the "this" keyword in our greet function.​
var greetAnAdultMale = greet.bind (null, "male", 45);

greetAnAdultMale("John Hartlove");
// "Hello, Mr. John Hartlove."​

var greetAYoungster = greet.bind (null, "", 16);
greetAYoungster("Alex"); // "Hey, Alex."​
greetAYoungster("Emma Waterloo"); // "Hey, Emma Waterloo."


/** Use Call or Apply To Set this in Callback Functions  */

// Define an object with some properties and a method​
// We will later pass the method as a callback function to another function​
var clientData = {
    id: "094545",
    fullName: "Not Set",
    // setUserName is a method on the clientData object​
    setUserName: function (firstName, lastName) {
        // this refers to the fullName property in this object​
        this.fullName = firstName + " " + lastName;
    }
};

function getUserInput(firstName, lastName, callback, callbackObj) {
    // The use of the Apply method below will set the "this" value to callbackObj​
    callback.apply (callbackObj, [firstName, lastName]);
}

// The clientData object will be used by the Apply method to set the "this" value​
getUserInput("Barack", "Obama", clientData.setUserName, clientData);
// the fullName property on the clientData was correctly set​
console.log (clientData.fullName); // Barack Obama​


/** Borrowing Functions with Apply and Call */

//// Borrow aray methods

// An array-like object: note the non-negative integers used as keys​
var anArrayLikeObj = {0: "Martin", 1: 78, 2: 67, 3: ["Letta", "Marieta", "Pauline"], length: 4};

// Make a quick copy and save the results in a real array:​
// First parameter sets the "this" value​
var newArray = Array.prototype.slice.call (anArrayLikeObj, 0);
console.log (newArray); // ["Martin", 78, 67, Array[3]]​

// Search for "Martin" in the array-like object​
console.log (Array.prototype.indexOf.call (anArrayLikeObj, "Martin") === -1 ? false : true); // true​
// Try using an Array method without the call () or apply ()​
console.log (anArrayLikeObj.indexOf ("Martin") === -1 ? false : true); // Error: Object has no method 'indexOf'​

// Reverse the object:​
console.log (Array.prototype.reverse.call (anArrayLikeObj));
// {0: Array[3], 1: 67, 2: 78, 3: "Martin", length: 4}​

// Sweet. We can pop too:​
console.log (Array.prototype.pop.call (anArrayLikeObj));
console.log (anArrayLikeObj); // {0: Array[3], 1: 67, 2: 78, length: 3}​

// What about push?​
console.log (Array.prototype.push.call (anArrayLikeObj, "Jackie"));
console.log (anArrayLikeObj); // {0: Array[3], 1: 67, 2: 78, 3: "Jackie", length: 4}​

//// Borrow Other Methods and Functions

appController.maxNum = function () {
    this.avgScore = Math.max.apply (null, this.scores);
};

appController.maxNum.apply (gameController, gameController.scores);
console.log (gameController.avgScore); // 77


/** Use Apply () to Execute Variable-Arity Functions */

var students = ["Peter Alexander", "Michael Woodruff", "Judy Archer", "Malcolm Khan"];

// No specific parameters defined, because ANY number of parameters are accepted​
function welcomeStudents() {
    console.log(arguments); // when we use apply method function can reach array of arg added by apply with arguments predefined variable
    var args = Array.prototype.slice.call (arguments);
    var lastItem = args.pop ();
    console.log ("Welcome " + args.join (", ") + ", and " + lastItem + ".");
}

welcomeStudents.apply(null, students);
// Welcome Peter Alexander, Michael Woodruff, Judy Archer, and Malcolm Khan.