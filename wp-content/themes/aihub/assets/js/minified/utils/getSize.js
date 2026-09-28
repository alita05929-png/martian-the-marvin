const measurements = [
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "borderLeftWidth",
  "borderRightWidth",
  "borderTopWidth",
  "borderBottomWidth",
];
function getZeroSize() {
  const r = measurements.length;
  for (
    var i = {
        width: 0,
        height: 0,
        innerWidth: 0,
        innerHeight: 0,
        outerWidth: 0,
        outerHeight: 0,
      },
      e = 0;
    e < r;
    e++
  ) {
    var t = measurements[e];
    i[t] = 0;
  }
  return i;
}
function getStyleSize(r) {
  var i = parseFloat(r),
    e = r.indexOf("%") == -1 && !isNaN(i);
  return e && i;
}
function getSize(r) {
  if (!r) return {};
  const i = getComputedStyle(r);
  if (i.display === "none") return getZeroSize();
  const e = measurements.length,
    t = {};
  (t.width = r.offsetWidth), (t.height = r.offsetHeight);
  for (var d = 0; d < e; d++) {
    var h = measurements[d],
      a = i[h],
      n = parseFloat(a);
    t[h] = isNaN(n) ? 0 : n;
  }
  var s = t.paddingLeft + t.paddingRight,
    f = t.paddingTop + t.paddingBottom,
    p = t.marginLeft + t.marginRight,
    m = t.marginTop + t.marginBottom,
    W = t.borderLeftWidth + t.borderRightWidth,
    v = t.borderTopWidth + t.borderBottomWidth,
    g = getStyleSize(i.width);
  g !== !1 && (t.width = g);
  var o = getStyleSize(i.height);
  return (
    o !== !1 && (t.height = o),
    (t.innerWidth = t.width - (s + W)),
    (t.innerHeight = t.height - (f + v)),
    (t.outerWidth = t.width + p),
    (t.outerHeight = t.height + m),
    t
  );
}
