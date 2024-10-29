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

var color_mode_loc;
var color_mode = 0;

let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];
let wcolor = () => [1., 1., 1., 1.];

let current_color

let GenColors = () => {
	for(let i = 0; i < num_verts; ++i) vert_colors.push(rcolor());
}

function toggleColor() {
	color_mode = (color_mode+1) % 2;
}

function lookAt(eye, at, up) {
	function CalcVPN(eye, at) {
		return [at[0]-eye[0], at[1]-eye[1], at[2]-eye[2]];
	}

	let n = normalize(CalcVPN(eye, at), false);
	let u = normalize(cross_product(n, up), false);
	let v = normalize(cross_product(u,n), false);

	// let t = negate(eye);
	// let i = translate4x4(...t);
	
	let r = [ [...u, 0], [...v, 0], [...n, 0], [0,0,0,1] ];

	// let V = matMult(r, i);
	let V = r;

	return V;
}

function GetBoundingBox() {

	let left = teapot_vertices[0][0];
	let right = teapot_vertices[0][0];
	let bottom = teapot_vertices[0][1];
	let top = teapot_vertices[0][1];
	let near = teapot_vertices[0][2];
	let far = teapot_vertices[0][2];

	teapot_vertices.forEach( (e) =>  {
		left = Math.min(left, e[0]);
		right = Math.max(right, e[0]);

		bottom = Math.min(bottom, e[1]);
		top = Math.max(top, e[1]);

		near = Math.min(near, e[2]);
		far = Math.max(far, e[2]);
	} );


	// This process gives a generous square bounding box
	let vals = [left, right, bottom, top, near, far];
	let min = Math.min(...vals);
	let max = Math.max(...vals);

	return [min, max, min, max, min, max];
}

function NormOrthoMatrix(left, right, bottom, top, near, far) {
	let mat = mat4();

	let flip_z = identity4();

	mat = matMult( translate4x4( -(left+right)/2.0, -(bottom+top)/2.0, -(-near+-far)/2.0 ), mat );
	mat = matMult( scale4x4(2.0/(right-left), 2.0/(top-bottom), 2.0/(far-near)), mat );
	mat = matMult( flip_z, mat );

	return mat;
}

function CalcMatrix(eye, at, up) {
	
	let look_at = lookAt(eye, at, up);
	let b_box = GetBoundingBox();
	let normalize = NormOrthoMatrix(...b_box);

	M_comp = mat4();
	M_comp = matMult(look_at, M_comp);
	M_comp = matMult(normalize, M_comp);
	M_comp = matMult(scale4x4(0.85, 0.85, 0.85), M_comp);

	console.log()
}



// all initializations
window.onload = function init() {
	// get canvas handle
	canvas = document.getElementById( "gl-canvas" );

	// WebGL Initialization
	gl = initWebGL(canvas);
	if (!gl ) {
		alert( "WebGL isn't available" );
	}

	GenColors();
	CalcMatrix([0,0,1], [0,0,0], [0,1,1]);

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
	color_mode_loc = gl.getUniformLocation(program, "color_mode");

	// must enable Depth test for 3D viewing in GL
	gl.enable(gl.DEPTH_TEST);

    render();
}

let theta = 0;
// all drawing is performed here
function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.uniform1i(color_mode_loc, color_mode);
	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, num_verts, gl.UNSIGNED_SHORT, 0);
	

	setTimeout(
      function (){requestAnimFrame(render);}, delay
 	);
}