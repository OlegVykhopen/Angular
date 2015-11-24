var ParentClass = function(){
    this.getName = function(){
        return this.name;
    };
    this.name = "parent name";
};
ParentClass.prototype = {
    name: "Parent proto name"
};

var StorageManager = function(){
    this.name = "own name";
};
//StorageManager.prototype.constructor = ParentClass.constructor;
StorageManager.prototype = new ParentClass();
StorageManager.prototype.name = "proto name";

var mStorageManager = new StorageManager();
console.log(mStorageManager.getName());