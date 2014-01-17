
// TODO: Interpret hash portion of URL as formula for linking
// TODO: Support for negating symbols
// TODO: Support mouse-drag panning
// TODO: cSinh, cCosh
// TODO: cGamma (Lanczos)


var VSHADER_SOURCE =
'attribute vec4 a_Position;                                           \n' +
'void main()                                                          \n' +
'{                                                                    \n' +
'  gl_Position = a_Position;                                          \n' +
'}                                                                    \n';

var FSHADER_SOURCE =
'#define M_PI 3.1415926535897932384626433832795                       \n' +
'#define M_E 2.71828182845904523536028747135266                       \n' +
'precision highp float;                                               \n' +
'uniform float u_width;                                               \n' +
'uniform float u_height;                                              \n' +
'uniform float u_zoom;                                                \n' +

'vec4 getRgbaByArg(vec2 c)                                            \n' +
'{                                                                    \n' +
'    float sixAngle = (atan(c.y, c.x) + M_PI) / M_PI * 3.0;           \n' +
'    vec4 rgba;                                                       \n' +
'    if (sixAngle < 1.0) rgba = vec4(1.0, sixAngle, 0.0, 1.0);        \n' +
'    else if (sixAngle < 2.0) rgba = vec4(2.0 - sixAngle, 1.0, 0.0, 1.0);  \n' +
'    else if (sixAngle < 3.0) rgba = vec4(0.0, 1.0, sixAngle - 2.0, 1.0);  \n' +
'    else if (sixAngle < 4.0) rgba = vec4(0.0, 4.0 - sixAngle, 1.0, 1.0);  \n' +
'    else if (sixAngle < 5.0) rgba = vec4(sixAngle - 4.0, 0.0, 1.0, 1.0);  \n' +
'    else rgba = vec4(1.0, 0.0, 6.0 - sixAngle, 1.0);                 \n' +
'                                                                     \n' +
'    if (dot(c, c) < 0.00390625)                                      \n' +
'        rgba *= 0.8;                                                 \n' +
'                                                                     \n' +
'    if (dot(c, c) > 1.0 - 0.05 && dot(c, c) < 1.0 + 0.05)            \n' +
'        rgba *= 0.8;                                                 \n' +
'                                                                     \n' +
'    rgba[3] = 1.0;                                                   \n' +
'                                                                     \n' +
'    return rgba;                                                     \n' +
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

'vec2 cCos(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    float eTozy = pow(M_E, z.y);                                     \n' +
'    float eToNegzy = pow(M_E, -z.y);                                 \n' +
'    return vec2(cos(z.x) * (eTozy + eToNegzy),                       \n' +
'                -1.0 * sin(z.x) * (eTozy - eToNegzy)) / 2.0;         \n' +
'}                                                                    \n' +

'vec2 cTan(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return cDiv(cSin(z), cCos(z));                                   \n' +
'}                                                                    \n' +

'vec2 cLog(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return vec2(log(sqrt(dot(z, z))),                                \n' +
'                cArg(z).x);                                          \n' +
'}                                                                    \n' +

'vec2 cPow(vec2 z, vec2 c)                                            \n' +
'{                                                                    \n' +
'    return cExp(cMult(c, cLog(z)));                                  \n' +
'}                                                                    \n' +

'vec2 cMag(vec2 z)                                                    \n' +
'{                                                                    \n' +
'    return vec2(sqrt(dot(z, z)), 0.0);                               \n' +
'}                                                                    \n' +

'void main()                                                          \n' +
'{                                                                    \n' +
'    vec2 z = vec2(gl_FragCoord.x / u_width - 0.5,                    \n' +
'                  0.5 - gl_FragCoord.y / u_height);                  \n' +
'                                                                     \n' +
'    z /= u_zoom / 30.0;                                               \n' +
'                                                                     \n' +
'    z = {js_generated_expr};                                         \n' +
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
    
    $(document).mousemove(mouseMove);
    $(document).mouseup(mouseUp);
    $('#webgl').mousedown(mouseDown);
    $('#webgl').mousewheel(mouseWheel);
    
    gl = getWebGLContext(canvas, { antialias: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE.replace('{js_generated_expr}', 'z'))) {
        console.log('Failed to intialize shaders.');
    }
    
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    
    draw(gl, n);
}

var dragging = false;
var dragStart = { x: 0, y: 0 };

function mouseDown(event) {
    dragging = true;
    // TODO: Etc.
}

function mouseUp(event) {
}

function mouseDown(event) {
}

function mouseMove(event) {
}

function mouseWheel(event) {
    if (event.deltaY > 0)
        zoom *= 1.05;
    else if (event.deltaY < 0)
        zoom *= 0.95;
    
    gl.uniform1f(u_Zoom, zoom);
    draw(gl);
    
    console.log('wheel');
    
    return false;
}

