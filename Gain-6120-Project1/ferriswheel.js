
// some globals
/** @type {WebGLRenderingContext} */
var gl;

/** @type {ANGLE_instanced_arrays}*/
var ext;

var canvas;

var matrices = [];
var colors = [];
var numInstances = 24+(12*6);

var program;

var squareBuffer;
var squareColorBuffer;
var squareMatrixBuffer;

var positionBuffer;
var colorBuffer;
var matrixBuffer;

var matrixLoc;
var colorLoc;
var positionLoc;

var delay = 10;
var sc = 0.9;

var scaleSlider;

let world2NDC_mat = () => {
	let translate = translate4x4(-1024, -1024, 0);
	let sc = scale4x4(1/1024, 1/1024, 1);

	return matMult(sc, translate);
}


function GetMatrices(theta, chairRock, scale) {
	let deg2rad = (deg) => {return deg * (Math.PI/180);}

	let mats = [];

	let spokeRot = deg2rad(360/12);
	let spoke2addRot = deg2rad(-3);


	// Spoke Transforms
	for (let i = 0; i < 12; ++i) {
		let mat = identity4();
		mat = matMult(world2NDC_mat(), mat);
		mat = matMult(rotate4x4(spokeRot*i, 'z'), mat);
		mat = matMult(rotate4x4(theta, 'z'), mat);
		mat = matMult(scale4x4(scale,scale,1), mat);
		
		let mat2 = identity4();
		mat2 = matMult(world2NDC_mat(), mat2);
		mat2 = matMult(rotate4x4( (spokeRot*i)+spoke2addRot , 'z'), mat2);
		mat2 = matMult(rotate4x4(theta, 'z'), mat2);
		mat2 = matMult(scale4x4(scale,scale,1), mat2);
		
		mat = transpose(mat);
		mat2 = transpose(mat2);
		
		mats.push(mat, mat2);
	}
	
	let deg90 = deg2rad(90);
	
	// Seat Transforms
	for (let i = 0; i < 12; ++i) {
		let rotation = spokeRot*i;
		let x = scale * Math.cos(rotation+theta);
		let y = scale * Math.sin(rotation+theta);

		let mat = identity4();
		mat = matMult(world2NDC_mat(), mat);
		mat = matMult(scale4x4(0.1*scale,0.1*scale,1*scale), mat);
		mat = matMult(translate4x4(-0.05*scale, 0., 0.), mat);
		mat = matMult(rotate4x4(chairRock, 'z'), mat);
		mat = matMult(translate4x4(x, y, 0.), mat);

		let mat2 = identity4();
		mat2 = matMult(world2NDC_mat(), mat2);
		mat2 = matMult(scale4x4(0.1*scale,0.1*scale,1*scale), mat2);
		mat2 = matMult(rotate4x4(deg90, 'z'), mat2);
		mat2 = matMult(translate4x4(-0.05*scale, -0.1*scale, 0.), mat2);
		mat2 = matMult(rotate4x4(chairRock, 'z'), mat2);
		mat2 = matMult(translate4x4(x, y, 0.), mat2);
		
		let mat3 = identity4();
		mat3 = matMult(world2NDC_mat(), mat3);
		mat3 = matMult(scale4x4(0.2*scale,0.2*scale,1*scale), mat3);
		mat3 = matMult(rotate4x4(deg90, 'z'), mat3);
		mat3 = matMult(translate4x4(0.05*scale, -0.1*scale, 0.), mat3);
		mat3 = matMult(rotate4x4(chairRock, 'z'), mat3);
		mat3 = matMult(translate4x4(x, y, 0.), mat3);
		
		// Secondary
		let mat4 = identity4();
		mat4 = matMult(world2NDC_mat(), mat4);
		mat4 = matMult(scale4x4(0.1*scale,0.1*scale,1*scale), mat4);
		mat4 = matMult(translate4x4(-0.05*scale, 0.02*scale, 0.), mat4);
		mat4 = matMult(rotate4x4(chairRock, 'z'), mat4);
		mat4 = matMult(translate4x4(x, y, 0.), mat4);

		let mat5 = identity4();
		mat5 = matMult(world2NDC_mat(), mat5);
		mat5 = matMult(scale4x4(0.1*scale,0.1*scale,1*scale), mat5);
		mat5 = matMult(rotate4x4(deg90, 'z'), mat5);
		mat5 = matMult(translate4x4(-0.03*scale, -0.1*scale, 0.), mat5);
		mat5 = matMult(rotate4x4(chairRock, 'z'), mat5);
		mat5 = matMult(translate4x4(x, y, 0.), mat5);
		
		let mat6 = identity4();
		mat6 = matMult(world2NDC_mat(), mat6);
		mat6 = matMult(scale4x4(0.2*scale,0.2*scale,1*scale), mat6);
		mat6 = matMult(rotate4x4(deg90, 'z'), mat6);
		mat6 = matMult(translate4x4(0.07*scale, -0.1*scale, 0.), mat6);
		mat6 = matMult(rotate4x4(chairRock, 'z'), mat6);
		mat6 = matMult(translate4x4(x, y, 0.), mat6);
		

		mat = transpose(mat);
		mat2 = transpose(mat2);
		mat3 = transpose(mat3);
		mat4 = transpose(mat4);
		mat5 = transpose(mat5);
		mat6 = transpose(mat6);

		mats.push(mat, mat2, mat3, mat4, mat5, mat6);
	}

	return mats;
}

