
// some globals
/** @type {WebGLRenderingContext} */
var gl;

var colorLoc;

var vertices = [];
var num_points = 0;

var delay = 100;
var direction = true;
var vBuffer;
var program;

// use a random color (RGB)
var color_vals = [Math.random(), Math.random(), Math.random(), 1.];


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

	// we are also going manipulate the vertex color, so get its location
	colorLoc = gl.getUniformLocation(program, "vertColor");

	// set an initial color for all vertices
	gl.uniform4fv (colorLoc, [1., 0., 0., 1.])

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	// buffer calls to send vertex data to the shader
	updateBuffers(vertices);

	// render the square
    render();
};

function updateBuffers(vertices) {
	// make the needed GL calls to tranfer vertices

	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

}

counter = 0;
function render() {
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	

	// set the color in the shader
	//gl.uniform4fv (colorLoc, color_vals)

    //gl.drawArrays(gl.POINTS, 0, num_points);
    

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
