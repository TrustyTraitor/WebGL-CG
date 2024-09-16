
// some globals
/** @type {WebGLRenderingContext} */
var gl;

var vertices = [];

var delay = 10;
var direction = true;

var program;

var u_time;
var time = 0;

var u_resolution;

var canvas;


let rcolor = () => {
	return [Math.random(), Math.random(), Math.random(), 1.];
}


// Your GL program starts after the HTML page is loaded, indicated
// by the onload event
window.onload = function init() {
	
	// get the canvas handle from the document's DOM
    canvas = document.getElementById( "gl-canvas" );
    
	// initialize webgl, returns gl context (handle to the drawing canvas)
	gl = initWebGL(canvas)

	// check for errors
    if (!gl) { 
		alert( "WebGL isn't available" ); 
	}

    // specify viewing surface geometry to display your drawings
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );

    //  Initialize and load shaders -- all work done in init_shaders.js
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

	// make this the current shader program
    gl.useProgram( program );

	// we are also going manipulate the vertex color, so get its location
	u_time = gl.getUniformLocation(program, "u_time");
	u_resolution = gl.getUniformLocation(program, "u_resolution");

	// set an initial color for all vertices
	gl.uniform1f(u_time, 0.0)
	gl.uniform2fv(u_resolution, flatten([canvas.width,canvas.height]));

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	
	updateBuffers();

	// render the square
    render();
};

function updateBuffers() {
	// make the needed GL calls to tranfer vertices

	vertices = [];
	vertices.push([-1, 1])
	vertices.push([ 1, 1]); 
	vertices.push([-1,-1]);
	
	vertices.push([ 1, 1]); 
	vertices.push([-1,-1]);
	vertices.push([ 1,-1]);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

}

var is_increasing = true;

function render() {

	if (time >= 255 && is_increasing) {
		is_increasing = false;
	} else if (time <= 0 && !is_increasing) {
		is_increasing = true;
	}

	if (is_increasing) ++time;
	else --time;

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set the color in the shader
	gl.uniform1f(u_time, time);
	gl.uniform2fv(u_resolution, flatten([canvas.width,canvas.height]));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
