var canvas;

/** @type {WebGLRenderingContext} */
var gl;

var program;
var vertexShader, fragmentShader;

var delay = 10;

var num_verts = teapot_indices.length;
var vert_colors = [];
var M_comp = mat4(); 

var vBuffer, cBuffer, iBuffer;
var vColor, vPosition;
var M_comp_loc;

// var color_mode_loc;
// var color_mode = 0;

let width_slider;
let height_slider;
let near_slider;
let far_slider;

let xrot;
let yrot;
let zrot;


let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];
let wcolor = () => [1., 1., 1., 1.];

let current_color

let GenColors = () => {
	for(let i = 0; i < num_verts; ++i) vert_colors.push(rcolor());
}

// function toggleColor() {
// 	color_mode = (color_mode+1) % 2;
// }

function lookAt(eye, at, up) {
	function CalcVPN(eye, at) {
		return [at[0]-eye[0], at[1]-eye[1], at[2]-eye[2]];
	}

	let n = CalcVPN(eye, at);
	let u = cross_product(n, up);
	let v = cross_product(u,n);

	n = normalize(n,false);
	u = normalize(u,false);
	v = normalize(v,false);

	n = negate(n);

	const r = [
		[...u, -dot_product(u, eye)],
		[...v, -dot_product(v, eye)],
		[...n, dot_product(negate(n), eye)],
		[0, 0, 0, 1]
	];

	let V = r;

	return V;
}

function GetViewPlanes(width, height, near, far) {
	let left = -(width/2);
	let right = width/2;
	
	let bottom = -(height/2);
	let top = height/2;


	return [left, right, bottom, top, near, far];
}

function PerspectiveMatrix(left, right, bottom, top, near, far) {
	let mat = identity4();

	mat[0][0] = near/right;
	mat[1][1] = near/top;
	mat[2][2] = -(far+near)/(far-near);
	mat[2][3] = -(2*far*near)/(far-near);
	mat[3][2] = -1.0;
	mat[3][3] = 0.0;

	// mat[0][0] = (2*near)/(right-left);
	// mat[1][1] = (2*near)/(top-bottom);
	// mat[2][2] = -(far+near)/(far-near);
	// mat[3][3] = 0.0;

	// mat[0][2] = (right+left)/(right-left);
	// mat[1][2] = (top+bottom)/(top-bottom);
	// mat[2][3] = (-2*far*near)/(far-near);
	// mat[3][2] = -1.0;

	return mat;
}

function CalcMatrix(eye, at, up) {
	
	let width, height, near, far;
	width = width_slider.valueAsNumber;
	height = height_slider.valueAsNumber;
	near = near_slider.valueAsNumber;
	far = far_slider.valueAsNumber;

	let x_rot = degreesToRadians(xrot.valueAsNumber);
	let y_rot = degreesToRadians(yrot.valueAsNumber);
	let z_rot = degreesToRadians(zrot.valueAsNumber);

	let look_at = lookAt(eye, at, up);
	let b_box = GetViewPlanes(width, height, near, far);
	let normalize = PerspectiveMatrix(...b_box);

	M_comp = mat4();
	M_comp = matMult(rotate4x4(x_rot, 'x'), M_comp);
	M_comp = matMult(rotate4x4(y_rot, 'y'), M_comp);
	M_comp = matMult(rotate4x4(z_rot, 'z'), M_comp);
	M_comp = matMult(look_at, M_comp);
	M_comp = matMult(normalize, M_comp);
}

// all initializations
window.onload = function init() {
	// get canvas handle
	canvas = document.getElementById( "gl-canvas" );

	width_slider = document.getElementById("width");
	height_slider = document.getElementById("height");
	near_slider = document.getElementById("near");
	far_slider = document.getElementById("far");

	xrot = document.getElementById("xrot");
	yrot = document.getElementById("yrot");
	zrot = document.getElementById("zrot");

	// WebGL Initialization
	gl = initWebGL(canvas);
	if (!gl ) {
		alert( "WebGL isn't available" );
	}

	GenColors();

	// set up viewport
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	// create shaders, compile and link program
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

    // buffers to hold cube vertices, colors and indices
	vBuffer = gl.createBuffer();
	cBuffer = gl.createBuffer();
	iBuffer = gl.createBuffer();

	// allocate and send vertices to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_vertices), gl.STATIC_DRAW);

    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	

	// similarly for color buffer
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vert_colors), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor);

	// index buffer 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapot_indices),
								 gl.STATIC_DRAW);

	M_comp_loc = gl.getUniformLocation(program, "M_comp");
	// color_mode_loc = gl.getUniformLocation(program, "color_mode");

	let eye= [0. , 100. , 100.];
	let at = [0. , 0. , 0.];
	let up = [eye[0], eye[1]+1, eye[2]];

	CalcMatrix(eye, at, up);

	width_slider.oninput = () => CalcMatrix(eye, at, up);
	height_slider.oninput = () => CalcMatrix(eye, at, up);
	near_slider.oninput = () => CalcMatrix(eye, at, up);
	far_slider.oninput = () => CalcMatrix(eye, at, up);
	
	xrot.oninput = () => CalcMatrix(eye, at, up);
	yrot.oninput = () => CalcMatrix(eye, at, up);
	zrot.oninput = () => CalcMatrix(eye, at, up);

	// must enable Depth test for 3D viewing in GL
	gl.enable(gl.DEPTH_TEST);

    render();
}

let theta = 0;
// all drawing is performed here
function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// gl.uniform1i(color_mode_loc, color_mode);
	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, num_verts, gl.UNSIGNED_SHORT, 0);
	

	setTimeout(
      function (){requestAnimFrame(render);}, delay
 	);
}