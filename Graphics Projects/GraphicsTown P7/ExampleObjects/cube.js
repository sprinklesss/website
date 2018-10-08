var grobjects = grobjects || [];

var Cube = undefined;
var SpinningCube = undefined;

(function() {
    "use strict";

    // i will use t
    var shaderProgram = undefined;
    var buffers = undefined;

    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.3,.3,.9];
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;

        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
					0.75,3,0.5,		0.5,3,1,	1,3,1,//front point is first
					0.75,3,0.5,		0.5,3,1,	0.75,2.75,1,
					0.75,3,0.5,		1,3,1,		0.75,2.75,1,
					
                ] },
                vnormal : {numComponents:3, data: [
                    0,1,1, 0,1,1, 0,1,1,     0,0,-1, 0,0,-1, 0,0,-1,//bright
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,//norm
                    0,0,1, 0,0,1, 0,0,1,     0,0,1, 0,0,1, 0,0,1,//norm
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };

    SpinningCube = function SpinningCube(name, position, size, color, axis) {
        Cube.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningCube.prototype = Object.create(Cube.prototype);
    SpinningCube.prototype.draw = function(drawingState) {

        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/200.0;
        if (this.axis == 'X') {
            twgl.m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            twgl.m4.rotateZ(modelM, theta, modelM);
        } else {
            twgl.m4.rotateY(modelM, theta, modelM);
        }
        twgl.m4.setTranslation(modelM,this.position,modelM);

        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

grobjects.push(new SpinningCube("scube 1",[-2.75,0.5, -2.75],1, [0,1,0], 'Y'));
grobjects.push(new SpinningCube("scube 2",[-2.75,0.5,  2.75],1, [0,1,0], 'Y'));
grobjects.push(new SpinningCube("scube 3",[ 2.75,0.5, -2.75],1, [0,1,0], 'Y'));
grobjects.push(new SpinningCube("scube 4",[ 2.75,0.5,  2.75],1, [0,1,0], 'Y'));
