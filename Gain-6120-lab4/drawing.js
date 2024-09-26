
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

var matrixLoc;

var canvas;

var p_dev_coords;
var p_ndc_coords;
var p_world_coords;

let device2World_mat = () => {
	
	const rect = canvas.getBoundingClientRect();

	let origin_translate = translate4x4(-rect.left, -rect.top, 0);
	let scale_window = scale4x4(1/canvas.width, 1/canvas.height, 1);
	let scale_to_world = scale4x4(2048,2048, 1);
	let trans_to_world_o = translate4x4(0,-2048, 0);
	let reflect_x = scale4x4(1,-1, 1);

	let computed = matMult(scale_window, origin_translate);
	computed = matMult(scale_to_world, computed);
	computed = matMult(trans_to_world_o, computed);
	computed = matMult(reflect_x, computed);

	return computed;
}

let world2NDC_mat = () => {
	let translate = translate4x4(-1024, -1024, 0);
	let scale = scale4x4(1/1024, 1/1024, 1);

	return matMult(scale, translate);
}

// Returns mouse coordinates in the custom world coordinates
let getMousePosition = (event) => {

	let conversion_mat = device2World_mat();
	let mouse_coords = [event.clientX, event.clientY, 0.0, 1.0];

	let world = matVecMult(conversion_mat, mouse_coords);

	let ndc_coords = matVecMult(world2NDC_mat(), world);

	p_dev_coords.innerHTML = `Device Coords: x: ${mouse_coords[0]}  y: ${mouse_coords[1]}`;
	p_ndc_coords.innerHTML = `NDC Coords: x: ${ndc_coords[0]}  y: ${ndc_coords[1]}`;
	p_world_coords.innerHTML = `Device Coords: x: ${world[0]}  y: ${world[1]}`;

	return ndc_coords;
}

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
    p_dev_coords = document.getElementById("device-coords");
    p_ndc_coords = document.getElementById("ndc-coords");
    p_world_coords = document.getElementById("world-coords");

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

	matrixLoc = gl.getUniformLocation(program, "ndcMat");
	gl.uniformMatrix4fv(matrixLoc, false, flatten(world2NDC_mat()));

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (5000*4*7), gl.STATIC_DRAW);


    render();
};

function updateBuffers() {
	// make the needed GL calls to tranfer vertices

	let pc = (num_points > 0) ? num_points-1 : 0;

	//#region Vertex Buffer
	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	gl.bufferSubData(gl.ARRAY_BUFFER, pc * 7 * 4, flatten(vertices));

	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, true, 28, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	//#endregion

	//#region Color Buffer
	gl.bufferSubData(gl.ARRAY_BUFFER, (pc * 7 * 4) + 16, flatten(colors));

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 28, 16);
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
