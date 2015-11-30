var fs = require('fs');
var watch = require('node-watch');

var Amble = require('./js/amble-editor.js');
var Camera = require('./js/camera.js');

var projectPath = '../project-folder';

var projectView = {
    projectStructure: [],
    makeList: function(array) {

        var list = document.createElement("ul");
        list.className = "list";

        for(var i = 0; i < array.length; i++) {
            list.appendChild(this.item(array[i]));
        }

        return list;
    },

    item: function(item) {
        var div = document.createElement("li");

        div.className = "list-item"

        var header = document.createElement('div');
        header.className = 'header';

        var icon = document.createElement("i");

        switch(item.type) {
            case 'folder':

                var arrow = document.createElement("i");
                arrow.className = "fa fa-caret-right no-clickable triangle icon"
                header.appendChild(arrow);
                icon.className = "fa fa-folder no-clickable folder icon"

                break;
            case 'file':

                icon.className = "fa fa-file-text-o no-clickable file icon"

                break;

        }

        header.appendChild(icon);

        var text = document.createElement("a");
        text.href = "#"
        text.className = 'list-item';
        text.innerHTML = item.name;
        text.addEventListener('click', this.itemOnClick, false);

        header.appendChild(text);
        div.appendChild(header);

        if(item.childs.length > 0) {
            div.appendChild(this.makeList(item.childs));
        }

        return div;
    },

    itemOnClick: function(e) {
        e.preventDefault();

        //if file else collapse/expand directory

        var normal = 'header';
        var highlighted = "header highlighted";

        var parent = e.target.parentElement;
        console.log(parent)

        if(parent.className == normal) {
            parent.className = highlighted;
        } else {
            parent.className = normal;
        }

    },

    processDir: function(path) {

        var files = [];

        var abc = fs.readdirSync(path)

        for(var i = 0; i < abc.length; i++) {

            var file = {
                type: fs.lstatSync(path + '/' + abc[i]).isDirectory() ? 'folder': 'file',
                path: path + '/' + abc[i],
                name: abc[i],
                childs: []
            }

            if(file.type == 'folder') {
                file.childs = this.processDir(path + '/' + abc[i]);
            }

            files.push(file)
        }

        return files;

    },

    watch: function(){

        watch(projectView.projectPath, function(filename){
            projectView.projectStructure = projectView.processDir(projectPath);
            var list = document.getElementById("list");
            list.innerHTML = "";
            for(var i = 0; i < projectView.projectStructure.length; i++) {
                list.appendChild(projectView.item(projectView.projectStructure[i]));
            }
        });

    },

    init: function(){

        this.projectStructure = this.processDir(projectPath);

        var list = document.getElementById("list");
        for(var i = 0; i < this.projectStructure.length; i++) {
            list.appendChild(this.item(this.projectStructure[i]));
        }

        this.watch();

    }
}

projectView.init();

var ambleEditor = angular.module('ambleEditor', []);
ambleEditor.controller('inspectorController', function() {

    var inspector = this;

    inspector.actorName = 'some name';

});

ambleEditor.controller('hierarchyController', function($scope){

    var hierarchy = this;

    hierarchy.actors = Amble.app.scene.children;

    //
    // console.log(Amble.app.scene.children.length);
    //
    // $scope.he = function(o){
    //
    //     hierarchy.actors = $scope.actors = o;
    //
    // }
    //
    // $scope.he(Amble.app.scene.children);
    //
    // $scope.$watchCollection('actors', function(current, original) {
    //     // console.log(current);
    //     // console.log(original);
    //
    //     $scope.he(current);
    //
    //     // console.log(current);
    //     // console.log(original);
    //     // if(current !== original) {
    //     //     console.log('asdasd')
    //     //     // hierarchy.actors = Amble.app.scene.children;
    //     // }
    //     // console.log(current)
    //
    //
    // });

});

var inspectorView = {

    printActor: function(actor) {

        var name = document.getElementById('actor-name');
        var x = document.getElementById('transform-x');
        var y = document.getElementById('transform-y');
        var width = document.getElementById('transform-width');
        var height = document.getElementById('transform-height');
        var rotation = document.getElementById('transform-rotation');

        console.log(actor);

        name.value = actor.name;

        if(actor.name != 'MainCamera') {
            x.value = actor.transform.position.x;
            y.value = actor.transform.position.y;
            width.value = actor.transform.size.x;
            height.value = actor.transform.size.y;

        } else {
            x.value = 0;
            y.value = 0;
            width.value = 0;
            height.value = 0;
        }
    }
}

