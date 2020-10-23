 /* Copyright 2017 Esri

   Licensed under the Apache License, Version 2.0 (the "License");

   you may not use this file except in compliance with the License.

   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software

   distributed under the License is distributed on an "AS IS" BASIS,

   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

   See the License for the specific language governing permissions and

   limitations under the License.
   ​
   */

/*
 * Title: Tools Menu
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Description: creates the three tools
 * (highlight, visualization, filter) and
 * combines the various filter and selection
 * options to one definition expression.
 */

define([
    "esri/core/declare",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",

    "c-through/HighlightTool",
    "c-through/VizTool",
    "c-through/FilterTool"

], function (
    declare,
    domCtr, win, dom,
    HighlightTool, VizTool, FilterTool
) {

        return declare(null, {
            constructor: function (params) {

                this.settings = params.config;
                this.scene = params.map;
                this.view = params.view;

                this.state = params.state;

                this.createUI();
                this.setupTools();
            },

            createUI: function () {
                var mobilDetector = detectmob();
                function detectmob() {
                    if (navigator.userAgent.match(/Android/i) ||
                        navigator.userAgent.match(/webOS/i) ||
                        navigator.userAgent.match(/iPhone/i) ||
                        navigator.userAgent.match(/iPad/i) ||
                        navigator.userAgent.match(/iPod/i) ||
                        navigator.userAgent.match(/BlackBerry/i) ||
                        navigator.userAgent.match(/Windows Phone/i)
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                }

                var toolsMenuInnerBox = document.querySelector("#toolsMenuInnerBox");
                var toolsMenu = document.querySelector("#toolsMenu");
                
                var viewDiv = document.querySelector("#viewDiv");
                this.containerArrow = domCtr.create("div", { className: "arrowUp" }, dom.byId("toolsMenuInnerBox"));
                this.containerSelect = domCtr.create("div", { className: "containerSelect", id: "arrowUp" }, dom.byId("toolsMenuInnerBox"));
                this.containerViz = domCtr.create("div", { className: "containerViz" }, dom.byId("toolsMenuInnerBox"));
                this.containerFilter = domCtr.create("div", { className: "containerFilter", id: "containerFilter" }, dom.byId("toolsMenuInnerBox"));
                var arrowUp = document.querySelector(".arrowUp");
                if(mobilDetector === true){
                    
                    arrowUp.style.display = "inline-block";
                    var windowWitht = document.documentElement.clientWidth;
                    var windowHitht = document.documentElement.clientHeight;
                    toolsMenuInnerBox.style.position = "absolute";
                    toolsMenu.style.left = "0px";
                    toolsMenu.style.height= "0px";
                    toolsMenu.style.width= windowWitht + "px";
                    toolsMenu.style.top= windowHitht - 120 + "px";
                    viewDiv.style.height = windowHitht - 150 + "px";
                    viewDiv.style.paddingTop = "50px";
                    toolsMenuInnerBox.style.overflow = "unset";
                    this.containerViz.style.width = "80%";
                    this.containerFilter.style.width = "90%";
                    this.containerSelect.style.width = "90%"; 
                    toolsMenuInnerBox.style.width = "100vw";
                    
                    function portapbleLandscape(){
                        if(windowWitht > windowHitht){
                            arrowUp.style.marginLeft = windowWitht / 2 + "px";
                            toolsMenu.style.top= windowHitht - 40 + "px";
                            viewDiv.style.height = windowHitht - 30 + "px";
                        }else{
                            arrowUp.style.marginLeft = windowWitht / 2 + "px";
                            toolsMenu.style.top= windowHitht - 120  + "px";
                            viewDiv.style.height = windowHitht - 150 + "px";

                        }
                    }
                    portapbleLandscape();
                    window.addEventListener("resize", function(){
                         windowWitht = document.documentElement.clientWidth;
                         windowHitht = document.documentElement.clientHeight;
                         portapbleLandscape();


                    });
                }else{
                    
                    var windowHitht = document.documentElement.clientHeight;
                    toolsMenuInnerBox.style.height = windowHitht + "px";
                    window.addEventListener("resize", function(){
                        windowHitht = document.documentElement.clientHeight;
                        toolsMenuInnerBox.style.height = windowHitht + "px";
                    });
                }
            },

            setupTools: function () {

                this.highlightTool = new HighlightTool({
                    container: this.containerSelect,
                    menu: this,
                    map: this.scene,
                    highlightstate: this.state.highlight,
                    settings: this.settings,
                    view: this.view
                });

                this.setLoadingState("busy");

                this.vizTool = new VizTool({
                    container: this.containerViz,
                    menu: this,
                    map: this.scene,
                    vizstate: this.state.viz,
                    highlightstate: this.state.highlight,
                    filterstate: this.state.filter,
                    settings: this.settings,
                    view: this.view
                });

            },

            setInitData: function (data) {
                this.initData = data;

                this.filterTool = new FilterTool({
                    container: this.containerFilter,
                    menu: this,
                    map: this.scene,
                    filterstate: this.state.filter,
                    settings: this.settings,
                    initData: data
                });

                this.setLoadingState("loaded");
            },

            setLoadingState: function (state) {
                this.loadingstate = state;

                if (state === "loaded") {
                    domCtr.destroy(dom.byId("loader"));
                    domCtr.destroy(dom.byId("toolsMenuBusy"));
                }

                if (state === "busy") {
                    domCtr.create("div", { id: "toolsMenuBusy" }, win.body());
                    domCtr.create("div", { id: "loader" }, dom.byId("toolsMenuBusy"));
                }

            },

            setHighlightState: function (state) {
                this.state.highlight = state;
                this.highlightTool.setHighlightState(state);

                this.state.combinedExpression = this.calculateCombinedExpression(this.settings);
                this.setVizState(this.state.viz, this.state.filter, state, this.state.combinedExpression);
                this.filterTool.setFilterState(this.state);
            },

            setVizState: function (state) {
                this.state.viz = state;

                this.vizTool.setVizState(this.state.viz, this.state.filter, this.state.highlight, this.state.combinedExpression);
            },

            resetFilterUI: function (mode) {
                this.filterTool.resetUI(this.state.filter, function (state) {
                    this.state.filter = state;
                    if (mode == "filter") {
                        this.setHighlightState(this.state.highlight);
                    }
                    if (mode == "highlight") {
                        this.setHighlightState({ name: "city", expression: undefined });
                    }
                }.bind(this));
            },

            setFilterState: function (state) {
                this.state.filter = state;

                this.state.combinedExpression = this.calculateCombinedExpression(this.settings);

                this.setVizState(this.state.viz, this.state.filter, this.state.highlight, this.state.combinedExpression);
                this.filterTool.setFilterState(this.state);
            },

            calculateCombinedExpression: function (settings) {
                var h = this.state.highlight.expression;
                var u = this.state.filter.usageFeatures;
                var f = this.state.filter.floorFeatures;
                var a = this.state.filter.areaFeatures;

                var expressions = [h, u, f, a];
                var combinedExpression = expressions.filter(item => item != undefined).join(" AND ");

                return combinedExpression;
            }
        });
    }
);