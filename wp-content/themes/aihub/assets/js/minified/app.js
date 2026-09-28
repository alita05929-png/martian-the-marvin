const ElementsCollection = Backbone.Collection.extend({
  model: LiquidWidgetBaseModel,
});
class LiquidApp {
  isStarted = !1;
  topWrapClassname = "lqd-wrap";
  topWrapSelector = `#${this.topWrapClassname}`;
  globalBehaviors = [];
  layoutRegions = {};
  elementsCollection = new ElementsCollection();
  behaviorsInitializeQueue = [];
  windowResizeUpdateQueue = [];
  _windowSize = { width: window.innerWidth, height: window.innerHeight };
  _prevWindowSize = this._windowSize;
  globalOptions = { localScroll: { offset: 0, duration: 1 } };
  activeBreakpoint = "";
  uninitializedBehaviors = [];
  deferredBehaviorsQueue = new Map();
  constructor({
    layoutRegions: i,
    containersClassname: o = "lqd-container",
    containersBoxedClassname: e = "lqd-container-boxed",
    widgetsClassname: s = "lqd-widget",
    globalOptions: t,
    globalBehaviors: n,
    touchMatchMedia: l,
  }) {
    _.extend(this, Backbone.Events),
      _.extend(window.liquid, Backbone.Events),
      (this.containersClassname = o),
      (this.containersBoxedClassname = e),
      (this.widgetsClassname = s),
      (this.containersSelector = `.${this.containersClassname}`),
      (this.containersBoxedSelector = `.${this.containersBoxedClassname}`),
      (this.widgetsSelector = `.${this.widgetsClassname}`),
      (this.touchMatchMedia =
        l ||
        (window.liquidTouchMM
          ? liquidTouchMM
          : window.matchMedia("(pointer: coarse)"))),
      i && (this.layoutRegions = i),
      t && (this.globalOptions = { ...this.globalOptions, ...t }),
      n && (this.globalBehaviors = [...this.globalBehaviors, ...n]),
      (this.breakpointsOrder = [
        window.liquid.breakpoints.desktop ? "" : "all",
        ...Object.keys(window.liquid.breakpoints).filter(
          (d) => window.liquid.breakpoints[d].is_enabled
        ),
      ]),
      typeof fstdm > "u"
        ? (this.fastdom = fastdom.extend(fastdomPromised))
        : (this.fastdom = fstdm.extend(fastdomPromised)),
      (this.model = new Backbone.Model({
        loadedBehaviors: window.liquid?.loadedBehaviors || [],
      })),
      (this.view = new LiquidBaseView({ el: "#lqd-wrap" })),
      (this.view.model = this.model),
      (this.model.view = this.view),
      (this.beforeWindowResize = _.debounce(
        this.beforeWindowResize.bind(this),
        185.69
      )),
      (this.afterWindowResize = _.debounce(
        this.afterWindowResize.bind(this),
        585.69,
        !1
      ));
  }
  get prevWindowSize() {
    return this._prevWindowSize;
  }
  set prevWindowSize({ width: i, height: o }) {
    this._prevWindowSize = { width: i, height: o };
  }
  get windowSize() {
    return this._windowSize;
  }
  set windowSize({ width: i, height: o }) {
    this._windowSize = { width: i, height: o };
  }
  start(i = { isEditor: !1 }) {
    this.trigger("app:before:start", this),
      (this.elementsCollection.comparator = (o, e) => {
        this.elementsCollectionSortedCIDs ||
          (this.elementsCollectionSortedCIDs = [
            ...document.querySelectorAll("[data-lqd-model-cid]"),
          ].map((l) => l.getAttribute("data-lqd-model-cid")));
        const s = o.cid,
          t = e.cid;
        let n = 0;
        return (
          this.elementsCollectionSortedCIDs.indexOf(s) >
          this.elementsCollectionSortedCIDs.indexOf(t)
            ? (n = 1)
            : this.elementsCollectionSortedCIDs.indexOf(s) <
                this.elementsCollectionSortedCIDs.indexOf(t) && (n = -1),
          n
        );
      }),
      this.elementsCollection.on("sort", () => {
        this.elementsCollectionSortedCIDs = null;
      }),
      (this.topWrap = document.querySelector(this.topWrapSelector)),
      this.setActiveBreakpoint(),
      Object.entries(this.layoutRegions).forEach(([o, e]) => {
        const s =
            typeof e.el == "string" ? document.getElementById(e.el) : e.el,
          t =
            typeof e.contentWrap == "string"
              ? document.getElementById(e.contentWrap)
              : e.contentWrap;
        (this.layoutRegions[o].el = s), (this.layoutRegions[o].contentWrap = t);
      }),
      this.buildElementsCollection(),
      this.addLayoutRegions(),
      this.model.set({ childrenCollection: this.elementsCollection }),
      _.defer(() => {
        i.isEditor || (this.addBehaviors(), this.initializeBehaviors()),
          this.trigger("app:start", this);
      }),
      _.defer(() => {
        this.bindWindowResize();
      }),
      _.defer(() => {
        i.isEditor || (this.isStarted = !0);
      });
  }
  childrenComparator(i, o) {
    const e = this.elementsCollection.map((l) => l.cid),
      s = i.cid,
      t = o.cid;
    let n = 0;
    return (
      e.indexOf(s) > e.indexOf(t)
        ? (n = 1)
        : e.indexOf(s) < e.indexOf(t) && (n = -1),
      n
    );
  }
  addLayoutRegions() {
    Object.entries(this.layoutRegions).forEach(
      ([i, { el: o, contentWrap: e }]) => {
        const s = this.elementsCollection.where(
            (r) => r.get("layoutRegion") === i
          ),
          t = Backbone.Collection.extend({ model: LiquidWidgetBaseModel }),
          n = new t(s),
          l = new LiquidBaseModel({
            childrenCollection: n,
            contentWrap: e,
            regionName: i,
          }),
          d = new LiquidBaseView({ model: l, contentWrap: e, el: o });
        (n.comparator = this.childrenComparator.bind(this)),
          (l.view = d),
          (this.layoutRegions[i] = this.layoutRegions[i] || {}),
          (this.layoutRegions[i].model = l);
      }
    );
  }
  buildElementsCollection() {
    (liquid?.elementsCollection?.length
      ? liquid.elementsCollection
      : [
          ...document.querySelectorAll(
            `${this.containersSelector}, ${this.widgetsSelector}`
          ),
        ]
    ).forEach((o) => this.buildElementModelAndView(o)),
      liquid?.elementsCollection && (liquid.elementsCollection = []);
  }
  buildElementModelAndView(i, { region: o, sort: e = !1 } = {}) {
    if (i.hasAttribute("data-lqd-model-cid")) return;
    const s = i.classList.contains(this.containersClassname),
      t = o || this.getElRegion(i),
      n = [],
      l = {},
      d = i.hasAttribute("data-lqd-has-inner-animatables"),
      r = new LiquidWidgetBaseModel({
        isContainer: s,
        layoutRegion: t,
        animatableElements: d
          ? i.querySelectorAll("[data-lqd-inner-animatable-el]")
          : [i],
        dataId: i.getAttribute("data-id"),
      }),
      c = new LiquidBaseView({ model: r, el: i });
    (r.view = c),
      i.setAttribute("data-lqd-model-cid", r.cid),
      i.setAttribute("data-lqd-view-cid", c.cid),
      this.elementsCollection.add(r, { sort: e });
    const a = this.layoutRegions[t]?.model?.get("childrenCollection");
    a && a.add(r, { sort: e });
    let u = i.parentElement?.closest(
      `${this.containersSelector}, ${this.widgetsSelector}`
    );
    for (; u; )
      n.push(u),
        (u = u?.parentElement?.closest(
          `${this.containersSelector}, ${this.widgetsSelector}`
        ));
    const m = this.getModelsOfElements(n, { layoutRegion: t, sort: e });
    if (m.length) {
      const h = Backbone.Collection.extend({ model: LiquidWidgetBaseModel });
      (l.parentsCollection = new h(m)), (l.topParentContainer = m.at(-1));
    }
    const w = [
      ...i.querySelectorAll(
        `${this.containersSelector}, ${this.widgetsSelector}`
      ),
    ];
    if (w.length) {
      const h = this.getModelsOfElements(w, { layoutRegion: t, sort: e }),
        f = Backbone.Collection.extend({ model: LiquidWidgetBaseModel });
      (l.childrenCollection = new f(h)),
        (l.isBoxed = i.classList.contains(this.containersBoxedClassname)),
        (l.childrenCollection.comparator = this.childrenComparator.bind(this));
    }
    return (
      s && !l.topParentContainer && (l.isTopLevelContainer = !0),
      r.set(l),
      l.parentsCollection &&
        l.parentsCollection.forEach((h) => {
          const f = h.get("childrenCollection");
          f && f.add(r, { sort: e });
        }),
      r
    );
  }
  getElRegion(i) {
    const o = _.omit(this.layoutRegions, "liquidPageContent");
    let e = "liquidPageContent";
    return (
      Object.entries(o).forEach(([s, { contentWrap: t }]) => {
        if (!(!t || typeof t == "string") && t.contains(i)) return (e = s);
      }),
      e
    );
  }
  getModelsOfElements(i = [], { layoutRegion: o, sort: e = !1 } = {}) {
    let s = [];
    return (
      i?.length &&
        (s = i
          .map(
            (t) =>
              this.elementsCollection.findWhere(
                (n) => n.cid === t.getAttribute("data-lqd-model-cid")
              ) ||
              this.buildElementModelAndView(t, { layoutRegion: o, sort: e })
          )
          .filter((t) => t && t.view)),
      s
    );
  }
  addToElementsCollection(i, { layoutRegion: o = "liquidPageContent" } = {}) {
    this.buildElementModelAndView(i, { layoutRegion: o, sort: !0 });
  }
  removeFromElementsCollection(i) {
    if (!i) return;
    const o = i.getAttribute("data-lqd-model-cid"),
      e = this.elementsCollection.get(o);
    if (!e) return;
    this.elementsCollection.remove(e);
    const s = e.get("layoutRegion");
    this.elementsCollection.find((t) => {
      const n = t.get("parentsCollection"),
        l = t.get("childrenCollection");
      n?.forEach((d) => d?.get("childrenCollection")?.remove(e)), l?.remove(e);
    }),
      this.layoutRegions[s].model.get("childrenCollection").remove(e),
      e.view.destroy();
  }
  addBehaviors() {
    const i = [];
    this.model.on("change:loadedBehaviors", (o, e) => {
      if (!this.uninitializedBehaviors.length) return;
      const t = e.at(-1).behaviorName,
        n = this.uninitializedBehaviors.filter(
          ({ behavior: l }) => l.behaviorName === t
        );
      n.forEach(({ model: l, behavior: d }) =>
        this.addElementBehaviors({ model: l, behaviorsArray: [d] })
      ),
        (this.uninitializedBehaviors = _.difference(
          this.uninitializedBehaviors,
          n
        ));
    }),
      [...this.elementsCollection.models].reverse().forEach((o) => {
        const e = o.get("dataId"),
          s = o.view.el,
          t = window.liquid.behaviors
            ?.filter((n) => {
              if (n.dataId && e) return n.dataId === e;
              if (n.el) return n.el === s;
            })
            ?.flatMap((n) => n.behaviors);
        t?.length && i.push({ model: o, behaviorsArray: t });
      }),
      Object.entries(this.layoutRegions).forEach(
        ([o, { behaviors: e, model: s }]) => {
          e &&
            i.push({
              model: s,
              behaviorsArray: [
                ...e,
                ...(window.liquid?.behaviors
                  ?.filter((t) => t.layoutRegion && t.layoutRegion === o)
                  ?.flatMap((t) => t.behaviors) || []),
              ],
            });
        }
      ),
      this.globalBehaviors.length &&
        i.push({ model: this.model, behaviorsArray: this.globalBehaviors }),
      this.constructBehaviors(i),
      (window.liquid.behaviors = []);
  }
  addElementBehaviors({
    el: i,
    dataId: o,
    model: e,
    behaviorsArray: s,
    layoutRegion: t,
  }) {
    if ((!i && !e && !o && !t) || !s) return;
    let n = null;
    e
      ? (n = e)
      : o
      ? (n = this.elementsCollection.find((l) => l.get("dataId") === o))
      : i
      ? (n = this.elementsCollection.find((l) => l.view.el === i))
      : t && (n = this.layoutRegions[t]?.model),
      n &&
        (this.constructBehaviors([{ model: n, behaviorsArray: s }]),
        this.initializeBehaviors());
  }
  constructBehaviors(i) {
    [...i]
      .sort((e, s) => e.model.get("isContainer") - s.model.get("isContainer"))
      .forEach(({ model: e, behaviorsArray: s }) => {
        s.forEach((t) => {
          let { behaviorClass: n, behaviorName: l } = t;
          if (
            (l &&
              !n &&
              (n = this.model
                .get("loadedBehaviors")
                .find((a) => a.behaviorName === l)),
            !n || typeof n == "string")
          )
            return this.uninitializedBehaviors.push({ model: e, behavior: t });
          const d = n.initializeConditions;
          if (d?.length && !d.every((a) => a)) return;
          const r = new n(e.view, t?.options || {}),
            c = e.get("behaviors") || [];
          if (
            (e.set({ behaviors: [...c, r] }),
            r.willEmitInitializeTriggerEvents.length)
          )
            return this.deferredBehaviorsQueue.set(e.cid, [
              ...(this.deferredBehaviorsQueue.get(e.cid) || []),
              r,
            ]);
          this.behaviorsInitializeQueue.push(r);
        });
      });
  }
  initializeBehaviors() {
    if (
      (this.behaviorsInitializeQueue.forEach((i) => {
        i.initializeTriggers.size === 0 && i.initialize();
      }),
      (this.behaviorsInitializeQueue = []),
      this.deferredBehaviorsQueue.size !== 0)
    )
      for (const [i, o] of this.deferredBehaviorsQueue) {
        const e = this.elementsCollection.get(i)?.get("behaviors"),
          s = e?.at(0)?.model?.cid;
        (e?.length === 1 && s === o?.at(0)?.model?.cid) ||
          (o.forEach((t) => t.initialize()),
          this.deferredBehaviorsQueue.delete(i));
      }
  }
  destroyElementBehaviors({ el: i, model: o, dataId: e } = {}) {
    if (!(!i && !o && !e)) {
      if (
        (!i &&
          e &&
          ((o = this.elementsCollection.find((s) => s.get("dataId") === e)),
          (i = o?.view?.el)),
        i && !o)
      ) {
        const s = i.getAttribute("data-lqd-model-cid");
        o = this.elementsCollection.find((t) => t.cid === s);
      }
      o &&
        o.get("behaviors")?.forEach((s) => {
          s.destroy();
        });
    }
  }
  setActiveBreakpoint() {
    const i = liquid?.breakpoints;
    if (!i) return;
    const o = [
      {
        mm: window.matchMedia("(min-width: 1201px)"),
        breakpointKey: "desktop",
      },
    ];
    Object.entries(i).forEach(
      ([e, { direction: s, is_enabled: t, value: n }]) => {
        t &&
          o.push({
            mm: window.matchMedia(`(${s}-width: ${n}px)`),
            breakpointKey: e,
          });
      }
    ),
      (this.activeBreakpoint =
        o.filter(({ mm: e }) => e.matches)?.at(-1)?.breakpointKey || "desktop");
  }
  bindWindowResize() {
    window.addEventListener("resize", () => {
      this.beforeWindowResize(), this.afterWindowResize();
    });
  }
  beforeWindowResize() {
    (this.prevWindowSize = this.windowSize),
      this.trigger("before:windowResize", {
        prevSize: this.prevWindowSize,
        currentSize: this.windowSize,
      });
  }
  afterWindowResize() {
    (this.windowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    }),
      this.setActiveBreakpoint(),
      this.fastdom.mutate(() => {
        this.trigger("after:windowResize", {
          prevSize: this.prevWindowSize,
          currentSize: this.windowSize,
        });
      });
  }
  destroy() {
    (this.isStarted = !1),
      this.off(),
      this.stopListening(),
      (this.layoutRegions = {}),
      (this.elementsCollection = new ElementsCollection());
  }
}
