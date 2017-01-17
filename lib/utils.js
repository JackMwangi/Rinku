const logger = require('./logger')();
var linkify = require('linkifyjs');

const saveToDb = (linksObj) => {
     if (linksObj.length) {
        // TODO save to MongoDb
        return true;
     }
    return false;
}

module.exports = {
    matchUrl(text) {
        var linksObj = linkify.find(text);
        var res = saveToDb(linksObj);
        return res;
    },

};