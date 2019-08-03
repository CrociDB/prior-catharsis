class GameplayState {
    enter(manager) {
        this.manager = manager;

        this.speed = .3;
        this.dist = 12;

        this.cameraPos = new Vec3(-5, 10, -20);
        this.shipPos = new Vec3(0, 2.6, 0);

        let shader = this.manager.params.shader;
        let shaderCodes = this.manager.params.shaderCodes;
        shader.setShaders(shaderCodes.mainVertex, shaderCodes.gameFragment);

        this.state = new StateManager(this.params);
        this.state.game = this;
        this.state.setState(new GameLevel());
    }

    update() {
        this.state.update();
    }

    exit() {
    }
}

// Main gameplay
class GameLevel {
    enter(manager) {
        this.manager = manager;

        this.obstacles = [
            new Vec3(10, 5, 5),
            new Vec3(0, 5, 10),
            new Vec3(-10, 5, 15) ];
    }

    update() {
        let game = this.manager.game;
        let gl = game.manager.params.gl;
        let input = game.manager.params.input;
        let dialog = game.manager.params.dialog;
        let shader = game.manager.params.shader;

        
        game.dist += input.mouse.dy * .01;
        game.dist = Math.min(20, Math.max(11, game.dist));
        
        let angle = input.mouse.x * -.001;
        
        game.cameraPos = game.shipPos.add(new Vec3(0, 0, -game.dist));
            
        let dir = game.shipPos.sub(game.cameraPos).norm;
        let sidedir = dir.cross(Vec3.up);

        if (input.key(Input.A)) {
            game.shipPos = game.shipPos.add(Vec3.right.muls(-game.speed));
        }
        else if(input.key(Input.D)) {
            game.shipPos = game.shipPos.add(Vec3.right.muls(game.speed));
        }
        
        if (input.key(Input.W)) {
            game.shipPos = game.shipPos.add(Vec3.forward.muls(game.speed));
        }
        else if (input.key(Input.S)) {
            game.shipPos = game.shipPos.add(Vec3.forward.muls(-game.speed));
        }

        if (input.blink == 1) {
            console.log("LEFT");
            dialog.show("LEFT");
        } else if (input.blink == 2) {
            console.log("RIGHT");
            dialog.show("RIGHT");
        }

        game.cameraPos = game.cameraPos.add(Vec3.up.muls(game.dist - 5));
        
        // Send Uniforms
        shader.uniformv("camera_pos", game.cameraPos);
        shader.uniformv("ship_pos", game.shipPos);
        shader.uniform1f("ship_angle", angle);
        
        for (let i = 0; i < this.obstacles.length; i++) {
            shader.uniformv("obstacle" + (i + 1), this.obstacles[i]);
        }
    }

    exit() {
        
    }
}
