var canvas;

/** @type {WebGLRenderingContext} */
var gl;

var program;
var vertexShader, fragmentShader;

var delay = 10;

var num_verts = teapot_indices.length;

var vert_colors = [];

var vBuffer, cBuffer, iBuffer;
var vColor, vPosition;

var M_comp_loc;

var M_comp = mat4(); 

let rcolor = () => [Math.random(), Math.random(), Math.random(), 1.];
let wcolor = () => [1., 1., 1., 1.];

let GenColors = () => {
	for(let i = 0; i < num_verts; ++i) vert_colors.push(wcolor());
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

	// set up viewport
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

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

	// must enable Depth test for 3D viewing in GL
	gl.enable(gl.DEPTH_TEST);

    render();
}

let theta = 0;
// all drawing is performed here
function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	scale = 0.01;
	theta += 0.01;

	M_comp = mat4();
	M_comp = matMult(scale4x4(scale,scale,scale), M_comp);
	M_comp = matMult(rotate4x4(theta, 'y'), M_comp);


	gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
	gl.drawElements(gl.TRIANGLES, num_verts, gl.UNSIGNED_SHORT, 0);
	

	setTimeout(
      function (){requestAnimFrame(render);}, delay
 	);
}