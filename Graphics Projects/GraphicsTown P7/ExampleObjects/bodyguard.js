/**
 * Created by gleicher on 10/17/15.
 */
var grobjects = grobjects || [];

// make the two constructors global variables so they can be used later
var Copter = undefined;
var Helipad = undefined;

(function () {
    "use strict";
	

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var copterBodyBuffers = undefined;
    var copterRotorBuffers = undefined;
    var copterNumber = 0;

    var padBuffers = undefined;
    var padNumber = 0;

    // constructor for Helipad
    // note that anything that has a helipad and helipadAltitude key can be used
    Helipad = function Helipad(position) {
        this.name = "helipad"+padNumber++;
        this.position = position || [2,0.01,2];
        this.size = 1.0;
        // yes, there is probably a better way
        this.helipad = true;
        // what altitude should the helicopter be?
        // this get added to the helicopter size
        this.helipadAltitude = 0;
    }
    Helipad.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        var q = .25;  // abbreviation

        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["text2-vs", "text2-fs"]);
        }
        if (!padBuffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -10,0,-10,	 -10,0,10,		-10,5,10,			 
					-10,5,10,	 -10,0,-10,		-10,5,-10,	//LEFT	
                    -10,0,10,	10,0,10,	10,5,10,
					10,5,10,	-10,0,10,	-10,5,10,//TOP
					10,0,10,	10,0,-10,	10,5,-10,
					10,5,-10,	10,0,10,	10,5,10,//RIGHT
					-10,0,-10,	10,0,-10,	10,5,-10,
					10,5,-10,	-10,0,-10,	-10,5,-10,
					
                ] },
                vnormal : {numComponents:3, data: [
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
					0,1,0, 0,1,0, 0,1,0, 0,1,0,
					0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
                    0,1,0, 0,1,0, 0,1,0, 0,1,0,
					0,1,0, 0,1,0, 0,1,0, 0,1,0,
                ]},
				vTexCoord {numComponents:2, data: [
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
					0,0,	1,0,	1,1,	0,1,
				]},
				
                indices : [0,1,2, 3,4,5, 6,7,8, 9,10,11,
						   12,13,14, 15,16,17,	18,19,20,	21,22,23,
				]}
            };
            padBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
	
	shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
	gl.uniform1i(shaderProgram.texSampler1, 0);
	
	var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image1 = new Image();
	
	function initTextureThenDraw()
    {
      image1.onload = function() { loadTexture(image1,texture1); };
      image1.crossOrigin = "anonymous";
      image1.src = "https://farm6.staticflickr.com/5564/30725680942_e3bfe50e5e_b.jpg";

      /*image2.onload = function() { loadTexture(image2,texture2); };
      image2.crossOrigin = "anonymous";
      image2.src = "https://farm6.staticflickr.com/5726/30206830053_87e9530b48_b.jpg";*/

      window.setTimeout(draw,200);
    }

    function loadTexture(image,texture)
    {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    }   
	

	
    Helipad.prototype.draw = function(drawingState) {
		

        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
		
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:[139/255,69/255,19/255], model: modelM });
        twgl.setBuffersAndAttributes(gl,shaderProgram,padBuffers);
		
		//////////////////
 
		
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
		
		/////////////////
		
        twgl.drawBufferInfo(gl, gl.TRIANGLES, padBuffers);
    };
    Helipad.prototype.center = function(drawingState) {
        return this.position;
    }

    // constants
    var altitude = 3;
    var verticalSpeed = 3 / 1000;      // units per milli-second
    var flyingSpeed = 10/1000;          // units per milli-second
    var turningSpeed = 8/1000;         // radians per milli-second

    // utility - generate random  integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    // find a random helipad - allow for excluding one (so we don't re-use last target)
    function randomHelipad(exclude) {
        var helipads = grobjects.filter(function(obj) {return (obj.helipad && (obj!=exclude))});
        if (!helipads.length) {
            throw("No Helipads for the helicopter!");
        }
        var idx = getRandomInt(0,helipads.length);
        return helipads[idx];
    }

    // this actually does the work
    function advance(heli, drawingState) {
        // on the first call, the copter does nothing
        if (!heli.lastTime) {
            heli.lastTime = drawingState.realtime;
            return;
        }
        var delta = drawingState.realtime - heli.lastTime;
        heli.lastTime = drawingState.realtime;

        // now do the right thing depending on state
       
	}
})();

// make the objects and put them into the world
// note that the helipads float above the floor to avoid z-fighting
grobjects.push(new Helipad([0,.01,0]));
grobjects.push(new Helipad([0,.01,0]));
grobjects.push(new Helipad([0,.01,0]));
grobjects.push(new Helipad([0,.01,0]));

// just to show - if there's a cube, we can land on it
var acube = findObj("cube1");
if (acube) {
    acube.helipad = true;
    acube.helipadAltitude = .5;
}
