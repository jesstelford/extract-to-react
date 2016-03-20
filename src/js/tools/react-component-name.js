import titlecase from 'titlecase';

export default function reactComponentName(name) {
  if (!name || Object.prototype.toString.call(name) !== '[object String]') {
    return '';
  }
  return toVariable(titlecase(name));
}

function toVariable(name) {
  return name.slice(0,1).replace(/[^A-Za-z]/g, '')
    + name.slice(1).replace(/[^A-Za-z0-9_]/g, '');
}
