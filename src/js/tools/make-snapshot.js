var Snapshooter = require('./Snapshooter'),
    extractHtmlCss = require('./extract-html-css'),
    inspectedContext = new (require('./InspectedContext'));

module.exports = function makeSnapshot(callback) {

  inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (result) {

    inspectedContext.eval('window.location.href', url => {

      var snapshot;

      try {
        snapshot = JSON.parse(result);
        snapshot = extractHtmlCss(snapshot);
        snapshot.url = url;
        return callback(null, snapshot);
      } catch (e) {
        return callback(e);
      }

    });

  });
}

