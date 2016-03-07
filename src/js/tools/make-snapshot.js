var Snapshooter = require('./Snapshooter'),
    extractHtmlCss = require('./extract-html-css'),
    inspectedContext = new (require('./InspectedContext'));

module.exports = function makeSnapshot(callback) {

  function processSnapshot(url, result, exception) {

    var snapshot;

    if (exception) {
      return callback(exception);
    }

    try {
      snapshot = JSON.parse(result);
      snapshot = extractHtmlCss(snapshot);
      snapshot.url = url;
      return callback(null, snapshot);
    } catch (e) {
      return callback(new Error('Snapshot failed: ' + (result ? result.toString() : 'Unable to create snapshot')));
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
