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
 * Title: App Configuration Script
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Modified: Josef Divín
 * Date: 23/2´10/20
 * Description: Used to configure and link a webscene
 * with corresponding attributes for visualization
 * and statistics. A webscene with a scene service 
 * that contains the following required attributes on 
 * unit level for each feature needs to be set-up first: 
 * - building id (int)
 * - floor level (int)
 * - usage (string)
 * - area (float)
 */

define([
    "esri/core/declare",
    "esri/config",

    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/SceneLayer",
    "esri/Basemap",

    "esri/widgets/BasemapToggle",
    "esri/PopupTemplate",
    "esri/widgets/Daylight",
    "esri/widgets/Expand",
    "esri/widgets/Home",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

    "c-through/ToolsMenu",
    "c-through/welcome",
    "c-through/support/queryTools"

], function (
    declare, esriConfig,
    WebScene, SceneView, SceneLayer, Basemap,
    BasemapToggle, PopupTemplate,  Daylight, Expand, Home,
    dom, on, domCtr, win, domStyle,
    Search,
    ToolsMenu, Welcome, queryTools) {

        // application settings
        var settings_demo = {
            name: "Demo",
            url: "https://gis.brno.cz/esri",           // portal URL for config
            webscene: "09467ef90fb14641b2ea19379909da79",   // portal item ID of the webscene
            titleOfLegend: "Funkce:",
            titleOfPopUpButon: "Podat návrh na opravu funkčního využití",
            usagename: "floorusage",                             // usage attribute (string)
            floorname: "floorname",                           // floor attribute (int)
            OIDname: "idbud",                            // objectid
            buildingIDname: "idobject",                   // building attribute (int)
            areaname: "areafloat",  
            areaname2: "area3",                         // area attribute (float)
            color: [                                        // color ramp for unique value renderer
                [255,222,220, 1],
                [255,225,245, 1],
                [214, 195, 182, 1],
                [163, 73, 164,1 ],
                [181, 112, 74, 1],
                [255,255, 115 ,1 ],
                [237, 0, 0, 1],
                [245, 156, 155, 1],
                [127, 127, 127, 1]
                ]
        };

        return declare(null, {

            constructor: function () {

            },

            init: function (settings) {
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

                           if(mobilDetector === true){
                            
                            var toolsMenu = document.querySelector("#toolsMenu");
                            var vie_wDiv = document.querySelector("#viewDiv");
                            vie_wDiv.style.width = "100%";
                            toolsMenu.style.top = "85%";
                            toolsMenu.style.height = "50%";
                            toolsMenu.style.zIndex = "1";
                            toolsMenu.style.backgroundColor = "white";
                            toolsMenu.style.width = "100%";
                        }
           
                // destroy welcome page when app is started
                domCtr.destroy("welcome");

                // create header with title according to choice on welcome page
                var header = domCtr.create("div", { id: "header" }, win.body());
                domCtr.create("div", { id: "headerTitle" }, header);

                // get settings from choice on welcome page
                this.settings = this.getSettingsFromUser(settings);

                // set portal url
                esriConfig.portalUrl = this.settings.url;

                // fix CORS issues by adding portal url to cors enabled servers list
                esriConfig.request.corsEnabledServers.push("http://zurich.maps.arcgis.com");

                // load scene with portal ID
                this.scene = new WebScene({
                    portalItem: {
                        id: this.settings.webscene
                    },
                    basemap: "topo"
                });

                // create a view
                this.view = new SceneView({
                    container: "viewDiv",
                    map: this.scene,
                    qualityProfile: "high"
                });

                // environment settings for better visuals (shadows)
                this.view.environment.lighting.ambientOcclusionEnabled = true;
                this.view.environment.lighting.directShadowsEnabled = true;

                // create search widget
                var searchWidget = new Search({
                    view: this.view
                });
                this.view.ui.add(searchWidget, {
                    position: "top-right",
                    index: 2
                });

                // create home button that leads back to welcome page
                var home = domCtr.create("div", { className: "button", id: "homeButton", innerHTML: "Home" }, header);

                on(home, "click", function () {
                    var URI = window.location.href;
                    var newURI = URI.substring(0, URI.lastIndexOf("?"));
                    window.location.href = newURI;
                }.bind(this));

                // create home widget for scene view
                var homeWidget = new Home({
                    view: this.view
                });

                const daylightWidget = new Daylight({
                    view: this.view,
                    // plays the animation twice as fast than the default one
                    playSpeedMultiplier: 2,
                    // disable the timezone selection button
                    visibleElements: {
                      timezone: false
                    }
                  });
          
                  // add the daylight widget inside of Expand widget
                  const expand = new Expand({
                    expandIconClass: "esri-icon-time-clock",
                    expandTooltip: "Zobrazit denní dobu",
                    view: this.view,
                    content: daylightWidget,
                    expanded: false
                  });


                var basemapToggle = new BasemapToggle({
                    view: this.view,  // The view that provides access to the map's "streets" basemap
                    nextBasemap: "dark-gray"  // Allows for toggling to the "hybrid" basemap
                  });
                  this.view.ui.add(basemapToggle, {
                    position: "top-right"
                  });
                  this.view.ui.add(expand, "top-right");
                this.view.ui.add(homeWidget, "top-right");

                // wait until view is loaded
                this.view.when(function () {
                    // layer1 = active layer (receives renderers, used for statistics, selected)
                    // layer2 = background layer (shows remaining buildings, not selected)

                    // retrieve active layer from webscene
                    this.settings.layer1 = this.scene.layers.getItemAt(0);

                    // create background layer (identical copy of activ layer) for highlighting and add it to the scene
                    this.settings.layer2 = new SceneLayer({
                        url: this.settings.layer1.url,
                        popupEnabled: false
                    });
                    this.scene.add(this.settings.layer2);

                    // add view to the settings
                    this.settings.view = this.view;
                    this.settings.titleOfLegend = settings_demo.titleOfLegend;
                    this.settings.layer1.popupEnabled = false; 
                    this.settings.layer1.visible = true;
                    this.settings.layer2.visible = false;

                    if (mobilDetector === true) {

                        var infoButoon = document.createElement("div");
                        infoButoon.classList.add("infoButoon")
                        var infoButoonIcon = document.createElement("div");
                        //infoButoon.src = "img/info.png";
                        infoButoon.appendChild(infoButoonIcon);
                        infoButoonIcon.id = "icons";
                        infoButoonIcon.classList.add("esri-icon-chart");
                        infoButoonIcon.classList.add("active");
                        infoButoon.classList.add("esri-widget--button");
                        this.view.ui.add(infoButoon, "top-left");
                        var toolsMenu = document.querySelector("#toolsMenubox");
                        var textBox = document.querySelector("#textBox");
                        var infobutonIcon =  document.querySelector("#icons");
                        textBox.style.display = "block";
                        toolsMenu.style.display = "none";
                        function togleTextpanel(){
                            
                            if(infobutonIcon.classList[1] ==="active"){

                                infobutonIcon.classList.remove("active");
                                textBox.style.display = "none";
                                toolsMenu.style.display = "block";
                            }else{
                                infobutonIcon.classList.add("active");
                                textBox.style.display = "block";
                                toolsMenu.style.display = "none";
                            }
                        }
                        infobutonIcon.addEventListener("click", togleTextpanel)

                    }
                    
                    // retrieve distinct values of usage attribute from feature service to create UI (filter dropdowns)
                    queryTools.distinctValues(this.settings.layer1, this.settings.usagename, this.settings.OIDname, function (distinctValues) {

                        distinctValues.sort();
                        this.settings.values = distinctValues;

                        // initiliaze tools menu with state
                        this.menu = new ToolsMenu({
                            config: this.settings,
                            map: this.scene,
                            view: this.view,
                            state: {
                                highlight: {
                                    name: "city",
                                    features: undefined
                                },
                                viz: {
                                    name: "white"
                                },
                                filter: {
                                    name: "none",
                                    usageFeatures: undefined,
                                    areaFeatures: undefined,
                                    floorFeatures: undefined
                                },
                                combinedFilteredFeatures: undefined
                            }
                        });
                        
                    }.bind(this));

                }.bind(this)).otherwise(function (err) {
                    console.error(err);
                });

            },

            getSettingsFromUser: function (settings) {
                if (settings === "budovy_v_brne"){
                    dom.byId("headerTitle").innerHTML = "c-through / Budovy v Brně";
                    return settings_demo;
                }
            }
        });
    });




