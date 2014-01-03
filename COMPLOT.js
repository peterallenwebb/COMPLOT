
var VSHADER_SOURCE =
'attribute vec4 a_Position;                                           \n' +
'void main()                                                          \n' +
'{                                                                    \n' +
'  gl_Position = a_Position;                                          \n' +
'}                                                                    \n';

var FSHADER_SOURCE =
'#define M_PI 3.1415926535897932384626433832795                       \n' +
'#define M_E 2.71828182845904523536028747135266                       \n' +
'precision mediump float;                                             \n' +
'uniform float u_Width;                                               \n' +
'uniform float u_Height;                                              \n' +

'vec4 getRgbaByArg(vec2 c)                                            \n' +
'{                                                                    \n' +
'    float sixAngle = (atan(c.y, c.x) + M_PI)/ M_PI * 3.0;            \n' +
'    if (sixAngle < 1.0) return vec4(1.0, sixAngle, 0.0, 1.0);        \n' +
'    if (sixAngle < 2.0) return vec4(2.0 - sixAngle, 1.0, 0.0, 1.0);  \n' +
'    if (sixAngle < 3.0) return vec4(0.0, 1.0, sixAngle - 2.0, 1.0);  \n' +
'    if (sixAngle < 4.0) return vec4(0.0, 4.0 - sixAngle, 1.0, 1.0);  \n' +
'    if (sixAngle < 5.0) return vec4(sixAngle - 4.0, 0.0, 1.0, 1.0);  \n' +
'    return vec4(1.0, 0.0, 6.0 - sixAngle, 1.0);                      \n' +
'}                                                                    \n' +

'vec2 cMult(vec2 z1, vec2 z2)                                         \n' +
'{                                                                    \n' +
'    return vec2(z1.x * z2.x - z1.y * z2.y,                           \n' +
'                z1.x * z2.y + z1.y * z2.x);                          \n' +
'}                                                                    \n' +

'vec2 cDiv(vec2 z1, vec2 z2)                                          \n' +
'{                                                                    \n' +
'    float z2Mag2 = dot(z2, z2);                                      \n' +
'    return vec2(dot(z1, z2) / z2Mag2,                                \n' +
'                (z1.y * z2.x - z1.x * z2.y) / z2Mag2);               \n' +
'}                                                                    \n' +

'vec2 cExp(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    float rFact = pow(M_E, z.x);                                     \n' +
'    vec2 cFact = vec2(cos(z.y), sin(z.y));                           \n' +
'    return rFact * cFact;                                            \n' +
'}                                                                    \n' +

// todos:
// cPow
// cSin
// cCos
// cTan

'void main()                                                          \n' +
'{                                                                    \n' +
'    vec2 z = vec2(0.5 - gl_FragCoord.x / u_Width,                    \n' +
'                  0.5 - gl_FragCoord.y / u_Height);                  \n' +
'                                                                     \n' +
'    z = cMult(vec2(1,2) - z, cDiv(cExp(13.0*z), cMult(z, z)));                                     \n' +
'                                                                     \n' +
'                                                                     \n' +
'    gl_FragColor = getRgbaByArg(z);                                  \n' +
'}                                                                    \n' +
'                                                                     \n' +
'                                                                     \n' +
'                                                                     \n';

function main() {

    var canvas = document.getElementById('webgl');
    
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    
    gl.clearColor(0, 0, 0, 1);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([ -1.0, 1.0, 1.0, 1.0, 1.0, -1.0,   -1.0, -1.0, -1.0, 1.0, 1.0, -1.0 ]);
    var n = 6; // The number of vertices
    
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Pass the position of a point to a_Position variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    var u_Width = gl.getUniformLocation(gl.program, 'u_Width');
    if (!u_Width) {
        console.log('Failed to get the storage location of u_Width');
        return;
    }
    
    var u_Height = gl.getUniformLocation(gl.program, 'u_Height');
    if (!u_Height) {
        console.log('Failed to get the storage location of u_Height');
        return;
    }
    
    // Pass the width and hight of the <canvas>
    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);
    
    // Enable the generic vertex attribute array
    gl.enableVertexAttribArray(a_Position);
    
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return n;
}