function grammarReady(grammar) {
    parser = PEG.buildParser(grammar);
}

var parsedExprAst = null;

function exprChange(event) {
    $('#parseStatus').removeClass('ok error unknown');
    $('#ast').val('');
    
    if (parser) {
        var newExpr = $(this).val();
        
        try {
            var parsedExprAst = parser.parse(newExpr);
            $('#ast').val(JSON.stringify(parsedExprAst));
            
            var shaderExpr = astToShaderExpr(parsedExprAst);
            $('#shaderExpression').val(JSON.stringify(shaderExpr));
            
            updateShader(shaderExpr);
        }
        catch (exp) {
            $('#parseStatus').addClass('error');
            $('#shaderExpression').val(exp);
           return;
        }
        
        $('#parseStatus').addClass('ok');
    }
    else {
        $('#parseStatus').addClass('unknown');
    }
}

function updateShader(shaderExpr) {
    var shaderTxt = FSHADER_SOURCE.replace('{js_generated_expr}', shaderExpr.str);
    
    // TODO: Dry this up.
    if (!initShaders(gl, VSHADER_SOURCE, shaderTxt)) {
        console.log('Failed to intialize shaders.');
    }
    
    initVertexBuffers(gl);
    
    draw(gl);
}

function paramChange(event) {
    var newVal = $(this).val();
    gl.uniform1f(u_Zoom, newVal);
    draw(gl);
}

// Convert the abstract syntax tree created by the parser into a
// C-style expression in the shader language, and a list of the
// constants used in the expression.
function astToShaderExpr(ast) {
    
    if (ast.type === 'number') {
        return { str: 'vec2(' + ast.intPart + '.' + ast.fracPart + ', 0.0)' };
    } else if (ast.type === 'symbol') {
        
        switch (ast.name) {
            case 'i':
                return { str: 'vec2(0.0, 1.0)' };
            case 'z':
                return { str: 'z' };
            case 'e':
                return { str: 'vec2(M_E, 0.0)' };
            case 'pi':
                return { str: 'vec2(M_PI, 0.0)' };
            default:
                var usedParams = {};
                usedParams[ast.name] = ast.name;
                return { 'usedParams': usedParams, str: 'u_Param' + ast.name };
        }
    } else if (ast.type === 'func') {
        
        if (ast.name === 'add' || ast.name === 'sub') {
            var op = ast.name === 'add' ? '+' : '-';
            var leftExpr = astToShaderExpr(ast.params[0]);
            var rightExpr = astToShaderExpr(ast.params[1])
            var sumStr = '(' +  leftExpr.str + op +  rightExpr.str + ')';
            return { str: sumStr,
                     usedParams: { } };// TODO: Param merge
        }
        else {
            return getStdFuncExpr(ast);
        }
    }
    
    throw 'Unexpected node type found in abstract syntax tree.';
}

function getStdFuncExpr(ast) {
    var shaderFuncName = 'c' + ast.name.charAt(0).toUpperCase() + ast.name.slice(1);
    
    var paramsString = '';
    var usedParams = [];
    
    var first = true;
    for (var paramIdx in ast.params) {
        var paramExpr = astToShaderExpr(ast.params[paramIdx]);
        
        if (first === false)
            paramsString = paramsString + ', ';
        
        paramsString += paramExpr.str;
        
        if (paramExpr.usedParams) {
            for (var exprParamIdx in paramExpr.usedParams) {
                usedParams[exprParamIdx] = exprParamIdx;
            }
        }
        
        first = false;
    }
    
    return { usedParams: usedParams,
        str: shaderFuncName + '(' + paramsString + ')' };
}

var a_Position = 0;
var u_Width = 0;
var u_Height = 0;
var u_Zoom = 0;

var zoom = 1.0;

var gl = {};

var u_centerX = 0.0;
var u_centerY = 0.0;

function draw() {
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
    
    u_Width = gl.getUniformLocation(gl.program, 'u_width');
    if (!u_Width) {
        console.log('Failed to get the storage location of u_width');
        return;
    }
    
    u_Height = gl.getUniformLocation(gl.program, 'u_height');
    if (!u_Height) {
        console.log('Failed to get the storage location of u_height');
        return;
    }
    
    // Pass the width and hight of the <canvas>
    gl.uniform1f(u_Width, gl.drawingBufferWidth);
    gl.uniform1f(u_Height, gl.drawingBufferHeight);
    
    u_Zoom = gl.getUniformLocation(gl.program, 'u_zoom');
    if (!u_Zoom) {
        console.log('Failed to get the storage location of u_zoom');
        return;
    }
    
    gl.uniform1f(u_Zoom, zoom);
     
    // Enable the generic vertex attribute array
    gl.enableVertexAttribArray(a_Position);
    
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
