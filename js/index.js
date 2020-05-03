"use strict";

// let sw = null;
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("sw.js").then(swRegistered => {
//         console.log("[ServiceWorker**] - Registered");
//         sw = swRegistered;
//     });
// }
const BUTTON = document.getElementById('formSubmit');
BUTTON.addEventListener('click', (event) => onSubmitForm(event));
const ERROR_MESSAGE = document.getElementById('errorMessage');
const REPORT_CONTAINER = document.querySelector('.report-container');
const INPUT = document.getElementById('testURL');

const onSubmitForm = (e) => {
    e.preventDefault();
    if (INPUT.checkValidity() && validateUrl(INPUT.value)) {
        fetchCall(INPUT.value);
    } else if (INPUT.value) {
        validateUrl(INPUT.value);
        INPUT.value = '';
        ERROR_MESSAGE.innerHTML = "Please enter a valid URL";
    } else {
        INPUT.value = '';
        ERROR_MESSAGE.innerHTML = INPUT.validationMessage;
    }
}

const validateUrl = (value) => {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

const fetchCall = (url) => {
    REPORT_CONTAINER.innerHTML = '';
    const BASE_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url='
    fetch(`${BASE_URL}${url}&strategy=desktop&utm_source=lh-chrome-ext&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa&key=&key=AIzaSyDgh0rRy-3t76lVh7YSj00AEIU71UT9LeA`)
        .then(response => response.json())
        .then(result => {
            INPUT.value = '';
            reportGenerator(result.lighthouseResult.categories);
        })
        .catch(err => {
            console.log(err);
            ERROR_MESSAGE.innerHTML = 'An error occured. Please try again.';
        });
}

const reportGenerator = (categoriesObj) => {
    const CATEGORIES = document.createElement('div');
    CATEGORIES.className = 'categories';
    const categoriesArray = Object.keys(categoriesObj);
    let categoryObj;
    for (const key in categoriesArray) {
        categoryObj = categoriesObj[categoriesArray[key]];
        CATEGORIES.innerHTML += catergoryScoreBuilder(categoryObj);
        REPORT_CONTAINER.append(CATEGORIES);
        progressBar(+categoryObj.score * 100, categoryObj.id)
    }
}

const catergoryScoreBuilder = (category) => {
    return `<div class="progress" id="${category.id}">
                <svg class="progress-circle" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg">
                    <circle class="progress-circle-back" cx="80" cy="80" r="74"></circle>
                    <circle class="progress-circle-prog progress-${category.id}" cx="80" cy="80" r="74"></circle>
                </svg>
                <div class="progress-text" data-progress="0">${+category.score * 100}</div>
                <div class="progress-title">${category.title}</div>
            </div>`
}

const progressBar = (progressVal, category) => {
    const strokeVal = 4.64
    const CIRCLE = document.querySelector(`.progress-${category}`);
    CIRCLE.style.strokeDasharray = (progressVal * strokeVal) + ' 999';

    if (progressVal > 90) {
        CIRCLE.style.stroke = '#4CAF50';
    } else if (progressVal <= 89 && progressVal >= 50) {
        CIRCLE.style.stroke = '#ffae1a';
    } else {
        CIRCLE.style.stroke = '#DC143C';
    }

    const SCORE = document.querySelector('.progress-text');
    SCORE.dataset.progress = progressVal;
}




