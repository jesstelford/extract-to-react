import Panel from './components/panel';

var ga = require('./analytics'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    throttle = require('lodash/throttle'),
    makeSnapshot = require('./tools/make-snapshot'),
    elementBottomVisible = require('./tools/element-bottom-visible');

ReactDOM.render(
  <Panel isLoading={true} />,
  document.querySelector('.panel-component')
);

ga('send', 'pageview', '/panel.html');

// export this function for use in the devtools initialization script
window.handleInspected = _ => {

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.extract-button')),
      startTime;

  startTime = performance.now();

  console.log('about to makeSnapshot');

  makeSnapshot(function(error, output) {

    console.log('makeSnapshot callback');

    var processingTime = Math.round(performance.now() - startTime);

    if (error) {
      let errorMessage;

      if (error instanceof Error) {
        errorMessage = error.toString() + '\n' + error.stack;
      } else if (Object.prototype.toString.call(error) === '[object Object]') {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = error.toString();
      }

      chrome.runtime.sendMessage({type: 'error', message: errorMessage});

      ReactDOM.render(
        <Panel inspected={{html: 'ERROR', css: '', js: ''}} />,
        document.querySelector('.panel-component')
      );

      ga(
        'send',
        'exception',
        {
          'exDescription': errorMessage,
          'exFatal': false
        }
      );

      return;
    }

    if (output.html === '') {
      ga('set', ga.dimensions['No Inspected Element'], 'true');
    }

    ga(
      'send',
      'timing',
      {
        'timingCategory': 'processing',
        'timingVar': 'extracting-complete',
        'timingValue': processingTime,
        'timingLabel': 'Extracting DOM Complete'
      }
    );

    console.log(output);
    ReactDOM.render(
      <Panel inspected={output} />,
      document.querySelector('.panel-component')
    );

  });
}

// Disabled until jsbin supports babel: https://github.com/jsbin/jsbin/pull/2633
/*
linkTrigger('jsbin', document.querySelector('button#jsbin'), function(output) {
  return {
    url: 'http://jsbin.com/?html,css,js,output',
    data: {
      babel: encodeURIComponent(output.js),
      html: encodeURIComponent(output.html),
      css: encodeURIComponent(output.css)
    }
  }
});
*/

var visibilityListener = throttle(advancedUsageFullyVisible, 100);

window.addEventListener('scroll', visibilityListener);
window.addEventListener('resize', visibilityListener);

function advancedUsageFullyVisible() {

  if (!elementBottomVisible(document.getElementById('advanced-usage'))) {
    return;
  }

  window.removeEventListener('scroll', visibilityListener);
  window.removeEventListener('resize', visibilityListener);
  visibilityListener.cancel();

  ga(
    'send',
    'event',
    'advanced-usage',
    'visible',
    'UI'
  );

}

