export default class Enemy extends Phaser.Physics.Arcade.Sprite {


    constructor(scene, x, y, properties) {
        super(scene, x, y, "enemy_" + properties.type + "_move_right_SS");
        this.properties = properties;
        this.type = properties.type;
        this.anim_move_right_string = "anim_enemy_" + this.type + "_move_right";
        this.anim_shoot_right_string = "anim_enemy_" + this.type + "_shoot_right";
        this.anim_jump_right_string = "anim_enemy_" + this.type + "_jump_right";

        // Ajoute le joueur à la scène
        scene.add.existing(this);

        if (this.type !== 5) {
            this.setScale(0.75);
        }
        if (this.type == 5) {
            this.setScale(3);
        }
        // Physique du joueur
        scene.physics.world.enable(this); // Active la physique pour le joueur
        this.body.setCollideWorldBounds(true); // Empêche le joueur de sortir des limites du monde
        this.body.setBounce(0.2); // Rebondissement lorsque le joueur heurte quelque chose (facultatif)
        this.body.setGravityY(300); // Gravité du joueur (facultatif, dépend du jeu)

        this.projectileDuration = 1200;
        // Animer le joueur (s'il y a des animations à ajouter)

        // Configuration des touches de déplacement

        // Vitesse de déplacement du  sprite

        this.speed = 100; // Vous pouvez ajuster cette valeur selon vos besoins
        this.direction = "right";
        this.isShooting = false;
        this.isMoving = true;
        this.isJumping = false;
        this.isBerserk = false;
        this.invincible = false;

        // personnalisation des points de vie
        switch (this.type) {
            case 1:
                this.lifePoints = 4;
                break;
            case 2:
                this.lifePoints = 2;
                break;
            case 3:
                this.lifePoints = 4;
                break;
            case 4:
                this.lifePoints = 5;
                break;
            case 5:
                this.lifePoints = 15;
                this.speed = 0;
                break;
            default:
                this.lifePoints = 1;
        }
        // Autres initialisations ou logique spécifique au joueur

        // Créer un timer pour gérer les tirs aléatoires
        // cas du type ennemi 2 : 
        if (this.type == 2) {
            this.projectileSpeed = 400;
            this.timerShoot = this.scene.time.addEvent({
                delay: Phaser.Math.Between(1000, 3000), // Délai aléatoire initial entre les tirs
                callback: this.fireBullet,
                callbackScope: this,
                loop: true // Répéter le tir
            });
        }


        // ennemy type 3 : saut aléatoire
        if (this.type == 3) {
            this.monTimer = this.scene.time.addEvent({
                delay: Phaser.Math.Between(2000, 6000),
                callback: function () {
                    if (!this.active || !this.body) return; // Protection si l'ennemi est détruit
                    if (this.isJumping == false) {
                        this.setVelocityY(-250);
                        this.isJumping = true;
                    }
                },
                callbackScope: this,
                repeat: -1
            });
        }

        // ennemy type 4 : déplacement en tween
        if (this.type == 4) {
            this.body.setAllowGravity(false);
            this.body.allowGravity = false;

            this.destinationID = parseInt(this.properties.destination);

            this.scene.tweens.add({
                targets: this,
                x: this.scene.destinations[this.destinationID].x,
                y: this.scene.destinations[this.destinationID].y,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                delay: 0,  // on commence le déplacement immédiatement
                onYoyo: function () {
                    this.flipX = true;

                },
                onYoyoScope: this,
                onRepeat: function () {
                    this.flipX = false;
                },
                onRepeatScope: this,
            });
        }


        if (this.type == 5) {
            this.look = this.scene.time.addEvent({
                delay: Phaser.Math.Between(1000, 3000), // Délai aléatoire initial entre les tirs
                callback: function () { this.flipX = !this.flipX; },
                callbackScope: this,
                loop: true // Répéter le tir
            });
        }

    }

    initiateMobility() {
        if (this.type != 4) {
            this.setVelocityX(this.speed);
        }
    }

