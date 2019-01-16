var packageJson = require('../../package.json');

var whereAmI = window || global,
    gaFuncName = 'ga',
    ga,
    backoffTimeout = 4,
    dimensions = {
      'No Inspected Element': 'dimension1'
    };

if (false /*process.env.NODE_ENV === 'production'*/) {

  // GA tag which will retry loading until successful with initial expoential
  // backoff, up to 30 seconds where it'll retry every 30 seconds.
  function loadGA(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.onerror=function(){
  setTimeout(function(){loadGA(i,s,o,g,r);backoffTimeout*=2;if(backoffTimeout>=30000)backoffTimeout=30000;},backoffTimeout);};
  a.src=g;m.parentNode.insertBefore(a,m)
  };

  loadGA(whereAmI,document,'script','https://www.google-analytics.com/analytics.js',gaFuncName);

  whereAmI[gaFuncName]('create', process.env.GA_TRACKING_ID, 'auto');

  // Allows sending click events even when the page is being unloaded. @see: https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits#specifying_different_transport_mechanisms
  whereAmI[gaFuncName]('set', 'transport', 'beacon');

  // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
  whereAmI[gaFuncName]('set', 'checkProtocolTask', function(){});

  whereAmI[gaFuncName]('set', 'appId', packageJson.name);
  whereAmI[gaFuncName]('set', 'appVersion', packageJson.version);

  whereAmI[gaFuncName]('set', 'forceSSL', true);
  whereAmI[gaFuncName]('set', 'dataSource', 'extension');

  // Usage:
  /* whereAmI[gaFuncName]('send', 'pageview', '/options.html'); */
} else {
  whereAmI[gaFuncName] = function() {
    console.info('[GA Event]:', arguments);
  }
}

module.exports = function() {
  whereAmI[gaFuncName].apply(whereAmI, arguments);
}

module.exports.dimensions = dimensions;
