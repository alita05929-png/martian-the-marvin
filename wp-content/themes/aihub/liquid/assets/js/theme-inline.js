(() => {
  "use strict";
  const liquidApp = new LiquidApp(window.liquidAppOptions || {});
  window.liquid.app = liquidApp;
  liquidApp.start();
})();
