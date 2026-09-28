class LiquidCarouselAutoplayBehavior extends LiquidBehavior {
  static behaviorName = "liquidCarouselAutoplay";
  static viewEvents = {
    "carousel:activate": [
      { "carousel:uiChange": "stopPlayer" },
      { "carousel:pointerDown": "stopPlayer" },
      "onCarouselActivate",
    ],
  };
  options() {
    return { autoplayTimeout: 3e3, pauseAutoPlayOnHover: !1 };
  }
  get bindToThis() {
    return ["onCarouselActivate", "onmouseenter", "onmouseleave", "stopPlayer"];
  }
  onCarouselActivate() {
    (this.playerState = "stopped"),
      (this.onTick = () => {
        this.view.trigger("carousel:next", !0);
      }),
      (this.onVisibilityChange = this.visibilityChange.bind(this)),
      (this.onVisibilityPlay = this.visibilityPlay.bind(this)),
      this.activatePlayer();
  }
  play() {
    if (this.playerState === "playing") return;
    if (document.hidden) {
      document.addEventListener("visibilitychange", this.onVisibilityPlay);
      return;
    }
    (this.playerState = "playing"),
      document.addEventListener("visibilitychange", this.onVisibilityChange),
      this.tick();
  }
  tick() {
    if (this.playerState !== "playing") return;
    let e = this.getOption("autoplayTimeout");
    this.clearPlayer(),
      (this.timeout = setTimeout(() => {
        this.onTick(), this.tick();
      }, parseFloat(e)));
  }
  stop() {
    (this.playerState = "stopped"),
      this.clearPlayer(),
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
  clearPlayer() {
    clearTimeout(this.timeout);
  }
  pause() {
    this.playerState === "playing" &&
      ((this.playerState = "paused"), this.clearPlayer());
  }
  unpause() {
    this.playerState === "paused" && this.play();
  }
  visibilityChange() {
    let e = document.hidden;
    this[e ? "pause" : "unpause"]();
  }
  visibilityPlay() {
    this.play(),
      document.removeEventListener("visibilitychange", this.onVisibilityPlay);
  }
  activatePlayer() {
    this.play(), this.view.el.addEventListener("mouseenter", this.onmouseenter);
  }
  playPlayer() {
    this.play();
  }
  stopPlayer() {
    this.stop();
  }
  pausePlayer() {
    this.pause();
  }
  unpausePlayer() {
    this.unpause();
  }
  onmouseenter() {
    this.getOption("pauseAutoPlayOnHover") &&
      (this.pause(),
      this.view.el.addEventListener("mouseleave", this.onmouseleave));
  }
  onmouseleave() {
    this.unpause(),
      this.view.el.removeEventListener("mouseleave", this.onmouseleave);
  }
  destroy() {
    this.clearPlayer(), super.destroy();
  }
}
typeof window < "u" &&
  (window.liquid?.app
    ? window.liquid?.app?.model?.set("loadedBehaviors", [
        ...window.liquid.app.model.get("loadedBehaviors"),
        LiquidCarouselAutoplayBehavior,
      ])
    : window.liquid?.loadedBehaviors?.push(LiquidCarouselAutoplayBehavior));
