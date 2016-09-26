/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="userVariableHost.js" />
/// <reference path="sprite.js" />
/// <reference path="imageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="broadcastManager.js" />
/// <reference path="collisionManager.js" />
/// <reference path="soundManager.js" />
/// <reference path="stopwatch.js" />
'use strict';

PocketCode.Model.Scene = (function () {
    Scene.extends(PocketCode.UserVariableHost, false);

    function Scene() {
        //todo id background sprite
        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._physicsWorld = new PocketCode.PhysicsWorld(this);

        //events
        this._onProgramStart = new SmartJs.Event.Event(this);
        this._onSpriteTabbedAction = new SmartJs.Event.Event(this);

        this._sprites = [];
    }

    //properties
    Object.defineProperties(Scene.prototype, {
        executionState:{
           get: function () {
               return this._executionState;
           }
        },
        id: {
           get: function () {
               return this._id;
           }
        },
        name: {
           get: function () {
                return this._name;
            }
        },
        sprites: {
            get: function () {
                return this._sprites;
            }
        },
        background: {
            get: function () {
                return this._background;
            }
        },
        collisionManager: {
            get: function () {
                return this._collisionManager;
            },
        },
        physicsWorld: {
            get: function () {
                return this._physicsWorld;
            }
        },
        renderingImages: {
            get: function () {
                var imgs = [this.background.renderingImage],
                    sprites = this.sprites;
                for (var i = 0, l = sprites.length; i < l; i++)
                    imgs.push(sprites[i].renderingImage);

                return imgs;
            }
        },
    });

    Object.defineProperties(Scene.prototype, {
        onProgramStart: {
            get: function () { return this._onProgramStart; },
        },
        onSpriteTabbedAction: {
            get: function () { return this._onSpriteTabbedAction; },
        },
    });

    //methods
    Scene.prototype.merge({
        init: function (spriteFactory, projectTimer, spriteOnExecutedHandler, gameEngine, device, soundManager) { //todo move unnecessary parameters to scene directly
            this._gameEngine = gameEngine;
            this._spriteOnExecutedHandler = spriteOnExecutedHandler;
            this._spriteFactory = spriteFactory;
            this._collisionManager = undefined;
            this._device = device;
            this._soundManager = soundManager;

            if (this._background)
                this._background.dispose();// = undefined;
            this._originalSpriteOrder = [];
            this._sprites.dispose();

           // this._sprites = [];
            this._projectTimer = projectTimer;
            this._originalSpriteOrder = [];
        },
        start: function () {
            if (this._executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (this._executionState === PocketCode.ExecutionState.PAUSED)
                return this.resume();

            this._projectTimer.start();
            this._executionState = PocketCode.ExecutionState.RUNNING;
            //^^ we create them onProjectLoaded at the first start
            this._onProgramStart.dispatchEvent();    //notifies the listerners (script bricks) to start executing
            if (!this._background)
                this._spriteOnExecutedHandler();    //make sure an empty program terminates
        },
        load: function (jsonScene) {
            if (!jsonScene)
                throw new Error('invalid argument: jsonScene');

            this._name = jsonScene.name;
            this._id = jsonScene.id;
            this._originalScreenWidth = jsonScene.screenWidth;
            this._originalScreenHeight = jsonScene.screenHeight;
            this._collisionManager = new PocketCode.CollisionManager(this._originalScreenWidth, this._originalScreenHeight);

            if (jsonScene.background)
                this._loadBackground(jsonScene.background);

            this._loadSprites(jsonScene.sprites);
        },
        stop: function (){
            if (this._executionState === PocketCode.ExecutionState.STOPPED)
                return;

            this._projectTimer.stop();
            if (this._background) {
                this._background.stopAllScripts();
            }
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].stopAllScripts();
            }

            this._executionState = PocketCode.ExecutionState.STOPPED;
        },
        pause: function (){
            if (this._executionState !== PocketCode.ExecutionState.RUNNING)
                return false;

            this._projectTimer.pause();
            this._soundManager.pauseSounds();
            if (this._background)
                this._background.pauseScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].pauseScripts();
            }
            this._executionState = PocketCode.ExecutionState.PAUSED;
            return true;
        },
        resume: function () {
            if (this._executionState !== PocketCode.ExecutionState.PAUSED)
                return;

            //todo resume event?

            this._projectTimer.resume();
            this._soundManager.resumeSounds();
            if (this._background)
                this._background.resumeScripts();

            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].resumeScripts();
            }
            this._executionState = PocketCode.ExecutionState.RUNNING;
        },
        initializeSprites: function () {
            var bg = this._background,
                sprites = this._sprites;

            if (bg) {
                bg.initLooks();
                bg.init();
            }
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprites[i].initLooks();
                sprites[i].init();
            }

        },
        reinitializeSprites: function () {
            var bg = this._background;
            if (bg) {
                bg.init();
            }

            this._sprites = this._originalSpriteOrder;  //reset sprite order
            this._collisionManager.sprites = this._originalSpriteOrder;

            var sprites = this._sprites,
                sprite;
            for (var i = 0, l = sprites.length; i < l; i++) {
                sprite = sprites[i];
                sprite.init();
            }
        },
        handleUserAction: function (e) {
            switch (e.action) {
                case PocketCode.UserActionType.SPRITE_CLICKED:
                    var sprite = this.getSpriteById(e.targetId);
                    if (sprite)
                        this._onSpriteTabbedAction.dispatchEvent({ sprite: sprite });
                    break;
                default:
                    this._device.updateTouchEvent(e.action, e.id, e.x, e.y);
            }
        },
        getSpriteById: function (spriteId) {
            var sprites = this._sprites;
            for (var i = 0, l = sprites.length; i < l; i++) {
                if (sprites[i].id === spriteId)
                    return sprites[i];
            }

            if (this._background && spriteId == this._background.id)
                return this._background;

            throw new Error('unknown sprite with id: ' + spriteId);
        },
        setGravity: function (x, y) {
            this._physicsWorld.setGravity(x, y);
        },
        _loadSprites: function (sprites) {
            //todo type check
            var sp = sprites;
            var sprite, i, l;
            for (i = 0, l = sp.length; i < l; i++) {
                sprite = this._spriteFactory.create(sp[i]);
                sprite.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this._gameEngine)); //todo
                this._sprites.push(sprite);
                this._originalSpriteOrder.push(sprite);
            }
            this._collisionManager.sprites = this._sprites;
        },
        _loadBackground: function (background) {
            this._background = this._spriteFactory.create(background);
            this._background.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._spriteOnExecutedHandler, this._gameEngine)); //todo
            this._collisionManager.background = this._background;
        },
        setBackground: function (lookId) {
            return this.background.setLook(lookId);
        },
    });

    return Scene;
})();