Amble.Class({

    name: 'Player',

    properties: {
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
            44,
            20323
        ],
        position: new Vec2(),
        color: "red"
    },

    start: function(self) { },

    update: function(self) {

        // console.log('player-update')

    }

});