// Your GL program starts after the HTML page is loaded, indicated
// by the onload event
window.onload = function init() {
	
	// get the canvas handle from the document's DOM
    canvas = document.getElementById( "gl-canvas" );

	scaleSlider = document.getElementById("scaleSlider");

	scaleSlider.onchange = () => {
		sc = parseFloat(scaleSlider.value);
	}

	// initialize webgl, returns gl context (handle to the drawing canvas)
	gl = initWebGL(canvas);
	if (!gl) { 
		alert( "WebGL isn't available" ); 
	}
	
	ext = gl.getExtension('ANGLE_instanced_arrays');
	if (!ext) {
		alert('need ANGLE_instanced_arrays');
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

	matrixLoc = gl.getAttribLocation(program, "matrix");
	colorLoc = gl.getAttribLocation(program, "vColor");
	positionLoc = gl.getAttribLocation( program, "vPosition");

	// create a vertex buffer - this will hold all vertices
    positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten([[1024., 1024., 0., 1.], [2048., 1024., 0., 1.]]), gl.STATIC_DRAW);

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(
	[
		//[0, 8., 1., 1.], [0, 8., 1., 1.], [0, 8., 1., 1.], [0, 8., 1., 1.], [0, 8., 1., 1.], [0, 8., 1., 1.], // Square
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], // Spokes begin
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], 
		[1.0, 1.0, 0.0, 1.0], [0, 8., 1., 1.], // Spokes end
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], // Seats begin 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], // Seats end
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], // Seats begin 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.], 
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.],  // Seats end
	]),
	gl.STATIC_DRAW);

	matrixBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16*4*numInstances, gl.DYNAMIC_DRAW);


	squareBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, flatten([[-1126.4, -1126.4, 0., 1.], [-1126.4, 1126.4, 0., 1.], [1126.4, -1126.4, 0., 1.], [1126.4, 1126.4, 0., 1.]]), gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER, flatten([[921.6, 921.6, 0., 1.], [921.6, 1126.4, 0., 1.], [1126.4, 921.6, 0., 1.], [1126.4, 1126.4, 0., 1.]]), gl.STATIC_DRAW);

	squareColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten([[0, 8., 1., 1.]]),gl.STATIC_DRAW);

	squareMatrixBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareMatrixBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16*4*60, gl.DYNAMIC_DRAW);

    render();
};

let t = 0.0;
let ch = 0.0;
let isRockingForward = true;

function updateBuffers() {
	t += 0.005;

	if (isRockingForward) {
		ch -= 0.005;

		if (ch < -0.2) isRockingForward = false;
	}
	else {
		ch += 0.005;

		if (ch > 0.2) isRockingForward = true;
	}

	gl.useProgram(program);

	//#region Vertex Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.enableVertexAttribArray(positionLoc);
	gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, true, 0, 0);
	//#endregion

	//#region Color Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.enableVertexAttribArray(colorLoc);
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

	ext.vertexAttribDivisorANGLE(colorLoc, 1);
	//#endregion

	//#region Matrix Buffer
	matrices = GetMatrices(t, ch, sc);


	let newMats = [];
	for (let i = 0; i < matrices.length; ++i) {
		for (let j = 0; j < 4; ++j) {
			newMats.push(matrices[i][j]);
			newMats[i].matrix = true;
		}
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(newMats));

	for (let i = 0; i < 4; ++i) {
		const LOC = matrixLoc + i;
		gl.enableVertexAttribArray(LOC);
		gl.vertexAttribPointer(LOC, 4, gl.FLOAT, false, 16*4, i*16);
	
		ext.vertexAttribDivisorANGLE(LOC, 1);
	}
	//#endregion
}

function updateSquareBuffers() {

	gl.useProgram(program);

	//#region Vertex Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
	gl.enableVertexAttribArray(positionLoc);
	gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, true, 0, 0);
	//#endregion

	//#region Color Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
	gl.enableVertexAttribArray(colorLoc);
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

	ext.vertexAttribDivisorANGLE(colorLoc, 1);
	//#endregion

	//#region Matrix Buffer
	matrices = [transpose(
		matMult(scale4x4(0.7*sc,0.7*sc,1.*sc), world2NDC_mat())
	)];

	let newMats = [];
	for (let i = 0; i < matrices.length; ++i) {
		for (let j = 0; j < 4; ++j) {
			newMats.push(matrices[i][j]);
			newMats[i].matrix = true;
		}
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, squareMatrixBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(newMats));

	for (let i = 0; i < 4; ++i) {
		const LOC = matrixLoc + i;
		gl.enableVertexAttribArray(LOC);
		gl.vertexAttribPointer(LOC, 4, gl.FLOAT, false, 16*4, i*16);
	
		ext.vertexAttribDivisorANGLE(LOC, 1);
	}
	//#endregion
}

function render() {

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	updateBuffers();
	ext.drawArraysInstancedANGLE(
		gl.LINES,
		0,
		2,
		numInstances
	  );


	updateSquareBuffers();
	ext.drawArraysInstancedANGLE(
		gl.TRIANGLE_STRIP,
		0,
		4,
		1
	  );

	  
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
