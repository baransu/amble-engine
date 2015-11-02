var COMPONENTS_FUNCTIONS = {}

COMPONENTS_FUNCTIONS.MyFunction  = function(data, output) {
    console.log(data);
    output(data);
}

module.exports = COMPONENTS_FUNCTIONS;
