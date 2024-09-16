/** @type {WebGLRenderingContext} */
var gl;
var canvas;
var program;

var line_points = [];
var vBuffer;

var u_time;
var u_resolution;
var time = 0;

var segment_count = 0;
var is_increasing = true;

const DELAY = 75;
const MAX_VERTS = 4096;
const POSITION_COMPONENT_COUNT = 2;

let vertsCheckbox;
let segmentInput;

let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];

window.onload = function init() {
	
	vertsCheckbox = document.getElementById("DrawVerts");
	segmentInput = document.getElementById("SegmentCount");

	segment_count = segmentInput.value;

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

	u_time = gl.getUniformLocation(program, "u_time");
	u_resolution = gl.getUniformLocation(program, "u_resolution");

	gl.uniform1f(u_time, 0.0)
	gl.uniform2fv(u_resolution, flatten([canvas.width,canvas.height]));
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (MAX_VERTS*Float32Array.BYTES_PER_ELEMENT*POSITION_COMPONENT_COUNT), gl.STATIC_DRAW);

	// Update the number of segments
	//segmentInput.oninput = (event) => {
		line_points.push(
			[-1.0,0], [-0.75, 0.0], 
			[-0.75, 0.0], [-0.50, 0.0], 
			[-0.50, 0.0], [-0.25, 0.0], 
			[-0.25, 0.0], [0.0,0.0], 
			[0.0,0.0], [0.25, 0.0], 
			[0.25, 0.0], [0.5, 0.0], 
			[0.5, 0.0], [0.75, 0.0], 
			[0.75, 0.0], [1.0,0.0]);
		console.log(event.target.value);
	//}

	// render the square
    render();
};

function updateBuffers(vertex_buffer, vertices) {

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, POSITION_COMPONENT_COUNT, gl.FLOAT, true, 0, 0);
	gl.enableVertexAttribArray(vPosition);
}

let delta_time = 0;
let time_last_frame = 0;
function render() {
	delta_time = Date.now() - time_last_frame;
	
	if (time >= 255 && is_increasing) is_increasing = false;
	else if(time <= 0 && !is_increasing) is_increasing = true;
	
	if (is_increasing) time++;
	else time--;

	let bounded_time = time%255;

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set the color in the shader
	gl.uniform1f(u_time, bounded_time*delta_time);
	gl.uniform2fv(u_resolution, flatten([canvas.width,canvas.height]));
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	updateBuffers(vBuffer, line_points);
    gl.drawArrays(gl.LINES, 0, line_points.length);

	if (vertsCheckbox.checked) gl.drawArrays(gl.POINTS, 0, line_points.length);
    
	time_last_frame = Date.now();
    setTimeout(
        function (){requestAnimFrame(render);}, DELAY
    );
}
