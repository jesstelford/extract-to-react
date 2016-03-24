export default function cleanNode(node) {
  // Only if it's an element that can have attributes removed
  if (node instanceof Element && node.removeAttribute) {
    node.removeAttribute('data-snapshooter-original-id');
  }
}
