var Vec3 = (function() {

  var Vec3 = function Vec3(x, y, z) {
    if(typeof x == 'object') {
      this.x = x['x'] || 0;
      this.y = x['y'] || 0;
      this.z = x['z'] || 0;
    } else if(Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2];
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
  };

  Vec3.prototype.copy = function copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  };

  Vec3.prototype.add = function add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  };

  Vec3.prototype.sub = function sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  };

  Vec3.prototype.dot = function dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  };

  Vec3.prototype.length2 = function length2() {
    return this.dot(this);
  };

  Vec3.prototype.length = function length() {
    return Math.sqrt(this.length2());
  };

  Vec3.prototype.normalize = function normalize() {
    var l = this.length();
    if(l > 0) {
      this.x = this.x / l;
      this.y = this.y / l;
      this.z = this.z / l;
    }
    return this;
  };

  return Vec3;

}());
