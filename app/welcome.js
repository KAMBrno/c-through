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
 * Title: Welcome Page
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Description: First Page of the application
 * with information about authors and disclaimers,
 * starts the application
 */

define([
    "esri/core/declare",
    "c-through/app"

], function (
    declare,
    App) {

        return declare(null, {

            constructor: function () {
                
            },

            init: function () {

                this.initApp();

            },


            initApp: function () {
                var app = new App();
                app.init("budovy_v_brne");
            }
        });
    });


