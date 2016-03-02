// From http://stackoverflow.com/a/21627295
module.exports = function elementBottomVisible(el){

  var bottom = el.getBoundingClientRect().bottom;

  el = el.parentNode;

  do {
    if (Math.floor(bottom) > Math.floor(el.getBoundingClientRect().bottom)) {
      return false;
    }
    el = el.parentNode;
  } while (el != document.body);
  // Check its within the document viewport
  return bottom <= document.documentElement.clientHeight;
};
