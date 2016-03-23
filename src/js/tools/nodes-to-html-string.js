module.exports = function nodesToHtmlString(nodes) {
  return Array.prototype.slice.call(nodes).map(node => node.outerHTML).join('');
}
