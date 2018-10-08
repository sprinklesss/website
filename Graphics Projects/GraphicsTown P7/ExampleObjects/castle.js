var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [139/255,69/255,19/255];
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;

        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
		var h = 2.5;
		
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    1.5,0,1.5,		1.5,h,1.5,		1.5,0,0.75,//TOWER1/4	
					1.5,0,0.75,		1.5,h,0.75,		1.5,h,1.5,
					1.5,0,1.5,		1.5,h,1.5,		0.75,0,1.5,	
					0.75,0,1.5,		0.75,h,1.5,		1.5,h,1.5,
					0.75,0,0.75,	0.75,h,0.75,	1.5,0,0.75,
					1.5,0,0.75,		1.5,h,0.75,		0.75,h,0.75,
					0.75,0,0.75,	0.75,h,0.75,	0.75,0,1.5,
					0.75,0,1.5,		0.75,h,1.5,		0.75,h,0.75,
					0.75,h,0.75,	0.75,h,1.5,		1.5,h,1.5,//TOP OF TOWER1
					1.5,h,1.5,		1.5,h,0.75,		0.75,h,0.75,
					
					1.5,0,-1.5,		1.5,h,-1.5,		1.5,0,-0.75,//TOWER2/4
					1.5,0,-0.75,	1.5,h,-0.75,	1.5,h,-1.5,
					1.5,0,-0.75,	1.5,h,-0.75,	0.75,0,-0.75,
					0.75,0,-0.75,	0.75,h,-0.75,	1.5,h,-0.75,
					0.75,0,-0.75,	0.75,h,-0.75,	0.75,0,-1.5,
					0.75,0,-1.5,	0.75,h,-1.5,	0.75,h,-0.75,
					0.75,0,-1.5,	0.75,h,-1.5,	1.5,0,-1.5,
					1.5,0,-1.5,		1.5,h,-1.5,		0.75,h,-1.5,	
					0.75,h,-0.75,	0.75,h,-1.5,	1.5,h,-1.5,//TOP OF TOWER2
					1.5,h,-1.5,		1.5,h,-0.75,	0.75,h,-0.75,

					-1.5,0,-1.5,	-1.5,h,-1.5,	-1.5,0,-0.75,//TOWER3/4
					-1.5,0,-0.75,	-1.5,h,-0.75,	-1.5,h,-1.5,
					-1.5,0,-0.75,	-1.5,h,-0.75,	-0.75,0,-0.75,
					-0.75,0,-0.75,	-0.75,h,-0.75,	-1.5,h,-0.75,
					-0.75,0,-0.75,	-0.75,h,-0.75,	-0.75,0,-1.5,
					-0.75,0,-1.5,	-0.75,h,-1.5,	-0.75,h,-0.75,
					-0.75,0,-1.5,	-0.75,h,-1.5,	-1.5,0,-1.5,
					-1.5,0,-1.5,	-1.5,h,-1.5,	-0.75,h,-1.5,	
					-0.75,h,-0.75,	-0.75,h,-1.5,	-1.5,h,-1.5,//TOP OF TOWER3
					-1.5,h,-1.5,	-1.5,h,-0.75,	-0.75,h,-0.75,

					-1.5,0,1.5,		-1.5,h,1.5,		-1.5,0,0.75,//TOWER4/4
					-1.5,0,0.75,	-1.5,h,0.75,	-1.5,h,1.5,
					-1.5,0,0.75,	-1.5,h,0.75,	-0.75,0,0.75,
					-0.75,0,0.75,	-0.75,h,0.75,	-1.5,h,0.75,
					-0.75,0,0.75,	-0.75,h,0.75,	-0.75,0,1.5,
					-0.75,0,1.5,	-0.75,h,1.5,	-0.75,h,0.75,
					-0.75,0,1.5,	-0.75,h,1.5,	-1.5,0,1.5,
					-1.5,0,1.5,		-1.5,h,1.5,		-0.75,h,1.5,	
					-0.75,h,0.75,	-0.75,h,1.5,	-1.5,h,1.5,//TOP OF TOWER4
					-1.5,h,1.5,		-1.5,h,0.75,	-0.75,h,0.75,
					
					-1.5,1.75,-1.5,	-1.5,1.75,1.5,	1.5,1.75,1.5,//bottom
					-1.5,1.75,-1.5,	1.5,1.75,-1.5,	1.5,1.75,1.5,
					
					1.5,0,0.75,			1.5,0,-0.75,		1.5,1.75,-0.75,//side1
					1.5,1.75,-0.75,		1.5,1.75,0.75,		1.5,0,0.75,
					-1.5,0,0.75,		-1.5,0,-0.75,		-1.5,1.75,-0.75,//side2
					-1.5,1.75,-0.75,	-1.5,1.75,0.75,		-1.5,0,0.75,
					-0.75,0,1.5,		0.75,0,1.5,			0.75,1.75,1.5,//side3
					0.75,1.75,1.5,		-0.75,1.75,1.5,		-0.75,0,1.5,
					-0.75,0,-1.5,		0.75,0,-1.5,		0.75,1.75,-1.5,//side4
					0.75,1.75,-1.5,		-0.75,1.75,-1.5,	-0.75,0,-1.5,
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,//TOWER1/4
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,//COPY ABOVE 10 LINES FOR ALL TOWERS!
					
					0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,//TOWER2/4
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
					
					0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,//TOWER3/4
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
					
					0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,//TOWER4/4
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,0,1, 0,1,1, 0,0,1,     0,0,1, 0,1,1, 0,1,1,
                    0,1,0, 0,1,0, 0,1,0,     0,1,0, 0,1,0, 0,1,0,
					
					0,0,1, 0,0,1, 0,0,1,	 0,0,1, 0,0,1, 0,0,1,//bottom
					
					0,1,1, 0,1,1, 0,0,1,	 0,0,1, 0,0,1, 0,1,1,//side1
					0,1,1, 0,1,1, 0,0,1,	 0,0,1, 0,0,1, 0,1,1,//side2
					0,1,1, 0,1,1, 0,0,1,	 0,0,1, 0,0,1, 0,1,1,//side3
					0,1,1, 0,1,1, 0,0,1,	 0,0,1, 0,0,1, 0,1,1,//side4
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Cube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
		
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
		
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
			
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Cube("cube1",[0,0,0],1) );//middle castle

