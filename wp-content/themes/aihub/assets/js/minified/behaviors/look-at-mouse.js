class LiquidLookAtMouseBehavior extends LiquidBehavior {
  static behaviorName = "liquidLookAtMouse";
  static docEvents = { mousemove: "onDocMouseMove" };
  pageX = 0;
  pageY = 0;
  options() {
    return {};
  }
  get ui() {
    return { items: "[data-lqd-look-at-mouse]" };
  }
  get bindToThis() {
    return ["onTick"];
  }
  initialize() {
    gsap.ticker.add(this.onTick);
  }
  onTick() {
    this.getUI("items").forEach((e) => {
      const i = e.getBoundingClientRect(),
        o = {
          x: i.left + i.width / 2,
          y: i.top + window.scrollY + i.height / 2,
        },
        t =
          Math.atan2(this.pageX - o.x, this.pageY - o.y) *
            (180 / Math.PI) *
            -1 +
          180;
      gsap.set(e, { transition: "none" }),
        gsap.to(e, { rotation: `${t}_short` });
    });
  }
  onDocMouseMove(e) {
    (this.pageX = e.pageX), (this.pageY = e.pageY);
  }
  destroy() {
    gsap.ticker.remove(this.onTick),
      this.getUI("items").forEach((e) => {
        gsap.killTweensOf(e);
      }),
      super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidLookAtMouseBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidLookAtMouseBehavior));
