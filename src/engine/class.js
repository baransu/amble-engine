var CLASSES = [];
var Class = (function() {

  var Class = function Class(body) {

    if(!body) {
        // Amble.app.debug.error('Wrong class code!')
        throw new Error('Wrong class code!');
    } else if(typeof body !== 'object') {
        // Amble.app.debug.error('Class must be an object!')
        throw new Error('Class must be an object!');
    } else if(!body.name) {
        // Amble.app.debug.error('Class must have a name!')
        throw new Error('Class must have a name!');
    }

    var _class = {
      name: body.name,
      _options: body._options,
      properties: [],
    }

    this.validate = function validate(obj, name) {
      if(typeof obj == 'string' || typeof obj == 'number' || typeof obj == 'boolean') {
        var value = obj;
        obj = {
          name: name,
          value: value,
          type: value.constructor
        };
      } else if(obj == null) {
        obj = {
          name: name,
          value: null,
          type: Object
        };
      } else {

        if(typeof obj.value === 'undefined' && typeof obj.type === 'undefined') {
          var val = obj;
          obj = {
            value: val,
            type: val.constructor
          };
        } else if( typeof obj.value === 'undefined') {
          obj.value == null;
        }

        if(typeof obj.type === 'undefined') {
          obj.type = obj.value.constructor;
        }


        if(typeof obj.name === 'undefined') {
          obj.name = name;
        }

      }

      return obj;
    };

    for(var i in body.properties) {
      body.properties[i] = this.validate(body.properties[i], i)
      body.properties[i] = Utils.stringify(body.properties[i]);
    }

    for(var i in body.properties) {
      _class.properties.push(body.properties[i])
    }

    // TODO: extend option
    for(var i in body) {
      if(i != 'name' && i != 'properties' && typeof body[i] === 'function') {
        _class[i] = body[i];
      }
    }

    var cl = CLASSES.find( function(c) { return c.name == _class.name });
    if(cl) {
      var index = CLASSES.indexOf(cl);
      CLASSES.splice(index, 1);
    }

    CLASSES.push(_class);

    console.log(CLASSES)

  };

  return Class;

}());
