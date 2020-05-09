import { validateUrl, queryBuilder } from '../helpers/helpers.js'
import { COLOR } from '../enums/colors.js'

export default class PerformanceReport {

    constructor() {
        this.__BUTTON = document.getElementById('formSubmit');
        this.__ERROR_MESSAGE = document.getElementById('errorMessage');
        this.__REPORT_CONTAINER = document.querySelector('.report-container');
        this.__INPUT = document.getElementById('testURL');
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
            const result = await (await fetch(queryBuilder(API, parameters))).json();
            this.__categoriesReportGenerator(result.lighthouseResult.categories);
        } catch (err) {
            this.__REPORT_CONTAINER.innerHTML = '';
            this.__ERROR_MESSAGE.innerHTML = 'An error occured. Please try again.';
        }
    }

    /**
     * Builds the report based on the obj categories of the api call
     * @param {Object} categoriesObj
     */
    __categoriesReportGenerator(categoriesObj) {
        this.__REPORT_CONTAINER.innerHTML = '';
        this.__ERROR_MESSAGE.innerHTML = '';

        let categoryObj;
        const CATEGORIES = document.createElement('div');
        CATEGORIES.className = 'categories';
        const categoriesArray = Object.keys(categoriesObj);
        const URL = document.createElement('p');
        URL.style.textAlign = 'center';
        URL.innerHTML = this.__INPUT.value;
        this.__REPORT_CONTAINER.append(URL);

        for (const key in categoriesArray) {
            categoryObj = categoriesObj[categoriesArray[key]];
            CATEGORIES.innerHTML += this.constructor.catergoryScoreBuilder(categoryObj);
            this.__REPORT_CONTAINER.append(CATEGORIES);
            this.constructor.progressBar(+categoryObj.score * 100, categoryObj.id)
        }

        this.__INPUT.value = '';
    }

    /**
     * Creates animated circles to wait for the fetch call to resolve
     */
    __loading() {
        this.__REPORT_CONTAINER.innerHTML = '';

        const LOADING = document.createElement('div');
        LOADING.className = "loading";

        for (let i = 0; i < 5; i++) {
            const CIRCLE = document.createElement('div');
            CIRCLE.className = "loading__circle";
            LOADING.append(CIRCLE);
        }

        this.__REPORT_CONTAINER.append(LOADING);
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
}