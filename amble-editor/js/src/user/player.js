Amble.Class({

    name: 'Player',

    properties: {
        position: new Vec2(),
        age: 0,
        year: 1000,
        dead: false,
        positions: [
            new Vec2(123123123,44444),
            new Vec2(123,44),
            new Vec2(1,2323)
        ],
        pp: [
            44444,
            true,
            'red'
        ],
        color: "red"
    },

    start: function(self) {
        console.log(this.age)

    },

    update: function(self) {


    }

});
