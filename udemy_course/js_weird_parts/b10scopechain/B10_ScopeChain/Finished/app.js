function a() {
    
    function b() {
        console.log(this);
    }
    console.log(this);

	b();
}

var myVar = 1;
a();