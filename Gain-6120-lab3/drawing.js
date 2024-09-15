/** @type {WebGLRenderingContext} */
var gl;
var canvas;
var program;

//#region Data
var triangle_verts = [];
var vert_colors = [];

var box_verts = [];
var box_colors = [];
//#endregion

//#region buffers
// Triangles
var vBuffer;
var colorBuffer;

//Bounding Boxes
var box_vBuffer;
var box_cBuffer;
//#endregion

var triangle_count = 0;
var vert_count = 0;
var box_count = 0;

const DELAY = 10;
const MAX_VERTS = 4158;
const MAX_TRIS = Math.floor(MAX_VERTS/3);
const COLOR_COMPONENT_COUNT = 4;
const POSITION_COMPONENT_COUNT = 2;

const GLOBAL_BB_COLOR = [0.1, 1.0, 0.6, 1.0];
const LOCAL_BB_COLOR = [0.9, 0.2, 0.4, 1.0];

let vertsCheckbox;

let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];

window.onload = function init() {
	
	vertsCheckbox = document.getElementById("DrawVerts");

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
    
	box_vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, box_vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (MAX_VERTS*Float32Array.BYTES_PER_ELEMENT*POSITION_COMPONENT_COUNT), gl.STATIC_DRAW);

	box_cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, box_cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (MAX_VERTS*Float32Array.BYTES_PER_ELEMENT*COLOR_COMPONENT_COUNT), gl.STATIC_DRAW);

	canvas.onmousedown = (event) => {
		triangle_verts.push(getMousePosition(event));
		vert_colors.push(rcolor());
	
		vert_count = triangle_verts.length;
		triangle_count = (vert_count - (vert_count%3))/3;
	
		//updateBuffers(vBuffer, colorBuffer, triangle_verts, vert_colors);

		if (vert_count % 3 == 0) {
			updateBoundingBoxes();
		}
	};

	// render the square
    render();
};

function updateBoundingBoxes() {
	let global_box = [];

	let new_box = [];
	let latest_triangle = [];

	// The latests triangles X and Y coordinates seperated
	let ltri_x = [];
	let ltri_y = [];

	let g_ltri_x = [];
	let g_ltri_y = [];

	// Local Bounding Box
	let max_x, min_x, max_y, min_y;
	// Global Bounding Box
	let g_max_x, g_min_x, g_max_y, g_min_y;

	let pushNewBox = (box, target, color, cTarget) => {
		box.map(arr => target.push(arr));
		box.map(() => cTarget.push(color));
	}

	latest_triangle = triangle_verts.slice(vert_count-3, vert_count+1);
	ltri_x = latest_triangle.map(arr => arr[0]);
	ltri_y = latest_triangle.map(arr => arr[1]);

	max_x = Math.max(...ltri_x);
	min_x = Math.min(...ltri_x);
	max_y = Math.max(...ltri_y);
	min_y = Math.min(...ltri_y);

	new_box.push([min_x, max_y], [max_x, max_y], [max_x, max_y], [max_x, min_y], [max_x, min_y], [min_x, min_y], [min_x, min_y], [min_x, max_y]);

	box_count = Math.floor(box_verts.length / 8);
	
	if (box_count <= 1) {
		pushNewBox(new_box, box_verts, LOCAL_BB_COLOR, box_colors);
		pushNewBox(new_box, box_verts, GLOBAL_BB_COLOR, box_colors);
	
	} else {
		
		global_box = box_verts.slice(box_verts.length-8, box_verts.length+1);
		box_verts.length -= 8;
		box_colors.length -= 8;
		
		pushNewBox(new_box, box_verts, LOCAL_BB_COLOR, box_colors);

		g_ltri_x = global_box.map(arr => arr[0]);
		g_ltri_y = global_box.map(arr => arr[1]);

		g_max_x = Math.max(max_x, ...g_ltri_x);
		g_min_x = Math.min(min_x, ...g_ltri_x);

		g_max_y = Math.max(max_y, ...g_ltri_y);
		g_min_y = Math.min(min_y, ...g_ltri_y);
		
		global_box = [[g_min_x, g_max_y], [g_max_x, g_max_y], [g_max_x, g_max_y], [g_max_x, g_min_y], [g_max_x, g_min_y], [g_min_x, g_min_y], [g_min_x, g_min_y], [g_min_x, g_max_y]];

		pushNewBox(global_box, box_verts, GLOBAL_BB_COLOR, box_colors);
	}
}

function updateBuffers(vertex_buffer, color_buffer, vertices, colors) {

	//#region Vertex Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, (vertex_buffer.length - 16) * Float32Array.BYTES_PER_ELEMENT * POSITION_COMPONENT_COUNT, flatten(vertices));

	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, POSITION_COMPONENT_COUNT, gl.FLOAT, true, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	//#endregion

	//#region Color Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, (color_buffer.length - 16) * Float32Array.BYTES_PER_ELEMENT * COLOR_COMPONENT_COUNT, flatten(colors));

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, COLOR_COMPONENT_COUNT, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	//#endregion
}

var counter = 0;
function render() {

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	updateBuffers(vBuffer, colorBuffer, triangle_verts, vert_colors);
    gl.drawArrays(gl.TRIANGLES, 0, vert_count);
	if (vertsCheckbox.checked) gl.drawArrays(gl.POINTS, 0, vert_count);
    
	updateBuffers(box_vBuffer, box_cBuffer, box_verts, box_colors);
	gl.drawArrays(gl.LINES, 0, box_verts.length);

    setTimeout(
        function (){requestAnimFrame(render);}, DELAY
    );
}
