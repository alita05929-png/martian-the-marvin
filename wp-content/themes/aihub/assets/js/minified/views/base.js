const BackboneView = Backbone.NativeViewMixin
  ? Backbone.View.extend(Backbone.NativeViewMixin)
  : Backbone.View;
class LiquidBaseView extends BackboneView {
  destroy() {
    this.el.removeAttribute("data-lqd-model-cid"),
      this.el.removeAttribute("data-lqd-view-cid"),
      this.model.get("ghost")?.el?.remove(),
      this.model.unset("ghost"),
      this.model.get("behaviors")?.forEach((e) => {
        e.destroy();
      }),
      this.off(),
      this.model.off(),
      this.model.stopListening(),
      this.model.destroy();
  }
}
