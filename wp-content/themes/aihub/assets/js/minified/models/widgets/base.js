class LiquidWidgetBaseModel extends LiquidBaseModel {
  get defaults() {
    return { ...super.defaults, layoutRegion: "liquidPageContent" };
  }
}
