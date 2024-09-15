/** @type {WebGLRenderingContext} */
var gl;
var canvas;
var program;

// Data
var triangle_verts = [];
var colors = [];
var box_verts = []

// Buffers
var vBuffer;
var colorBuffer;

var triangle_count = 0;
var vert_count = 0;

var delay = 10;
const MAX_VERTS = 4096;
const COLOR_COMPONENT_COUNT = 4;
const POSITION_COMPONENT_COUNT = 2;

let vertsCheckbox;

let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];;

window.onload = function init() {
	
	vertsCheckbox = document.getElementById("DrawVerts");

	// get the canvas handle from the document's DOM
    canvas = document.getElementById( "gl-canvas" );
    
	canvas.onmousedown = (event) => {
		triangle_verts.push(getMousePosition(event));
		colors.push(rcolor());
	
		vert_count = triangle_verts.length;
	
		updateBuffers();
		if (vert_count % 3 == 0) {
		}
	};

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
    gl.clearColor(0.7, 0.7, 0.7, 1.0);

    //  Initialize and load shaders -- all work done in init_shaders.js
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this the current shader program
    gl.useProgram(program);

	// create a vertex buffer - this will hold all triangle_verts
    vBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (MAX_VERTS*Float32Array.BYTES_PER_ELEMENT*POSITION_COMPONENT_COUNT), gl.STATIC_DRAW);

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (MAX_VERTS*Float32Array.BYTES_PER_ELEMENT*COLOR_COMPONENT_COUNT), gl.STATIC_DRAW);

	// render the square
    render();
};

function updateBuffers() {

	//#region Vertex Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(triangle_verts));
	//vert_count * Float32Array.BYTES_PER_ELEMENT * POSITION_COMPONENT_COUNT

	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, POSITION_COMPONENT_COUNT, gl.FLOAT, true, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	//#endregion

	//#region Color Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
	//vert_count * Float32Array.BYTES_PER_ELEMENT * COLOR_COMPONENT_COUNT

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, COLOR_COMPONENT_COUNT, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	//#endregion
}

var counter = 0;
function render() {
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if (vertsCheckbox.checked) gl.drawArrays(gl.POINTS, 0, vert_count);
    gl.drawArrays(gl.TRIANGLES, 0, vert_count);
    
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
