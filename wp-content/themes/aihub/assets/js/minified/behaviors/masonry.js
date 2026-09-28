class Rect {
  defaults = { x: 0, y: 0, width: 0, height: 0 };
  constructor(t) {
    for (var i in Rect.defaults) this[i] = Rect.defaults[i];
    for (i in t) this[i] = t[i];
  }
  contains(t) {
    var i = t.width || 0,
      e = t.height || 0;
    return (
      this.x <= t.x &&
      this.y <= t.y &&
      this.x + this.width >= t.x + i &&
      this.y + this.height >= t.y + e
    );
  }
  overlaps(t) {
    var i = this.x + this.width,
      e = this.y + this.height,
      s = t.x + t.width,
      h = t.y + t.height;
    return this.x < s && i > t.x && this.y < h && e > t.y;
  }
  getMaximalFreeRects(t) {
    if (!this.overlaps(t)) return !1;
    var i = [],
      e,
      s = this.x + this.width,
      h = this.y + this.height,
      r = t.x + t.width,
      o = t.y + t.height;
    return (
      this.y < t.y &&
        ((e = new Rect({
          x: this.x,
          y: this.y,
          width: this.width,
          height: t.y - this.y,
        })),
        i.push(e)),
      s > r &&
        ((e = new Rect({ x: r, y: this.y, width: s - r, height: this.height })),
        i.push(e)),
      h > o &&
        ((e = new Rect({ x: this.x, y: o, width: this.width, height: h - o })),
        i.push(e)),
      this.x < t.x &&
        ((e = new Rect({
          x: this.x,
          y: this.y,
          width: t.x - this.x,
          height: this.height,
        })),
        i.push(e)),
      i
    );
  }
  canFit(t) {
    return this.width >= t.width && this.height >= t.height;
  }
}
class Packer {
  constructor(t, i) {
    (this.width = t || 0), (this.height = i || 0), this.reset();
  }
  reset() {
    this.spaces = [];
    var t = new Rect({ x: 0, y: 0, width: this.width, height: this.height });
    this.spaces.push(t), (this.sorter = (i, e) => i.y - e.y || i.x - e.x);
  }
  pack(t) {
    for (var i = 0; i < this.spaces.length; i++) {
      var e = this.spaces[i];
      if (e.canFit(t)) {
        this.placeInSpace(t, e);
        break;
      }
    }
  }
  placeInSpace(t, i) {
    (t.x = i.x), (t.y = i.y), this.placed(t);
  }
  placed(t) {
    for (var i = [], e = 0; e < this.spaces.length; e++) {
      var s = this.spaces[e],
        h = s.getMaximalFreeRects(t);
      h ? i.push.apply(i, h) : i.push(s);
    }
    (this.spaces = i), this.mergeSortSpaces();
  }
  mergeSortSpaces() {
    this.mergeRects(this.spaces), this.spaces.sort(this.sorter);
  }
  mergeRects(t) {
    var i = 0,
      e = t[i];
    t: for (; e; ) {
      for (var s = 0, h = t[i + s]; h; ) {
        if (h == e) s++;
        else if (h.contains(e)) {
          t.splice(i, 1), (e = t[i]);
          continue t;
        } else e.contains(h) ? t.splice(i + s, 1) : s++;
        h = t[i + s];
      }
      i++, (e = t[i]);
    }
    return t;
  }
}
class LiquidMasonryBehavior extends LiquidBehavior {
  static behaviorName = "liquidMasonry";
  static viewEvents = { "before:filter:animation": "onBeforeFilterAnimation" };
  static windowEvents = {
    resize: { func: "onResize", debounce: { wait: 100 } },
  };
  options() {
    return { originLeft: !0, originTop: !0 };
  }
  get ui() {
    return { container: ".lqd-masonry-container", items: ".lqd-masonry-item" };
  }
  get bindToThis() {
    return ["layout"];
  }
  initialize() {
    (this.packer = new Packer()), this._getElements(), _.defer(this.layout);
  }
  _getElements() {
    (this.container = { el: this.getUI("container")[0] }),
      this.view.model.set(
        { items: this._itemize(this.getUI("items")) },
        { silent: !0 }
      );
  }
  _itemize(t) {
    const i = [];
    return (
      t.forEach((e) => {
        const s = e.dataset.lqdFilterCat,
          h = {
            el: e,
            position: { x: 0, y: 0 },
            isFiltered: !0,
            filterCat: s ? s.split(" ") : [],
          };
        i.push(h);
      }),
      i
    );
  }
  async layout() {
    this.isDestroyed ||
      (await this.liquidApp.fastdom.measure(() => {
        this.isDestroyed || this._resetLayout();
      }),
      !this.isDestroyed &&
        (await this.liquidApp.fastdom.mutate(() => {
          this.isDestroyed || this.layoutItems();
        })));
  }
  _resetLayout() {
    this.isDestroyed ||
      (this._sizing(),
      (this.packer.width = this.container.size.innerWidth),
      (this.packer.height = 1 / 0),
      this.packer.reset(),
      (this.maxY = 0),
      (this.maxX = 0));
  }
  _sizing() {
    const t = this.view.model.get("items");
    if (((this.container.size = getSize(this.container.el)), !t || !t.length))
      return;
    const i = t.map(
      (e) => ((e.size = getSize(e.el)), (e.rect = new Rect()), e)
    );
    this.view.model.set({ items: i });
  }
  layoutItems() {
    this.isDestroyed || (this._layoutItems(), this._postLayout());
  }
  _layoutItems() {
    this.view.model
      .get("items")
      .filter((i) => i.isFiltered)
      .forEach((i) => {
        var e = this._getItemLayoutPosition(i);
        this._positionItem(i, e.x, e.y);
      });
  }
  _getItemLayoutPosition(t) {
    return (
      this._setRectSize(t),
      this.packer.pack(t.rect),
      this._setMaxXY(t.rect),
      t.rect
    );
  }
  _setMaxXY(t) {
    (this.maxX = Math.max(t.x + t.width, this.maxX)),
      (this.maxY = Math.max(t.y + t.height, this.maxY));
  }
  _setRectSize(t) {
    var i = t.size.outerWidth,
      e = t.size.outerHeight;
    (i || e) &&
      ((i = this._applyGridGutter(i, this.columnWidth)),
      (e = this._applyGridGutter(e, 0))),
      (t.rect.width = Math.min(i, this.packer.width)),
      (t.rect.height = Math.min(e, this.packer.height));
  }
  _applyGridGutter(t, i) {
    if (!i) return t;
    var e = t % i,
      s = e && e < 1 ? "round" : "ceil";
    return (t = Math[s](t / i) * i), t;
  }
  _positionItem(t, i, e) {
    this.itemSetPosition(t, i, e), this.itemLayoutPosition(t);
  }
  itemSetPosition(t, i, e) {
    (t.position.x = parseFloat(i)), (t.position.y = parseFloat(e));
  }
  itemLayoutPosition(t) {
    var i = this.container.size,
      e = {},
      s = this.getOption("originLeft"),
      h = this.getOption("originTop");
    (t.el.style.position = ""),
      (t.el.style.left = ""),
      (t.el.style.right = ""),
      (t.el.style.top = ""),
      (t.el.style.bottom = "");
    var r = s ? "paddingLeft" : "paddingRight",
      o = s ? "left" : "right",
      d = s ? "right" : "left",
      l = t.position.x + i[r];
    (e[o] = this.itemGetXValue(l)), (e[d] = "");
    var y = h ? "paddingTop" : "paddingBottom",
      u = h ? "top" : "bottom",
      p = h ? "bottom" : "top",
      g = t.position.y + i[y];
    (e[u] = this.itemGetYValue(g)),
      (e[p] = ""),
      (t.el.style.position = "absolute"),
      Object.entries(e).forEach(([f, a]) => {
        a && (t.el.style[f] = a);
      });
  }
  itemGetXValue(t) {
    return `${(t / this.container.size.width) * 100}%`;
  }
  itemGetYValue(t) {
    return `${t}px`;
  }
  _postLayout() {
    this._setContainerMeasure(this.maxY);
  }
  _setContainerMeasure(t) {
    if (t !== void 0) {
      this.container.el.style.height = "";
      var i = this.container.size;
      (t +=
        i.paddingBottom +
        i.paddingTop +
        i.borderTopWidth +
        i.borderBottomWidth),
        (t = Math.max(t, 0)),
        (this.container.el.style.height = `${t}px`);
    }
  }
  async onResize() {
    const t = await this.needsResizeLayout();
    this.isDestroyed || !t || this.layout();
  }
  needsResizeLayout() {
    return this.liquidApp.fastdom.measure(() => {
      const t = this.container.size.innerWidth,
        i = getSize(this.container.el).innerWidth;
      return t !== i;
    });
  }
  onBeforeFilterAnimation() {
    this._resetLayout(), this.layoutItems();
  }
  destroy() {
    ["height", "position", "width"].forEach((t) => {
      this.container.el.style[t] = "";
    }),
      this.itemsDestroy(),
      super.destroy();
  }
  itemsDestroy() {
    this.view.model.get("items").forEach((t) => {
      [
        "position",
        "left",
        "right",
        "top",
        "bottom",
        "transition",
        "transform",
      ].forEach((i) => {
        t.el.style[i] = "";
      });
    });
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidMasonryBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidMasonryBehavior));
