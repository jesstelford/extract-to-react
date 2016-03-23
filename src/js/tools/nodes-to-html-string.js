module.exports = function nodesToHtmlString(nodes) {
  let result = Array.prototype.slice.call(nodes).map(node => node.outerHTML).join('');

  console.log('nodes as html string:', result);
  return result;
}
