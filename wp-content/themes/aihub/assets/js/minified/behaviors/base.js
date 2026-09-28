class LiquidBehavior {
  static behaviorName = "liquidBase";
  static initialModelProps = {};
  static initializeConditions = [];
  static willEmitInitializeTriggerEvents = [];
  static appEvents = {};
  static regionsEvents = {};
  static modelEvents = {};
  static viewEvents = {};
  static viewModelEvents = {};
  static parentsCollectionEvents = {};
  static topParentContainerEvents = {};
  static topParentChildrenCollectionEvents = {};
  static childrenCollectionEvents = {};
  static domEvents = {};
  static docEvents = {};
  static windowEvents = {};
  constructor(t, e) {
    _.extend(this, Backbone.Events),
      (this.model = new Backbone.Model(this.initialModelProps)),
      (this.view = t),
      (this._ui = {}),
      (this._allEvents = { domEvents: [], docEvents: [], windowEvents: [] }),
      (this._options = { ...this.options(), ...e }),
      (this.initializeTriggers = new Set()),
      (this.isDestroyed = !1),
      (this.liquidApp = window.liquid.app),
      this.preInitialize();
  }
  preInitialize() {
    this.addUi(), this.addAllEvents();
  }
  initialize() {}
  options() {
    return {};
  }
  get behaviorName() {
    return this.constructor.behaviorName;
  }
  get initialModelProps() {
    return this.constructor.initialModelProps;
  }
  get willEmitInitializeTriggerEvents() {
    return this.constructor.willEmitInitializeTriggerEvents;
  }
  get ui() {
    return {};
  }
  get appEvents() {
    return this.constructor.appEvents;
  }
  get regionsEvents() {
    return this.constructor.regionsEvents;
  }
  get modelEvents() {
    return this.constructor.modelEvents;
  }
  get viewEvents() {
    return this.constructor.viewEvents;
  }
  get viewModelEvents() {
    return this.constructor.viewModelEvents;
  }
  get parentsCollectionEvents() {
    return this.constructor.parentsCollectionEvents;
  }
  get topParentContainerEvents() {
    return this.constructor.topParentContainerEvents;
  }
  get topParentChildrenCollectionEvents() {
    return this.constructor.topParentChildrenCollectionEvents;
  }
  get childrenCollectionEvents() {
    return this.constructor.childrenCollectionEvents;
  }
  get domEvents() {
    return this.constructor.domEvents;
  }
  get docEvents() {
    return this.constructor.docEvents;
  }
  get windowEvents() {
    return this.constructor.windowEvents;
  }
  get throttledFunctions() {
    return {};
  }
  get debouncedFunctions() {
    return {};
  }
  get bindToThis() {
    return [];
  }
  get initializeConditions() {
    return this.constructor.initializeConditions;
  }
  addUi() {
    Object.entries({ ...this.ui, ...(this.getOption("ui") || {}) }).forEach(
      ([t, e]) => {
        this._ui[t] = [...this.view.el.querySelectorAll(e)];
      }
    );
  }
  addAllEvents() {
    this.bindAllEvents(),
      this.listenToAppEvents(),
      this.listenToRegionsEvents(),
      this.buildThrottledAndDebouncedFunctions(
        this.throttledFunctions,
        "throttle"
      ),
      this.buildThrottledAndDebouncedFunctions(
        this.debouncedFunctions,
        "debounce"
      ),
      this.listenToModelsAndViewEvents(
        "parentsCollectionEvents",
        this.view.model.get("parentsCollection")
      ),
      this.listenToModelsAndViewEvents(
        "topParentContainerEvents",
        this.view.model.get("topParentContainer") || this.view.model
      ),
      this.listenToModelsAndViewEvents(
        "topParentChildrenCollectionEvents",
        this.view.model.get("topParentContainer")?.get("childrenCollection") ||
          this.view.model.get("childrenCollection")
      ),
      this.listenToModelsAndViewEvents("modelEvents", this.model),
      this.listenToModelsAndViewEvents("viewEvents", this.view),
      this.listenToModelsAndViewEvents("viewModelEvents", this.view.model),
      this.listenToModelsAndViewEvents(
        "childrenCollectionEvents",
        this.view.model.get("childrenCollection")
      ),
      this.addDomEvents(),
      this.addDocEvents(),
      this.addWindowEvents();
  }
  bindAllEvents() {
    this.bindToThis?.length && _.bindAll(this, ...this.bindToThis);
  }
  getChangeProp(t = "openedItems") {
    const e = this.getOption("changePropPrefix");
    return e ? `${t}@${e}` : t;
  }
  listenToModelsAndViewEvents(t, e) {
    if (!e) return;
    const i = this[t];
    if (!i) return;
    const s = Object.entries(i),
      n = this.view.model.get("childrenCollection");
    s.length &&
      s.forEach(([r, h]) => {
        const l = [];
        Array.isArray(h)
          ? h.forEach((o) => {
              if (typeof o == "string") l.push(this.buildFunction(o, r, e));
              else if (typeof o == "object") {
                const c = Object.keys(o)[0],
                  d = Object.values(o)[0];
                l.push(() => this.listenTo(e, c, this.buildFunction(d, r, e)));
              }
            })
          : l.push(this.buildFunction(h, r, e)),
          l
            .filter((o) => o)
            .forEach((o) => {
              if (!e?.models) {
                const c = new Backbone.Collection();
                if (h.listenToChildrenToo) {
                  if (n) {
                    const d = n.where((u) =>
                      u
                        .get("behaviors")
                        ?.find((v) =>
                          v.willEmitInitializeTriggerEvents.includes(r)
                        )
                    );
                    d.length && c.add(d);
                  }
                  if (
                    (e
                      ?.get("behaviors")
                      ?.find((d) =>
                        d.willEmitInitializeTriggerEvents.includes(r)
                      ) && c.add(e),
                    c.length)
                  )
                    return (o = _.after(c.length, o)), this.listenTo(c, r, o);
                  if (
                    !this.view.model
                      .get("behaviors")
                      ?.find((d) =>
                        d.willEmitInitializeTriggerEvents.includes(r)
                      )
                  )
                    return o();
                }
              }
              this.listenTo(e, r, o);
            });
      });
  }
  listenToAppEvents() {
    this.liquidApp &&
      Object.entries(this.appEvents).forEach(([t, e]) => {
        const i = this.buildFunction(e, t);
        i && this.listenTo(this.liquidApp, t, i);
      });
  }
  listenToRegionsEvents() {
    this.liquidApp &&
      Object.entries(this.regionsEvents).forEach(([t, e]) => {
        const i = this.liquidApp.layoutRegions[t]?.model;
        i &&
          e.forEach((s) => {
            const n = Object.keys(s)[0],
              r = this.buildFunction(Object.values(s)[0], n);
            r && this.listenTo(i, n, r);
          });
      });
  }
  addDomEvents() {
    this.domEvents &&
      Object.entries(this.domEvents).forEach(([t, e]) => {
        const i = t.split(" "),
          s = i[0],
          n = i[1],
          r = this.buildFunction(e, s);
        let h;
        if (!r) return;
        let l;
        if (n)
          if (n.startsWith("@")) l = this.getUI(n.replace("@", ""));
          else if (n.includes("<")) {
            const o = n.replace("<", "");
            o === "document"
              ? (l = [document])
              : (l = document.querySelectorAll(o));
          } else l = this.view.el.querySelectorAll(n);
        else l = [this.view.el];
        s === "inview"
          ? ((h = new IntersectionObserver(([o], c) => {
              r(o, c);
            })),
            l.forEach((o) => h.observe(o)))
          : l.forEach((o) => o.addEventListener(s, r)),
          this._allEvents.domEvents.push({
            els: l,
            eventType: s,
            fn: r,
            io: h,
          });
      });
  }
  addDocEvents() {
    this.docEvents &&
      Object.entries(this.docEvents).forEach(([t, e]) => {
        const i = this.buildFunction(e, t);
        if (i) {
          if (t === "DOMContentLoaded" && document.readyState === "complete")
            return i();
          document.addEventListener(t, i),
            this._allEvents.docEvents.push({ event: t, fn: i });
        }
      });
  }
  addWindowEvents() {
    this.windowEvents &&
      Object.entries(this.windowEvents).forEach(([t, e]) => {
        const i = this.buildFunction(e, t);
        i &&
          (window.addEventListener(t, i),
          this._allEvents.windowEvents.push({ event: t, fn: i }));
      });
  }
  buildFunction(t, e, i) {
    const s = t.func || t;
    if (typeof s == "string" && !this[s])
      return console.warn("Could not find the handler", this, s);
    if (
      (t.ifHasOption && !this.getOption(t.ifHasOption)) ||
      (t.conditions?.length && !t.conditions.every((r) => r))
    )
      return !1;
    let n = typeof s == "string" ? this[s].bind(this) : s.bind(this);
    return (
      t.once && (n = _.once(n)),
      t.throttle
        ? (n = _.throttle(n, t.throttle.wait, { ...t.throttle.options }))
        : t.debounce &&
          (n = _.debounce(n, t.debounce.wait, t.debounce?.options?.immediate)),
      i &&
        s === "initialize" &&
        !i?.emittedEvents?.includes(e) &&
        this.initializeTriggers.add({ eventName: e, modelOrView: i }),
      n
    );
  }
  buildThrottledAndDebouncedFunctions(t, e) {
    Object.entries(t).forEach(([i, s]) => {
      if (!this[i]) return console.warn("Could not find the handler", this, i);
      this[i] = _[e](
        this[i].bind(this),
        s.wait,
        e === "throttle" ? { ..._.omit(s, "wait") } : s.immediate
      );
    });
  }
  getUI(t) {
    let e = this._ui[t] || [];
    const i = t.split(/:|\[/);
    if (i.length < 2) return e;
    const s = i[0],
      n = t.replace(s, "");
    return (e = this._ui[s].filter((r) => r.matches(n))), e;
  }
  getOption(t) {
    return this._options[t];
  }
  setOption(t, e, i = !0) {
    if (this._options[t] && i && typeof this._options[t] == "object")
      return (this._options[t] = _.extend(this._options[t], e));
    this._options[t] = e;
  }
  destroy() {
    this.handleDestroy(), (this.isInitialized = !1);
  }
  handleDestroy() {
    this.offAllEvents(),
      this.view.model.set({
        behaviors: this.view.model
          .get("behaviors")
          .filter((t) => t.model.cid !== this.model.cid),
      }),
      (this.isDestroyed = !0);
  }
  offAllEvents() {
    this.offDomEvents(),
      this.offDocEvents(),
      this.offWindowEvents(),
      this.model.off(),
      this.off(),
      this.stopListening();
  }
  offDomEvents() {
    this._allEvents.domEvents.forEach(
      ({ els: t, eventType: e, fn: i, io: s }) => {
        s ? s.disconnect() : t.forEach((n) => n.removeEventListener(e, i, !1));
      }
    );
  }
  offDocEvents() {
    this._allEvents.docEvents.forEach(({ event: t, fn: e }) =>
      document.removeEventListener(t, e, !1)
    );
  }
  offWindowEvents() {
    this._allEvents.windowEvents.forEach(({ event: t, fn: e }) =>
      window.removeEventListener(t, e, !1)
    );
  }
}
