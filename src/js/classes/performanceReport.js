import { validateUrl } from '../helpers/helpers.js'
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
        this.__BUTTON.addEventListener('click', (event) => this.__onSubmitForm(event));
    }

    __onSubmitForm(e) {
        e.preventDefault();
        if (this.__INPUT.checkValidity() && validateUrl(this.__INPUT.value)) {
            this.__fetchCall(this.__INPUT.value);
        } else if (this.__INPUT.value) {
            validateUrl(this.__INPUT.value);
            this.__INPUT.value = '';
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
    __fetchCall(url) {
        this.__REPORT_CONTAINER.innerHTML = '';
        const BASE_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url='

        fetch(encodeURI(`${BASE_URL}${url}&strategy=desktop&utm_source=lh-chrome-ext&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa&key=&key=AIzaSyDgh0rRy-3t76lVh7YSj00AEIU71UT9LeA`))
            .then(response => response.json())
            .then(result => {
                this.__INPUT.value = '';
                this.__categoriesReportGenerator(result.lighthouseResult.categories);
            })
            .catch(err => {
                this.__ERROR_MESSAGE.innerHTML = 'An error occured. Please try again.';
            });
    }

    /**
     * Builds the report based on the obj categories of the api call
     * @param {Object} categoriesObj
     */
    __categoriesReportGenerator(categoriesObj) {
        let categoryObj;
        const CATEGORIES = document.createElement('div');
        CATEGORIES.className = 'categories';
        const categoriesArray = Object.keys(categoriesObj);

        for (const key in categoriesArray) {
            categoryObj = categoriesObj[categoriesArray[key]];
            CATEGORIES.innerHTML += this.__catergoryScoreBuilder(categoryObj);
            this.__REPORT_CONTAINER.append(CATEGORIES);
            this.__progressBar(+categoryObj.score * 100, categoryObj.id)
        }
    }

    /**
    * Builds a circle with the score based on a cotegory provided
    * @param {Object} category
    * @return {string} returns a html string containing the score circle
    */
    __catergoryScoreBuilder(category) {
        return `<div class="progress" id="${category.id}">
                    <svg class="progress__circle" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg">
                        <circle class="progress__circle--back" cx="80" cy="80" r="74"></circle>
                        <circle class="progress__circle--prog progress-${category.id}" cx="80" cy="80" r="74"></circle>
                    </svg>
                    <div class="progress__text" data-progress="0">${+category.score * 100}</div>
                    <div class="progress__title">${category.title}</div>
                </div>`
    }

    /**
    * Creates the score cirlce based on % 
    * @param {string} score Score of the category provided by API call
    * @param {string} category Category passed to dynamically created IDs
    */
    __progressBar(score, category) {
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