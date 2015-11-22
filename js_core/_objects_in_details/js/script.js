    var ageGroup = {30: "Children", 100: "Very Old"};
    //console.log(ageGroup.30); ---- Error
    console.log(ageGroup["30"]);

    /*****  hasOwnProperty ******/

    // Create a new school object with a property name schoolName​
    ​
    var school = {schoolName: "MIT"};
    console.log(school.hasOwnProperty ("schoolName")); // true​
    console.log(school.hasOwnProperty ("toString"));  // false

    /**** Accessing and Enumerating Properties  ****/

    // Create a new school object with 3 own properties: schoolName, schoolAccredited, and schoolLocation.​
    ​
    var school = {schoolName: "MIT", schoolAccredited: true, schoolLocation: "Massachusetts"};
    for (var eachItem in school) {
        console.log(eachItem); // Prints schoolName, schoolAccredited, schoolLocation​
    }

    /**** Deleting Properties of an Object  ****/

    var christmasList = {mike: "Book", jason: "sweater"}
    delete christmasList.mike; // deletes the mike property​
    for (var people in christmasList) {
        console.log(people); // mike is deleted
    }
    delete christmasList.toString; // returns true, but toString not deleted because it is an inherited method​
    christmasList.toString(); //"[object Object]"​

    console.log(school.hasOwnProperty("educationLevel")); //true​
    delete school.educationLevel; //true
    console.log(school.educationLevel); //undefined
    ​
    var newSchool = new HigherLearning();
    console.log(newSchool.educationLevel); // University​
    HigherLearning.prototype.educationLevel2 = "University 2";
    console.log(school.hasOwnProperty("educationLevel2")); //false​
    console.log(school.educationLevel2); // University 2​
    delete school.educationLevel2; //true (always returns true, as noted earlier)
    console.log(school.educationLevel2); //University 2​