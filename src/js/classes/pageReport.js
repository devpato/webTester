import { validateUrl, queryBuilder } from '../helpers/helpers.js'
import { COLOR } from '../enums/colors.js'

export default class PageReport {

    constructor() {
        this.__BUTTON = document.getElementById('formSubmit');
        this.__ERROR_MESSAGE = document.getElementById('errorMessage');
        this.__INPUT = document.getElementById('testURL');
        this.__LOADING = document.querySelector('.loading');
        this.__REPORT_CONTAINER = document.querySelector('.report-container');
        this.__CATERGORIES_CONTAINER = document.querySelector('.categories-results');
        this.__UX_CONTAINER = document.querySelector('.ux-container');
        this.__LIGHTHOUSE_CONTAINER = document.querySelector('.lighthouse-container');
        this.__onLoad();
    }

    /**
     * Call necessary things onLoad for the app to work
     */
    __onLoad() {
        this.__BUTTON.addEventListener('click', async (event) => await this.__onSubmitForm(event));
    }

    async __onSubmitForm(e) {
        e.preventDefault();
        this.__INPUT.value = this.__INPUT.value.trim();
        if (this.__INPUT.checkValidity() && validateUrl(this.__INPUT.value)) {
            await this.__fetchCall(this.__INPUT.value);
        } else if (this.__INPUT.value) {
            validateUrl(this.__INPUT.value);
            this.__ERROR_MESSAGE.innerHTML = "Please enter a valid URL";
        } else {
            this.__INPUT.value = '';
            this.__ERROR_MESSAGE.innerHTML = this.__INPUT.validationMessage;
        }
    }

    /**
     * GET fetch call to the Google API
     * @param {string} url URL entered in the input box
     */
    async __fetchCall(url) {
        this.__loading();

        const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
        const parameters = {
            url: encodeURIComponent(url),
            strategy: "desktop",
            category: ["performance", "accessibility", "best-practices", "seo", "pwa"],
            key: "AIzaSyDgh0rRy-3t76lVh7YSj00AEIU71UT9LeA"
        };

        try {
            const results = await (await fetch(queryBuilder(API, parameters))).json();
            this.__resetHTML();

            this.__categoriesReportGenerator(results.lighthouseResult.categories);

            this.__chromeUXReports(PageReport.buildChromUXReport(results.loadingExperience));

            this.__lighthouseResults(PageReport.buildLighthouseMetrics(results.lighthouseResult));
        } catch (err) {
            this.__resetHTML();
            this.__ERROR_MESSAGE.style.display = "inline-block"
            this.__ERROR_MESSAGE.innerHTML = "An error occured. Please try again.";
        }
    }

    /**
     * Creates animated circles to wait for the fetch call to resolve
     */
    __loading() {
        this.__resetHTML();
        this.__LOADING.style.display = 'flex';

        for (let i = 0; i < 5; i++) {
            const CIRCLE = document.createElement('div');
            CIRCLE.className = "loading__circle";
            this.__LOADING.append(CIRCLE);
        }
    }

    /**
     * Builds the report based on the obj categories of the api call
     * @param {Object} categoriesObj
     */
    __categoriesReportGenerator(categoriesObj) {
        let categoryObj;
        const categoriesArray = Object.keys(categoriesObj);
        const URL = document.createElement('p');
        URL.style.textAlign = 'center';
        URL.innerHTML = this.__INPUT.value;
        //this.__REPORT_CONTAINER.append(URL);

        for (const key in categoriesArray) {
            categoryObj = categoriesObj[categoriesArray[key]];
            this.__CATERGORIES_CONTAINER.innerHTML += PageReport.catergoryScoreBuilder(categoryObj);
            PageReport.progressBar(+categoryObj.score * 100, categoryObj.id)
        }

        this.__INPUT.value = '';
    }

