/*** Created by Oleg Vykhopen on 25.11.2015. */

function FileManager(params){
    var self = this;
    self.sortBy = params.sortBy || "name";
    self.container = params.container || document.body;

    /* path functionality block */
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

    /* controls functionality block */
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
                var curFold = self._getItemByType(self._TYPE_FOLDER);
                self._createItem({
                    type: self._TYPE_FOLDER,
                    name: self._DEFAULT_FOLDER_NAME + (curFold.defaultItems != 0 ? curFold.defaultItems : ""),
                    action: function(){
                        alert(1);
                    }
                });
            });
            controls.createFileBtn = self._createBtn("Create file", "_createFileBtn", function(){
                var curFiles = self._getItemByType(self._TYPE_FILE);
                self._createItem({
                    type: self._TYPE_FILE,
                    name: self._DEFAULT_FILE_NAME + (curFiles.defaultItems != 0 ? curFiles.defaultItems : ""),
                    action: function(){
                        alert(2);
                    }
                });
            });
            controlsCont.appendChild(controls.deleteBtn);
            controlsCont.appendChild(controls.renameBtn);
            controlsCont.appendChild(controls.createFolderBtn);
            controlsCont.appendChild(controls.createFileBtn);
            return controls;

        }();
        self.getControls = function(){
            return controls;
        }
    })();

    /* items table functionality block */
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
        self.getItemsTable().appendChild(self._createItem({
            isEmpty: true,
            action: function(){
                alert(3)
            }
        }));
    })();

}

FileManager.prototype = {
    _root: "rootFolder",
    _selectedItems: [],
    _TYPE_FOLDER: "folder",
    _TYPE_FILE: "file",
    _DEFAULT_FOLDER_NAME: "newFolder",
    _DEFAULT_FILE_NAME: "newFile",
    _deleteItem: function(){
        if (this._selectedItems.length == 0){
            alert("Nothing to delete");
            return false;
        }else{
            for (var i = 0; i < this._selectedItems.length; i++){
                var el = this._selectedItems[i].node;
                el.parentNode.removeChild(el);
            }
            this._selectedItems = [];
            return true;
        }
    },
    _renameItem: function(){
        console.log(this);
    },
    _createItem: function(params){
        var item = document.createElement("tr"),
            name = params.name || "...";
        item.className = params.type || this._TYPE_FOLDER;
        item.innerHTML = "" +
            "<td>"+(params.type || this._TYPE_FOLDER)+"</td>" +
            "<td>" + name +  "</td>" +
            "<td>"+ (params.isEmpty == true ? "&nbsp;" : this._createBox('box_'+name).outerHTML) +"</td>" +
            "";
        item.childNodes[1].onclick = params.action || function(){};
        var fChBox = item.childNodes[2].childNodes[0],
            _this = this;
        if (fChBox != undefined && fChBox.tagName && fChBox.tagName.toLocaleLowerCase() == "input") fChBox.onchange = function(){
            _this._changeSelectedStatus(this.checked, item, params);
        };
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
                if (chl[i].childNodes[1].innerText.search(defName) != -1) defNameCount++;
            }
        }
        console.log({nodes: byType, defaultItems: defNameCount});
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
