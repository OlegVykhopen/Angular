function a(){
    b();
    var c = 1;
    console.log(c);
}
function b(){
    var d = 2;
    console.log(d);
}
a();