    /**
    * Builds a circle with the score based on a cotegory provided
    * @param {Object} category
    * @return {string} returns a html string containing the score circle
    */
    static catergoryScoreBuilder(category) {
        return `<div class="progress" id="${category.id}">
                    <svg class="progress__circle" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg">
                        <circle class="progress__circle--back" cx="80" cy="80" r="74"></circle>
                        <circle class="progress__circle--prog progress-${category.id}" cx="80" cy="80" r="74"></circle>
                    </svg>
                    <div class="progress__text" data-progress="0">${Math.trunc(+category.score * 100)}</div>
                    <div class="progress__title">${category.title}</div>
                </div>`
    }

    /**
    * Creates the score cirlce based on % 
    * @param {string} score Score of the category provided by API call
    * @param {string} category Category passed to dynamically created IDs
    */
    static progressBar(score, category) {
        const strokeVal = 4.64;
        const CIRCLE = document.querySelector(`.progress-${category}`);
        CIRCLE.style.strokeDasharray = (score * strokeVal) + ' 999';

        if (score > 90) {
            CIRCLE.style.stroke = COLOR.GREEN;
        } else if (50 >= score && score <= 89) {
            CIRCLE.style.stroke = COLOR.ORANGE;
        } else {
            CIRCLE.style.stroke = COLOR.RED;
        }

        const SCORE = document.querySelector('.progress__text');
        SCORE.dataset.progress = score;
    }

    /**
   * Displays data based on the Chrome UX
   * @param {object} results
   */
    __chromeUXReports(results) {
        const cruxHeader = document.createElement('h2');
        cruxHeader.textContent = "Chrome User Experience Report Results";
        this.__UX_CONTAINER.appendChild(cruxHeader);

        if (results !== null) {
            for (let key in results) {
                const p = document.createElement('p');
                p.textContent = `${key}: ${results[key]}`;
                this.__UX_CONTAINER.appendChild(p);
            }
        } else {
            const na = document.createElement('h2');
            na.textContent = "N/A";
            this.__UX_CONTAINER.appendChild(na);
        }
    }

    /**
    * Displays data based on the lighthouse results
    * @param {object} results results.lighthouseResult
    */
    __lighthouseResults(results) {
        const lighthouseHeader = document.createElement('h2');
        lighthouseHeader.textContent = "Lighthouse Results";
        this.__LIGHTHOUSE_CONTAINER.appendChild(lighthouseHeader);
        for (let key in results) {
            const p = document.createElement('p');
            p.textContent = `${key}: ${results[key]}`;
            this.__LIGHTHOUSE_CONTAINER.appendChild(p);
        }
    }

    static buildChromUXReport(loadingExperience) {
        return loadingExperience.metrics ? {
            "First Contentful Paint": loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
            "First Input Delay": loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
        } : null;
    }

    static buildLighthouseMetrics(lighthouse) {
        return lighthouse.audits ? {
            'First Contentful Paint': lighthouse.audits['first-contentful-paint'] ? lighthouse.audits['first-contentful-paint'].displayValue : 'N/A',
            'Speed Index': lighthouse.audits['speed-index'] ? lighthouse.audits['speed-index'].displayValue : 'N/A',
            'Time To Interactive': lighthouse.audits['interactive'] ? lighthouse.audits['interactive'].displayValue : 'N/A',
            'First Meaningful Paint': lighthouse.audits['first-meaningful-paint'] ? lighthouse.audits['first-meaningful-paint'].displayValue : "N/A",
            'First CPU Idle': lighthouse.audits['first-cpu-idle'] ? lighthouse.audits['first-cpu-idle'].displayValue : "N/A",
            'Estimated Input Latency': lighthouse.audits['estimated-input-latency'] ? lighthouse.audits['estimated-input-latency'].displayValue : "N/A"
        } : null;
    }


    __resetHTML() {
        this.__LOADING.innerHTML = "";
        this.__LOADING.style.display = "none";
        this.__ERROR_MESSAGE.innerHTML = ""
        this.__ERROR_MESSAGE.style.display = "none"
        document.querySelector('.categories-results').innerHTML = "";
        document.querySelector('.ux-container').innerHTML = "";
        document.querySelector('.lighthouse-container').innerHTML = "";
    }
}