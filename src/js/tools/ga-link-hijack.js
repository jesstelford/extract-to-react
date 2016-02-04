module.exports = function(DOMNodes) {

  // Modified from http://exisweb.net/link-tracking-universal-analytics
  Array.prototype.slice.call(DOMNodes).filter(el => {

    // Extract its href attribute
    var href = (typeof(el.getAttribute('href')) == 'string' ) ? el.getAttribute('href') : '';

    // If link is outbound
    return (href.match(/^(https?:|\/\/)/i) || href.match(/^mailto\:/i));

  }).forEach(el => {

    // Add an event to click
    el.addEventListener('click', function(event) {

      var href = el.getAttribute('href');

      // Log even to Analytics, once done, go to the link
      ga(
        'send',
        'event',
        'outbound',
        'click',
        href,
        {
          'nonInteraction': 1 // Don't count against bounce rate. @see: http://analytics.blogspot.com.au/2011/10/non-interaction-events-wait-what.html
        }
      );

    });
  });
}
