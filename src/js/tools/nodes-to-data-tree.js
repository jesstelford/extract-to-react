import camelcase from 'camelcase';

function cleanName(name) {
  if (!name || Object.prototype.toString.call(name) !== '[object String]') {
    return '';
  }
  return toAlpha(camelcase(name));
}

function toAlpha(name) {
  return name.replace(/[^A-Za-z]/g, '');
}

function uniquifyName(name, existingNames) {

  if (existingNames[name]) {
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
  let componentDataAttribute = (node.dataset && cleanName(node.dataset.component));
  let name = componentDataAttribute
    || cleanName(node.id)
    || cleanName(node.tagName);

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

  children = nodesToDataTree(Array.prototype.slice.call(node.children));

  if (children.length) {
    result.children = children;
  }

  return result;
}