    update() {
        if (this.type == 3) {
            if (Math.abs(this.y - this.scene.player.y) < 500 &&
                Math.abs(this.x - this.scene.player.x) < 200) {
                this.isBerserk = true;
                if (this.x > this.scene.player.x) this.direction = "left";
                else this.direction = "right";
            }
            else {
                this.isBerserk = false;
            }
        }
        if (this.body.blocked.down == true) this.isJumping = false;

        if (this.type != 4 && this.type != 5) {
            if (this.direction == "left" && this.isJumping == false) {
                if (this.body.velocity.x == 0) this.setVelocityX(-40);
                if (this.isBerserk == true) {
                    this.setVelocityX(-120);
                }
                else {
                    var coords = this.getBottomLeft();
                    var tuileSuivante = this.scene.platform_layer.getTileAtWorldXY(
                        coords.x,
                        coords.y + 10
                    );

                    if (tuileSuivante == null || this.body.blocked.left) {
                        // on risque de marcher dans le vide, on tourne
                        this.direction = "right";
                        this.setVelocityX(40);
                    }
                }
            } else if (this.direction == "right" && this.isJumping == false) {
                if (this.body.velocity.x == 0) this.setVelocityX(40);
                if (this.isBerserk == true) {
                    this.setVelocityX(120);
                }
                else {
                    var coords = this.getBottomRight();

                    var tuileSuivante = this.scene.platform_layer.getTileAtWorldXY(
                        coords.x,
                        coords.y + 10
                    );

                    if (tuileSuivante == null || this.body.blocked.right) {
                        // on risque de marcher dans le vide, on tourne
                        this.direction = "left";
                        this.setVelocityX(-40);
                    }
                }
            }

            if (this.direction == "right") {
                this.flipX = false;
            }
            else {
                this.flipX = true;
            };
        }
        if (0 && this.isShooting == false) {
            this.isShooting = true;
            this.fire();
            this.scene.time.delayedCall(500, () => {
                this.isShooting = false;
            });
        }
        /*
                        this.play("anim_tourne_gauche", true);
        
           
        }
        if (this.body.onFloor()) {
            this.isJumping = false;
        }
        // Saut
        if (0 && this.body.onFloor()) {
            this.isJumping = true;
            this.body.setVelocityY(-400);
        }
        un_ennemi.play("anim_ennemi_1tourne_droite", true);
        
        
        */
        // animations

        if (this.isShooting) {
            this.anims.play(this.anim_shot_right_string, true);
        } else if (this.isJumping) {
            this.anims.play(this.anim_jump_right_string, true);
        } else {
            this.anims.play(this.anim_move_right_string, true);
        }

    }
    decreaseHealthPoints() {
        this.lifePoints--;
        if (this.lifePoints == 0) {
            if (this.type == 2 && this.timerShoot) {
                this.timerShoot.remove();
            }
            if (this.type == 3 && this.monTimer) {
                this.monTimer.remove();
            }
            this.destroy();
        }
    }

    getHealthPoints() {
        return this.lifePoints;
    }

    isDead() {
        return this.lifePoints == 0;
    }


    fireBullet() {

        // Vérifier si l'ennemi regarde le joueur 
        if ((this.scene.player.x < this.x && this.direction == "left") ||
            (this.scene.player.x > this.x && this.direction == "right")
        ) {
            // Créer le projectile
            var projectile = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
            projectile.setDepth(200);
            this.scene.grp_bullet_enemy.add(projectile);
            projectile.body.allowGravity = false;
            projectile.setVelocityX(this.projectileSpeed); // Définir la vitesse du projectile

            // Si le joueur est orienté vers la gauche, inverser la direction du projectile
            if (this.flipX) {
                projectile.flipX = true;
                projectile.setVelocityX(-this.projectileSpeed);
            }

            // Détruire le projectile après un certain délai
            this.scene.time.delayedCall(this.projectileDuration, function () {
                projectile.destroy();
            }, [], this);
            // Mettre à jour le délai du timer pour la prochaine itération
            this.timerShoot.delay = Phaser.Math.Between(1000, 3000);
        }
    }
    setInvincible() {
        this.invincible = true;
        this.setTint("0x00FF00")
        // Activer l'animation de clignotement
        this.blinkAnimation = this.scene.tweens.add({
            targets: this,
            alpha: 0.3, // Baisser l'opacité à 50%
            duration: 150, // Durée d'une itération de clignotement
            ease: 'Linear',
            repeat: -1, // Répéter indéfiniment
            yoyo: true // Inverser l'animation (pour que le sprite clignote)
        });

        // Timer pour revenir à l'état normal après X millisecondes
        this.scene.time.delayedCall(250, () => {
            this.invincible = false;
            this.clearTint();
            this.alpha = 1; // Remettre l'opacité à 100%
            this.blinkAnimation.stop(); // Arrêter l'animation de clignotement
        }, [], this);
    }

    isInvincible() {
        return this.invincible;
    }

}
