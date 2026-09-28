gsap.registerPlugin(ScrollTrigger);
class LiquidAnimationsBehavior extends LiquidBehavior {
  static behaviorName = "liquidAnimations";
  static viewModelEvents = {
    "change:ghost": [
      { "change:animatableElements": { func: "initialize", once: !0 } },
    ],
    "change:animatableElements": [
      { "change:ghost": { func: "initialize", once: !0 } },
    ],
    "change:rect": { func: "onChangeRect", debounce: { wait: 150 } },
  };
  static parentsCollectionEvents = {
    "change:toggle:open": "onParentsToggleOpen",
    "change:toggle:close": "onParentsToggleClose",
    "change:rect": { func: "onChangeRect", debounce: { wait: 150 } },
    "change:ghost": { func: "onChangeRect", debounce: { wait: 150 } },
  };
  defaultElementsSelector = "[data-lqd-animation-el]";
  options() {
    return {
      domain: "inview",
      trigger: "ghost",
      endTrigger: null,
      duration: 1,
      ease: "power4.out",
      stagger: { each: 0.075, from: "start" },
      delay: 0,
      repeat: 0,
      repeatDelay: 0,
      yoyo: !1,
      yoyoEase: !1,
      start: "top bottom",
      end: "bottom top",
      startElementOffset: 0,
      startViewportOffset: 0,
      endElementOffset: 0,
      endViewportOffset: 0,
      toggleActions: "play none none none",
      scrub: !1,
      animations: [
        {
          elements: this.defaultElementsSelector,
          breakpointsKeyframes: {
            all: { options: {}, keyframes: [] },
            tablet: { options: {}, keyframes: [] },
            mobile: { options: {}, keyframes: [] },
          },
        },
      ],
    };
  }
  initialize() {
    this.isDestroyed ||
      (this.view.model.get("computedStyles") === "done"
        ? this.initAnimations()
        : this.view.model.on("change:computedStyles", () => {
            this.isDestroyed || this.initAnimations();
          }));
  }
  initAnimations() {
    this.isDestroyed ||
      ((this.animations = this.buildAnimationsArray()),
      (this.animationsBreakpoints = this.buildAnimationsBreakpoints()),
      (this.matchMedia = gsap.matchMedia()),
      this.buildAnimations());
  }
  onAnimatablesChange(i, t) {
    const e = this.getOption("domain");
    if (!i.models && !Array.isArray(t)) {
      const s = [...(i?.changed?.behaviors || [])];
      if (
        (i.previous &&
          i.previous("behaviors")?.length &&
          s.push(...i.previous("behaviors")),
        !s.find(
          (o) =>
            o.behaviorName === this.behaviorName && o.getOption("domain") === e
        ))
      )
        return;
    }
    this.revertAnimations(), this.initAnimations();
  }
  buildAnimationsArray() {
    const i = {
      duration: this.getOption("duration"),
      ease: this.getOption("ease"),
      stagger: this.getOption("stagger"),
      repeat: this.getOption("repeat"),
      repeatDelay: this.getOption("repeatDelay"),
      yoyo: this.getOption("yoyo"),
      yoyoEase: this.getOption("yoyoEase"),
    };
    let t = [...this.getOption("animations")];
    return (
      t.forEach((s, n) => {
        const { elements: o, breakpointsKeyframes: h, originalElements: a } = s;
        Object.entries(h).forEach(([c]) => {
          const r = this.liquidApp.breakpointsOrder.findIndex((g) => g === c);
          let p = {};
          for (let g = r; g < this.liquidApp.breakpointsOrder.length; g++)
            s.breakpointsKeyframes[this.liquidApp.breakpointsOrder[g]] &&
              (p = s.breakpointsKeyframes[this.liquidApp.breakpointsOrder[g]]);
          h[c].options = {
            ...i,
            ...(p?.options || {}),
            ...(h[c]?.options || {}),
          };
        }),
          typeof o == "string"
            ? o === "selfAnimatables"
              ? t.splice(n, 0, {
                  elements: this.view.model.get("animatableElements"),
                  breakpointsKeyframes: h,
                })
              : o === "self"
              ? (t[n].elements = [this.view.el])
              : o !== "" &&
                (t[n].elements = [...this.view.el.querySelectorAll(o)])
            : (t[n].elements = [
                ...this.view.el.querySelectorAll(this.defaultElementsSelector),
              ]);
      }),
      t.filter((s) => typeof s?.elements != "string" && s?.elements?.length)
    );
  }
  buildAnimationsBreakpoints() {
    const i = this.animations.flatMap((e) =>
        Object.keys(e.breakpointsKeyframes)
      ),
      t = _.uniq(i).sort(
        (e, s) =>
          this.liquidApp.breakpointsOrder.indexOf(e) -
          this.liquidApp.breakpointsOrder.indexOf(s)
      );
    return (
      t.forEach((e, s) => {
        const n = window.liquid.breakpoints[e];
        let o = n ? `(${n.direction}-width: ${n.value}px)` : "all";
        (t[s] = { name: e, value: o }),
          n && ((t[s].direction = n.direction), (t[s].screenSize = n.value));
      }),
      t
    );
  }
  buildAnimations() {
    const i = [(this.animations.length - 1) >> 1],
      t = this.animations.length % 2,
      e = {
        delay: this.getOption("delay"),
        repeat: this.getOption("repeat"),
        repeatDelay: this.getOption("repeatDelay"),
        yoyo: this.getOption("yoyo"),
        yoyoEase: this.getOption("yoyoEase"),
      },
      s = {
        trigger: this.getTrigger(this.getOption("trigger")),
        endTrigger: this.getTrigger(this.getOption("endTrigger")),
        toggleActions: this.getOption("toggleActions"),
        scrub: this.getOption("scrub"),
        scroller: this.getScroller(),
        start: this.getStartAndEnd(this.getOption("start"), [
          this.getOption("startElementOffset"),
          this.getOption("startViewportOffset"),
        ]),
        end: this.getStartAndEnd(this.getOption("end"), [
          this.getOption("endElementOffset"),
          this.getOption("endViewportOffset"),
        ]),
      };
    t || i.push(this.animations.length >> 1),
      this.animationsBreakpoints?.forEach(
        ({ name: n, value: o, direction: h, screenSize: a }, c) => {
          let r = o;
          const g = Object.entries(this.animations)
              .filter(([m, d]) => !d.isChildAnimation)
              .map(([m, d]) => d.breakpointsKeyframes[n])[0]?.options?.stagger,
            l = this.animationsBreakpoints[c],
            f = this.animationsBreakpoints[c - 1];
          if (o === "all" && f?.direction && f?.screenSize) {
            const m = f.direction === "max" ? "min" : "max",
              d = f.direction === "max" ? f.screenSize + 1 : f.screenSize;
            r = `(${m}-width: ${d}px)`;
          }
          l?.direction &&
            l?.screenSize &&
            f?.direction &&
            f.screenSize &&
            (r = `(min-width: ${f?.screenSize + 1}px) and (max-width: ${
              l.screenSize
            }px)`),
            this.matchMedia.add(r, () => {
              const m = gsap.timeline({
                delay: e.repeat !== 0 ? 0 : e.delay,
                scrollTrigger: s,
              });
              this.getBreakpointAnimation(m, n, i, g), (l.timeline = m);
            }),
            e?.repeat !== 0 &&
              ((this.repeatTimelines = this.repeatTimelines || []),
              (this.repeatTimelines[c] = this.repeatTimelines[c] || {
                name: n,
                value: o,
              }),
              this.matchMedia.add(r, () => {
                l.timeline.restart();
                const m = gsap.timeline({ paused: !1, ...e, scrollTrigger: s });
                m.add(l.timeline), (this.repeatTimelines[c].timeline = m);
              }));
        }
      );
  }
  getBreakpointAnimation(i, t, e, s) {
    const n = { ...this.getOption("stagger") },
      o = s || n;
    let h = [...this.animations];
    o.from === "random" && (h = _.shuffle(h)),
      h.forEach((a, c) => {
        if (!a.elements?.length || !a.breakpointsKeyframes[t]?.keyframes)
          return;
        const r = _.pick(
            { ...n, ...a.breakpointsKeyframes[t]?.options },
            "ease",
            "duration",
            "stagger"
          ),
          p = this.buildBreakpointStagger(r, a, c, e);
        let g = a.breakpointsKeyframes[t].keyframes.map((l) =>
          this.buildKeyframe(r, p, l)
        );
        i.to(
          a.elements,
          {
            stagger: p,
            delay: r.delay || 0,
            keyframes: g,
            onUpdate: () => {
              a.elements.forEach((l) => (l.style.transition = "none"));
            },
            onComplete: () => {
              a.elements.forEach((l) => (l.style.transition = ""));
            },
          },
          this.getTweensPositionInTimeline(o, t, c, e)
        );
      });
  }
  buildBreakpointStagger(i, t, e, s) {
    if (t.isChildAnimation) return i.stagger;
    const n = { from: i?.stagger?.from, each: i?.stagger?.each },
      o = s[0],
      h = s[s.length - 1];
    if (n.from === "center") {
      let a = n.from;
      s.length === 1 && e === o
        ? (a = "center")
        : e <= o
        ? (a = "end")
        : (a = "start"),
        (n.from = a);
    }
    if (n.from === "edges") {
      let a = n.from;
      s.length === 1 && e === o
        ? (a = "edges")
        : e >= h
        ? (a = "end")
        : (a = "start"),
        (n.from = a);
    }
    return n;
  }
  buildKeyframe(i, t, e) {
    const s = {
        from: e?.stagger?.from || t.from,
        each: e?.stagger?.each || t.each,
      },
      n = { ...this.timelinesDefaultOptions, ...i, ...e, stagger: s };
    return _.omit(n, "stagger");
  }
  getTweensPositionInTimeline(i, t, e, s) {
    const n = { from: i.from, each: i.each },
      o = n.each || 0,
      h = this.animations[e - 1],
      a = h?.breakpointsKeyframes[t] ? h.elements.length : 0,
      c = h?.breakpointsKeyframes[t]?.options?.stagger?.each;
    let r = `<+=${(e >= 1 ? a : 0) * (c || o)}`;
    if (n.from === "end") {
      let p = 0;
      for (let g = e; g < this.animations.length; g++) {
        const l = this.animations[g + 1];
        if (l) {
          const f = l?.breakpointsKeyframes[t] ? l.elements.length : 0,
            m = l?.breakpointsKeyframes[t]?.options?.stagger?.each || 0;
          p += f * m;
        }
      }
      r = p;
    }
    if (n.from === "center" && (s.includes(e) && (r = 0), e < s[0])) {
      const p = this.animations[s[0]].elements.length >> 1;
      r = `${
        (this.animations
          .slice(e, s[0])
          .map((l) => l.elements.length)
          .reduce((l, f) => l + f, 0) +
          p) *
        o
      }`;
    }
    return (
      n.from === "edges" &&
        (s.includes(e) ||
          (e === 0 || e === this.animations.length - 1
            ? (r = 0)
            : e > s[0]
            ? (r = this.animations[e].elements.length * o)
            : e < s[0] &&
              (r = `<+=${
                this.animations[e === 0 ? 0 : e - 1].elements.length * o
              }`))),
      r
    );
  }
  getTrigger(i) {
    let t;
    if (i === "self") t = this.view.el;
    else if (i === "ghost")
      t = this.view.model.get("ghost")?.el || this.view.el;
    else if (i === "topParentContainer") {
      const e = this.view.model.get("topParentContainer");
      t = e ? e.get("ghost")?.el || e.view?.el : this.view.el;
    } else if (i === "closestParentContainer") {
      const e = this.view.model.get("parentsCollection")?.at(0);
      t = e ? e.get("ghost")?.el || e.view?.el : this.view.el;
    } else
      i === "pageContent" && this.liquidApp.layoutRegions?.liquidPageContent?.el
        ? (t = this.liquidApp.layoutRegions?.liquidPageContent?.el)
        : i === "pageFooter" &&
          this.liquidApp.layoutRegions?.liquidPageFooter?.el
        ? (t = this.liquidApp.layoutRegions?.liquidPageFooter?.el)
        : (t = i);
    return t;
  }
  getStartAndEnd(i, t = [0, 0]) {
    if (!i) return 0;
    if (typeof i == "number") return `${i}%`;
    if (i === "max") return i;
    const e = i.split(" ");
    let s = "",
      n = "";
    return (
      t[0] !== 0 &&
        ((s = `${t[0] < 0 ? "-" : "+"}=${Math.abs(t[0])}%`),
        (e[0] = e[0].split(/[+-]/)[0])),
      t[1] !== 0 &&
        ((n = `${t[1] < 0 ? "-" : "+"}=${Math.abs(t[1])}%`),
        (e[1] = e[1].split(/[+-]/)[0])),
      `${e[0]}${s} ${e[1]}${n}`
    );
  }
  getScroller() {
    const i = this.view.model.get("parentsCollection");
    let t = null;
    return (
      i?.length &&
        i.forEach((e) => {
          const s = e.view.el;
          if (s.classList.contains("elementor-widget-lqd-modal")) {
            t = s.querySelector(".lqd-modal-inner");
            return;
          }
        }),
      t
    );
  }
  onParentsToggleOpen(i, { openedElements: t, firstToggle: e }) {
    this.onParentsToggleChange(t, e, "open");
  }
  onParentsToggleClose(i, { closedElements: t, firstToggle: e }) {
    this.onParentsToggleChange(t, e, "close");
  }
  onParentsToggleChange({ triggers: i, targets: t }, e, s) {
    if (!i.length && !t.length) return;
    const n = this.getOption("toggleActions").split(" "),
      o = n[0],
      h = n[1],
      a = n[2],
      c = n[3];
    let r = o,
      p;
    switch (
      (s === "open" && !e
        ? (r = a)
        : s === "close" && e
        ? (r = h)
        : s === "close" && !e && (r = c),
      r === "reset" && (r = "pause"),
      r)
    ) {
      case "restart":
        p = !0;
        break;
      case "reset":
        p = 0;
        break;
    }
    this.animationsBreakpoints?.forEach(({ name: g, timeline: l }) => {
      (this.liquidApp.activeBreakpoint !== g && g !== "all") ||
        _.defer(() => {
          l.scrollTrigger.refresh(!0),
            (r === "play" ||
              r === "pause" ||
              r === "reverse" ||
              r === "restart" ||
              r === "reset") &&
              l[r](p);
        });
    });
  }
  onChangeRect() {
    this.isDestroyed ||
      this.animationsBreakpoints?.forEach(({ name: i, timeline: t }) => {
        (this.liquidApp.activeBreakpoint !== i && i !== "all") ||
          _.defer(() => {
            t.scrollTrigger.refresh(!0);
          });
      });
  }
  revertAnimations() {
    this.repeatTimelines
      ?.filter((i) => i.timeline)
      ?.forEach((i) => {
        i.timeline.revert();
      }),
      this.animationsBreakpoints
        ?.filter((i) => i.timeline)
        ?.forEach((i) => {
          i.timeline.revert();
        }),
      (this.repeatTimelines = null),
      (this.animationsBreakpoints = null),
      this.matchMedia?.revert();
  }
  destroy() {
    this.revertAnimations(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidAnimationsBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidAnimationsBehavior));
