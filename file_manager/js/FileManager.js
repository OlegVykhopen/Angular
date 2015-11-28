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
                path = path.substring(0, path.search("/" + newPathName));
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
                    name = self._DEFAULT_FOLDER_NAME + (curFold.defaultItems != 0 ? curFold.defaultItems : "");
                self._createFolder(name, null, true);
            });
            controls.createFileBtn = self._createBtn("Create file", "_createFileBtn", function(){
                var curFiles = self._getItemByType(self._TYPE_FILE),
                    name = self._DEFAULT_FILE_NAME + (curFiles.defaultItems != 0 ? curFiles.defaultItems : "");
                self._createFile(name, true);
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
        // create first item for returning to parent folder
        self.getItemsTable().appendChild(self._createItem({
            isRoot: true,
            action: function(){ // fire return to parent action
                self._back();
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
        }, false));
    })();

    // storage functionality block
    (function(){
        var storedItems = window.localStorage.getItem(self._KEY_ITEMS),
            baseRoot = {name: self._root, type: self._TYPE_FOLDER, items: []};
        self.getBaseRoot = function(){
            return baseRoot;
        };
        self.setBaseRoot = function(newBaeRoot){
            baseRoot = newBaeRoot;
            return baseRoot;
        };
        if (storedItems != null) baseRoot = JSON.parse(storedItems);
        self._buildItemsFromStorage(self._createStorageRoot(baseRoot.name, baseRoot.items).items); // create root folder for file manager
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
    _KEY_ITEMS: "stored_items",
    _ACTION_ADD: 1,
    _ACTION_DELETE: 2,
    _ACTION_UPDATE: 3,
    _createStorageRoot: function(rootName, rootItems){
        var oldRoot = FileManager.prototype._currentRoot || {};
        FileManager.prototype._currentRoot = { // define new current folder
            name: rootName || this._root,
            type: this._TYPE_FOLDER,
            items: rootItems || []
        };
        FileManager.prototype._currentRoot.__proto__ = oldRoot; // defined parent folder as previous folder
        return FileManager.prototype._currentRoot;
    },
    _updateStorageRoot: function(params){
        var parent = params.parent,
            upItem = params.upItem,
            action = params.action,
            oldItem = params.oldItem,
            oldParent = parent;
        switch (action){
            case this._ACTION_ADD:
                if (upItem.constructor === Array){
                    parent.items.push.apply(parent.items, upItem); // add array to current folder
                }else{
                    parent.items.push(upItem); // add one element to folder
                }
                break;
            case this._ACTION_DELETE:
                parent.items.splice(parent.items.indexOf(upItem));
                break;
            case this._ACTION_UPDATE: // update specific element in folder
                for (var j = 0; j < parent.items.length; j++){
                   if (parent.items[j].name === oldItem.name && parent.items[j].type === oldItem.type){
                       parent.items[j] = upItem;
                       break;
                   }
                }
                break;
        }
        if (parent.__proto__.items != undefined && parent.__proto__.items.length > 0){
            for (var i = 0; i < parent.__proto__.items.length; i++){
                if (parent.__proto__.items[i].name === parent.name && parent.__proto__.items[i].type === parent.type){ // find item in parent and override
                    parent.__proto__.items[i] = parent;
                    break;
                }
            }
            if (parent.__proto__ != null && parent.__proto__.hasOwnProperty("name")){ // save all folder up to root
                this._updateStorageRoot({
                    parent: parent.__proto__, // update parent folder for current
                    upItem: parent,
                    oldItem: oldParent,
                    action: this._ACTION_UPDATE
                });
            }else{ // root is reached
                this._saveStorageRoot(parent); // save whole root
            }
        }else{ // first saving
            parent.__proto__.items = [];
            parent.__proto__.items.push(parent);
            this._saveStorageRoot(parent);
        }
    },
    _saveStorageRoot: function(root){
        this.setBaseRoot(root);
        window.localStorage.setItem(this._KEY_ITEMS, JSON.stringify(root)); // save whole root in storage
    },
    _buildItemsFromStorage: function(items){
        if (items == null || items.length == 0) return false;
        for(var i = 0; i < items.length; i++){
            switch (items[i].type) {
                case this._TYPE_FILE:
                    this._createFile(items[i].name, false);
                    break;
                case this._TYPE_FOLDER:
                    this._createFolder(items[i].name, items[i].items, false);
                    break;
            }
        }
    },
    _deleteItem: function(){ // delete all selected items
        var toDeleteCount = this._selectedItems.length;
        if (toDeleteCount == 0){
            alert("Nothing to delete");
            return false;
        }else{
            if (confirm("Delete " + toDeleteCount + (toDeleteCount == 1 ? " item" : " items") + "?")){
                for (var i = 0; i < toDeleteCount; i++){
                    var el = this._selectedItems[i].node;
                    el.parentNode.removeChild(el);
                    this._updateStorageRoot({parent: this._currentRoot, upItem: this._selectedItems[i].info, action: this._ACTION_DELETE});
                }
                this._selectedItems = [];
                if (this.getItemsTable().childNodes.length == 1){
                    this._groupControl.checked = false;
                }
                return true;
            }
        }
    },
    _renameItem: function(){ // trigger edit mode for items
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
    _isNameUnique: function(el, type){ // check if exist the item with the same type & the same name
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
        if (this._isNameUnique(inp, type) && inp.value != "")  { // accept new name and override base value
            inp.readOnly = true;
            inp.setAttribute("data-base-value", inp.value);
            return true;
        }else if (inp.value == ""){
            alert("Name can not be empty");
            return false;
        }else{
            alert("Such name already exist");
            return false;
        }
    },
    _createItem: function(params, isNew){
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
            if (params.isRoot) FileManager.prototype._groupControl = fChBox; // define group control to manipulate with all others
            fChBox.onchange = params.change || function(){};
        }

        this.getItemsTable().appendChild(item);
        if (!params.isRoot && isNew){
            this._updateStorageRoot({parent: _this._currentRoot, upItem: params, action: _this._ACTION_ADD}); // if creates new item update storage
        }
        return item;
    },
    _createFile: function(name, isNew){
        var _this = this,
            item = _this._createItem({
            type: _this._TYPE_FILE,
            name: name,
            action: function(){
                if (!this.readOnly) return false; // if file in edit mode prevent opening it
                alert("Currently file can not be opened");
            },
            change: function(){
                _this._changeSelectedStatus(this.checked, item, {type: _this._TYPE_FILE,name: name});
            },
            keyup: function(e){ // accept new name when enter is pressed
                if (e.keyCode == 13){
                    if (_this._verifyName(this, _this._TYPE_FILE)){
                        _this._updateStorageRoot({parent: _this._currentRoot, upItem: { type: _this._TYPE_FILE, name: this.value}, action: _this._ACTION_UPDATE , oldItem: {type: _this._TYPE_FILE, name: name}});
                    }
                }
            }
        }, isNew);
        return item;
    },
    _createFolder: function(name, items, isNew){
        var _this = this,
            item = _this._createItem({
                type: _this._TYPE_FOLDER,
                name: name,
                items: items || [],
                action: function(){
                    if (!this.readOnly) return false; // if folder in edit mode prevent opening it
                    _this._openFolder({
                        name: name,
                        items: items
                    });
                },
                change: function(){
                    _this._changeSelectedStatus(this.checked, item, {type: _this._TYPE_FOLDER, name: name, items: items});
                },
                keyup: function(e){ // accept new name when enter is pressed
                    if (e.keyCode == 13){
                        if (_this._verifyName(this, _this._TYPE_FOLDER)){
                            _this._updateStorageRoot({parent: _this._currentRoot, upItem: { type: _this._TYPE_FOLDER, name: this.value}, action: _this._ACTION_UPDATE , oldItem: {type: _this._TYPE_FOLDER, name: name}});
                        }
                    }
                }
            }, isNew);
        return item;
    },
    _openFolder: function(params){ // open specific folder
        this.updatePath(params.name, true); // add folder name to general path
        this._clearTable();
        this._buildItemsFromStorage(this._createStorageRoot(params.name, params.items).items);
    },
    _back: function(){ // back to parent folder
        if (this._isEmptyObject(this._currentRoot.__proto__)){ // check if parent is empty and root is reached
            alert("You are in root already");
        }else{
            this.updatePath(this._currentRoot.name, false);
            FileManager.prototype._currentRoot = FileManager.prototype._currentRoot.__proto__; // make current folder as paernt folder
            this._clearTable();
            this._buildItemsFromStorage(this._currentRoot.items);
        }
    },
    _changeSelectedStatus: function(isSelected, item, itemParams){
        if (isSelected){ // add item to selected array
            this._selectedItems.push({
                node: item,
                info: itemParams
            });
        }else{ // remove item from selected array and change edit mode to readonly
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
        if (this._selectedItems.length == 0){ // check if all boxed not checked uncheck group box
            this._groupControl.checked = false;
        }else if (this._selectedItems.length == this.getItemsTable().childNodes.length - 1){ // and vice verse
            this._groupControl.checked = true;
        }
    },
    _getItemByType: function(type){
        var chl = this.getItemsTable().childNodes,
            byType = [],
            defNameCount = 0,
            defName = type == this._TYPE_FILE ? this._DEFAULT_FILE_NAME : this._DEFAULT_FOLDER_NAME;
        for (var i = 1; i < chl.length; i++){ // get all items except first item that return to parent
            if (chl[i].className == type){
                byType.push(chl[i]);
                if (chl[i].childNodes[1].querySelector('input').value.search(defName) != -1) defNameCount++; // calculate items with default name that was added when were created
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
    },
    _clearTable: function(){ // clear all items in table and insert first node again for returning to parent folder
        var tbl = this.getItemsTable(),
            rootItem = tbl.childNodes[0];
        while (tbl.hasChildNodes()) {
            tbl.removeChild(tbl.lastChild);
        }
        tbl.appendChild(rootItem);
    },
    _isEmptyObject: function(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    }
};
