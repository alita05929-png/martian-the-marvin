class LiquidThrowableBehavior extends LiquidBehavior {
  static behaviorName = "liquidThrowable";
  static windowEvents = {
    resize: { func: "onWindowResize", debounce: { wait: 100 } },
  };
  get ui() {
    return { items: ".lqd-throwable-element" };
  }
  bodies = [];
  options() {
    return { roundness: "sharp", scrollGravity: !0 };
  }
  initialize() {
    this.createWorld(),
      this.createBoundries(),
      this.createBodies(),
      this.enableRunner(),
      this.makeItRain();
  }
  enableRunner() {
    this.runnerObserver = new IntersectionObserver(([t]) => {
      this.runner.enabled = t.isIntersecting;
    }).observe(this.view.el);
  }
  makeItRain() {
    new IntersectionObserver(([t], s) => {
      t.isIntersecting &&
        (this.startRain(),
        gsap.to(this.getUI("items"), { opacity: 1, duration: 1, stagger: 0.2 }),
        s.disconnect());
    }).observe(this.view.el);
  }
  createWorld() {
    (this.height = this.view.el.offsetHeight),
      (this.width = this.view.el.offsetWidth),
      (this.engine = Matter.Engine.create()),
      (this.runner = Matter.Runner.create()),
      (this.mouse = Matter.Mouse.create(this.view.el)),
      this.view.el.removeEventListener("mousewheel", this.mouse.mousewheel),
      this.view.el.addEventListener("mouseleave", this.mouse.mouseup),
      (this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
        mouse: this.mouse,
        constraint: { render: { visible: !1 } },
      })),
      (this.engine.gravity.y = 0.8),
      Matter.Composite.add(this.engine.world, [this.mouseConstraint]),
      Matter.Runner.start(this.runner, this.engine),
      Matter.Events.on(this.mouseConstraint, "mousedown", () => {
        this.view.el.style.pointerEvents = "auto";
      }),
      Matter.Events.on(this.mouseConstraint, "mouseup", () => {
        this.view.el.style.pointerEvents = "";
      }),
      (this.runner.enabled = !1);
  }
  createBoundries() {
    (this.boundStart = Matter.Bodies.rectangle(
      -250,
      this.height / 2,
      500,
      4 * this.height,
      { isStatic: !0 }
    )),
      (this.boundEnd = Matter.Bodies.rectangle(
        this.width + 250,
        this.height / 2,
        500,
        4 * this.height,
        { isStatic: !0 }
      )),
      (this.boundBottom = Matter.Bodies.rectangle(
        0,
        this.height + 250,
        2 * this.width,
        500,
        { isStatic: !0 }
      )),
      Matter.Composite.add(this.engine.world, [
        this.boundBottom,
        this.boundStart,
        this.boundEnd,
      ]);
  }
  createBodies() {
    this.getUI("items").forEach((t, s) => {
      const e = t.querySelector("span");
      if (!e) return;
      const i = t.getBoundingClientRect(),
        n = gsap.quickSetter(t, "x", "px"),
        r = gsap.quickSetter(t, "y", "px"),
        h = gsap.utils.random(0.2 * -Math.PI, 0.2 * Math.PI),
        a = gsap.utils.random(i.width / 2, this.width - i.width / 2),
        d = -100,
        u = this.getOption("roundness") === "sharp" ? 0 : i.height / 2,
        o = Matter.Bodies.rectangle(a, d, i.width, i.height, {
          chamfer: { radius: u },
          angle: h,
          isStatic: !0,
          restitution: 0.3,
        });
      this.bodies.push(o),
        Matter.Composite.add(this.engine.world, [o]),
        Matter.Events.on(this.runner, "tick", () => {
          this.runner.enabled &&
            ((e.style.transform =
              "translate(-50%, -50%) rotate(" + o.angle.toFixed(2) + "rad)"),
            r(o.position.y.toFixed(1)),
            n(o.position.x.toFixed(1)));
        });
    });
  }
  createTopBound() {
    (this.boundTop = Matter.Bodies.rectangle(
      this.width / 2,
      -20,
      this.width,
      50,
      { isStatic: !0 }
    )),
      Matter.Composite.add(this.engine.world, [this.boundTop]);
  }
  makeScrollGravity() {
    let t = 0;
    Matter.Events.on(this.runner, "tick", () => {
      const s =
          document.documentElement.scrollTop -
          document.documentElement.clientTop,
        e = s - t;
      (this.engine.gravity.y = 0.7 - gsap.utils.clamp(-2, 4, e * 0.1)), (t = s);
    });
  }
  updateBoundries() {
    this.boundTop &&
      Matter.Body.setVertices(
        this.boundTop,
        Matter.Bodies.rectangle(0, -250, 2 * this.width, 500, { isStatic: !0 })
          .vertices
      ),
      this.boundStart &&
        (Matter.Body.setPosition(this.boundStart, {
          x: -250,
          y: this.height / 2,
        }),
        Matter.Body.setVertices(
          this.boundStart,
          Matter.Bodies.rectangle(-250, this.height / 2, 500, 4 * this.height, {
            isStatic: !0,
          }).vertices
        )),
      this.boundEnd &&
        (Matter.Body.setPosition(this.boundEnd, {
          x: this.width + 250,
          y: this.height / 2,
        }),
        Matter.Body.setVertices(
          this.boundEnd,
          Matter.Bodies.rectangle(
            this.width + 250,
            this.height / 2,
            500,
            4 * this.height,
            { isStatic: !0 }
          ).vertices
        )),
      this.boundBottom &&
        (Matter.Body.setPosition(this.boundBottom, {
          x: 0,
          y: this.height + 250,
        }),
        Matter.Body.setVertices(
          this.boundBottom,
          Matter.Bodies.rectangle(0, this.height + 250, 2 * this.width, 500, {
            isStatic: !0,
          }).vertices
        ));
  }
  updateBodies() {
    this.getUI("items").forEach((t, s) => {
      const e = this.bodies[s],
        i = t.getBoundingClientRect(),
        n = this.getOption("roundness") === "sharp" ? 0 : i.height / 2,
        r = Matter.Bodies.rectangle(
          e.position.x,
          e.position.y,
          i.width,
          i.height,
          { chamfer: { radius: n }, angle: e.angle }
        );
      if (
        (Matter.Body.setVertices(e, r.vertices),
        e.position.y > this.height &&
          Matter.Body.setPosition(e, { y: this.height / 2, x: e.position.x }),
        e.position.x > this.width)
      ) {
        var h = gsap.utils.random(i.width / 2, this.width - i.width / 2);
        Matter.Body.setPosition(e, { y: e.position.y, x: h });
      }
    });
  }
  startRain() {
    this.bodies.forEach((s, e) => {
      const i = setTimeout(() => {
        Matter.Body.setStatic(s, !1), clearTimeout(i);
      }, e * 80);
    });
    let t = !1;
    Matter.Events.on(this.runner, "tick", () => {
      !t &&
        this.bodies[this.bodies.length - 1].position.y >
          this.view.el.offsetHeight / 2 &&
        (this.createTopBound(),
        this.getOption("scrollGravity") && this.makeScrollGravity(),
        (t = !0));
    });
  }
  refresh() {
    if (
      this.height === this.view.el.offsetHeight &&
      this.width === this.view.el.offsetWidth
    )
      return !1;
    (this.height = this.view.el.offsetHeight),
      (this.width = this.view.el.offsetWidth);
    const t = setTimeout(() => {
      this.updateBoundries(), this.updateBodies(), clearTimeout(t);
    });
  }
  onWindowResize() {
    this.refresh();
  }
  destroy() {
    (this.runner.enabled = !1),
      Matter.Runner.stop(this.runner),
      super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidThrowableBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidThrowableBehavior));
