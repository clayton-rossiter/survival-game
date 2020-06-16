import Player from "./Player.js";
import Resource from "./Resource.js";
import Enemy from "./Enemy.js";

export default class MainScene extends Phaser.Scene {
    constructor(){
        super("MainScene");
        this.enemies = [];
    }

    preload(){
        Player.preload(this);
        Resource.preload(this);
        Enemy.preload(this);
        this.load.image('tiles','assets/images/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map','assets/images/map.json');
    }

    create(){
        //map
        const map = this.make.tilemap({key:'map'});
        this.map = map;
        const tileset = map.addTilesetImage('RPG Nature Tileset','tiles',32,32,0,0);
        const layer1 = map.createStaticLayer('Tile Layer 1',tileset,0,0);
        const layer2 = map.createStaticLayer('Tile Layer 2',tileset,0,0);
        layer1.setCollisionByProperty({collides:true});
        this.matter.world.convertTilemapLayer(layer1);
        //resources
        this.map.getObjectLayer('Resources').objects.forEach(resource =>new Resource({scene:this,resource}));
        //enemies
        this.map.getObjectLayer('Enemies').objects.forEach(enemy => this.enemies.push(new Enemy({scene:this,enemy})));
        //main player
        this.player = new Player({scene:this,x:20,y:20,texture:'player',frame:'thief_idle_1'});
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })
    }

    update(){
        this.enemies.forEach(enemy => enemy.update());
        this.player.update();
    }
}