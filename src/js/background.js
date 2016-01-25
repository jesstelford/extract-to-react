chrome.runtime.onMessage.addListener(function (message, sender, callback) {
  "use strict";

  if (message.post) {
    postData(message.post.url, message.post.data);
  } else {

    if (message.type && console[message.type]) {
      console[message.type](message.message);
    } else {
      console.log(message.message);
    }
  }
});

function postData(url, data) {
  chrome.tabs.create(
    {
      url: chrome.runtime.getURL("html/post.html")
    },
    function(tab) {
      var handler = function(tabId, changeInfo) {
        if(tabId === tab.id && changeInfo.status === "complete"){
          chrome.tabs.onUpdated.removeListener(handler);
          chrome.tabs.sendMessage(tabId, {url: url, data: data});
        }
      }

      // in case we're faster than page load (usually):
      chrome.tabs.onUpdated.addListener(handler);
      // just in case we're too late with the listener:
      chrome.tabs.sendMessage(tab.id, {url: url, data: data});
    }
  );
}

