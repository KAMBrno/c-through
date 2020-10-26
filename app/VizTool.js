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
 * Title: Visualization Tool
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Modified: Josef Divín
 * Date: 10/23/20
 * Description: changes renderer of the active layer
 * according to selection and filter. Shows statistics
 * and adjusts charts according to selection and filter.
 */

define([
    "esri/core/declare",
    "esri/tasks/support/Query",
    "esri/widgets/Legend",
    "esri/widgets/Expand",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",

    "c-through/support/applyRenderer",

    "c-through/support/chartMaker",
    "c-through/support/barMaker",
    "c-through/support/statsMaker",

    "c-through/support/queryTools"

], function (
    declare, Query, Legend,
    Expand,
    domCtr, win, dom, domStyle, on,
    applyRenderer,
    chartMaker, barMaker, statsMaker,
    queryTools
) {
        return declare(null, {
            constructor: function (params) {

                this.container = params.container;
                this.menu = params.menu;
                this.scene = params.scene;
                this.highlight = params.highlightstate;
                this.viz = params.vizstate;
                this.filter = params.filterstate;
                this.settings = params.settings;
                this.view = params.view;

                this.createUI(this.container);
                this.updateUI(this.viz);
                this.clickHandler();

                this.init();

            },

            init: function () {

                this.initialChart(this.settings, function (data, chartdata) {

                    this.initData = data;
                    this.initCharts = chartdata;

                    this.setSelection(this.select);

                    this.menu.setInitData(data);

                }.bind(this));

            },

            createUI: function (container) {
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
                this.title = domCtr.create("div", { className: "titleViz", id: "titleViz", innerHTML: "Roztřídit podle" }, container);
                this.label1 = domCtr.create("div", { className: "labelViz", id: "viz-white", innerHTML: "žádné" }, container);
                this.label2 = domCtr.create("div", { className: "labelViz", id: "viz-usage", innerHTML: "funkce" }, container);
                this.label3 = domCtr.create("div", { className: "labelViz", id: "viz-area", innerHTML: "plocha" }, container);

                this.statsDiv = domCtr.create("div", { id: "statsDiv", className: "statsDiv" }, container);
                this.chartDiv = domCtr.create("div", { id: "chartDiv", className: "chartDiv" }, container);


                domCtr.create("div", { id: "titleStats", innerHTML: "Statistika" }, "statsDiv");
                domCtr.create("div", { id: "numberofunits", innerHTML: "<b>Počet prvků:     </b>" }, "statsDiv");
                domCtr.create("div", { id: "usage", innerHTML: "<b>Nejvíce zastoupená kategorie:       </b>" }, "statsDiv");
                domCtr.create("div", { id: "averagearea", innerHTML: "<b>Průměrná plocha:      </b>" }, "statsDiv");
                domCtr.create("div", { id: "maxarea", innerHTML: "<b>Maximální plocha:      </b>" }, "statsDiv");
                domCtr.create("div", { id: "averagefloor", innerHTML: "<b>Průměrný počet podlaží:    </b>" }, "statsDiv");
                domCtr.create("div", { id: "maxfloor", innerHTML: "<b>Maximální počet podlaží:     </b>" }, "statsDiv");

                if(mobilDetector === true){
                    this.label1.style.width = "50px";
                    this.label2 .style.width = "50px";
                    this.label3.style.width = "50px";
                    this.label2 .style.left = "100px";
                    this.label3.style.left = "180px";
                    this.chartDiv.style.width = "100%";
                    this.chartDiv.style.width = "100%";
                    this.statsDiv.style.width = "100%";
                    this.title.style.width = "90%";
                }
               
            },

            updateUI: function (state) {
                var viz = state.name;

                if (viz === "white") {
                    domStyle.set(dom.byId("viz-white"), { "opacity": 1, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3, "border": "1px solid black" });
                    domCtr.destroy(dom.byId("reload"));
                }

                if (viz === "usage") {
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 1, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-area"), { "opacity": 0.3, "border": "1px solid black" });
                    domCtr.destroy(dom.byId("reload"));
                }

                if (viz === "area") {
                    domStyle.set(dom.byId("viz-area"), { "opacity": 1, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-white"), { "opacity": 0.3, "border": "1px solid black" });
                    domStyle.set(dom.byId("viz-usage"), { "opacity": 0.3, "border": "1px solid black" });
                    this.reload = domCtr.create("div", { id: "reload" }, this.container);
                    domCtr.create("img", { className: "reload", src: "img/reload.png", style: "width:25px;height:25px" }, this.reload);
                }
            },

            updateVizState: function (state) {
                this.updateUI(state);
                this.menu.setVizState(state);
            },

            setVizState: function (state, filter, highlight, expression) {
                this.highlight = highlight;
                this.filter = filter;
                this.viz = state;
                this.expression = expression;
                this.filterName = filter.name;

                this.setSelection(this.highlight.name, this.highlight.features, this.expression);
            },

            clickHandler: function () {
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
                var legend;
                var bgExpand;
                var startValue;

                on(this.label1, "click", function (evt) {
                    this.updateVizState({ name: "white" });
                    if(mobilDetector === false){
                        this.settings.view.ui.remove(bgExpand, "bottom-right");
                        if (legend) {
                            if (legend.destroyed === false) {
                                legend.destroy();
                            }
                        }
                    }
                }.bind(this));

                on(this.label2, "click", function (evt) {
                    this.updateVizState({ name: "usage" });
                    if(mobilDetector === false){
                        if (startValue !== "start") {
                            startValue = "start";
                            bgExpand = new Expand({
                              content: legend,
                              expanded: true
                            });
                          }
                
                          legend = new Legend({
                            view: this.settings.view,
                            layerInfos: [
                              {
                                title: this.settings.titleOfLegend,
                                layer: this.settings.layer1
                              }
                            ]
                          });
                          bgExpand.content = legend;
                          this.settings.view.ui.add(bgExpand, "bottom-right");
                          bgExpand.expanded = true;
                        }
                }.bind(this));

                on(this.label3, "click", function (evt) {
                    this.updateVizState({ name: "area" });
                    if(mobilDetector === false){
                        this.settings.view.ui.remove(bgExpand, "bottom-right");
                        if (legend) {
                          if (legend.destroyed === false) {
                            legend.destroy();
                          }
                        }
                    }
                }.bind(this));

            },

            initialChart: function (settings, callback) {

                settings.layer1.load().then(function () {

                    var query = settings.layer1.createQuery();

                    query.returnGeometry = false;
                    query.outFields = [settings.OIDname, settings.usagename, settings.areaname, settings.areaname2, settings.floorname, settings.buildingIDname];

                    settings.layer1.queryFeatures(query).then(function (result) {
                        var currentResult = result.features;

                        var initData = currentResult;
                        // for white renderer
                        var initStats = statsMaker.createChartData(currentResult, settings, this.view);
                        // for usage renderer
                        var initUsage = chartMaker.createChartData(currentResult, settings);
                        // for area renderer
                        var initArea = barMaker.createChartData(currentResult, settings, 10);

                        var initCharts = {
                            stats: initStats,
                            usage: initUsage,
                            area: initArea
                        };

                        callback(initData, initCharts);

                    }.bind(this));

                }.bind(this)).otherwise(function (err) {
                    console.error(err);
                });
            },

            setSelection: function (sel, highlight, selection) {
                var vizName = this.viz.name;

                this.setVizCity(vizName, highlight, selection);

            },

            setVizCity: function (vizName, highlight, selection) {
                var settings = this.settings;

                settings.layer1.opacity = 0.8;
                settings.layer2.opacity = 0.8;

                if (selection !== undefined && selection !== "") {

                    settings.layer1.definitionExpression = selection;

                    settings.layer2.visible = false;

                    if (highlight == undefined) {
                        settings.layer2.visible = false;
                    } else {
                        settings.layer2.visible = true;
                        settings.layer2.renderer = null;
                        settings.layer2.definitionExpression = settings.buildingIDname + " NOT IN (" + highlight + ")";
                    }
                } else {
                    settings.layer1.definitionExpression = undefined;
                    settings.layer1.renderer = null;
                    settings.layer2.visible = false;
                }

                // visualization

                if (selection !== undefined && selection !== "") {
                    this.changeVisualiationSelection(vizName, this.menu, this.settings, this.view);
                } else {
                    this.changeVisualisationCity(vizName, this.initData, this.initCharts);
                }

            },

            changeVisualisationCity: function (vizName, initData, initCharts) {
                var settings = this.settings;

                if (vizName === "white") {
                    settings.layer1.renderer = null;

                    domStyle.set(dom.byId("chartDiv"), { "opacity": 0 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 1 });

                    statsMaker.createChart(initCharts.stats, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
                if (vizName === "usage") {
                    settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);

                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    chartMaker.createChart(this.view, initCharts.usage, settings, "city", function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                    statsMaker.createChart(initCharts.stats, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
                if (vizName === "area") {
                    settings.layer1.renderer = applyRenderer.createRendererVV(initData, settings.areaname2);

                    domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                    domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                    barMaker.createChart(initData, initCharts.area, settings, "city", this.view, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                    statsMaker.createChart(initCharts.stats, function (state) {
                        this.menu.setLoadingState("loaded");
                    }.bind(this));
                }
            },

            changeVisualiationSelection: function (vizName, menu, settings, view) {

                if (this.loadingState !== "busy") {
                    this.menu.setLoadingState("busy");
                }

                var query = settings.layer1.createQuery();

                query.returnGeometry = false;
                query.outFields = [settings.OIDname, settings.usagename, settings.areaname, settings.areaname2, settings.floorname, settings.buildingIDname];

                settings.layer1.queryFeatures(query).then(function (result) {

                    var selection = result.features;

                    if (vizName === "white") {
                        settings.layer1.renderer = applyRenderer.createSimpleRenderer();

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 0 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 1 });

                        var statsDataBuilding = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(statsDataBuilding, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                    if (vizName === "usage") {
                        settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var chartData = chartMaker.createChartData(selection, settings);
                        chartMaker.createChart(view, chartData, settings, "building", function (state) {
                            menu.setLoadingState(state);
                        });

                        var data = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data, function (state) {
                            menu.setLoadingState(state);
                        });
                    }
                    if (vizName === "area") {
                        settings.layer1.renderer = applyRenderer.createRendererVV(selection, settings.areaname2);

                        domStyle.set(dom.byId("chartDiv"), { "opacity": 1 });
                        domStyle.set(dom.byId("statsDiv"), { "opacity": 0 });

                        var barData = barMaker.createChartData(selection, settings, 6);
                        barMaker.createChart(selection, barData, settings, "building", view, function (state) {
                            menu.setLoadingState(state);
                        });

                        var data2 = statsMaker.createChartData(selection, settings);
                        statsMaker.createChart(data2, function (state) {
                            menu.setLoadingState(state);
                        });
                    }

                });
            }

        });
    }
);