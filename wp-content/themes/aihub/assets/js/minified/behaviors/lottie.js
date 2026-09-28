class LiquidLottieBehavior extends LiquidBehavior {
  static behaviorName = "liquidLottie";
  options() {
    return {
      animType: "",
      name: "",
      autoplay: !1,
      loop: !1,
      path: "",
      className: "lqd-lottie",
      direction: "",
      speed: 1,
    };
  }
  get ui() {
    return { elements: ".lqd-lottie" };
  }
  initialize() {
    const e = this.getOption("name"),
      t = this.getUI("elements")[0];
    bodymovin.loadAnimation({
      wrapper: t,
      animType: this.getOption("animType"),
      name: e,
      autoplay: this.getOption("autoplay"),
      loop: this.getOption("loop"),
      path: this.getOption("path"),
      rendererSettings: { className: this.getOption("className") },
    }),
      lottie.setDirection(this.getOption("direction"), e),
      lottie.setSpeed(this.getOption("speed"), e),
      lottie.pause(e),
      (this.IO = new IntersectionObserver(([i]) => {
        i.isIntersecting ? lottie.play(e) : lottie.pause(e);
      })),
      this.IO.observe(t);
  }
  destroy() {
    this.IO?.disconnect(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidLottieBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidLottieBehavior));
