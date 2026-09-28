class Slide {
  constructor(e, t, i) {
    (this.beginMargin = e),
      (this.endMargin = t),
      (this.itemAlign = i),
      (this.items = []),
      (this.outerWidth = 0),
      (this.height = 0);
  }
  addItem(e) {
    this.items.push(e),
      (this.outerWidth += e.size.outerWidth),
      (this.height = Math.max(e.size.outerHeight, this.height)),
      this.items.length === 1 &&
        ((this.x = e.x), (this.firstMargin = e.size[this.beginMargin]));
  }
  updateTarget() {
    let e = this.getLastItem(),
      t = e ? e.size[this.endMargin] : 0,
      i = this.outerWidth - (this.firstMargin + t);
    this.target = this.x + this.firstMargin + i * this.itemAlign;
  }
  getLastItem() {
    return this.items[this.items.length - 1];
  }
  select() {
    this.items.forEach((e) => {
      e.el.classList.add("lqd-carousel-cell-active"),
        e.el.removeAttribute("aria-hidden");
    });
  }
  unselect() {
    this.items.forEach((e) => {
      e.el.classList.remove("lqd-carousel-cell-active"),
        e.el.setAttribute("aria-hidden", "true");
    });
  }
  getItemElements() {
    return this.items.map((e) => e.el);
  }
}
class LiquidCarouselBehavior extends LiquidBehavior {
  static behaviorName = "liquidCarousel";
  static viewEvents = {
    "carousel:ready": "onCarouselReady",
    "carousel:prev": "previous",
    "carousel:next": "next",
    "carousel:select": "select",
    "carousel:focus": "focus",
    "carousel:startAnimation": "startAnimation",
    "before:filter:animation": "onBeforeFilterAnimation",
  };
  static windowEvents = {
    resize: { func: "onResize", debounce: { wait: 150 } },
  };
  keyboardHandlers = {
    ArrowLeft: function () {
      this.view.trigger("carousel:uiChange");
      let e = this.view.rightToLeft ? "next" : "previous";
      this[e]();
    },
    ArrowRight: function () {
      this.view.trigger("carousel:uiChange");
      let e = this.view.rightToLeft ? "previous" : "next";
      this[e]();
    },
  };
  options() {
    return {
      accessibility: !0,
      adaptiveHeight: !1,
      equalHeight: !1,
      itemAlign: "start",
      contain: !1,
      friction: 0.28,
      selectedAttraction: 0.025,
      initialIndex: 0,
      setGallerySize: !0,
      wrapAround: !1,
      groupItems: !1,
      connectedCarousels: "",
    };
  }
  get ui() {
    return { items: ".lqd-carousel-cell" };
  }
  initialize() {
    (this.view.selectedIndex = 0),
      (this.restingFrames = 0),
      (this.view.carouselX = 0),
      (this.view.carouselVelocity = 0),
      (this.view.rightToLeft = this.getOption("rightToLeft")),
      (this.beginMargin = this.view.rightToLeft ? "marginRight" : "marginLeft"),
      (this.endMargin = this.view.rightToLeft ? "marginLeft" : "marginRight"),
      (this.view.contain = this.getOption("contain")),
      (this.view.freeScrollFriction = this.getOption("freeScrollFriction")),
      (this.view.friction = this.getOption("friction")),
      (this.view.wrapAround = this.getOption("wrapAround")),
      (this.view.carouselViewport = this.view.el.querySelector(
        ".lqd-carousel-viewport"
      )),
      (this.view.carouselSlider = this.view.el.querySelector(
        ".lqd-carousel-slider"
      )),
      (this.view.focusableElems = [this.view.el]);
    const e = this._itemize(this.getUI("items"));
    this.view.model.set({ items: e, visibleItems: e }, { silent: !0 }),
      this.view.el.classList.add("lqd-carousel-initiated"),
      this.view.rightToLeft && this.view.el.classList.add("lqd-carousel-rtl"),
      this.initCarousel();
  }
  async initCarousel() {
    if (this.isDestroyed) return;
    const e = this.getOption("accessibility");
    await this.liquidApp.fastdom.measure(() => {
      this.isDestroyed || this._sizing();
    }),
      !this.isDestroyed &&
        (await this.liquidApp.fastdom.mutate(() => {
          this.isDestroyed ||
            (this.setItemAlign(),
            (this.cursorPosition = this.size.innerWidth * this.itemAlign),
            this.positionItems(),
            e &&
              ((this.view.el.tabIndex = 0),
              this.view.el.addEventListener(
                "keydown",
                this.onkeydown.bind(this)
              )),
            this.view.trigger("carousel:activate"),
            this.selectInitialIndex(),
            this.view.trigger("carousel:ready", this.onCarouselReady));
        }));
  }
  onCarouselReady() {
    this.handleConnectedCarousels();
  }
  _itemize(e) {
    return e.map((t) => {
      const i = t.dataset.lqdFilterCat;
      return { el: t, x: 0, isFiltered: !0, filterCat: i ? i.split(" ") : [] };
    });
  }
  positionItems() {
    this._positionItems(), this._updateWrapShiftItems(), this.setGallerySize();
  }
  getLastItem() {
    const e = this.view.model.get("items");
    return e[e.length - 1];
  }
  _positionItems(e = 0) {
    this.maxItemHeight = (e && this.maxItemHeight) || 0;
    const t = this.view.model.get("visibleItems");
    let i = 0;
    if (e > 0) {
      let s = t[e - 1];
      i = s.x + s.size.outerWidth;
    }
    t.slice(e).forEach((s) => {
      (s.x = i),
        this._renderItemPosition(s, i),
        (i += s.size.outerWidth),
        (this.maxItemHeight = Math.max(s.size.outerHeight, this.maxItemHeight));
    }),
      (this.view.slideableWidth = i),
      this.updateSlides(),
      this._containSlides(),
      (this.view.carouselSlidesWidth = t.length
        ? this.view.carouselSlides[this.view.carouselSlides.length - 1].target -
          this.view.carouselSlides[0].target
        : 0);
  }
  _renderItemPosition(e, t) {
    const i = this.view.rightToLeft ? "right" : "left",
      s = this.getOption("equalHeight");
    (e.el.style.position = "absolute"),
      (e.el.style.insetInlineStart = `${t}px`),
      e.el.style.setProperty("--lqd-carousel-cell-x", `${t}px`),
      e.el.style.setProperty("--lqd-carousel-cell-width", `${e.size.width}px`),
      e.el.style.setProperty(
        "--lqd-carousel-cell-height",
        `${e.size.height}px`
      ),
      e.el.style.setProperty(
        "--lqd-carousel-cell-outerWidth",
        `${e.size.outerWidth}px`
      ),
      e.el.style.setProperty(
        "--lqd-carousel-cell-outerHeight",
        `${e.size.outerHeight}px`
      ),
      s && (e.el.style.height = `${this.maxItemHeight}px`);
  }
  updateSlides() {
    this.view.carouselSlides = [];
    const e = this.view.model.get("visibleItems");
    if (!e.length) return;
    let { beginMargin: t, endMargin: i, itemAlign: s } = this,
      r = new Slide(t, i, s);
    this.view.carouselSlides.push(r);
    let l = this._getCanItemFit();
    e.forEach((h) => {
      if (!r.items.length) return r.addItem(h);
      const o = r.outerWidth - r.firstMargin + (h.size.outerWidth - h.size[i]);
      l(o) ||
        (r.updateTarget(),
        (r = new Slide(t, i, s)),
        this.view.carouselSlides.push(r)),
        r.addItem(h);
    }),
      r.updateTarget(),
      this.updateSelectedSlide();
  }
  _getCanItemFit() {
    const e = this.getOption("groupItems");
    if (!e) return () => !1;
    if (typeof e == "number") {
      let r = parseInt(e, 10);
      return (l) => l % r !== 0;
    }
    let t = 1,
      i = typeof e == "string" && e.match(/^(\d+)%$/);
    i && (t = parseInt(i[1], 10) / 100);
    let s = (this.size.innerWidth + 1) * t;
    return (r) => r <= s;
  }
  _sizing() {
    if (this.isDestroyed) return;
    const e = this.view.model.get("items");
    (this.windowWidth = window.innerWidth),
      (this.size = getSize(this.view.el)),
      this._itemsSizing(e),
      this.view.model.set({ items: e }, { silent: !0 });
  }
  _itemsSizing(e) {
    e.forEach((t) => (t.size = getSize(t.el)));
  }
  setItemAlign() {
    let e = { start: 0, center: 0.5, end: 1 };
    const t = this.getOption("itemAlign");
    let i = e[t];
    (this.itemAlign = i !== void 0 ? i : t),
      this.view.rightToLeft && (this.itemAlign = 1 - this.itemAlign);
  }
  setGallerySize() {
    if (!this.getOption("setGallerySize")) return;
    const i = {
        height: `${
          this.getOption("adaptiveHeight") && this.selectedSlide
            ? this.selectedSlide.height
            : this.maxItemHeight
        }px`,
      },
      s = {
        height: "100%",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
    Object.entries(i).forEach(
      ([r, l]) => (this.view.carouselViewport.style[r] = l)
    ),
      Object.entries(s).forEach(
        ([r, l]) => (this.view.carouselSlider.style[r] = l)
      ),
      this.view.carouselSlider.style.setProperty(
        "--lqd-carousel-slider-width",
        `${this.size.width}px`
      );
  }
  _updateWrapShiftItems() {
    if (
      ((this.view.isCarouselWrapping = this.getIsWrapping()),
      !this.view.isCarouselWrapping)
    )
      return;
    this._unshiftItems(this.beforeShiftItems),
      this._unshiftItems(this.afterShiftItems);
    const e = this.view.model.get("visibleItems");
    let t = this.cursorPosition,
      i = e.length - 1;
    this.beforeShiftItems = this._getGapItems(t, i, -1);
    let s = this.size.innerWidth - this.cursorPosition;
    this.afterShiftItems = this._getGapItems(s, 0, 1);
  }
  getIsWrapping() {
    if (!this.view.wrapAround || this.view.carouselSlides.length < 2) return !1;
    if (this.view.wrapAround !== "fill") return !0;
    let e = this.view.slideableWidth - this.size.innerWidth;
    if (e > this.size.innerWidth) return !0;
    for (let t of this.view.model.get("visibleItems"))
      if (t.size.outerWidth > e) return !1;
    return !0;
  }
  _getGapItems(e, t, i) {
    let s = [];
    for (; e > 0; ) {
      let r = this.view.model.get("visibleItems")[t];
      if (!r) break;
      s.push(r), (t += i), (e -= r.size.outerWidth);
    }
    return s;
  }
  _containSlides() {
    const e = this.view.model.get("visibleItems");
    if (!(this.view.contain && !this.view.isCarouselWrapping && e.length))
      return;
    const i =
      this.view.slideableWidth - this.getLastItem().size[this.endMargin];
    if (i < this.size.innerWidth)
      this.view.carouselSlides.forEach((r) => {
        r.target = i * this.itemAlign;
      });
    else {
      const r = this.cursorPosition + e[0].size[this.beginMargin],
        l = i - this.size.innerWidth * (1 - this.itemAlign);
      this.view.carouselSlides.forEach((h) => {
        (h.target = Math.max(h.target, r)), (h.target = Math.min(h.target, l));
      });
    }
  }
  select(e, t, i) {
    if (
      ((e = parseInt(e, 10)),
      this._wrapSelect(e),
      (this.view.isCarouselWrapping || t) &&
        (e = modulo(e, this.view.carouselSlides.length)),
      !this.view.carouselSlides[e])
    )
      return;
    let s = this.view.selectedIndex;
    (this.view.selectedIndex = e),
      this.updateSelectedSlide(),
      i ? this.positionSliderAtSelected() : this.startAnimation(),
      this.getOption("adaptiveHeight") && this.setGallerySize(),
      e !== s &&
        (this.view.trigger("carousel:change", e),
        this.view.model.set({ activeCarouselItem: e }),
        this.view.model
          .get("topParentContainer")
          ?.set({ activeCarouselItem: e }));
  }
  _wrapSelect(e) {
    if (!this.view.isCarouselWrapping) return;
    const { slideableWidth: t, selectedIndex: i } = this.view,
      s = this.view.carouselSlides.length;
    if (!this.view.isDragSelect) {
      let r = modulo(e, s),
        l = Math.abs(r - i),
        h = Math.abs(r + s - i),
        o = Math.abs(r - s - i);
      h < l ? (e += s) : o < l && (e -= s);
    }
    e < 0 ? (this.view.carouselX -= t) : e >= s && (this.view.carouselX += t);
  }
  previous(e, t) {
    this.view.trigger("carousel:select", this.view.selectedIndex - 1, e, t);
  }
  next(e, t) {
    this.view.trigger("carousel:select", this.view.selectedIndex + 1, e, t);
  }
  updateSelectedSlide() {
    let e = this.view.carouselSlides[this.view.selectedIndex];
    e &&
      (this.unselectSelectedSlide(),
      (this.selectedSlide = e),
      this.view.carouselSlides
        .filter((t) => t !== e)
        .forEach((t) => t.unselect()),
      e.select(),
      (this.selectedItems = e.items),
      (this.selectedElements = e.getItemElements()));
  }
  unselectSelectedSlide() {
    this.selectedSlide && this.selectedSlide.unselect();
  }
  selectInitialIndex() {
    const e = this.getOption("initialIndex");
    if (e && typeof e == "string" && this.queryItem(e)) {
      this.selectItem(e, !1, !0);
      return;
    }
    let t = 0;
    e && this.view.carouselSlides[e] && (t = e),
      this.view.trigger("carousel:select", t, !1, !0);
  }
  selectItem(e, t, i) {
    let s = this.queryItem(e);
    if (!s) return;
    let r = this.getItemSlideIndex(s);
    this.view.trigger("carousel:select", r, t, i);
  }
  getItemSlideIndex(e) {
    let t = this.view.carouselSlides.find((i) => i.items.includes(e));
    return this.view.carouselSlides.indexOf(t);
  }
  getItem(e) {
    for (let t of this.view.model.get("items")) if (t.el === e) return t;
  }
  getItemElements() {
    return this.view.model.get("items").map((e) => e.el);
  }
  queryItem(e) {
    return typeof e == "number"
      ? this.view.model.get("items")[e]
      : (typeof e == "string" &&
          !e.match(/^[#.]?[\d/]/) &&
          (e = this.view.el.querySelector(e)),
        this.getItem(e));
  }
  handleConnectedCarousels() {
    const e = this.getOption("connectedCarousels");
    if (!e || e === "") return;
    e.split(",").forEach((i) => {
      const s = i.trim(),
        r = this.liquidApp.elementsCollection.find(
          (h) => h.view.el.getAttribute("id") === s
        ),
        l = r
          ?.get("behaviors")
          ?.find((h) => h.behaviorName === this.behaviorName);
      l &&
        (this.view.on("carousel:select", l.select.bind(l)),
        r.view.on("carousel:select", this.select.bind(this)));
    });
  }
  positionSliderAtSelected() {
    (this.view.carouselX = -this.selectedSlide.target),
      (this.view.carouselVelocity = 0),
      this.positionSlider();
  }
  reposition() {
    this.positionItems(), this.positionSliderAtSelected();
  }
  onResize() {
    this.isAnimating ||
      this.isDragging ||
      window.innerWidth === this.windowWidth ||
      (getSize(this.view.el).width !== this.size.width && this.resize());
  }
  resize() {
    this._sizing(),
      this.view.isCarouselWrapping &&
        (this.view.carouselX = modulo(
          this.view.carouselX,
          this.view.slideableWidth
        )),
      (this.cursorPosition = this.size.innerWidth * this.itemAlign),
      this.positionItems(),
      this.view.trigger("carousel:resize");
    let e = this.selectedElements && this.selectedElements[0];
    this.selectItem(e, !1, !0);
  }
  onkeydown(e) {
    let { activeElement: t } = document,
      i = this.keyboardHandlers[e.key];
    if (!this.getOption("accessibility") || !t || !i) return;
    this.view.focusableElems.some((r) => t === r) && i.call(this);
  }
  focus() {
    this.view.carouselViewport.focus({ preventScroll: !0 });
  }
  startAnimation() {
    this.isAnimating ||
      ((this.isAnimating = !0),
      (this.restingFrames = 0),
      this.view.carouselViewport.classList.add("lqd-carousel-is-sliding"),
      this.animate());
  }
  animate() {
    this.applyDragForce(), this.applySelectedAttraction();
    let e = this.view.carouselX;
    this.integratePhysics(),
      this.positionSlider(),
      this.settle(e),
      this.isAnimating && requestAnimationFrame(() => this.animate());
  }
  positionSlider() {
    let e = this.view.carouselX;
    this.view.isCarouselWrapping &&
      ((e = modulo(e, this.view.slideableWidth) - this.view.slideableWidth),
      this.shiftWrapItems(e)),
      this.setTranslateX(e),
      this.dispatchScrollEvent();
  }
  setTranslateX(e) {
    let t = e + this.cursorPosition;
    this.view.rightToLeft && (t = -t);
    const i = this.getPositionValue(t);
    (this.view.carouselSlider.style.transform = this.isAnimating
      ? `translate3d(${i}, 0, 0)`
      : `translateX(${i})`),
      this.view.carouselSlider.style.setProperty(
        "--lqd-carousel-slider-translate-x",
        `${Math.round(t)}px`
      );
  }
  dispatchScrollEvent() {
    let e = this.view.carouselSlides[0];
    if (!e) return;
    let t = -this.view.carouselX - e.target,
      i = t / this.view.carouselSlidesWidth;
    this.view.trigger("carousel:scroll", null, [i, t]);
  }
  getPositionValue(e) {
    return Math.round((e / this.size.innerWidth) * 1e4) * 0.01 + "%";
  }
  settle(e) {
    !this.view.isPointerDown &&
      Math.round(this.view.carouselX * 100) === Math.round(e * 100) &&
      this.restingFrames++,
      this.restingFrames > 2 &&
        ((this.isAnimating = !1),
        delete this.view.isFreeScrolling,
        this.positionSlider(),
        this.view.trigger("carousel:settle", this.view.selectedIndex),
        this.view.carouselViewport.classList.remove("lqd-carousel-is-sliding"));
  }
  shiftWrapItems(e) {
    let t = this.cursorPosition + e;
    this._shiftItems(this.beforeShiftItems, t, -1);
    let i =
      this.size.innerWidth -
      (e + this.view.slideableWidth + this.cursorPosition);
    this._shiftItems(this.afterShiftItems, i, 1);
  }
  _shiftItems(e, t, i) {
    e.forEach((s) => {
      let r = t > 0 ? i : 0;
      this._wrapShiftItem(s, r), (t -= s.size.outerWidth);
    });
  }
  _unshiftItems(e) {
    !e || !e.length || e.forEach((t) => this._wrapShiftItem(t, 0));
  }
  _wrapShiftItem(e, t) {
    this._renderItemPosition(e, e.x + this.view.slideableWidth * t);
  }
  integratePhysics() {
    (this.view.carouselX += this.view.carouselVelocity),
      (this.view.carouselVelocity *= this.getFrictionFactor());
  }
  applyForce(e) {
    this.view.carouselVelocity += e;
  }
  getFrictionFactor() {
    return 1 - this.view.friction;
  }
  applyDragForce() {
    if (!this.view.isDraggable || !this.view.isPointerDown) return;
    let t =
      this.view.carouselDragX -
      this.view.carouselX -
      this.view.carouselVelocity;
    this.applyForce(t);
  }
  applySelectedAttraction() {
    if (
      (this.view.isDraggable && this.view.isPointerDown) ||
      this.view.isFreeScrolling ||
      !this.view.carouselSlides.length
    )
      return;
    let i =
      (this.selectedSlide.target * -1 - this.view.carouselX) *
      this.getOption("selectedAttraction");
    this.applyForce(i);
  }
  onBeforeFilterAnimation() {
    const e = this.view.model.get("items");
    this.view.model.set({ visibleItems: e.filter((t) => t.isFiltered) }),
      this.resize(),
      this.view.trigger("carousel:select", 0);
  }
  deactivate() {
    this.view.el.classList.remove("lqd-carousel-initiated"),
      this.view.el.classList.remove("lqd-carousel-rtl"),
      this.unselectSelectedSlide(),
      this.getOption("accessibility") &&
        (this.view.el.removeAttribute("tabIndex"),
        this.view.el.removeEventListener("keydown", this.onkeydown)),
      this.view.trigger("carousel:deactivate");
  }
  destroy() {
    this.deactivate(),
      window.removeEventListener("resize", this.resize),
      super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidCarouselBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidCarouselBehavior));
