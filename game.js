var canvas;
var gl;

// Tools

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function initWebGL()
{
    canvas = document.getElementById("game-canvas");
    gl = canvas.getContext("webgl2");

    let width = canvas.width;
    let height = canvas.height;

    // Getting shaders
    let vertexCode = document.getElementById("game-vertex-shader").text;
    let fragmentCode = document.getElementById("game-fragment-shader").text;
    let fragmentCommonCode = document.getElementById("game-fragment-common").text;

    fragmentCode = fragmentCode.replace("#include \"common.frag\"", fragmentCommonCode);

    let vsh = createShader(gl, gl.VERTEX_SHADER, vertexCode);
    let fsh = createShader(gl, gl.FRAGMENT_SHADER, fragmentCode);

    let program = createProgram(gl, vsh, fsh);

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        -1, -1, 0, 0, 0,
        -1, 1, 0, 0, 1,
        1, 1, 0, 1, 1,

        1, 1, 0, 1, 1,
        1, -1, 0, 1, 0,
        -1, -1, 0, 0, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    let timeUniform = gl.getUniformLocation(program, "time");
    let aspectRatioUniform = gl.getUniformLocation(program, "aspectRatio");
    
    let input = new Input(canvas);

    let stateManager = new StateManager({
        gl: gl, 
        program: program, 
        input: input });
    stateManager.setState(new GameplayState());

    let loop = (timestamp) => {
        // Render
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(0, 
            3, gl.FLOAT, false, 5 * 4, 0);
            
        gl.vertexAttribPointer(1, 
            2, gl.FLOAT, false, 5 * 4, 3 * 4);

        stateManager.update();

        // Default uniform data
        gl.uniform1f(timeUniform, timestamp);
        gl.uniform1f(aspectRatioUniform, width / height);

        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);

        window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
}

function downloadShaders(finishCallback)
{
    let loaded = 0;
    let shaders = [];
    let scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++)
    {
        if (scripts[i].type == "notjs")
        {
            shaders.push(scripts[i]);
        }
    }

    shaders.forEach((s) => {
        let req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            s.innerHTML = req.responseText;
            console.log("Loaded ", s);
            if (++loaded >= shaders.length) {
                finishCallback();
            }
        });
        req.open("GET", s.src);
        req.send();
    });
}

(function() {
    downloadShaders(initWebGL);
 })();






