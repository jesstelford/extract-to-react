export default function lineageSearch(
  collection,
  lineage,
  childrenSelector = element => element.children
) {
  let element = null;
  lineage.forEach(index => {
    if (Object.prototype.toString.call(collection) === '[object Array]') {
      element = collection[index];
      collection = childrenSelector(element);
    } else {
      throw new Error(`Lineage ${JSON.stringify(lineage)} invalid in collection ${JSON.stringify(collection)}`);
    }
  });
  return element;
}
