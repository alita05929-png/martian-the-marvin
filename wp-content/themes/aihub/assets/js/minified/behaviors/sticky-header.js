class LiquidStickyHeaderBehavior extends LiquidBehavior {
  static behaviorName = "liquidStickyHeader";
  static viewModelEvents = {
    "change:computedStyles": "initialize",
    "change:isSticky": "setHeaderAttrs",
  };
  options() {
    return { end: "max", offset: 0 };
  }
  get bindToThis() {
    return ["handleContainerOnEnter", "handleContainerOnLeaveBack"];
  }
  initialize() {
    (this.scrollTriggers = []),
      (this.containerModels = []),
      this.stopListening(),
      (this.alwaysVisibleContainersModels = this.view.model
        .get("childrenCollection")
        .filter((e) => e.get("isTopLevelContainer"))
        .filter(
          (e) =>
            !e.view.el.dataset[DATA_ATTRS.SHOW_ON_STICKY.JS_DATASET] &&
            !e.view.el.dataset[DATA_ATTRS.HIDE_ON_STICKY.JS_DATASET]
        )),
      this.alwaysVisibleContainersModels.length &&
        this.alwaysVisibleContainersModels.forEach((e, i) =>
          _.defer(this.initStickyContainers.bind(this, e, i))
        );
  }
  setHeaderAttrs(e, i) {
    this.view.el.dataset[DATA_ATTRS.STICKY_HEADER.JS_DATASET] = i;
  }
  setContainerAttrs(e, i) {
    (e.view.el.dataset[DATA_ATTRS.STICKY_CONTAINER.JS_DATASET] = i),
      (e.view.el.dataset[DATA_ATTRS.STICKY_EL.JS_DATASET] = i);
  }
  initStickyContainers(e, i) {
    this.setContainerAttrs(e, !1),
      this.containerModelEventHandler(e),
      this.buildScrollTrigger(e, i);
  }
  buildScrollTrigger(e, i) {
    const t = ScrollTrigger.create({
      trigger: e.view.el,
      pin: !0,
      pinSpacing: !1,
      start: `top-=${
        this.getOption("offset") +
        (document.body.classList.contains("admin-bar") &&
        window.innerWidth >= 601
          ? 32
          : 0)
      } top`,
      endTrigger: document.body,
      end: "bottom top",
      onEnter: () => this.handleContainerOnEnter(e, i),
      onLeaveBack: () => this.handleContainerOnLeaveBack(e, i),
    });
    (e.view.el.style.zIndex = this.alwaysVisibleContainersModels.length - i),
      this.scrollTriggers.push(t);
  }
  handleContainerOnEnter(e, i) {
    i === this.alwaysVisibleContainersModels.length - 1 &&
      this.handleHeaderStickyChange(!0),
      this.handleContainerStickyChange(e, !0),
      (e.view.el.style.zIndex = this.alwaysVisibleContainersModels.length - i);
  }
  handleContainerOnLeaveBack(e, i) {
    i === 0 && this.handleHeaderStickyChange(!1),
      this.handleContainerStickyChange(e, !1),
      (e.view.el.style.zIndex = this.alwaysVisibleContainersModels.length - i);
  }
  containerModelEventHandler(e) {
    this.listenTo(e, "change:isSticky", (i, t) => this.setContainerAttrs(e, t));
  }
  handleContainerStickyChange(e, i) {
    e.set({ isSticky: i });
  }
  handleHeaderStickyChange(e) {
    this.view.model.set({ isSticky: e });
  }
  destroy() {
    this.scrollTriggers?.forEach((e) => e.kill()),
      this.alwaysVisibleContainersModels?.forEach(
        (e) => e.el && (e.el.style.zIndex = "")
      ),
      super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidStickyHeaderBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidStickyHeaderBehavior));