var hierarchyView = {

    selectedItems: [],

    item: function(child) {

        var li = document.createElement('li');
        li.className = 'list-item'
        var item = document.createElement("a");

        item.className = "hierarchy-item"

        if(child.name) {
            item.innerHTML = child.name;

        } else {
            item.innerHTML = "unnamed object";
        }

        item.sceneID = child.sceneID;

        item.href = "#";
        item.addEventListener('click', this.itemListener, false);

        li.appendChild(item);

        return li;
    },

    itemListener: function(e){
        e.preventDefault();

        var normal = 'hierarchy-item';
        var highlighted = "hierarchy-item highlighted";

        if(e.ctrlKey) {

            // if(e.target.className == normal) {
            //     e.target.className = highlighted;
            //
            //     hierarchyView.selectedItems.push(e.target);
            //
            // } else {
            //     e.target.className = normal;
            //
            //     var index = hierarchyView.selectedItems.indexOf(e.target);
            //     hierarchyView.selectedItems.splice(index, 1);
            // }

        } else {

            var ID = e.target.sceneID;

            for(var i = 0; i < hierarchyView.selectedItems.length; i++) {
                hierarchyView.selectedItems[i].className = normal;
            }

            hierarchyView.selectedItems = [];

            var actor = Amble.app.scene.getActorByID(ID);

            if(e.target.className == normal) {
                e.target.className = highlighted;

                actor.renderer.selected = true;

                hierarchyView.selectedItems.push(e.target);

            } else {
                e.target.className = normal;

                actor.renderer.selected = false;

                hierarchyView.selectedItems = [];
            }

            inspectorView.printActor(actor);


        }
    },

    printList: function(children){
        // var hierarchy = document.getElementById("hierarchy-list");
        hierarchy.innerHTML = "";
        for(var i = 0; i < children.length; i++) {
            if(!children[i].options.hideInHierarchy) {
                hierarchy.appendChild(this.item(children[i]));
            }
        }
    },

    addObjectCallback: function(children){
        hierarchyView.printList(children)
    }
}

//aplikacja
var app = new Amble.Application({

    resize: true,

    sceneCamera: {
        name: 'SceneCamera',
        tag: ['sceneCamera'],
        options: {
            hideInHierarchy: true
        },
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view",
            color: "#616161"
        }},
        components: [
            { name: "Camera", args: {}}
        ]
    },

    mainCamera: {
        name: 'MainCamera',
        tag: ['mainCamera'],
        options: {},
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view",
            color: "#616161"
        }},
        components: []
    },

    preload: function(){

        var player = {
            name: 'player',
            tag: ['object', 'player'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                size: { name: "Amble.Math.Vector2", args: {x:100 ,y:100}},
            }},
            renderer: {name: 'Amble.Graphics.RectRenderer', args: {
                color: 'red'
            }}
        };

        var p = this.scene.instantiate(player)//, hierarchyView.addObjectCallback);
        p.transform.position.x -= 100;

        var obj = {
            name: 'object',
            tag: ['object'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                size: { name: "Amble.Math.Vector2", args: {x:100 ,y:100}},
            }},
            renderer: {name: 'Amble.Graphics.RectRenderer', args: {
                color: '#1B5E20'
            }}
        };

        for(var i = 0; i < 100; i++) {
            var o = this.scene.instantiate(obj)//, hierarchyView.addObjectCallback);
            o.transform.position.x += i*10;
            o.transform.position.y += i*10;
        }

    },

    //process scripts int engine and load objects
    loaded: function(){

    },

    //actual start function
    start: function(){

    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    postrender: function(){

    }
});

/*

static html design (materialize css?)

*/

/*
    scene view

grid background

load all scene actors
dragable actors
click opens inspector for given actor

drag arrows

drag from project folder to scene if supported format like image or prefab

drag from scene to inspector - to script variable?

snap?

*/


/*
    game view

browser like window to preview game - stand alone?

*/

/*
    project view/asset/folder manager

*/

/*
    inspector

*/

/*
    hierarchy - scene list

*/
