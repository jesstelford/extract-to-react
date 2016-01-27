var htmlStringToNodesArray = require('./html-string-to-nodes'),
    extractReactComponents = require('html-to-react-components');

const DEFAULT_COMPONENT_NAME = 'Component';

function setAttributeToRoot(html, attribute, value) {
  var htmlNode = htmlStringToNodesArray(html)[0];
  if (!htmlNode.getAttribute(attribute)) {
    htmlNode.setAttribute(attribute, value);
  }
  return htmlNode.outerHTML;
}

module.exports = function convertToReact({html, css}, innerHTML = '', defaultComponentName = DEFAULT_COMPONENT_NAME) {

  html = setAttributeToRoot(html, 'data-component', defaultComponentName);

  var components = extractReactComponents(html, {
        componentType: 'es5',
        moduleType: false
      }),
      componentKeys = Object.keys(components),
      js = componentKeys.map(key => components[key]).join('\n')
        + `
ReactDOM.render(
<${componentKeys[0]} />,
document.getElementById('container')
);`;

  return {
    html: `<div id="container">${innerHTML}</div>`,
    js,
    css
  };

}
