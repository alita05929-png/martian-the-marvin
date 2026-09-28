class LiquidBaseModel extends Backbone.Model {}
(LiquidBaseModel.prototype.emittedEvents = []),
  (LiquidBaseModel.prototype.trigger = function (t, ...e) {
    return (
      t.includes(":") &&
        !this.emittedEvents.includes(t) &&
        this.emittedEvents.push(t),
      Backbone.Model.prototype.trigger.call(this, t, ...e)
    );
  }),
  (LiquidBaseModel.urlRoot =
    LiquidBaseModel.url =
    LiquidBaseModel.save =
    LiquidBaseModel.sync =
    LiquidBaseModel.fetch =
      _.noop);
