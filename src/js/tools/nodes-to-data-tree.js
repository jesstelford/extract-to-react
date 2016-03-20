import reactComponentName from './react-component-name';

function uniquifyName(name, existingNames) {

  console.log('uniquifying name', name, existingNames);

  if (typeof existingNames[name] !== 'undefined') {
    existingNames[name]++;
    return `${name}${existingNames[name]}`;
  } else {
    existingNames[name] = 0;
    return name;
  }

}

/**
 * Convert an array of DOM nodes into a data tree for display
 *
 * @param nodes {Array|Node} DOM node(s) to convert
 * @return {Array} Colleciton of data trees
 */
export function nodesToDataTree(nodes, existingNames = {}) {

  if (Object.prototype.toString.call(nodes) !== '[object Array]') {
    nodes = [nodes];
  }

  return nodes.map(node => nodeToDataTree(node, existingNames));

  // TODO: Walk the tree to collapse those without a child that is selected
}

export function nodeToDataTree(node, existingNames = {}) {

  let result = {};
  let children;
  let componentDataAttribute = (node.dataset && reactComponentName(node.dataset.component));

  let name;

  if (node.dataset) {
    name = componentDataAttribute
      // Try to get the original id out of the HTML first
      || reactComponentName(node.dataset.snapshooterOriginalId);
  }

  name = name
    // all else failed, use the tag name
    || reactComponentName(node.tagName.toLowerCase());

  name = uniquifyName(name, existingNames);

  result = {
    label: {
      name,
      checked: !!componentDataAttribute,
    },
    checkbox: false, // We'll handle this ourselves
    collapsed: false,
    collapsible: true
  };

  children = nodesToDataTree(Array.prototype.slice.call(node.children), existingNames);

  if (children.length) {
    result.children = children;
  }

  return result;
}
