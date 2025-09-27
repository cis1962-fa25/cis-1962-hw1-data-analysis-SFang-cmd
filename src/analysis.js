/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */
const fs = require('fs');
const Papa = require('papaparse');
/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    const file_data = fs.readFileSync(filename, 'utf8');
    const config = {
        header: true,
        skipEmptyLines: true,
    };
    const csv = Papa.parse(file_data, config);
    return csv;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */
function cleanData(csv) {
    const cleanData = csv.data
        .filter((review) => {
            return (
                notNull(review.review_id) &&
                notNull(review.user_id) &&
                notNull(review.app_name) &&
                notNull(review.app_category) &&
                notNull(review.review_text) &&
                notNull(review.review_language) &&
                notNull(review.rating) &&
                notNull(review.review_date) &&
                notNull(review.verified_purchase) &&
                notNull(review.device_type) &&
                notNull(review.num_helpful_votes) &&
                notNull(review.user_age) &&
                notNull(review.user_country) &&
                notNull(review.app_version)
            );
        })
        .map((review) => {
            return {
                review_id: parseInt(review.review_id),
                app_name: review.app_name,
                app_category: review.app_category,
                review_text: review.review_text,
                review_language: review.review_language,
                rating: parseFloat(review.rating),
                review_date: new Date(review.review_date),
                verified_purchase: review.verified_purchase === 'true',
                device_type: review.device_type,
                num_helpful_votes: parseInt(review.num_helpful_votes),
                app_version: review.app_version,
                user: {
                    user_age: parseInt(review.user_age),
                    user_country: review.user_country,
                    user_gender: review.user_gender,
                    user_id: parseInt(review.user_id),
                },
            };
        });
    return cleanData;
}

function notNull(value) {
    return value !== null && value !== undefined && value !== '';
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    if (rating > 4) {
        return 'positive';
    } else if (rating < 2) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const res = {};
    cleaned.forEach((review) => {
        if (!(review.app_name in res)) {
            res[review.app_name] = {
                app_name: review.app_name,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }
        const sentiment = labelSentiment(review);
        if (sentiment === 'positive') {
            res[review.app_name].positive += 1;
        } else if (sentiment === 'negative') {
            res[review.app_name].negative += 1;
        } else {
            res[review.app_name].neutral += 1;
        }
    });
    return Object.keys(res).map((app_name) => {
        return {
            app_name: app_name,
            positive: res[app_name].positive,
            neutral: res[app_name].neutral,
            negative: res[app_name].negative,
        };
    });
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{lang_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const res = {};
    cleaned.forEach((review) => {
        const { review_language } = review;
        if (!(review_language in res)) {
            res[review_language] = {
                lang_name: review_language,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }
        const sentiment = labelSentiment(review);
        if (sentiment === 'positive') {
            res[review_language].positive += 1;
        } else if (sentiment === 'negative') {
            res[review_language].negative += 1;
        } else {
            res[review_language].neutral += 1;
        }
    });
    return Object.keys(res).map((lang_name) => {
        return {
            lang_name: lang_name,
            positive: res[lang_name].positive,
            neutral: res[lang_name].neutral,
            negative: res[lang_name].negative,
        };
    });
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    const review_count = {};
    cleaned.forEach((review) => {
        const { app_name } = review;
        if (!(app_name in review_count)) {
            review_count[app_name] = 0;
        }
        review_count[app_name] += 1;
    });
    let most_reviewed_app = '';
    let most_reviews = 0;
    for (const app_name in review_count) {
        if (review_count[app_name] > most_reviews) {
            most_reviews = review_count[app_name];
            most_reviewed_app = app_name;
        }
    }
    const reviews_for_app = cleaned.filter(
        (review) => review.app_name === most_reviewed_app,
    );

    const device_count = {};
    let rating_sum = 0;
    reviews_for_app.forEach((review) => {
        const { device_type, rating } = review;
        if (!(device_type in device_count)) {
            device_count[device_type] = 0;
        }
        device_count[device_type] += 1;
        rating_sum += rating;
    });

    let most_used_device = null;
    let most_devices = 0;
    for (const device in device_count) {
        if (device_count[device] > most_devices) {
            most_devices = device_count[device];
            most_used_device = device;
        }
    }

    const avg_rating = rating_sum / reviews_for_app.length;
    return {
        mostReviewedApp: most_reviewed_app,
        mostReviews: most_reviews,
        mostUsedDevice: most_used_device,
        mostDevices: most_devices,
        avgRating: avg_rating,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
