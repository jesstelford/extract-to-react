/*
   Allows to read, change and override settings kept in localStorage

   FIXME Can be replaced with chrome.storage.local as soon as http://crbug.com/178618 will be resolved
   FIXME Can be replaced with localStorage on the panel page as soon as http://crbug.com/319328 will be resolved
 */
chrome.runtime.onMessage.addListener(function (message, sender, callback) {
  "use strict";

  if (message.post) {
    postData(message.post.url, message.post.data);
  } else {

    if (message.type) {
      console.log(message.type);
    }

    console.log(message.message);
  }
});

function postData(url, data) {
  chrome.tabs.create(
    {
      url: chrome.runtime.getURL("post.html")
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

