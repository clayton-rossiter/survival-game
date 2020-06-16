export default class Resource extends Phaser.Physics.Matter.Sprite {
    static preload (scene){
        // non-terrain resources
        scene.load.atlas('resources','assets/images/resources.png','assets/images/resources_atlas.json');
        // sound effects
        scene.load.audio('tree','assets/audio/tree.mp3');
        scene.load.audio('rock','assets/audio/rock.mp3');
        scene.load.audio('bush','assets/audio/bush.mp3');
    }

    constructor(data){
        let{scene,resource} = data;
        super(scene.matter.world, resource.x, resource.y, 'resources', resource.type);
        this.scene.add.existing(this);

        // load sounds
        this.name = resource.type;
        this.sound = this.scene.sound.add(this.name);

        // default health for each resource
        this.health = 5;

        // load resources
        let yOrigin = resource.properties.find(p=>p.name == 'yOrigin').value;
        this.y = this.y + this.height * (yOrigin - 0.5);

        // resource colliders and sensors
        const{Body,Bodies} = Phaser.Physics.Matter.Matter;
        var circleCollider = Bodies.circle(this.x, this.y,12,{isSensor:false,label:'collider'});
        this.setExistingBody(circleCollider);
        this.setStatic(true);
        this.setOrigin(0.5, yOrigin);
    }

    // when resource is destroyed
    get dead(){
        return this.health <= 0;
    }
    // load sound when hit confirmed
    hit = () => {
        if(this.sound) this.sound.play();
        this.health--;
    }
}