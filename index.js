"use strict";

import PerformanceReport from './src/js/classes/performanceReport.js';

let sw = null;

const onInit = () => {
    new PerformanceReport();
    //RegisterSw();
}

const RegisterSw = () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").then(swRegistered => {
            console.log("[ServiceWorker**] - Registered");
            sw = swRegistered;
        });
    }
}

onInit();





