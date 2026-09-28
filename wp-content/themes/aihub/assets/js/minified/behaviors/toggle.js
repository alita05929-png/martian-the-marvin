class LiquidToggleBehavior extends LiquidBehavior {
  static behaviorName = "liquidToggle";
  static initialModelProps = { firstToggle: !0 };
  options() {
    return {
      openedItems: [-1],
      toggleOffActiveItem: !1,
      keepOneItemActive: !1,
      toggleAllTriggers: !1,
      disableOnTouch: !1,
      changeTriggerClassname: [],
      changeTargetClassname: [],
      parentToChangeClassname: "",
      changePropPrefix: null,
      toggleOffOnEscPress: !1,
      toggleOffOnOutsideClick: !1,
      ignoreEnterOnFocus: !1,
      onChangeOpenedItems: null,
      triggerElements: ["click @togglableTriggers"],
    };
  }
  get ui() {
    return {
      togglableTriggers: ".lqd-togglable-trigger",
      togglableElements: ".lqd-togglable-element",
    };
  }
  get viewModelEvents() {
    return { [`change:${this.getChangeProp()}`]: "onChangeOpenedItems" };
  }
  get domEvents() {
    const e = this.getOption("triggerElements");
    if (!e?.length) return;
    const t = {};
    return (
      e.forEach((s) => {
        t[s] = "onLqdWidgetChangeOpenedItems";
      }),
      {
        ...t,
        "click <document": {
          ifHasOption: "toggleOffOnOutsideClick",
          func: "onDocClick",
        },
      }
    );
  }
  get windowEvents() {
    return { keyup: { ifHasOption: "toggleOffOnEscPress", func: "onKeyUp" } };
  }
  initialize() {
    const e = this.getOption("openedItems").filter((t) => t >= 0);
    e?.length ||
      this.view.model.set({ [this.getChangeProp()]: e }, { silent: !0 });
  }
  changeOpenedItems(e) {
    const t = this.getChangeProp(),
      s = this.getOption("toggleOffActiveItem"),
      i = this.getOption("toggleAllTriggers"),
      g = this.getOption("keepOneItemActive"),
      r = [...(this.view.model.get(t) || [])];
    let l = _.uniq([...r, e]);
    s && (l = [e]),
      r.includes(e) && !g && (l = l.filter((n) => n !== e)),
      i &&
        (l = this.getUI("togglableTriggers")
          .map((n, o) => o)
          .filter((n, o) => !r.includes(o))),
      this.view.model.set({ [t]: l });
  }
  onLqdWidgetChangeOpenedItems(e) {
    if (
      (this.getOption("ignoreEnterOnFocus") &&
        e.pointerType === "" &&
        this.getUI("togglableTriggers").findIndex(
          (g) => g === document.activeElement
        ) < 0) ||
      (this.getOption("disableOnTouch") &&
        this.liquidApp.touchMatchMedia.matches)
    )
      return;
    e.preventDefault(), e.stopPropagation();
    const s = e.currentTarget,
      i = this.getUI("togglableTriggers").findIndex((g) => g === s);
    i < 0 || this.changeOpenedItems(i);
  }
  onChangeOpenedItems() {
    const e = this.view.model.get("parentsCollection")?.at(0);
    this.handleClassnames(),
      this.view.trigger(`change:${this.getChangeProp()}`, this.openedElements),
      this.view.trigger(
        `change:${this.getChangeProp("closedItems")}`,
        this.closedElements
      ),
      e &&
        (e.set("toggle:open", {
          openedElements: this.openedElements,
          firstToggle: this.model.get("firstToggle"),
        }),
        e.set("toggle:close", {
          closedElements: this.closedElements,
          firstToggle: this.model.get("firstToggle"),
        })),
      this.model.set({ firstToggle: !1 }),
      this.getOption("onChangeOpenedItems") &&
        this.getOption("onChangeOpenedItems").apply(this, [
          this.openedElements,
          this.closedElements,
        ]);
  }
  handleClassnames() {
    const e = this.getOption("changeTriggerClassname"),
      t = this.getOption("changeTargetClassname"),
      s = this.getOption("parentToChangeClassname"),
      i = [...this.openedElements.triggers, ...this.closedElements.triggers],
      g = [...this.openedElements.targets, ...this.closedElements.targets],
      r = [...this.openedElements.triggers, ...this.openedElements.targets],
      l = [...this.closedElements.triggers, ...this.closedElements.targets];
    s !== "" &&
      (r.forEach((n) =>
        n?.parentElement?.closest(s)?.classList?.add(STATE_CLASSNAMES.ACTIVE)
      ),
      l.forEach((n) =>
        n?.parentElement?.closest(s)?.classList?.remove(STATE_CLASSNAMES.ACTIVE)
      )),
      e.length && i.forEach((n) => e.forEach((o) => n?.classList?.toggle(o))),
      t.length && g.forEach((n) => t.forEach((o) => n?.classList?.toggle(o))),
      r.forEach((n) => n.classList.add(STATE_CLASSNAMES.ACTIVE)),
      l.forEach((n) => n.classList.remove(STATE_CLASSNAMES.ACTIVE));
  }
  onDocClick(e) {
    const t = [...this.openedElements.targets, ...this.openedElements.triggers];
    if (!t.length) return;
    const s = e.composedPath();
    let i = !1;
    t.forEach((g) => {
      if (s.includes(g)) return (i = !0);
    }),
      !i && this.view.model.set({ [this.getChangeProp()]: [] });
  }
  onKeyUp(e) {
    e.code !== "Escape" ||
      ![...this.openedElements.targets, ...this.openedElements.triggers]
        .length ||
      this.view.model.set({ [this.getChangeProp()]: [] });
  }
  get openedElements() {
    const e = this.view.model.get(this.getChangeProp());
    return {
      targets: this.getUI("togglableElements").filter((t, s) => e.includes(s)),
      triggers: this.getUI("togglableTriggers").filter((t, s) => e.includes(s)),
    };
  }
  get closedElements() {
    const e = this.view.model.get(this.getChangeProp());
    return {
      targets: this.getUI("togglableElements").filter((t, s) => !e.includes(s)),
      triggers: this.getUI("togglableTriggers").filter(
        (t, s) => !e.includes(s)
      ),
    };
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidToggleBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidToggleBehavior));
