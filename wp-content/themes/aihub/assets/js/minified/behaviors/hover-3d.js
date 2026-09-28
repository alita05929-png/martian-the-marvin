class LiquidHover3dBehavior extends LiquidBehavior {
  static behaviorName = "liquidHover3d";
  static domEvents = {
    "mousemove @items": "onItemsMouseMove",
    "mouseleave @items": "onItemsMouseLeave",
  };
  currentRect = null;
  currentTarget = null;
  options() {
    return { maxRotation: 8, maxTranslation: 4, intensity: 1 };
  }
  get ui() {
    return { items: "[data-lqd-hover3d-el]" };
  }
  animate(t, e = !1) {
    this.currentTarget &&
      (gsap.set(this.currentTarget, {
        transitionProperty:
          "opacity,filter,background,color,border,box-shadow,text-shadow,fill,stroke,border-radius",
      }),
      gsap.killTweensOf(this.currentTarget),
      gsap.to(this.currentTarget, {
        x: t.xTranslationPercentage * -1 * t.maxTranslationX,
        y: t.yTranslationPercentage * -1 * t.maxTranslationY,
        rotateX: t.xRotationPercentage * -1 * t.maxRotationX,
        rotateY: t.yRotationPercentage * -1 * t.maxRotationY,
        transformPerspective: "1200",
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          e && this.killAllTweens();
        },
      }));
  }
  calculateRotationPercentage(t, e) {
    return (-2 / e) * t + 1;
  }
  calculateTranslationPercentage(t, e) {
    return (-2 / e) * t + 1;
  }
  onItemsMouseMove(t) {
    const e = this.getOption("intensity"),
      i = this.getOption("maxRotation");
    if (
      (this.currentTarget || (this.currentTarget = t.currentTarget),
      !this.currentRect)
    ) {
      const r = this.currentTarget.getBoundingClientRect();
      this.currentRect = {
        x: r.x,
        y: r.y + window.scrollY,
        width: r.width,
        height: r.height,
      };
    }
    const a = {
        x: t.pageX - this.currentRect.x,
        y: t.pageY - this.currentRect.y,
      },
      n = {
        xRotationPercentage: this.calculateRotationPercentage(
          a.y,
          this.currentRect.height
        ),
        yRotationPercentage:
          this.calculateRotationPercentage(a.x, this.currentRect.width) * -1,
        xTranslationPercentage: this.calculateTranslationPercentage(
          a.x,
          this.currentRect.width
        ),
        yTranslationPercentage: this.calculateTranslationPercentage(
          a.y,
          this.currentRect.height
        ),
      };
    this.animate({
      maxTranslationX: this.maxTranslation * e,
      maxTranslationY: this.maxTranslation * e,
      maxRotationX: i * e,
      maxRotationY: i * e,
      xRotationPercentage: n.xRotationPercentage,
      yRotationPercentage: n.yRotationPercentage,
      xTranslationPercentage: n.xTranslationPercentage,
      yTranslationPercentage: n.yTranslationPercentage,
    });
  }
  onItemsMouseLeave(t) {
    this.animate(
      {
        maxTranslationX: 0,
        maxTranslationY: 0,
        maxRotationX: 0,
        maxRotationY: 0,
        xRotationPercentage: 0,
        yRotationPercentage: 0,
        xTranslationPercentage: 0,
        yTranslationPercentage: 0,
      },
      !0
    ),
      (this.currentTarget = null),
      (this.currentRect = null);
  }
  killAllTweens() {
    this.currentTarget && gsap.killTweensOf(this.currentTarget);
  }
  destroy() {
    this.killAllTweens(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidHover3dBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidHover3dBehavior));
