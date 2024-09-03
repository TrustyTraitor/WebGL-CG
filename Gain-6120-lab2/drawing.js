
// some globals
/** @type {WebGLRenderingContext} */
var gl;

var vertices = [];
var num_points = 0;

var colors = [];

var delay = 10;
var direction = true;

var program;

var colorLoc;
var vBuffer;
var colorBuffer;

var canvas;

// use a random color (RGB)
var color_vals = [Math.random(), Math.random(), Math.random(), 1.];

let rcolor = () => {
	return [Math.random(), Math.random(), Math.random(), 1.];
}

var mouse_is_down = false;
var mouse_event = null;

onmousedown = (event) => {
	mouse_is_down = true;
	mouse_event = event;
};

onmouseup = (event) => {
	mouse_is_down = false;
	mouse_event = null;
};

onmousemove = (event) => {
	mouse_event = event;
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
	colorLoc = gl.getUniformLocation(program, "vertColor");

	// set an initial color for all vertices
	gl.uniform4fv (colorLoc, [1., 0., 0., 1.])

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (5000*4*2), gl.STATIC_DRAW);

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (5000*4*4), gl.STATIC_DRAW);

	// buffer calls to send vertex data to the shader
	//updateBuffers(vertices);

	// render the square
    render();
};

function updateBuffers() {
	// make the needed GL calls to tranfer vertices

	let pc = (num_points > 0) ? num_points-1 : 0;

	//#region Vertex Buffer
	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	//gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	gl.bufferSubData(gl.ARRAY_BUFFER, pc * 2 * 4, flatten(vertices));
	
//	console.log(`pc: ${pc}  verts: ${vertices}`);

	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, true, 0, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	//#endregion

	//#region Color Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, pc * 4 * 4, flatten(colors));

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	//#endregion

}

var counter = 0;
function render() {

	if (mouse_is_down) {
		temp = getMousePosition(mouse_event);
		vertices = temp;
		colors = rcolor();
		
		num_points += vertices.length;
		updateBuffers();
	}

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	

	// set the color in the shader
	//gl.uniform4fv (colorLoc, color_vals);

    gl.drawArrays(gl.POINTS, 0, num_points);
    

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
