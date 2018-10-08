/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL. 

 Notice that it is possible to only use twgl for math. 

 Also, due to security restrictions the image was encoded as a Base64 string. 
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as 
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


/**
	Resize objects to be square and a power of 2: 256x256
	obj file converter, convert file to imgjs -- image bundler
	copy the whole file string to source OR make new script source in exampleobjects/name or just use var image line, 
		make sure source comes before the object that uses it

**/

(function() {
    "use strict";

    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "attribute vec2 aTexCoord;" +
        "varying vec2 vTexCoord;" +
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
        "  vTexCoord = aTexCoord;" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec2 vTexCoord;" +
        "uniform sampler2D tex1;" +
		"uniform sampler2D tex2;" +
        "void main(void) {" +
        "  gl_FragColor = texture2D(tex1, vTexCoord);" +
        "}";


    var vertices = new Float32Array([
         0.5,  0.5,  0.0,
        -0.5,  0.5,  0.0,
        -0.5, -0.5,  0.0,

         0.5,  0.5,  0.0,
        -0.5, -0.5,  0.0,
         0.5, -0.5,  0.0

    ]);

    var uvs = new Float32Array([
       1.0, 1.0,
       0.0, 1.0,
       0.0, 0.0,

       1.0, 1.0,
       0.0, 0.0,
       1.0, 0.0
    ]);

    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    //NUKE
    var image = new Image();
    image.src = "data:image/jpeg;base64,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"
    //checkers
	var image2 = new Image();
	image2.src = "data:image/jpeg;base64,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738Gf373737395j37373738Gg8/77/H/AGA99e/e/e/vM3P5/qT/ALf/AIn317979z/vvp/jx/iPfwZ/fvfvfvf/0N5j37373738Gf373737395j37373738Gf373737395j37373738Gf373737395j37373738Gf3737373//R3mPfvfvfvfwZ/fvfvfvf3mPfvfvfvfwZ/fvfvfvf3mPfvfvfvfwZ/fvfvfvf3mPfvfvfvfwZ/fvfvfvf/9LeY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9//0/n/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1Pn/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1fn/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1vn/APv3v3v3v7zH/I/9vz797979/vQ+v+t9PfwZ/fvfvfvf3mPfvfvfv9t9P9jf/inv4M/v3v3vw/33++/Pv7zP0+v1/wB8P9b6j3179797+DP/ALf373737+n1/wB9/T395j3737373//X3mPfvfvfvfwZ/fvfvfvp7+8x7979797+DP7979797+8x7979797+DP7979797+8x/vv9t9PfvfvfvfwZ/fvfvfvf/9DeY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9//0d5j37373738Gf373737395j37373738Gf373737395j37373738Gf373737395j37373738Gf3737373//S3mPfvfvfv8ACTa9h+f8AW/1vfwZ/fvfvfvf3mP8AYEf6/v3v3v3v4M/v3v3v1r+/vMe/e/e/e/gz+/e/e/e/vMf7A/76x/4n373736/1/wAP+Nf71f8A33Hv4M/v3v3v3v8A/9P5/wD797977v8Aj395f37373738Gc8/wC+/p7979797+8x797979/T/D/fH/ePfwZ/fvfvfvf3mPfvfvfvfwaL/wC+/wBt9P6Hj3179797+8x7979797//1Pn/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1fn/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1vn/APv3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/195j373737/b/wCwNuf+Ne/gz+/e/e/e/vMf7f8A2Jv/AMRf37373738Gf373737/ffj395j/jQ/2wt/sPfvfvfvfwZ/fvfvfvf3mPoLc/Ukn/Vcnk8/q9+9+9+/H++/qPx9D9PfwZ/fvfvfvf8A/9DeY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9/eY9+9+9+9/Bn9+9+9+9//0d5j37373738Gf373737395j37373738Gf373737395j37373738Gf373737395j37373738Gf3737373//S3mPfvfvfv9gT/wAU5P5/1vfwZz7979797+8x+PfvfvfvfwZ/fvfvfv8AYfn/AHw9/eY9+9+9+/x/pz/xr/D38Gf373737395j/ib/wCtwbA3/wAR797979/Xn/WH9P8Aifr7+DP7979797//0/n/APv3v3v3v7zHv3v3v3v5C/v3v3v3v69Hv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1Pn/APv3v3v3v7zHv3v3v3v5C/v3v3v3v69Hv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1fn/APv3v3v3v7zHv3v3v3v5C/v3v3v3v69Hv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/1vn/APv3v3v3v7zHv3v3v3v5C/v3v3v3v69Hv3v3v3v4M/v3v3v3v7zHv3v3v3v4M/v3v3v3v7zHv3v3v3v/2Q==";


	//useful util function to return a glProgram from just vertex and fragment shader source.
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //creates a gl buffer and unbinds it when done. 
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later. 
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to. 
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
		
        gl.bindTexture(gl.TEXTURE_2D, texture);
		
		
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

     var TexturedPlane = function () {
        this.name = "TexturedPlane"
        this.position = new Float32Array([0, 0, 0]);
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null]
        this.texture = null;
    }

    TexturedPlane.prototype.init = function (drawingState) {
        var gl = drawingState.gl;

        this.program = createGLProgram(gl, vertexSource, fragmentSource);
        this.attributes = findAttribLocations(gl, this.program, ["aPosition", "aTexCoord"]);
        this.uniforms = findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "uTexture"]);

        this.texture = createGLTexture(gl, image, true);//CREATES TEXTURES
		this.texture2 = createGLTexture(gl, image2, true);//CREATES TEXTURES

        this.buffers[0] = createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, uvs, gl.STATIC_DRAW);
    }

    TexturedPlane.prototype.center = function () {
        return this.position;
    }

    TexturedPlane.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);

        var modelM = twgl.m4.scaling([this.scale[0],this.scale[1], 1]);
        twgl.m4.setTranslation(modelM,this.position, modelM);
		
		        var theta = Number(drawingState.realtime)/200.0;
		twgl.m4.rotateY(modelM, theta, modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, modelM);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.texture2);//TEXTURES HEREEE
		
        gl.uniform1i(this.uniforms.uTexture, 0);



        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        disableLocations(gl, this.attributes);
    }


    var plane1 = new TexturedPlane();
	var plane2 = new TexturedPlane();
	var plane3 = new TexturedPlane();
	var plane4 = new TexturedPlane();
    
    plane1.position = [4,1,0];
	plane2.position = [0,1,4];
	plane3.position = [-4,1,0];
	plane4.position = [0,1,-4];
	
    plane1.scale = [2, 2];
    plane2.scale = [2, 2];
    plane3.scale = [2, 2];
    plane4.scale = [2, 2];

    grobjects.push(plane1);
	grobjects.push(plane2);
	grobjects.push(plane3);
	grobjects.push(plane4);

})();