class LiquidCarouselNavBehavior extends LiquidBehavior {
  static behaviorName = "liquidCarouselNav";
  static viewEvents = {
    "carousel:activate": "onCarouselActivate",
    "carousel:select": "updateNavButtons",
  };
  static domEvents = {
    "click .lqd-carousel-nav-prev": "onPrevClick",
    "click .lqd-carousel-nav-next": "onNextClick",
  };
  get ui() {
    return {
      prevButton: ".lqd-carousel-nav-prev",
      nextButton: ".lqd-carousel-nav-next",
    };
  }
  onPrevClick() {
    this.view.trigger("carousel:uiChange"), this.view.trigger("carousel:prev");
  }
  onNextClick() {
    this.view.trigger("carousel:uiChange"), this.view.trigger("carousel:next");
  }
  onCarouselActivate() {
    this.view.focusableElems.push(
      this.getUI("prevButton")[0],
      this.getUI("nextButton")[0]
    );
  }
  navButtonEnable(e) {
    e.removeAttribute("disabled");
  }
  navButtonDisable(e) {
    e.setAttribute("disabled", !0);
  }
  updateNavButtons() {
    let e = this.view.carouselSlides.length
      ? this.view.carouselSlides.length - 1
      : 0;
    this.updateNavButton("prevButton", 0),
      this.updateNavButton("nextButton", e);
  }
  updateNavButton(e, a) {
    const t = this.getUI(e)[0];
    if (this.view.isCarouselWrapping && this.view.carouselSlides.length > 1) {
      this.navButtonEnable(t);
      return;
    }
    let i = this.view.selectedIndex !== a;
    this[i ? "navButtonEnable" : "navButtonDisable"](t),
      !i && document.activeElement === t && this.view.trigger("carousel:focus");
  }
  activateNavButtons() {}
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidCarouselNavBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidCarouselNavBehavior));
