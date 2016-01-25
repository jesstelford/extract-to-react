module.exports = function htmlStringToNodesArray(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return Array.prototype.slice.call(div.childNodes);
}
