var Snapshooter = require('./Snapshooter'),
    extractHtmlCss = require('./extract-html-css'),
    inspectedContext = new (require('./InspectedContext'));

module.exports = function makeSnapshot(callback) {

  function processSnapshot(url, result) {

    var snapshot;

    try {
      snapshot = JSON.parse(result);
      snapshot = extractHtmlCss(snapshot);
      snapshot.url = url;
      return callback(null, snapshot);
    } catch (e) {
      return callback(e);
    }

  }

  inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (inspectedUrl, result) {

    if (inspectedUrl) {
      processSnapshot(inspectedUrl, result);
    } else {

      inspectedContext.eval('window.location.href', (_, windowUrl) => {
        processSnapshot(windowUrl, result);
      });

    }

  });
}
