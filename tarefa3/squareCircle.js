
var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 0;

window.onload = function (){
	document.getElementById("clickMe").onclick = onClickGerar;
	document.getElementById("num").onkeydown = function(e){
		var charCode = (typeof e.which === "number") ? e.which : e.keyCode;
		if(charCode === 13){
			onClickGerar();
			e.preventDefault();
		}
	}
	init();
}

function onClickGerar ()
{
	var temp = parseInt(document.getElementById("num").value);
	if(!isNaN(temp)){
		temp = (temp > 10) ? 10 : temp; 
		NumTimesToSubdivide = temp;
		init();
	}
	document.getElementById("num").value = "";
}

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //  Initialize our data
    points = [
    	vec2(0.0, 1.0),
	    vec2(1.0, 0.0),
    	vec2(0.0, -1.0),
		vec2(-1.0, 0.0)
    ];

    points = divideSquare( points, NumTimesToSubdivide);

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

/*function polygon( a, b, c, d )
{
    points.push( a, b, c, d );
}*/

function divideSquare( points, count )
{
    // check for end of recursion
    while ( count !== 0 ) {
		var newPoints = points.slice(0);
		var l = points.length;
		var med;
		for (var i = 0, j = 1, index = 1; i < l; i++, j++, index += 2 ){
			j = (i === l - 1) ? 0 : j; 
			med = normalize(mix(points[i], points[j], 0.5));
			if (j === 0){
				newPoints.push(med);
			}
			else{
				newPoints.splice(index, 0, med);
			}
		}
		points = newPoints;
		count--;
    }
	return points
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length );
}

