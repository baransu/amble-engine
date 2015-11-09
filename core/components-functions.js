var COMPONENTS_FUNCTIONS = {}

COMPONENTS_FUNCTIONS.consoleLog  = function(data, output) {
    console.log(data);
    output(data);
}

COMPONENTS_FUNCTIONS.add  = function(value1, value2, sum) {
    sum(value1 + value2);
}

COMPONENTS_FUNCTIONS.subtract  = function(value1, value2, difference) {
    difference(value1 - value2);
}

COMPONENTS_FUNCTIONS.multiply  = function(value1, value2, product) {
    product(value1 * value2);
}

COMPONENTS_FUNCTIONS.divide  = function(value1, value2, quotient) {
    quotient(value1/value2);
}

COMPONENTS_FUNCTIONS.return10  = function(input, out) {
    out(10);
}

COMPONENTS_FUNCTIONS.OnStart  = function(out) {
    out(null);
}

COMPONENTS_FUNCTIONS.OnUpdate  = function(out) {
    out(null);
}

module.exports = COMPONENTS_FUNCTIONS;
