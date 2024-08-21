
// some globals
var gl;

var theta = 0.0;
var thetaLoc, colorLoc;

var delay = 100;
var direction = true;
var vBuffer;
var program;
//var vertices = [];

// use a random color (RGB)
var color_vals = [Math.random(), Math.random(), Math.random(), 1.];

var num_triangles = 0;

// Your GL program starts after the HTML page is loaded, indicated
// by the onload event
window.onload = function init() {
	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
    
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

	// Get a handle (address) to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
    thetaLoc = gl.getUniformLocation( program, "theta" );

	// we are also going manipulate the vertex color, so get its location
	colorLoc = gl.getUniformLocation(program, "vertColor");

	// set an initial color for all vertices
	gl.uniform4fv (colorLoc, [1., 0., 0., 1.])

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	// get the vertices to generate a square shape
	let vertices = getSquareVertices();

	// buffer calls to send vertex data to the shader
	updateBuffers(vertices);

	// render the square
    render();
};

function getSquareVertices() {
	// add a square at the center of the view (0, 0) of a fixed size
	// square is drawn as 2 triangles

	// triangle 1
	vertices = [];
	vertices.push([ 0.0,  0.3]); 
	vertices.push([-0.3,  0.0]); 
	vertices.push([ 0.0, -0.3]); 

	// triangle 2
	vertices.push([ 0.0,  0.3]); 
	vertices.push([ 0.0, -0.3]); 
	vertices.push([ 0.3,  0.0]); 

	num_triangles = 2;

	return vertices;
}

function updateBuffers(vertices) {
	// make the needed GL calls to tranfer vertices

	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	// transfer the data -- this is actually pretty inefficient!
	// flatten() function is defined in MV.js - this simply creates only
	// the vertex coordinate data array - all other metadata in Javascript
	// arrays should not be in the vertex buffer.
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	// Associate our shader variables with our data buffer
	// note: "vPosition" is a named buffer variable used in the vertex shader 
	// and is associated with vPosition here
	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	// we will use a single color for all primitives and so we will directly set
	// the color in the GPU's fragment shader. If you do need to set individual
	// colors for each vertex, then you will need to send a color buffer, 
	// similar to the vertex buffer, with associated shader variables for color.
}

counter = 0;
function render() {
	// this is render loop

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	// rotate the square by a small angle
	theta += 0.1;
	counter++;
	
	// send the theta value to the shader, where the rotation is
	// performed
	gl.uniform1f(thetaLoc, theta);

	// set the color to change it every 10 frames
	counter++;
	if (counter%10 == 0) {
		color_vals = [Math.random(), Math.random(), Math.random(), 1.];
	}

	// set the color in the shader
	gl.uniform4fv (colorLoc, color_vals)

	// draw the square as a triangle strip
    gl.drawArrays(gl.TRIANGLES, 0, num_triangles*3);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
