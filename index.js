"use strict";

import PageReport from './src/js/classes/pageReport.js';

let sw = null;

const onInit = () => {
    new PageReport();
    RegisterSw();
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