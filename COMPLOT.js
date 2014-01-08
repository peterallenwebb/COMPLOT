
var VSHADER_SOURCE =
'attribute vec4 a_Position;                                           \n' +
'void main()                                                          \n' +
'{                                                                    \n' +
'  gl_Position = a_Position;                                          \n' +
'}                                                                    \n';

var FSHADER_SOURCE =
'#define M_PI 3.1415926535897932384626433832795                       \n' +
'#define M_E 2.71828182845904523536028747135266                       \n' +
'precision highp float;                                             \n' +
'uniform float u_Width;                                               \n' +
'uniform float u_Height;                                              \n' +
'uniform float u_Param1;                                              \n' +

'vec4 getRgbaByArg(vec2 c)                                            \n' +
'{                                                                    \n' +
'    if (dot(c, c) < 0.00390625) return vec4(0.0, 0.0, 0.0, 1.0);     \n' +
'    if (dot(c, c) > 1.0 - 0.05 && dot(c, c) < 1.0 + 0.05)            \n' +
'        return vec4(0.0, 0.0, 0.0, 1.0);                             \n' +
'    float sixAngle = (atan(c.y, c.x) + M_PI) / M_PI * 3.0;           \n' +
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
'    return vec2(dot(z1, z2),                                         \n' +
'                z1.y * z2.x - z1.x * z2.y) / z2Mag2;                 \n' +
'}                                                                    \n' +

'vec2 cExp(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    float rFact = pow(M_E, z.x);                                     \n' +
'    vec2 cFact = vec2(cos(z.y), sin(z.y));                           \n' +
'    return rFact * cFact;                                            \n' +
'}                                                                    \n' +

'vec2 cArg(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return vec2(atan(z.y, z.x), 0.0);                                \n' +
'}                                                                    \n' +

'vec2 cSin(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    float eTozy = pow(M_E, z.y);                                     \n' +
'    float eToNegzy = pow(M_E, -z.y);                                 \n' +
'    return vec2(sin(z.x) * (eTozy + eToNegzy),                       \n' +
'                cos(z.x) * (eTozy - eToNegzy)) / 2.0;                \n' +
'}                                                                    \n' +

'vec2 cLog(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return vec2(log(sqrt(dot(z, z))),                                \n' +
'                cArg(z).x);                                          \n' +
'}                                                                    \n' +

'vec2 cMag(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return vec2(sqrt(dot(z, z)), 0.0);                               \n' +
'}                                                                    \n' +

// todos:
// cPow
// cCos
// cTan
// cSinh, cCosh
// cGamma (Lanczos)

'void main()                                                          \n' +
'{                                                                    \n' +
'    vec2 z = vec2(gl_FragCoord.x / u_Width - 0.5,                    \n' +
'                  0.5 - gl_FragCoord.y / u_Height);                  \n' +
'                                                                     \n' +
'    z = cExp(cDiv(vec2(1.0, 0.0),0.1*u_Param1*z));                                                    \n' +
'                                                                     \n' +
'                                                                     \n' +
'    gl_FragColor = getRgbaByArg(z);                                  \n' +
'}                                                                    \n' +
'                                                                     \n';

var parser = null;

function main() {
    
    jQuery.get('grammar.txt', function(data) { grammarReady(data); });

    var canvas = document.getElementById('webgl');
    
    $('#expr').on('change keyup paste', exprChange);
    $('#param1').change(paramChange);
    
    gl = getWebGLContext(canvas, { antialias: true });
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
    
    draw(gl, n);
}

function grammarReady(grammar) {
    parser = PEG.buildParser(grammar);
}

var parsedExpr = null;

function exprChange(event) {
    $('#parseStatus').removeClass('ok error unknown');
    $('#ast').val('');
    
    if (parser) {
        var newExpr = $(this).val();
        
        try {
            parsedExpr = parser.parse(newExpr);
            $('#ast').val(JSON.stringify(parsedExpr));
        }
        catch (exp) {
            $('#parseStatus').addClass('error');
            return;
        }
        
        $('#parseStatus').addClass('ok');
    }
}

function paramChange(event) {
    var newVal = $(this).val();
    gl.uniform1f(u_Param1, newVal);
    draw(gl);
}

// TODO: Finish this function next...
function astToShaderExpr(ast) {
    
    if (ast.type === "number") {
        return number.intPart + "." + number.fracPart;
    } else if (ast.type === "symbol") {
        
        switch (ast.name) {
            case "i":
                return { str: "vec2(0.0, 1.0)" };
            case "z":
                return { str: "z" };
            case "e":
                return { str: "M_E" };
            case "pi":
                return { str: "E_PI" };
            default:
                return { usedParams: [ ast.name ], str: "u_Param" + ast.name };
        }
    } else if (ast.type === "func") {
        var shaderFuncName = ast.name.charAt(0).toUpperCase() + ast.name.slice(1);
        
        var paramString = "";
        var usedParams = [];
        
        return { usedParams: usedParams, str: shaderFuncName + paramString };
    }
    
    throw "Unexpected node type found in abstract syntax tree.";
}

var a_Position = 0;
var u_Width = 0;
var u_Height = 0;
var u_Param1 = 0;
var gl = {};

function draw()
{
    gl.clearColor(0, 0, 0, 1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([ -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0 ]);
    
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
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    u_Width = gl.getUniformLocation(gl.program, 'u_Width');
    if (!u_Width) {
        console.log('Failed to get the storage location of u_Width');
        return;
    }
    
    u_Height = gl.getUniformLocation(gl.program, 'u_Height');
    if (!u_Height) {
        console.log('Failed to get the storage location of u_Height');
        return;
    }
    
    // Pass the width and hight of the <canvas>
    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);
    
    u_Param1 = gl.getUniformLocation(gl.program, 'u_Param1');
    if (!u_Param1) {
        console.log('Failed to get the storage location of u_Param1');
        return;
    }
    
    gl.uniform1f(u_Param1, 4.0);
    
    // Enable the generic vertex attribute array
    gl.enableVertexAttribArray(a_Position);
    
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
