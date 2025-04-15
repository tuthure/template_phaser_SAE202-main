
export default class accueil extends Phaser.Scene {
    // constructeur de la classe
    constructor() {
        super({
            key: "accueil" //  ici on précise le nom de la classe en tant qu'identifiant
        });

    }

    preload() {

    }

    create(){

    const screen_welcome = this.add.image(this.game.config.width/2, this.game.config.height/2, "screen_welcome"); // Réglez la valeur selon vos besoins

    var arrayButtons =[];
    const bouton_credits = this.add.image(this.game.config.width/2 + 200, 600, "button_credits"); // Réglez la valeur selon vos besoins
    const bouton_controls = this.add.image(this.game.config.width/2 - 200, 600, "button_controls"); // Réglez la valeur selon vos besoins
    const bouton_play = this.add.image(this.game.config.width/2 + 10, 400, "button_play"); // Réglez la valeur selon vos besoins
    
    var arrayButtons =[bouton_credits,bouton_controls, bouton_play];

    arrayButtons.forEach( (button) => {
    button.setInteractive();    
    button.on("pointerover", () => {
      button.setScale(1.2);
      button.setTint(0xFF0000);
    });
    button.on("pointerout", () => {
      button.setScale(1.0);
      button.clearTint();
    });
    })

    bouton_play.on("pointerup", () => {
      this.scene.stop("pagedelancement");
      this.scene.start("story");
    });
    bouton_credits.on("pointerup", () => {
      this.scene.switch("credits");
    });
     bouton_controls.on("pointerup", () => {
      this.scene.switch("controls");
    });
    }

    udpate() {

    }

}