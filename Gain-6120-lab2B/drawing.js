
// some globals
/** @type {WebGLRenderingContext} */
var gl;

var vertices = [];
var num_points = 0;

var colors = [];

var delay = 10;
var direction = true;

var program;

var vBuffer;

var canvas;


let rcolor = () => {
	return [Math.random(), Math.random(), Math.random()];
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


	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (5000*4*5), gl.STATIC_DRAW);


    render();
};

function updateBuffers() {
	// make the needed GL calls to tranfer vertices

	let pc = (num_points > 0) ? num_points-1 : 0;

	//#region Vertex Buffer
	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);


	gl.bufferSubData(gl.ARRAY_BUFFER, pc * 5 * 4, flatten(vertices));
	

	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, true, 20, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	//#endregion

	//#region Color Buffer
	gl.bufferSubData(gl.ARRAY_BUFFER, (pc * 5 * 4) + 8, flatten(colors));

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 20, 8);
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

    gl.drawArrays(gl.POINTS, 0, num_points);
    

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
