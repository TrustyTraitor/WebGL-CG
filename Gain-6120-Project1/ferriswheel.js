
// some globals
/** @type {WebGLRenderingContext} */
var gl;

/** @type {WebGL}*/
var ext;

var canvas;

var matrices = [];
var colors = [];
var numInstances = 24+(12*3);

var program;

var positionBuffer;
var colorBuffer;
var matrixBuffer;

var matrixLoc;
var colorLoc;
var positionLoc;



var delay = 10;

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

	return ndc_coords;
}

let rcolor = () => {
	return [Math.random(), Math.random(), Math.random()];
}


function GetMatrices(theta, chairRock) {
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
		mat = matMult(scale4x4(0.65,0.65,1), mat);
		
		let mat2 = identity4();
		mat2 = matMult(world2NDC_mat(), mat2);
		mat2 = matMult(rotate4x4( (spokeRot*i)+spoke2addRot , 'z'), mat2);
		mat2 = matMult(rotate4x4(theta, 'z'), mat2);
		mat2 = matMult(scale4x4(0.65,0.65,1), mat2);
		
		mat = transpose(mat);
		mat2 = transpose(mat2);
		
		mats.push(mat, mat2);
	}
	
	let deg90 = deg2rad(90);
	
	// Seat Transforms
	for (let i = 0; i < 12; ++i) {
		let rotation = spokeRot*i;
		let x = 0.65 * Math.cos(rotation+theta);
		let y = 0.65 * Math.sin(rotation+theta);

		let mat = identity4();
		mat = matMult(world2NDC_mat(), mat);
		mat = matMult(scale4x4(0.1,0.1,1), mat);
		mat = matMult(translate4x4(-0.05, 0., 0.), mat);
		mat = matMult(rotate4x4(chairRock, 'z'), mat);
		mat = matMult(translate4x4(x, y, 0.), mat);

		let mat2 = identity4();
		mat2 = matMult(world2NDC_mat(), mat2);
		mat2 = matMult(scale4x4(0.1,0.1,1), mat2);
		mat2 = matMult(rotate4x4(deg90, 'z'), mat2);
		mat2 = matMult(translate4x4(-0.05, -0.1, 0.), mat2);
		mat2 = matMult(rotate4x4(chairRock, 'z'), mat2);
		mat2 = matMult(translate4x4(x, y, 0.), mat2);
		
		let mat3 = identity4();
		mat3 = matMult(world2NDC_mat(), mat3);
		mat3 = matMult(scale4x4(0.2,0.2,1), mat3);
		mat3 = matMult(rotate4x4(deg90, 'z'), mat3);
		mat3 = matMult(translate4x4(0.05, -0.1, 0.), mat3);
		mat3 = matMult(rotate4x4(chairRock, 'z'), mat3);
		mat3 = matMult(translate4x4(x, y, 0.), mat3);
		
		mat = transpose(mat);
		mat2 = transpose(mat2);
		mat3 = transpose(mat3);

		mats.push(mat, mat2, mat3);
	}
	//console.log(mats[mats.length-1]);
	return mats;
}

// Your GL program starts after the HTML page is loaded, indicated
// by the onload event
window.onload = function init() {
	
	// get the canvas handle from the document's DOM
    canvas = document.getElementById( "gl-canvas" );

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
	// gl.bufferData(gl.ARRAY_BUFFER, flatten([[0., 0., 0., 1.], [1., 0., 0., 1.]]), gl.STATIC_DRAW);

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
		[1., 1., 1., 1.], [1., 1., 1., 1.], [1., 1., 1., 1.]  // Seats end
	]),
	gl.STATIC_DRAW);

	matrixBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16*4*60, gl.DYNAMIC_DRAW);


    render();
};

let t = 0.0;
let ch = 0.0;
let isRockingForward = true;

function updateBuffers() {
	t -= 0.00;

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
	matrices = GetMatrices(t, ch);

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

function render() {

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	updateBuffers();

    //gl.drawArrays(gl.LINES, 0, 2);
	ext.drawArraysInstancedANGLE(
		gl.LINES,
		0,
		2,
		numInstances
	  );
    
	// TODO: Draw Center Square


    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
