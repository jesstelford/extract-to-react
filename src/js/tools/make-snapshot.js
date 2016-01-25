var Snapshooter = require('./Snapshooter'),
    extractHtmlCss = require('./extract-html-css'),
    inspectedContext = new (require('./InspectedContext'));

module.exports = function makeSnapshot(callback) {

  inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
    var snapshot;
    try {
      snapshot = JSON.parse(result);
      return callback(null, extractHtmlCss(snapshot));
    } catch (e) {
      return callback(e);
    }

  });
}

