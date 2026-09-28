function getElementFromString(e, m) {
  let o;
  return (
    e === "html"
      ? (o = document.documentElement)
      : e === "body"
      ? (o = document.body)
      : e && m
      ? (o = m.querySelector(e))
      : (o = document.querySelector(e)),
    o
  );
}
