function getBrightness(t) {
  if (!t) return null;
  const i = t.indexOf("#") >= 0,
    a = t.indexOf("rgb") >= 0;
  if (i) {
    const r = t.length === 7,
      e = t.substr(1).match(r ? /(\S{2})/g : /(\S{1})/g);
    if (e)
      var s = parseInt(e[0] + (r ? "" : e[0]), 16),
        u = parseInt(e[1] + (r ? "" : e[1]), 16),
        h = parseInt(e[2] + (r ? "" : e[2]), 16);
  }
  if (a) {
    var n = t.match(/(\d+)/g);
    if (n)
      var s = n[0],
        u = n[1],
        h = n[2];
  }
  const f = Math.max(s, u, h),
    g = Math.min(s, u, h);
  return parseFloat(((f + g) / 2 / 255).toFixed(2));
}
function getAlpha(t) {
  if (t.startsWith("#")) {
    var i = parseInt(t.substring(1), 16),
      a = (i >> 24) & 255;
    return a / 255;
  } else if (t.startsWith("rgb")) {
    var s = t.substring(4).split(",");
    return s.length === 4 ? parseFloat(s[3]) : 1;
  } else if (t.startsWith("hsl")) {
    var s = t.substring(4).split(",");
    return s.length === 4 ? parseFloat(s[3]) : 1;
  } else return;
}
