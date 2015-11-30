/*** Created by Oleg Vykhopen on 25.11.2015. */

function FileManager(params){
    var self = this;
    self.sortByProperty = params.sortByProperty || self._SORT_BY_NAME;
    self.sortByIncrement = params.sortByIncrement || false;
    self.container = params.container || document.body;

    /** strings */
    self.deleteBtnTxt = params.deleteBtnTxt || "Delete";
    self.renameBtnTxt = params.renameBtnTxt || "Rename";
    self.creteFolderBtnTxt = params.creteFolderBtnTxt || "Create folder";
    self.creteFileBtnTxt = params.creteFileBtnTxt || "Create file";
    self.noForDeleteTxt = params.noForDeleteTxt || "Nothing to delete";
    self.noForRenameTxt = params.noForDeleteTxt || "Nothing to rename";
    self.deleteTxt = params.deleteTxt || "Delete";
    self.itemTxt = params.itemTxt || "item";
    self.itemsTxt = params.itemsTxt || "items";
    self.noEmptyNameTxt = params.noEmptyNameTxt || "Name can not be empty";
    self.existNameTxt = params.existNameTxt || "Such name already exist";
    self.allowOpenFileTxt = params.allowOpenFileTxt || "Currently file can not be opened";
    self.inRootTxt = params.inRootTxt || "You are in root folder";
    self.typeTxt = params.typeTxt || "Type";
    self.nameTxt = params.nameTxt || "Name";

    /** classes */
    self.contClass = params.contClass || "itemsCont";
    self.pathContClass = params.pathContClass || "pathCont";
    self.headerTblClass = params.headerTblClass || "";
    self.itemsTblClass = params.itemsTblClass || "";
    self.itemsTblContClass = params.itemsTblContClass || "tbodyCont";
    self.controlsContClass = params.controlsContClass || "controls_cont";
    self.deleteBtnClass = params.deleteBtnClass || "_deleteItemBtn";
    self.renameBtnClass = params.renameBtnClass || "_renameItemBtn";
    self.crFolderBtnClass = params.crFolderBtnClass || "_createFolderBtn";
    self.crFileBtnClass = params.crFileBtnClass || "_createFileBtn";

     // path functionality block
    (function(){
        var pathCont = self._createCont(self.pathContClass);
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

            var controlsCont = self._createCont(self.controlsContClass),
                controls = {};
            self.container.appendChild(controlsCont);
            controls.deleteBtn = self._createBtn(self.deleteBtnTxt, self.deleteBtnClass, function(){
                self._deleteItem();
            });
            controls.renameBtn = self._createBtn(self.renameBtnTxt, self.renameBtnClass, function(){
                self._renameItem();
            });
            controls.createFolderBtn = self._createBtn(self.creteFolderBtnTxt, self.crFolderBtnClass, function(){
                var curFold = self._getItemByType(self._TYPE_FOLDER),
                    name = self._DEFAULT_FOLDER_NAME + (curFold.defaultItems != 0 ? curFold.defaultItems : ""); // add default name for folder depends on quantity
                self._createFolder(name, null, true);
            });
            controls.createFileBtn = self._createBtn(self.creteFileBtnTxt, self.crFileBtnClass, function(){
                var curFiles = self._getItemByType(self._TYPE_FILE),
                    name = self._DEFAULT_FILE_NAME + (curFiles.defaultItems != 0 ? curFiles.defaultItems : ""); // add default name for file depends on quantity
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
        var itemsCont = self._createCont(self.contClass);
        self.container.appendChild(itemsCont);
        var headerTB = document.createElement('table');
        headerTB.className = self.headerTblClass;
        headerTB.innerHTML = "<thead>" +
            "<tr>" +
            "<td><span class='sortByType' data-act="+(self.sortByProperty == self._SORT_BY_TYPE)+">"+self.typeTxt+"</span></td>" +
            "<td><span class='sortByName' data-act="+(self.sortByProperty == self._SORT_BY_NAME)+">"+self.nameTxt+"</span></td>" +
            "<td>&nbsp;</td>" +
            "</tr>" +
            "</thead>";
        itemsCont.appendChild(headerTB);
        var itemsTB = document.createElement('table'),
            cont = self._createCont(self.itemsTblContClass);
        itemsCont.appendChild(cont);
        itemsTB.className = self.itemsTblClass;
        cont.appendChild(itemsTB);
        self.getItemsTable = function(){
            return itemsTB;
        };
        self.getHeaderTale = function(){
            return headerTB;
        };
        // create first item for returning to parent folder
        itemsTB.appendChild(self._createItem({
            isRoot: true,
            name: "...",
            action: function(){ // fire return to parent action
                self._back();
            },
            change: function(){
                if (self.getItemsTable().childNodes.length <= 1){ // return if just root folder exist
                    this.checked = false;
                    return false;
                }
                var allChbox = self.getItemsTable().querySelectorAll("input[type=checkbox]");
                for (var i = 0; i < allChbox.length; i++){ // make all checkboxes the same status as group control
                    if (allChbox[i] === this) continue;
                    if (allChbox[i].checked !== this.checked) self._triggerBoxChange(this.checked, allChbox[i]); // set the same status if already is not set
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
        self._buildItemsFromStorage(self._createStorageRoot(baseRoot.name, baseRoot.items).items.sort(self._sortBy(self.sortByProperty))); // create root folder for file manager
    })();

    // sort buttons functionality
    (function(){
        var headerTbl = self.getHeaderTale(),
            sortByNameBtn = headerTbl.querySelector('.sortByName'),
            sortByTypeBtn = headerTbl.querySelector('.sortByType');
        sortByNameBtn.onclick = function(){
            self.sortByProperty == self._SORT_BY_NAME ? self.sortByIncrement = !self.sortByIncrement : self.sortByIncrement = true;
            self._sortButtonAction(this, sortByTypeBtn, self._SORT_BY_NAME);
        };
        sortByTypeBtn.onclick = function(){
            self.sortByProperty == self._SORT_BY_TYPE ? self.sortByIncrement = !self.sortByIncrement : self.sortByIncrement = true;
            self._sortButtonAction(this, sortByNameBtn, self._SORT_BY_TYPE);
        };
    })();

    // events block
    document.addEventListener("keyup", function(e){
        switch (e.keyCode){
            case 113:
                self._renameItem();
                break;
            case 27:
                self._triggerBoxChange(false, self._groupControl);
                break;
            case 46:
                self._deleteItem();
                break;
            default:
        }
    });

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
    _SORT_BY_TYPE: "type",
    _SORT_BY_NAME: "name",
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
        if (items === null || items.length === 0) return false;
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
        if (toDeleteCount === 0){
            alert(this.noForDeleteTxt);
            return false;
        }else{
            if (confirm(this.deleteTxt + " " + toDeleteCount + (toDeleteCount === 1 ? " " + this.itemTxt : " " + this.itemsTxt) + "?")){
                for (var i = 0; i < toDeleteCount; i++){
                    var el = this._selectedItems[i].node;
                    el.parentNode.removeChild(el);
                    this._updateStorageRoot({parent: this._currentRoot, upItem: this._selectedItems[i].info, action: this._ACTION_DELETE});
                }
                this._selectedItems = [];
                this._groupControl.checked = false;
                document.activeElement.blur();
                return true;
            }
        }
    },
    _renameItem: function(){ // trigger edit mode for items
        if (this._selectedItems.length === 0){
            alert(this.noForRenameTxt);
            return false;
        }else{
            for (var i = 0; i < this._selectedItems.length; i++){
                var inp = this._selectedItems[i].node.querySelector('input');
                inp.readOnly = false;
                if (i === 0){
                    inp.focus();
                    inp.setSelectionRange(0, inp.value.length)
                }
            }
        }
    },
    _isNameUnique: function(el, type){ // check if exist the item with the same type & the same name
        var isUnique = true,
            allByType = this._getItemByType(type).nodes;
        for (var i = 0; i < allByType.length; i++){
            var inp = allByType[i].querySelector('input[type=text]');
            if (inp === el) continue;
            if (inp.value === el.value){
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
        }else if (inp.value === ""){
            alert(this.noEmptyNameTxt);
            return false;
        }else{
            alert(this.existNameTxt);
            return false;
        }
    },
    _createItem: function(params, isNew){
        var item = document.createElement("tr"),
            name = params.name || "newItem",
            _this = this;

        item.className = params.type || this._TYPE_FOLDER;
        item.innerHTML = "" +
            "<td>"+(params.type || 'root')+"</td>" +
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
                alert(_this.allowOpenFileTxt);
            },
            change: function(){
                _this._changeSelectedStatus(this.checked, item, {type: _this._TYPE_FILE,name: name});
                if (this.checked) item.querySelector("input[type=text]").setSelectionRange(0, 0);
            },
            keyup: function(e){ // accept new name when enter is pressed
                if (e.keyCode === 13){
                    if (_this._verifyName(this, _this._TYPE_FILE)){
                        _this._triggerBoxChange(false, item.querySelector("input[type=checkbox]"));
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
                    if (this.checked) item.querySelector("input[type=text]").setSelectionRange(0, 0);
                },
                keyup: function(e){ // accept new name when enter is pressed
                    if (e.keyCode === 13){
                        if (_this._verifyName(this, _this._TYPE_FOLDER)){
                            _this._triggerBoxChange(false, item.querySelector("input[type=checkbox]"));
                            _this._updateStorageRoot({parent: _this._currentRoot, upItem: { type: _this._TYPE_FOLDER, name: this.value}, action: _this._ACTION_UPDATE , oldItem: {type: _this._TYPE_FOLDER, name: name}});
                        }
                    }
                }
            }, isNew);
        return item;
    },
    _triggerBoxChange: function(status, box){
        box.checked = status;
        box.onchange();
        if (!status) box.blur();
    },
    _openFolder: function(params){ // open specific folder
        this.updatePath(params.name, true); // add folder name to general path
        this._clearTable();
        this._buildItemsFromStorage(this._createStorageRoot(params.name, params.items).items.sort(this._sortBy(this.sortByProperty)));
    },
    _back: function(){ // back to parent folder
        if (this._isEmptyObject(this._currentRoot.__proto__)){ // check if parent is empty and root is reached
            alert(this.inRootTxt);
        }else{
            this.updatePath(this._currentRoot.name, false);
            FileManager.prototype._currentRoot = FileManager.prototype._currentRoot.__proto__; // make current folder as paernt folder
            this._clearTable();
            this._buildItemsFromStorage(this._currentRoot.items.sort(this._sortBy(this.sortByProperty)));
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
                if (this._selectedItems[i].node.innerHTML === item.innerHTML){
                    this._selectedItems.splice(i, 1);
                    break;
                }
            }
            var inp = item.querySelector("input[type=text]");
            inp.readOnly = true;
            inp.value = inp.dataset.baseValue;
        }
        if (this._selectedItems.length === 0){ // check if all boxed not checked uncheck group box
            this._groupControl.checked = false;
        }else if (this._selectedItems.length === this.getItemsTable().childNodes.length - 1){ // and vice verse
            this._groupControl.checked = true;
        }
    },
    _getItemByType: function(type){
        var chl = this.getItemsTable().childNodes,
            byType = [],
            defNameCount = 0,
            defName = type === this._TYPE_FILE ? this._DEFAULT_FILE_NAME : this._DEFAULT_FOLDER_NAME;
        for (var i = 1; i < chl.length; i++){ // get all items except first item that return to parent
            if (chl[i].className === type){
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
    },
    _sortButtonAction: function(sortBtn, altBtn, type){
        sortBtn.dataset.act = true;
        altBtn.dataset.act = false;
        this.sortByProperty = type;
        this._clearTable();
        this._buildItemsFromStorage(this._currentRoot.items.sort(this._sortBy(type)));
    },
    _sortBy: function(property){
        var sortOrder = 1,
            _this = this;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result;
            if (_this.sortByIncrement){
                result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            }else{
                result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
            }
            return result * sortOrder;
        }
    }
};
