window.Vec2 = (function(){

    var Vec2 = {}

    Vec2 = function Vec2(x, y) {
        if(Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
        } else {
            this.x = x || 0;
            this.y = y || 0;
        }
    };

    Vec2.prototype.copy = function( vector ) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    };

    Vec2.prototype.add = function( vector ) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };

    Vec2.prototype.sub = function( vector ) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };

    Vec2.prototype.dot = function( vector ) {
        return this.x * vector.x + this.y * vector.y;
    };

    Vec2.prototype.length2 = function() {
        return this.dot(this);
    };

    Vec2.prototype.length = function() {
        return Math.sqrt(this.length2());
    };

    Vec2.prototype.normalize = function() {
        var l = this.length();
        if(l > 0) {
            this.x = this.x / l;
            this.y = this.y / l;
        }
        return this;
    };

    return Vec2;

}());

module.exports = window.Vec2;
