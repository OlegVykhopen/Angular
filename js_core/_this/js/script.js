(function test1(a){
    console.log(this);
    (function(b){
        console.log(b);
        console.log(a);
    })(2);
})(1);

/******/

function test1(a){
    console.log(this);
    console.log(a);
}
test1.call(document, 2);

/*******/

var firstName = "Peter",
    lastName = "Ally";
(function showName(){
    console.log(this.firstName + " " + this.lastName);
})();

/*****   this when used in a method passed as a callback    ***/

var user = {
    data:[
        {name:"T. Woods", age:37},
        {name:"P. Mickelson", age:43}
    ],
    clickHandler:function (event) {
        var randomNum = ((Math.random () * 2 | 0) + 1) - 1; // random number between 0 and 1​
        console.log (this.data[randomNum].name + " " + this.data[randomNum].age);
    }
};
document.addEventListener("click", user.clickHandler.bind(user));

/*****  Fix this inside closure  ****/

var user = {
    tournament: "The Masters",
    data: [
        {name: "T. Woods", age: 37},
        {name: "P. Mickelson", age: 43}
    ],
    clickHandler: function () {
        // the use of this.data here is fine, because "this" refers to the user object, and data is a property on the user object.​
        var that = this;
        this.data.forEach(function (person) {
            // But here inside the anonymous function (that we pass to the forEach method), "this" no longer refers to the user object.​
            // This inner function cannot access the outer function's "this"​
            console.log("What is This referring to? " + that); //[object Window]​
            console.log(person.name + " is playing at " + that.tournament);
            // T. Woods is playing at undefined​
            // P. Mickelson is playing at undefined​
        });
    }
};

user.clickHandler(); // What is "this" referring to? [object Window]


/******  this when wrapping via bind *****/

function sayHi() {
    console.log( this.name );
}
sayHi.test = 5;
console.log( sayHi.test ); // 5

var bound = sayHi.bind({
    name: "Вася"
});

console.log( bound.test ); // undefined, because previous context with test variable lost in case of bind

/***************** this when borrowing methods *******/

var gameController = {
    scores  :[20, 34, 55, 46, 77],
    avgScore:null,
    players :[
        {name:"Tommy", playerID:987, age:23},
        {name:"Pau", playerID:87, age:33}
    ]
};
var appController = {
    scores  :[900, 845, 809, 950],
    avgScore:null,
    avg:function () {
        var sumOfScores = this.scores.reduce (function (prev, cur, index, array) {
            return prev + cur;
        });
        console.log(this.scores);
        this.avgScore = sumOfScores / this.scores.length;
    }
};

// Don't run this code, for it is just for illustration; we want the appController.avgScore to remain null​
appController.avg.apply(gameController); // gameController borrow method from appController
console.log(gameController.avgScore);
console.log(appController.avgScore);