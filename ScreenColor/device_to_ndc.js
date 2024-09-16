function getMousePosition(event) {
	const rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left, y = event.clientY - rect.top;

	// convert to -1 to 1 range for webgl canvas coords with 
	// (-1, -1) as the lower left of the window
	x =  -1 + (x/canvas.width)*2.;
	y =   1 - (y/canvas.height)*2;

	return [x, y];
}

