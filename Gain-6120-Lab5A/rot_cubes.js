var canvas;

/** @type {WebGLRenderingContext} */
var gl;

var program;
var vertexShader, fragmentShader;

var delay = 50;

var NumCubeVertices = 36;

var cube_verts  = []; 
var cube_vert_cols = [];
var cube_element_indices = [];

var vBuffer, cBuffer, iBuffer;
var vColor, vPosition;

var M_comp_loc;
var theta = 0., phi = 0.;

var M_comp = mat4(); 

var RotSpeedInput;
var thetaDelta = 0;

// all initializations
window.onload = function init() {
	// get canvas handle
	canvas = document.getElementById( "gl-canvas" );

	RotSpeedInput = document.getElementById("RotSpeed");

	RotSpeedInput.onchange = () => {
		thetaDelta = parseFloat(RotSpeedInput.value);
	}

	thetaDelta = parseFloat(RotSpeedInput.value);
	
	// WebGL Initialization
	gl = initWebGL(canvas);
	if (!gl ) {
		alert( "WebGL isn't available" );
	}

	// set up viewport
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

	// create shaders, compile and link program
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// create the colored cube
	createColorCube();

    // buffers to hold cube vertices, colors and indices
	vBuffer = gl.createBuffer();
	cBuffer = gl.createBuffer();
	iBuffer = gl.createBuffer();

	// allocate and send vertices to buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cube_verts), gl.STATIC_DRAW);

    // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );	

	// similarly for color buffer
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(cube_vert_cols), gl.STATIC_DRAW );

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vColor );

	// index buffer 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cube_element_indices),
								 gl.STATIC_DRAW);

	M_comp_loc = gl.getUniformLocation(program, "M_comp");

	// must enable Depth test for 3D viewing in GL
	gl.enable(gl.DEPTH_TEST);

    render();
}

// all drawing is performed here
function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	theta += thetaDelta;

	// center cube
	M_comp = matMult(rotate4x4(-10., 'x'), matMult(rotate4x4(10., 'y'),  scale4x4(0.1, 0.1, 0.1) ));
	M_comp = matMult(rotate4x4(theta, 'x'), M_comp);
	M_comp = matMult(rotate4x4(theta, 'y'), M_comp);
	M_comp = matMult(rotate4x4(theta, 'z'), M_comp);

	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, NumCubeVertices, gl.UNSIGNED_BYTE, 0);
	
	// TODO : Cube Rotating about X
	M_comp = scale4x4(0.1, 0.1, 0.1);
	M_comp = matMult(translate4x4(0., 0.5, 0.), M_comp);
	M_comp = matMult(rotate4x4(theta, 'x'), M_comp);
	
	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, NumCubeVertices, gl.UNSIGNED_BYTE, 0);
	
	// TODO : Cube Rotation about Y
	M_comp = scale4x4(0.1, 0.1, 0.1);
	M_comp = matMult(translate4x4(0., 0., 0.5), M_comp);
	M_comp = matMult(rotate4x4(theta, 'y'), M_comp);
	
	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, NumCubeVertices, gl.UNSIGNED_BYTE, 0);	
	
	// TODO : Cube Rotation about Z
	M_comp = scale4x4(0.1, 0.1, 0.1);
	M_comp = matMult(translate4x4(0.5, 0., 0.), M_comp);
	M_comp = matMult(rotate4x4(theta, 'z'), M_comp);

	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, NumCubeVertices, gl.UNSIGNED_BYTE, 0);
	

	// increment angle

	setTimeout(
      function (){requestAnimFrame(render);}, delay
 	);
}

function createColorCube() {
	cube_verts = getCubeVertices();
	cube_vert_cols = getCubeVertexColors();
	cube_element_indices = getCubeElementIndices();
}

// create indices for each  triangle; these point to the vertex
function getCubeElementIndices () {
	return [
		1, 0, 3,
		3, 2, 1,
		2, 3, 7,
		7, 6, 2,
		3, 0, 4,
		4, 7, 3,
		6, 5, 1,
		1, 2, 6,
		4, 5, 6,
		6, 7, 4,
		5, 4, 0,
		0, 1, 5
	];
}

function getCubeVertices() {
	return [
        vec3( -1.00, -1.00,  1.00 ),
        vec3( -1.00,  1.00,  1.00 ),
        vec3(  1.00,  1.00,  1.00 ),
        vec3(  1.00, -1.00,  1.00 ),
        vec3( -1.00, -1.00,  -1.00 ),
        vec3( -1.00,  1.00,  -1.00 ),
        vec3(  1.00,  1.00,  -1.00 ),
        vec3(  1.00, -1.00,  -1.00 )
    ];
}
function getCubeVertexColors() {
	let cols = [];
	for (let k = 0; k < 8; k++)
		cols.push (Math.random(), Math.random(), Math.random(), 1.);

	return cols;
}

