var Amble = require('../../core/amble.js');

var Enemy = function(args){
    /* set variable there */
}
Enemy.prototype = {
    /* used for initialization */
    start: function (self){
        // console.log('enemy-start');
    },
    /* used for update */
    update: function(self){
        if(Amble.Input.keyIsPressed(65)){
            //left
            self.transform.position.x -= 300 * Amble.Time.deltaTime;
        }
        if(Amble.Input.keyIsPressed(68)){
            //right
            self.transform.position.x += 300 * Amble.Time.deltaTime;
        }
        if(Amble.Input.keyIsPressed(87)){
            //up
            self.transform.position.y -= 300 * Amble.Time.deltaTime;
        }
        if(Amble.Input.keyIsPressed(83)){
            // down
            self.transform.position.y += 300 * Amble.Time.deltaTime;
        }
    }
}
module.exports = Enemy;
