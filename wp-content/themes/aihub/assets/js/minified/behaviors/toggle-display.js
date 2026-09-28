class LiquidEffectsDisplayToggleBehavior extends LiquidBehavior {
  static behaviorName = "liquidEffectsDisplayToggle";
  options() {
    return { changePropPrefix: null };
  }
  get viewEvents() {
    const e = this.getChangeProp(),
      i = this.getChangeProp("closedItems");
    return {
      [`change:${e}`]: "onOpenedElements",
      [`change:${i}`]: "onClosedElements",
    };
  }
  onOpenedElements({ targets: e }) {
    e?.length && e.forEach((i) => i?.classList?.remove("hidden"));
  }
  onClosedElements({ targets: e }) {
    e?.length && e.forEach((i) => i?.classList?.add("hidden"));
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidEffectsDisplayToggleBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidEffectsDisplayToggleBehavior));
