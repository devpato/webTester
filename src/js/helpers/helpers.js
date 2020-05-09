/**
* Test to see if the URL is valid
* @param {string} url URL entered in the input box
* @return {boolean} 
*/
const validateUrl = (url) => {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

/**
* Will build query based on api and parameters passed
* @param {string} api URL
* @return {object} parameters
*/
const queryBuilder = (api, parameters) => {
    let query = `${api}?`;
    for (let key in parameters) {
        if (Array.isArray(parameters[key])) {
            for (let i = 0; i < parameters[key].length; i++) {
                query += `${key}=${parameters[key][i]}&`;
            }
        } else {
            query += `${key}=${parameters[key]}&`;
        }
    }

    return query.substring(0, query.length - 1);
};

export { validateUrl, queryBuilder };