const cursorNodes = ["TEXTAREA", "INPUT", "SELECT", "OPTION"],
  clickTypes = ["radio", "checkbox", "button", "submit", "image", "file"];
function getScrollPosition() {
  return { x: window.pageXOffset, y: window.pageYOffset };
}
class LiquidCarouselDragBehavior extends LiquidBehavior {
  static behaviorName = "liquidCarouselDrag";
  static viewEvents = {
    "carousel:activate": [
      { "carousel:pointerDown": "handlePointerDown" },
      { "carousel:pointerDown": "handlePointerDone" },
      { "carousel:pointerUp": "handlePointerUp" },
      { "carousel:dragStart": "handleDragStart" },
      { "carousel:dragMove": "handleDragMove" },
      { "carousel:dragEnd": "handleDragEnd" },
      { "carousel:uiChange": "_uiChangeDrag" },
      { "carousel:itemChange": "updateDraggable" },
      "onActivateDrag",
    ],
  };
  options() {
    return {
      freeScroll: !1,
      freeScrollFriction: 0.075,
      draggable: ">1",
      dragThreshold: window.matchMedia("(pointer: coarse)").matches ? 10 : 3,
    };
  }
  get bindToThis() {
    return [
      "ontouchstartstart",
      "ontouchmovestart",
      "ontouchendstart",
      "ontouchcancelstart",
      "onpointerdownstart",
      "onpointermovestart",
      "onpointerupstart",
      "onpointercancelstart",
      "onmousedownstart",
      "onmousemovestart",
      "onmouseupstart",
      "onscroll",
    ];
  }
  initialize() {
    (this.startEvent = null),
      (this.activeEvents = null),
      "ontouchstart" in window
        ? ((this.startEvent = "touchstart"),
          (this.activeEvents = ["touchmove", "touchend", "touchcancel"]))
        : window.PointerEvent
        ? ((this.startEvent = "pointerdown"),
          (this.activeEvents = ["pointermove", "pointerup", "pointercancel"]))
        : ((this.startEvent = "mousedown"),
          (this.activeEvents = ["mousemove", "mouseup"]));
  }
  getLastSlide() {
    return this.view.carouselSlides[this.view.carouselSlides.length - 1];
  }
  bindHandles() {
    this._bindHandles("addEventListener");
  }
  unbindHandles() {
    this._bindHandles("removeEventListener");
  }
  _bindHandles(e) {
    this.view.carouselViewport[e](
      this.startEvent,
      this[`on${this.startEvent}start`]
    ),
      this.view.carouselViewport[e]("click", this.onclick);
  }
  bindActivePointerEvents() {
    this.activeEvents.forEach((e) => {
      window.addEventListener(e, this[`on${e}start`]);
    });
  }
  unbindActivePointerEvents() {
    this.activeEvents.forEach((e) => {
      window.removeEventListener(e, this[`on${e}start`]);
    });
  }
  withPointer(e, t) {
    t.pointerId == this.pointerIdentifier && this[e](t, t);
  }
  withTouch(e, t) {
    let i;
    for (let s of t.changedTouches)
      s.identifier == this.pointerIdentifier && (i = s);
    i && this[e](t, i);
  }
  onmousedownstart(e) {
    this.pointerDown(e, e);
  }
  ontouchstartstart(e) {
    this.pointerDown(e, e.changedTouches[0]);
  }
  onpointerdownstart(e) {
    this.pointerDown(e, e);
  }
  pointerDown(e, t) {
    const i = cursorNodes.includes(e.target.nodeName),
      s = clickTypes.includes(e.target.type),
      r = !i || s;
    !this.view.isPointerDown &&
      !e.button &&
      r &&
      ((this.view.isPointerDown = !0),
      (this.pointerIdentifier =
        t.pointerId !== void 0 ? t.pointerId : t.identifier),
      (this.pointerDownPointer = { pageX: t.pageX, pageY: t.pageY }),
      this.bindActivePointerEvents(),
      this.view.trigger("carousel:pointerDown", e));
  }
  onmousemovestart(e) {
    this.pointerMove(e, e);
  }
  onpointermovestart(e) {
    this.withPointer("pointerMove", e);
  }
  ontouchmovestart(e) {
    this.withTouch("pointerMove", e);
  }
  pointerMove(e, t) {
    let i = {
      x: t.pageX - this.pointerDownPointer.pageX,
      y: t.pageY - this.pointerDownPointer.pageY,
    };
    this.view.trigger("carousel:pointerMove", e, t, i),
      !this.isDragging && this.hasDragStarted(i) && this.dragStart(e, t),
      this.isDragging && this.dragMove(e, i);
  }
  hasDragStarted(e) {
    const t = this.getOption("dragThreshold");
    return Math.abs(e.x) > t || Math.abs(e.y) > t;
  }
  dragStart(e, t) {
    (this.isDragging = !0),
      (this.isPreventingClicks = !0),
      this.view.trigger("carousel:dragStart", e, t);
  }
  dragMove(e, t) {
    this.view.trigger("carousel:dragMove", e, t);
  }
  onmouseupstart(e) {
    this.pointerUp(e, e);
  }
  onpointerupstart(e) {
    this.withPointer("pointerUp", e);
  }
  ontouchendstart(e) {
    this.withTouch("pointerUp", e);
  }
  pointerUp(e, t) {
    this.pointerDone(),
      this.view.trigger("carousel:pointerUp", e, t),
      this.isDragging && this.dragEnd(e, t);
  }
  dragEnd(e, t) {
    (this.isDragging = !1),
      setTimeout(() => delete this.isPreventingClicks),
      this.view.trigger("carousel:dragEnd", e, t);
  }
  pointerDone() {
    (this.view.isPointerDown = !1),
      delete this.pointerIdentifier,
      this.unbindActivePointerEvents(),
      this.view.trigger("carousel:pointerDone");
  }
  onpointercancelstart(e) {
    this.withPointer("pointerCancel", e);
  }
  ontouchcancelstart(e) {
    this.withTouch("pointerCancel", e);
  }
  pointerCancel(e, t) {
    this.pointerDone(), this.view.trigger("carousel:pointerCancel", [e, t]);
  }
  onclick(e) {
    this.isPreventingClicks && e.preventDefault();
  }
  onActivateDrag() {
    this.bindHandles(), this.updateDraggable();
  }
  onDeactivateDrag() {
    this.unbindHandles(),
      this.view.el.classList.remove("lqd-carousel-is-draggable");
  }
  updateDraggable() {
    const e = this.getOption("draggable");
    e === ">1"
      ? (this.view.isDraggable = this.view.carouselSlides.length > 1)
      : (this.view.isDraggable = e),
      this.view.el.classList.toggle(
        "lqd-carousel-is-draggable",
        this.view.isDraggable
      );
  }
  _uiChangeDrag() {
    delete this.view.isFreeScrolling;
  }
  handlePointerDown(e) {
    if (!this.view.isDraggable) {
      this.bindActivePointerEvents(e);
      return;
    }
    let t = e.type === "touchstart",
      i = e.pointerType === "touch",
      s = e.target.matches("input, textarea, select");
    !t && !i && !s && e.preventDefault(),
      s || this.view.trigger("carousel:focus"),
      document.activeElement !== this.view.el && document.activeElement.blur(),
      (this.view.carouselDragX = this.view.carouselX),
      this.view.carouselViewport.classList.add("lqd-carousel-pointer-down"),
      (this.pointerDownScroll = getScrollPosition()),
      window.addEventListener("scroll", this.onscroll),
      this.bindActivePointerEvents(e);
  }
  handlePointerUp() {
    delete this.isTouchScrolling,
      this.view.carouselViewport.classList.remove("lqd-carousel-pointer-down");
  }
  handlePointerDone() {
    window.removeEventListener("scroll", this.onscroll),
      delete this.pointerDownScroll;
  }
  handleDragStart() {
    this.view.isDraggable &&
      ((this.dragStartPosition = this.view.carouselX),
      this.view.trigger("carousel:startAnimation"),
      window.removeEventListener("scroll", this.onscroll));
  }
  handleDragMove(e, t) {
    if (!this.view.isDraggable) return;
    e.preventDefault(), (this.previousDragX = this.view.carouselDragX);
    let i = this.view.rightToLeft ? -1 : 1;
    this.view.isCarouselWrapping && (t.x %= this.view.slideableWidth);
    let s = this.dragStartPosition + t.x * i;
    if (!this.view.isCarouselWrapping) {
      let r = Math.max(
        -this.view.carouselSlides[0].target,
        this.dragStartPosition
      );
      s = s > r ? (s + r) * 0.5 : s;
      let o = Math.min(-this.getLastSlide().target, this.dragStartPosition);
      s = s < o ? (s + o) * 0.5 : s;
    }
    (this.view.carouselDragX = s), (this.dragMoveTime = new Date());
  }
  handleDragEnd() {
    if (!this.view.isDraggable) return;
    let e = this.getOption("freeScroll");
    e && (this.view.isFreeScrolling = !0);
    let t = this.dragEndRestingSelect();
    if (e && !this.view.isCarouselWrapping) {
      let i = this.getRestingPosition();
      this.view.isFreeScrolling =
        -i > this.view.carouselSlides[0].target &&
        -i < this.getLastSlide().target;
    } else
      !e && t === this.view.selectedIndex && (t += this.dragEndBoostSelect());
    delete this.previousDragX,
      (this.view.isDragSelect = this.view.isCarouselWrapping),
      this.view.trigger("carousel:select", t),
      delete this.view.isDragSelect;
  }
  dragEndRestingSelect() {
    let e = this.getRestingPosition(),
      t = Math.abs(this.getSlideDistance(-e, this.view.selectedIndex)),
      i = this._getClosestResting(e, t, 1),
      s = this._getClosestResting(e, t, -1);
    return i.distance < s.distance ? i.index : s.index;
  }
  _getClosestResting(e, t, i) {
    let s = this.view.selectedIndex,
      r = 1 / 0,
      o =
        this.view.contain && !this.view.isCarouselWrapping
          ? (n, a) => n <= a
          : (n, a) => n < a;
    for (
      ;
      o(t, r) &&
      ((s += i), (r = t), (t = this.getSlideDistance(-e, s)), t !== null);

    )
      t = Math.abs(t);
    return { distance: r, index: s - i };
  }
  getSlideDistance(e, t) {
    let i = this.view.carouselSlides.length,
      s = this.view.wrapAround && i > 1,
      r = s ? modulo(t, i) : t,
      o = this.view.carouselSlides[r];
    if (!o) return null;
    let n = s ? this.view.slideableWidth * Math.floor(t / i) : 0;
    return e - (o.target + n);
  }
  dragEndBoostSelect() {
    if (
      this.previousDragX === void 0 ||
      !this.dragMoveTime ||
      new Date() - this.dragMoveTime > 100
    )
      return 0;
    let e = this.getSlideDistance(
        -this.view.carouselDragX,
        this.view.selectedIndex
      ),
      t = this.previousDragX - this.view.carouselDragX;
    return e > 0 && t > 0 ? 1 : e < 0 && t < 0 ? -1 : 0;
  }
  getRestingPosition() {
    return (
      this.view.carouselX +
      this.view.carouselVelocity / (1 - this.getFrictionFactor())
    );
  }
  getFrictionFactor() {
    return (
      1 -
      (this.view.isFreeScrolling
        ? this.getOption("freeScrollFriction")
        : this.view.friction)
    );
  }
  onscroll() {
    let e = getScrollPosition(),
      t = this.pointerDownScroll.x - e.x,
      i = this.pointerDownScroll.y - e.y;
    (Math.abs(t) > 3 || Math.abs(i) > 3) && this.pointerDone();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidCarouselDragBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidCarouselDragBehavior));
