class LiquidSplitTextBehavior extends LiquidBehavior {
  static behaviorName = "liquidSplitText";
  static appEvents = {
    "after:windowResize": {
      func: "afterWindowResize",
      ifHasOption: "splitDoneFromBackend",
    },
  };
  options() {
    return {
      splitDoneFromBackend: !1,
      tag: "span",
      splitType: "words",
      classnamePrefix: "lqd-split-text-",
      elements: [{ els: "[data-lqd-split-text-el]" }],
    };
  }
  async initialize() {
    this.isDestroyed ||
      (this.getOption("splitDoneFromBackend") ||
        (this.widthBeforeResize = await this.liquidApp.fastdom.measure(
          () => this.view.el.offsetWidth
        )),
      this.isDestroyed) ||
      ((this.elements = this.getElements()), this.beginSplit());
  }
  getElements() {
    const e = this.getOption("elements"),
      t = this.getOption("splitType");
    return e.map(({ els: i, splitType: s }) => ({
      els: this.view.el.querySelectorAll(i),
      splitType: s || t,
    }));
  }
  beginSplit() {
    const e = this.getOption("splitDoneFromBackend");
    this.elements.forEach((t) =>
      e ? this.split(t) : _.defer(this.split.bind(this, t))
    );
  }
  split({ els: e, splitType: t }) {
    const i = this.getOption("classnamePrefix");
    if (!e.length || this.getOption("splitDoneFromBackend"))
      return (
        (this.splitText = {
          lines: this.view.el.querySelectorAll(`.${i}lines`),
          words: this.view.el.querySelectorAll(`.${i}words`),
          chars: this.view.el.querySelectorAll(`.${i}chars`),
          revert: _.noop,
        }),
        this.onSplitDone(t)
      );
    gsap.registerPlugin(SplitText);
    const s = this.getOption("tag");
    (this.splitText = new SplitText(e, {
      type: t,
      position: t === "chars" ? "absolute" : "relative",
      tag: s,
      linesClass: `${i}lines`,
      wordsClass: `${i}words`,
      charsClass: `${i}chars`,
    })),
      this.onSplitDone(t);
  }
  onSplitDone(e) {
    this.setSplitUnitsAttrs(e),
      this.setAnimatableElements(e),
      this.view.model.set({ splitText: "done" });
  }
  setSplitUnitsAttrs(e) {
    const t = e === "chars,words" ? "words" : e,
      i = this.splitText[t];
    i.forEach((s, l) => {
      s.style.setProperty("--split-text-index", l),
        s.style.setProperty("--split-text-last-index", i.length - 1 - l);
    });
  }
  setAnimatableElements(e) {
    const t = e === "chars,words" ? "chars" : e,
      i = this.splitText[t];
    this.view.model.set({ animatableElements: [...i] });
  }
  revertSplitText() {
    this.splitText?.revert();
  }
  reInit() {
    this.revertSplitText(), this.beginSplit();
  }
  async afterWindowResize(e) {
    const t = await this.liquidApp.fastdom.measure(
      () => this.view.el.offsetWidth
    );
    this.isDestroyed ||
      (e.prevSize.width !== e.currentSize.width &&
        this.widthBeforeResize !== t &&
        this.reInit(),
      (this.widthBeforeResize = t));
  }
  update(e) {
    super.update(e), this.reInit();
  }
  destroy() {
    this.revertSplitText(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidSplitTextBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidSplitTextBehavior));
