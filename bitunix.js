const axios = require('axios'); // For making HTTP requests
const crypto = require('crypto'); // For hashing
const querystring = require('querystring'); // For constructing query strings

// API keys and secret
const apiKey = 'xxx';
const apiSecret = 'xxx';

// Function to determine parameter type based on the first character
function getParameterType(s) {
    if (/^\d/.test(s)) {
        return 1; // If the first character is a digit
    } else if (/^[a-z]/.test(s)) {
        return 2; // If the first character is a lowercase letter
    }
    return 3; // Otherwise
}

// Function to calculate the sum of ASCII values of all characters in a string
function strToAsciiSum(s) {
    return Array.from(s).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

// Request parameters
const data = {
    timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    page: 1,
    pageSize: 10
};

// Sort the transaction parameters
// First, sort by key type (number, lowercase letter, others), then by ASCII sum of the keys
const sortedKeys = Object.keys(data).sort((a, b) => {
    const typeDiff = getParameterType(a) - getParameterType(b);
    return typeDiff !== 0 ? typeDiff : strToAsciiSum(a) - strToAsciiSum(b);
});
const sortedParams = sortedKeys.reduce((obj, key) => {
    obj[key] = data[key];
    return obj;
}, {});

// Generate the signature
const queryString = querystring.stringify(sortedParams);
const concatenatedString = Object.values(sortedParams).join('');
const signature = crypto.createHash('sha1').update(concatenatedString + apiSecret).digest('hex');

// Set the request headers
const headers = {
    'Content-Type': 'application/json',
    'apiKey': apiKey,
    'signature': signature
};

// Make the request
const url = `https://partners.bitunix.com/partner/api/v2/openapi/userList?${queryString}`;
axios.get(url, { headers, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) }) // Disable SSL certificate validation
    .then(response => {
        console.log("Execution result:", response.data);
    })
    .catch(error => {
        console.error("Error occurred:", error.message);
    });
