/*** Created by Oleg Vykhopen on 25.11.2015. */

function FileManager(params){
    var self = this;
    self.sortBy = params.sortBy || "name";
    self.container = params.container || document.body;

     // path functionality block
    (function(){
        var pathCont = self._createCont("pathCont");
        self.container.appendChild(pathCont);
        var path = "";
        self.updatePath = function(newPathName, add){
            if (add) {
                path += "/" + newPathName + "";
            }else{
                path = path.slice(path.search("/" + newPathName));
            }
            pathCont.innerHTML = path;
        };
        self.updatePath(self._root, true);
        self.getPath = function(){
            return path;
        };
    })();

     // controls functionality block
    (function(){
        var controls = function(){

            var controlsCont = self._createCont("controls_cont"),
                controls = {};
            self.container.appendChild(controlsCont);
            controls.deleteBtn = self._createBtn("Delete", "_deleteItemBtn", function(){
                self._deleteItem();
            });
            controls.renameBtn = self._createBtn("Rename", "_renameItemBtn", function(){
                self._renameItem();
            });
            controls.createFolderBtn = self._createBtn("Create folder", "_createFolderBtn", function(){
                var curFold = self._getItemByType(self._TYPE_FOLDER),
                    name = self._DEFAULT_FOLDER_NAME + (curFold.defaultItems != 0 ? curFold.defaultItems : ""),
                    item = self._createItem({
                        type: self._TYPE_FOLDER,
                        name: name,
                        action: function(){
                            if (!this.readOnly) return false;
                            // TODO open folder
                        },
                        change: function(){
                            self._changeSelectedStatus(this.checked, item, {type: self._TYPE_FOLDER,name: name});
                        },
                        keyup: function(e){
                            if (e.keyCode == 13){
                                if (confirm("Do you really want rename item ?")) self._verifyName(this, self._TYPE_FOLDER);
                            }
                        }
                    });
            });
            controls.createFileBtn = self._createBtn("Create file", "_createFileBtn", function(){
                var curFiles = self._getItemByType(self._TYPE_FILE),
                    name = self._DEFAULT_FILE_NAME + (curFiles.defaultItems != 0 ? curFiles.defaultItems : ""),
                    item = self._createItem({
                        type: self._TYPE_FILE,
                        name: name,
                        action: function(){
                            if (!this.readOnly) return false;
                            alert("Currently file can not be opened");
                        },
                        change: function(){
                            self._changeSelectedStatus(this.checked, item, {type: self._TYPE_FILE,name: name});
                        },
                        keyup: function(e){
                            if (e.keyCode == 13){
                                if (confirm("Do you really want rename item ?")) self._verifyName(this, self._TYPE_FILE);
                            }
                        }
                    });
            });
            for (var i in controls){
                if (controls.hasOwnProperty(i)) controlsCont.appendChild(controls[i]);
            }
            return controls;

        }();
        self.getControls = function(){
            return controls;
        }
    })();

     // items table functionality block
    (function(){
        var itemsCont = self._createCont("itemsCont");
        self.container.appendChild(itemsCont);
        var headerTB = document.createElement('table');
        headerTB.innerHTML = "<thead>" +
            "<tr>" +
            "<td>Type</td>" +
            "<td>Name</td>" +
            "<td>&nbsp;</td>" +
            "</tr>" +
            "</thead>";
        itemsCont.appendChild(headerTB);
        var itemsTB = document.createElement('table'),
            cont = self._createCont("tbodyCont");
        itemsCont.appendChild(cont);
        cont.appendChild(itemsTB);
        self.getItemsTable = function(){
            return itemsTB;
        };
        // create first toor folder
        self.getItemsTable().appendChild(self._createItem({
            isRoot: true,
            action: function(){
                // TODO back to root folder
            },
            change: function(){
                if (self.getItemsTable().childNodes.length <= 1){
                    this.checked = false;
                    return false;
                }
                var allChbox = self.getItemsTable().querySelectorAll("input[type=checkbox]");
                for (var i = 0; i < allChbox.length; i++){
                    if (allChbox[i] == this) continue;
                    allChbox[i].checked  = this.checked;
                    allChbox[i].onchange();
                }
            }
        }));
    })();

}