//first side!
grobjects.push(new Cube("cube1",[8.5,0,8.5],1) );
grobjects.push(new Cube("cube1",[8.5,0,5.5],1) );
grobjects.push(new Cube("cube1",[8.5,0,2.5],1) );

grobjects.push(new Cube("cube1",[8.5,0,-2.5],1) );
grobjects.push(new Cube("cube1",[8.5,0,-5.5],1) );
grobjects.push(new Cube("cube1",[8.5,0,-8.5],1) );
//continue to second

grobjects.push(new Cube("cube1",[-8.5,0,-8.5],1) );
grobjects.push(new Cube("cube1",[-5.5,0,-8.5],1) );
grobjects.push(new Cube("cube1",[-2.5,0,-8.5],1) );
grobjects.push(new Cube("cube1",[2.5,0,-8.5],1) );
grobjects.push(new Cube("cube1",[5.5,0,-8.5],1) );
//continue to third

grobjects.push(new Cube("cube1",[-8.5,0,-5.5],1) );
grobjects.push(new Cube("cube1",[-8.5,0,-2.5],1) );
grobjects.push(new Cube("cube1",[-8.5,0,2.5],1) );
grobjects.push(new Cube("cube1",[-8.5,0,5.5],1) );
grobjects.push(new Cube("cube1",[-8.5,0,8.5],1) );
//continue to last!

grobjects.push(new Cube("cube1",[5.5,0,8.5],1) );
grobjects.push(new Cube("cube1",[2.5,0,8.5],1) );
grobjects.push(new Cube("cube1",[-2.5,0,8.5],1) );
grobjects.push(new Cube("cube1",[-5.5,0,8.5],1) );