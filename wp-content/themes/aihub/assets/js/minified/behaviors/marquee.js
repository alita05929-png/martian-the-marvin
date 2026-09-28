class LiquidMarqueeBehavior extends LiquidBehavior {
  static behaviorName = "liquidMarquee";
  static appEvents = { "after:windowResize": "afterWindowResize" };
  options() {
    return { reversed: !1, speed: 1, interactWithScroll: !0 };
  }
  get ui() {
    return { items: ".lqd-marquee-cell", slider: ".lqd-marquee-slider" };
  }
  get bindToThis() {
    return ["sizing"];
  }
  initialize() {
    (this.isPaused = !0),
      (this.size = { width: 0, height: 0 }),
      (this.items = this.getUI("items").map((e) => ({
        el: e,
        size: { width: 0, height: 0 },
        position: { x: 0 },
      }))),
      (this.getUI("slider")[0].style.direction = "ltr"),
      this.init();
  }
  async init() {
    this.isDestroyed ||
      (await this.liquidApp.fastdom.measure(this.sizing),
      !(this.isDestroyed || this.size.width === 0) &&
        (await this.fill(),
        !this.isDestroyed &&
          (this.getStartX(),
          this.buildTimeline(),
          this.setIntersectionObserver(),
          this.getOption("interactWithScroll") && this.interactWithScroll())));
  }
  async sizing() {
    this.isDestroyed ||
      ((this.size.width = this.view.el.offsetWidth),
      this.items.forEach((e, t) => {
        (e.size = { width: e.el.offsetWidth, height: e.el.offsetHeight }),
          (e.position = { x: e.el.offsetLeft }),
          t === 0 && (this.size.height = e.size.height),
          t > 0 &&
            e.size.height > this.items[t - 1].size.height &&
            (this.size.height = e.size.height);
      }));
  }
  async fill() {
    const e = this.items.at(-1);
    e.size.width === 0 ||
      this.size.width === 0 ||
      e.size.width + e.position.x > this.size.width ||
      (await this.liquidApp.fastdom.mutate(() => {
        if (this.isDestroyed) return;
        const t = this.getUI("slider")[0];
        let h = !1,
          n = 0;
        for (; !h; ) {
          const s = {
            el: this.items[n].el.cloneNode(!0),
            size: { ...this.items[n].size },
            position: { ...this.items[n].position },
          };
          t.insertAdjacentElement("beforeend", s.el),
            (s.position.x = s.el.offsetLeft),
            this.items.push(s),
            n++,
            s.size.width + s.position.x >
              this.size.width + this.size.width / 2 && (h = !0);
        }
      }));
  }
  positioning() {
    const e = this.getUI("slider")[0];
    (e.style.height = `${this.size.height}px`),
      this.items.forEach((t) => {
        t.el.classList.remove("relative"),
          t.el.classList.add("absolute", "top-0"),
          (t.el.style.insetInlineStart = `${t.position.x}px`);
      });
  }
  getStartX() {
    this.startX =
      this.items[0].position.x -
      parseInt(getComputedStyle(this.items[0].el).marginInlineEnd, 10);
  }
  buildTimeline() {
    const e = this.getItemElements();
    this.timeline = gsap.timeline({
      repeat: -1,
      paused: !0,
      defaults: { ease: "none" },
      onReverseComplete: () =>
        this.timeline.totalTime(
          this.timeline.rawTime() + this.timeline.duration() * 100
        ),
    });
    const t = this.items.length,
      h = this.items[t - 1],
      n = [],
      l = [],
      s = this.getOption("speed") * 100,
      p = (i) => i;
    let m, o, d, a;
    gsap.set(e, {
      xPercent: (i, r) => {
        const c = this.items[i].size.width;
        return (
          (l[i] = p(
            (parseFloat(gsap.getProperty(r, "x", "px")) / c) * 100 +
              gsap.getProperty(r, "xPercent")
          )),
          l[i]
        );
      },
      x: 0,
    }),
      (m =
        h.position.x +
        (l[t - 1] / 100) * h.size.width -
        this.startX +
        h.size.width * gsap.getProperty(e[t - 1], "scaleX"));
    for (let i = 0; i < t; i++) {
      const r = this.items[i];
      (o = (l[i] / 100) * r.size.width),
        (d = r.position.x + o - this.startX),
        (a = d + r.size.width * gsap.getProperty(r.el, "scaleX")),
        this.timeline
          .to(
            r.el,
            { xPercent: p(((o - a) / r.size.width) * 100), duration: a / s },
            0
          )
          .fromTo(
            r.el,
            { xPercent: p(((o - a + m) / r.size.width) * 100) },
            {
              xPercent: l[i],
              duration: (o - a + m - o) / s,
              immediateRender: !1,
            },
            a / s
          )
          .add("label" + i, d / s),
        (n[i] = d / s);
    }
    (this.timeline.times = n),
      this.timeline.progress(1, !0).progress(0, !0),
      this.getOption("reversed") && this.timeline.vars.onReverseComplete();
  }
  play() {
    this.setWillChange("transform"),
      this.getOption("reversed")
        ? this.timeline.reverse()
        : this.timeline.play(),
      (this.isPaused = !1);
  }
  pause() {
    this.setWillChange(""), this.timeline.pause(), (this.isPaused = !0);
  }
  setIntersectionObserver() {
    new IntersectionObserver(([e], t) => {
      if (this.isDestroyed) return t.disconnect();
      e.isIntersecting ? this.play() : this.pause();
    }).observe(this.view.el);
  }
  interactWithScroll() {
    const t = this.getOption("reversed") ? -1 : 1,
      h = gsap.utils.clamp(-6, 6);
    (this.STTween = gsap.to(this.timeline, {
      duration: 1.5,
      timeScale: t,
      paused: !0,
    })),
      (this.ST = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (n) => {
          this.isPaused ||
            (this.timeline.timeScale(h((n.getVelocity() / 200) * t)),
            this.STTween.invalidate().restart());
        },
      }));
  }
  setWillChange(e) {
    this.getItemElements().forEach((t) => (t.style.willChange = e));
  }
  getItemElements() {
    return this.items.map((e) => e.el);
  }
  afterWindowResize() {
    this.destroyTimelines(), this.init();
  }
  destroyTimelines() {
    this.timeline?.revert(),
      this.STTween?.kill(),
      this.ST?.kill(),
      this.setWillChange("");
  }
  destroy() {
    this.destroyTimelines(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidMarqueeBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidMarqueeBehavior));
