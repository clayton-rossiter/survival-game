import MatterEntity from "./MatterEntity.js";

export default class Player extends MatterEntity{
    constructor(data) {
        // add scene terrain
        // let {scene,x,y,texture,frame} = data;
        // super(scene.matter.world,x,y,texture,frame);
        super({...data, health:2, drops:[], name:'player'});
        this.touching = []; // blank array for touching elements
        // this.scene.add.existing(this);

        // add character weapon
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene,0,0,'items',162);
        this.spriteWeapon.setScale(0.75);
        this.spriteWeapon.setOrigin(0.25,0.75);
        this.scene.add.existing(this.spriteWeapon);

        const{Body,Bodies} = Phaser.Physics.Matter.Matter;
        var playerCollider = Bodies.circle(this.x,this.y,12,{isSensor:false,label:'playerColldier'});
        var playerSensor = Bodies.circle(this.x,this.y,24,{isSensor:true,label:'playerSensor'});
        const compoundBody = Body.create({
            parts:[playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        // close object collision, e.g. whacking stuff, pickups
        this.createMiningCollisions(playerSensor);
        this.createPickupCollisions(playerCollider);

        // orientation of player/weapon
        this.scene.input.on('pointermove', pointer => this.setFlipX(pointer.worldX < this.x));
    }

    static preload(scene){
        scene.load.atlas('player', 'assets/images/player.png', 'assets/images/player_atlas.json');
        scene.load.animation('player_anim', 'assets/images/player_anim.json');
        scene.load.spritesheet('items', 'assets/images/items.png',{frameWidth:32, frameHeight:32});
    }

    // get velocity(){
    //     return this.body.velocity;
    // }

    update(){
        const speed = 5;
        let playerVelocity = new Phaser.Math.Vector2();
        if(this.inputKeys.left.isDown){
            playerVelocity.x = -1;
        } else if (this.inputKeys.right.isDown) {
            playerVelocity.x = 1;
        } 
        if(this.inputKeys.up.isDown){
            playerVelocity.y = -1;
        } else if(this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
        } 
        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y);
        if(Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play('player_walk', true);
        } else {
            this.anims.play('player_idle', true);
        }
        // update weapon movement
        this.spriteWeapon.setPosition(this.x, this.y);
        this.weaponRotate();
    }

    weaponRotate(){
        let pointer = this.scene.input.activePointer;
        if (pointer.isDown){
            this.weaponRotation+=6;
        } else {
            this.weaponRotation = 0;
        }
        // reset angle of pickaxe
        if(this.weaponRotation > 100){
            this.whackStuff();
            this.weaponRotation = 0;
        }
        
        // flip if player has flipped
        if(this.flipX){
            this.spriteWeapon.setAngle(-this.weaponRotation - 90);
        } else {
            this.spriteWeapon.setAngle(this.weaponRotation);
        }
    }

    createMiningCollisions(playerSensor){
        this.scene.matterCollision.addOnCollideStart({
            objectA:[playerSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
            },
            context: this.scene,
        });
        // only add collider if not already included
        this.scene.matterCollision.addOnCollideEnd({
            objectA:[playerSensor],
            callback: other => {
                this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
            },
            context: this.scene,
        });
    }

    whackStuff(){
        this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
        this.touching.forEach(gameObject => {
            gameObject.hit();
            if (gameObject.dead){
                gameObject.destroy();
            }
        })
    }

    createPickupCollisions(playerCollider){
        this.scene.matterCollision.addOnCollideStart({
            objectA:[playerCollider],
            callback: other => {
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
            },
            context: this.scene,
        });
        
        this.scene.matterCollision.addOnCollideActive({
            objectA:[playerCollider],
            callback: other => {
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
            },
            context: this.scene,
        });
    }
}