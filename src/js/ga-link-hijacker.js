var gaLinkHijack = require('./tools/ga-link-hijack');

window.addEventListener('DOMContentLoaded', _ => {
  gaLinkHijack(document.querySelectorAll('a'));
});