FileManager.prototype = {
    constructor: FileManager,
    _root: "rootFolder",
    _selectedItems: [],
    _groupControl: {},
    _TYPE_FOLDER: "folder",
    _TYPE_FILE: "file",
    _DEFAULT_FOLDER_NAME: "newFolder",
    _DEFAULT_FILE_NAME: "newFile",
    _deleteItem: function(){
        var toDeleteCount = this._selectedItems.length;
        if (toDeleteCount == 0){
            alert("Nothing to delete");
            return false;
        }else{
            if (confirm("Delete " + toDeleteCount + (toDeleteCount == 1 ? " item" : " items") + "?")){
                for (var i = 0; i < toDeleteCount; i++){
                    var el = this._selectedItems[i].node;
                    el.parentNode.removeChild(el);
                }
                this._selectedItems = [];
                if (this.getItemsTable().childNodes.length == 1){
                    this._groupControl.checked = false;
                }
                return true;
            }
        }
    },
    _renameItem: function(){
        if (this._selectedItems.length == 0){
            alert("Nothing to rename");
            return false;
        }else{
            for (var i = 0; i < this._selectedItems.length; i++){
                var inp = this._selectedItems[i].node.querySelector('input');
                inp.readOnly = false;
                if (i == 0) inp.focus();
            }
        }
    },
    _isNameUnique: function(el, type){
        var isUnique = true,
            allByType = this._getItemByType(type).nodes;
        for (var i = 0; i < allByType.length; i++){
            var inp = allByType[i].querySelector('input[type=text]');
            if (inp == el) continue;
            if (inp.value == el.value){
                isUnique = false;
                break;
            }
        }
        return isUnique;
    },
    _verifyName: function(inp, type){
        if (this._isNameUnique(inp, type)){
            inp.readOnly = true;
            inp.setAttribute("data-base-value", inp.value);
        }else if (inp.value == ""){
            alert("Name can not be empty");
        }else{
            alert("Such name already exist");
        }
    },
    _createItem: function(params){
        var item = document.createElement("tr"),
            name = params.name || "...",
            _this = this;

        item.className = params.type || this._TYPE_FOLDER;
        item.innerHTML = "" +
            "<td>"+(params.type || this._TYPE_FOLDER)+"</td>" +
            "<td><input type='text' data-base-value='"+name+"' readonly value='" + name +  "' /></td>" +
            "<td>"+ this._createBox('box_'+name).outerHTML +"</td>" +
            "";

        var nameHolder = item.querySelector("input[type=text]"),
            fChBox = item.querySelector("input[type=checkbox]");

        nameHolder.onclick = params.action || function(){};
        nameHolder.onkeyup = params.keyup || function(){};
        if (fChBox != undefined){
            if (params.isRoot) _this._groupControl = fChBox;
            fChBox.onchange = params.change || function(){};
        }

        this.getItemsTable().appendChild(item);
        return item;
    },
    _changeSelectedStatus: function(isSelected, item, itemParams){
        if (isSelected){
            this._selectedItems.push({
                node: item,
                info: itemParams
            });
        }else{
            for (var i = 0; i < this._selectedItems.length; i++){
                if (this._selectedItems[i].node.innerHTML == item.innerHTML){
                    this._selectedItems.splice(i, 1);
                    break;
                }
            }
            var inp = item.querySelector("input[type=text]");
            inp.readOnly = true;
            inp.value = inp.dataset.baseValue;
        }
        if (this._selectedItems.length == 0){
            this._groupControl.checked = false;
        }else if (this._selectedItems.length == this.getItemsTable().childNodes.length - 1){
            this._groupControl.checked = true;
        }
    },
    _getItemByType: function(type){
        var chl = this.getItemsTable().childNodes,
            byType = [],
            defNameCount = 0,
            defName = type == this._TYPE_FILE ? this._DEFAULT_FILE_NAME : this._DEFAULT_FOLDER_NAME;
        for (var i = 1; i < chl.length; i++){
            if (chl[i].className == type){
                byType.push(chl[i]);
                if (chl[i].childNodes[1].querySelector('input').value.search(defName) != -1) defNameCount++;
            }
        }
        return {nodes: byType, defaultItems: defNameCount};
    },
    _createCont: function(className){
        var cont = document.createElement("div");
        cont.className = className;
        return cont;
    },
    _createBtn: function(value, className, action){
        var btn = document.createElement("input");
        btn.type = "button";
        btn.value = value;
        btn.className = className;
        btn.onclick = action;
        return btn;
    },
    _createBox: function(name){
        var box = document.createElement("input");
        box.type = "checkbox";
        box.name = name;
        return box;
    }
};
