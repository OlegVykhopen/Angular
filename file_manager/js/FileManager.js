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
        // create first toor folder
        self.getItemsTable().appendChild(self._createItem({
            isRoot: true,
            action: function(){
                alert(1);
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
        }, false));
    })();

    // storage functionality block
    (function(){
        var storedItems = window.localStorage.getItem(self._KEY_ITEMS);
        if (storedItems != null){
            var baseRoot = JSON.parse(storedItems);
            self.getBaseRoot = function(){
                return baseRoot;
            };
            self._createStorageRoot(baseRoot.root, baseRoot.items);
            self._buildItemsFromStorage(baseRoot.items);
        }else{
            self._createStorageRoot(null, null);
            self._saveStorageRoot();
        }
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
        var pathArr = this.getPath().split("/");
        FileManager.prototype._currentRoot = {
            root: rootName || pathArr[pathArr.length - 1],
            items: rootItems || []
        };
    },
    _updateStorageRoot: function(upItems, action, oldItem){
        switch (action){
            case this._ACTION_ADD:
                if (upItems.constructor === Array){
                    this._currentRoot.items.push.apply(this._currentRoot.items, upItems)
                }else{
                    this._currentRoot.items.push(upItems);
                }
                break;
            case this._ACTION_DELETE:
                this._currentRoot.items.splice(this._currentRoot.items.indexOf(upItems));
                break;
            case this._ACTION_UPDATE:
                for (var i = 0; i < this._currentRoot.items.length; i++){
                   if (this._currentRoot.items[i].name === oldItem.name && this._currentRoot.items[i].type === oldItem.type){
                       this._currentRoot.items[i] = upItems;
                       break;
                   }
                }
                break;
        }
    },
    _saveStorageRoot: function(){
        window.localStorage.setItem(this._KEY_ITEMS, JSON.stringify(this._currentRoot));
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
                    this._updateStorageRoot(this._selectedItems[i].info, this._ACTION_DELETE);
                    this._saveStorageRoot();
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
            if (params.isRoot) FileManager.prototype._groupControl = fChBox;
            fChBox.onchange = params.change || function(){};
        }

        this.getItemsTable().appendChild(item);
        if (!params.isRoot && isNew){
            this._updateStorageRoot(params, this._ACTION_ADD);
            this._saveStorageRoot();
        }
        return item;
    },
    _createFile: function(name, isNew){
        var _this = this,
            item = _this._createItem({
            type: _this._TYPE_FILE,
            name: name,
            action: function(){
                if (!this.readOnly) return false;
                alert("Currently file can not be opened");
            },
            change: function(){
                _this._changeSelectedStatus(this.checked, item, {type: _this._TYPE_FILE,name: name});
            },
            keyup: function(e){
                if (e.keyCode == 13){
                    if (_this._verifyName(this, _this._TYPE_FILE)){
                        _this._updateStorageRoot({ type: _this._TYPE_FILE, name: this.value}, _this._ACTION_UPDATE , {type: _this._TYPE_FILE, name: name});
                        _this._saveStorageRoot();
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
                    if (!this.readOnly) return false;
                    _this._openFolder({
                        name: name,
                        items: items
                    });
                },
                change: function(){
                    _this._changeSelectedStatus(this.checked, item, {type: _this._TYPE_FOLDER, name: name, items: items});
                },
                keyup: function(e){
                    if (e.keyCode == 13){
                        if (_this._verifyName(this, _this._TYPE_FOLDER)){
                            _this._updateStorageRoot({ type: _this._TYPE_FOLDER, name: this.value, items: items}, _this._ACTION_UPDATE , {type: _this._TYPE_FOLDER, name: name,
                                items: items});
                            _this._saveStorageRoot();
                        }
                    }
                }
            }, isNew);
        return item;
    },
    _openFolder: function(params){
        this.updatePath(params.name, true);
        this._clearTable();
        this._updateStorageRoot(params.name, params.items);
        this._buildItemsFromStorage(params.items);
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
    },
    _clearTable: function(){
        var tbl = this.getItemsTable(),
            rootItem = tbl.childNodes[0];
        while (tbl.hasChildNodes()) {
            tbl.removeChild(tbl.lastChild);
        }
        tbl.appendChild(rootItem);
    }
};
