class LiquidEffectsFadeToggleBehavior extends LiquidBehavior {
  static behaviorName = "liquidEffectsFadeToggle";
  get viewEvents() {
    const e = this.getChangeProp(),
      i = this.getChangeProp("closedItems");
    return {
      [`change:${e}`]: "onOpenedElements",
      [`change:${i}`]: "onClosedElements",
    };
  }
  options() {
    return { duration: 0.7, changePropPrefix: null };
  }
  onOpenedElements({ targets: e }) {
    e?.length && this.fade(e, "in");
  }
  onClosedElements({ targets: e }) {
    e?.length && this.fade(e, "out");
  }
  fade(e, i) {
    e.forEach((t) => {
      t.animate(
        [{ opacity: i === "in" ? 0 : 1 }, { opacity: i === "in" ? 1 : 0 }],
        { duration: this.getOption("duration") * 1e3 }
      );
    });
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidEffectsFadeToggleBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidEffectsFadeToggleBehavior));
