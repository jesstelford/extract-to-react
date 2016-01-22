chrome.devtools.panels.create("Extract To React", "gfx/devtools-logo.png", "html/panel.html", panel => {

  var wasShown;

  panel.onShown.addListener(function(window) {
    // when the user switches to the panel, check for an elements tab
    // selection
    wasShown = true;
    window.handleInspected();
  });
  panel.onHidden.addListener(function() {
    // FIXME: This never fires?
    if (wasShown) {
      // TODO
    }
  });
});
