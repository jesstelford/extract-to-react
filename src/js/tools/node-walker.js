/**
 * @param visitors {Array[Function]} will receive a single DOMNode as a
 * parameter to be modified in place.
 * @return {Function(<DOMNode> | <[DOMNode, ...]>} Pass the node(s) to be walked
 * to this function
 */
export default function nodeWalker(visitors) {

  if (!visitors) {
    throw new Error('Must provide an [array of] visitors');
  }

  if (Object.prototype.toString.call(visitors) !== '[object Array]') {
    visitors = [visitors];
  }

  return function walker(nodes) {

    let isSingleNode = !nodes.length;

    // ensure we have an array to walk
    if (isSingleNode) {
      nodes = [nodes];
    }

    visitNodes(nodes, visitors);

    if (isSingleNode) {
      return nodes[0];
    } else {
      return nodes;
    }
  }
}

function visitNodes(nodes, visitors) {
  Array.prototype.slice.call(nodes).forEach(node => {
    visitNode(node, visitors);
    if (node.childNodes) {
      visitNodes(node.childNodes, visitors);
    }
  });
}

function visitNode(node, visitors) {
  visitors.forEach(visitor => visitor(node));
}
