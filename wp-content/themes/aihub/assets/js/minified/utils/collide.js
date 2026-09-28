function isColliding(i, o) {
  return !(i.bottom < o.y || i.y > o.bottom || i.right < o.x || i.x > o.right);
}
