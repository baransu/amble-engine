var ComponentsFunction = {}

ComponentsFunction.consoleLog  = function(data) {
    console.log(data.value);
    return 0;
}

ComponentsFunction.add  = function(a, b, c) {
    c.value = a.value + b.value;
    return 0;
}

ComponentsFunction.subtract  = function(a, b, c) {
    c.value = a.value - b.value;
    return 0;
}

ComponentsFunction.multiply  = function(a, b, c) {
    c.value = a.value * b.value;
    return 0;
}

ComponentsFunction.divide  = function(a, b, c) {
    c.value = a.value/b.value;
    return 0;
}

ComponentsFunction.branch  = function(condition) {
    if(condition.value) {
        return 0; //out node id first (true)
    } else {
        return 1; //out node id second (false)
    }
}

ComponentsFunction.OnStart  = function() {
    return 0;
}

ComponentsFunction.OnUpdate  = function() {
    return 0;
}

module.exports = ComponentsFunction;
