var COMPONENTS_FUNCTIONS = {}

COMPONENTS_FUNCTIONS.consoleLog  = function(data) {
    console.log(data.value);
    return 0;
}

COMPONENTS_FUNCTIONS.add  = function(a, b, c) {
    c.value = a.value + b.value;
    return 0;
}

COMPONENTS_FUNCTIONS.subtract  = function(a, b, c) {
    c.value = a.value - b.value;
    return 0;
}

COMPONENTS_FUNCTIONS.multiply  = function(a, b, c) {
    c.value = a.value * b.value;
    return 0;
}

COMPONENTS_FUNCTIONS.divide  = function(a, b, c) {
    c.value = a.value/b.value;
    return 0;
}

COMPONENTS_FUNCTIONS.branch  = function(condition) {
    if(condition.value) {
        return 0; //out node id first (true)
    } else {
        return 1; //out node id second (false)
    }
}

COMPONENTS_FUNCTIONS.OnStart  = function() {
    return 0;
}

COMPONENTS_FUNCTIONS.OnUpdate  = function() {
    return 0;
}

module.exports = COMPONENTS_FUNCTIONS;
