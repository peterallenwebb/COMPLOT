// TODO: exponents aren't workng on the iteration variable?

function COMPLOT(canvas, hostElem) {

    // Inelegantly include the WebGL vertex shader source code as a sting...
    var VSHADER_SOURCE =
    'attribute vec4 a_Position;                                           \n' +
    'void main()                                                          \n' +
    '{                                                                    \n' +
    '  gl_Position = a_Position;                                          \n' +
    '}                                                                    \n';

    // ...and do the same for the much more interesting fragment shader.
    var FSHADER_SOURCE =
    '#define M_PI 3.1415926535897932384626433832795                       \n' +
    '#define M_E  2.71828182845904523536028747135266                      \n' +
    'precision highp float;                                               \n' +
    'uniform float u_width;                                               \n' +
    'uniform float u_height;                                              \n' +
    'uniform float u_offsetX;                                             \n' +
    'uniform float u_offsetY;                                             \n' +
    'uniform float u_zoom;                                                \n' +
    'uniform vec2 u_paramA;                                               \n' +
    '\n' +
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
    '    c = c * 5.0;                                                                 \n' +
    '    float rFloor = c.x - mod(c.x, 1.0);                              \n' +
    '    float iFloor = c.y - mod(c.y, 1.0);                              \n' +
    '                                                                     \n' +
    '    if (mod(rFloor + iFloor, 2.0) == 0.0)                            \n' +
    '        rgba *= 0.8;                                                 \n' +
    '                                                                     \n' +
    '    rgba[3] = 1.0;                                                   \n' +
    '                                                                     \n' +
    '    return rgba;                                                     \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cMult(vec2 z1, vec2 z2)                                         \n' +
    '{                                                                    \n' +
    '    return vec2(z1.x * z2.x - z1.y * z2.y,                           \n' +
    '                z1.x * z2.y + z1.y * z2.x);                          \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cDiv(vec2 z1, vec2 z2)                                          \n' +
    '{                                                                    \n' +
    '    float z2Mag2 = dot(z2, z2);                                      \n' +
    '    return vec2(dot(z1, z2),                                         \n' +
    '                z1.y * z2.x - z1.x * z2.y) / z2Mag2;                 \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cExp(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    float rFact = pow(M_E, z.x);                                     \n' +
    '    vec2 cFact = vec2(cos(z.y), sin(z.y));                           \n' +
    '    return rFact * cFact;                                            \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cArg(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    return vec2(atan(z.y, z.x), 0.0);                                \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cSin(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    float eTozy = pow(M_E, z.y);                                     \n' +
    '    float eToNegzy = pow(M_E, -z.y);                                 \n' +
    '    return vec2(sin(z.x) * (eTozy + eToNegzy),                       \n' +
    '                cos(z.x) * (eTozy - eToNegzy)) / 2.0;                \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cCos(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    float eTozy = pow(M_E, z.y);                                     \n' +
    '    float eToNegzy = pow(M_E, -z.y);                                 \n' +
    '    return vec2(cos(z.x) * (eTozy + eToNegzy),                       \n' +
    '                -1.0 * sin(z.x) * (eTozy - eToNegzy)) / 2.0;         \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cSinh(vec2 z)                                                   \n' +
    '{                                                                    \n' +
    '    return (cExp(z) - cExp(-z)) / 2.0;                               \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cCosh(vec2 z)                                                   \n' +
    '{                                                                    \n' +
    '    return (cExp(z) + cExp(-z)) / 2.0;                               \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cTan(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    return cDiv(cSin(z), cCos(z));                                   \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cLog(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    return vec2(log(sqrt(dot(z, z))),                                \n' +
    '                cArg(z).x);                                          \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cPow(vec2 z, vec2 c)                                            \n' +
    '{                                                                    \n' +
    '    return cExp(cMult(c, cLog(z)));                                  \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cMag(vec2 z)                                                    \n' +
    '{                                                                    \n' +
    '    return vec2(sqrt(dot(z, z)), 0.0);                               \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cRe(vec2 z)                                                     \n' +
    '{                                                                    \n' +
    '    return vec2(z.x, 0.0);                                           \n' +
    '}                                                                    \n' +
    '\n' +
    'vec2 cIm(vec2 z)                                                     \n' +
    '{                                                                    \n' +
    '    return vec2(z.y, 0.0);                                           \n' +
    '}                                                                    \n' +
    '\n' +
    // Gamma function implementation based on Lanczos approximation. Adapted from
    // python code in Wikipedia entry on Lanczos.
    'vec2 cGamma(vec2 z)                                                    \n' +
    '{                                                                      \n' +
    '    float p[9];                                                        \n' +
    '    p[0] = 0.99999999999980993;                                        \n' +
    '    p[1] = 676.5203681218851;                                          \n' +
    '    p[2] = -1259.1392167224028;                                        \n' +
    '    p[3] = 771.32342877765313;                                         \n' +
    '    p[4] = -176.61502916214059;                                        \n' +
    '    p[5] = 12.507343278686905;                                         \n' +
    '    p[6] = -0.13857109526572012;                                       \n' +
    '    p[7] = 9.9843695780195716e-6;                                      \n' +
    '    p[8] = 1.5056327351493116e-7;                                      \n' +
    '\n' +
    '    bool reflected = false;                                            \n' +
    '    vec2 origZ = z;                                                    \n' +
    '    if (z.x < 0.5)                                                     \n' +
    '    {                                                                  \n' +
    '        z = vec2(1.0, 0.0) - z;                                        \n' +
    '        reflected = true;                                              \n' +
    '    }                                                                  \n' +
    '\n' +
    '    z -= vec2(1.0, 0.0);                                               \n' +
    '\n' +
    '    vec2 x = vec2(p[0], 0.0);                                          \n' +
    '    for (int i = 1; i < 9; i++)                                        \n' +
    '    {                                                                  \n' +
    '        x += cDiv(vec2(p[i], 0.0), z + vec2(float(i), 0.0));           \n' +
    '    }                                                                  \n' +
    '\n' +
    '    vec2 t = z + vec2(7.5, 0.0);                                       \n' +
    '    vec2 result = cMult(cMult(sqrt(2.0 * M_PI) * cPow(t, z + vec2(0.5, 0.0)), cExp(-t)), x); \n' +
    '\n' +
    '    if (!reflected)                                                    \n' +
    '        return result;                                                 \n' +
    '    else                                                               \n' +
    '        return cDiv(vec2(M_PI, 0.0), cMult(cSin(M_PI * origZ), result));                \n' +
    '}                                                                    \n' +
    'void main()                                                          \n' +
    '{                                                                    \n' +
    '    vec2 z = vec2((gl_FragCoord.x + u_offsetX) / u_width - 0.5,      \n' +
    '                  (u_height/u_width) * (0.5 - (gl_FragCoord.y - u_offsetY) / u_height)); \n' +
    '                                                                     \n' +
    '    z /= u_zoom / 30.0;                                              \n' +
    '                                                                     \n' +
    '    vec2 z_n = vec2(0.0, 0.0);                                       \n' +
    '    for (int i = 0; i < {iteration_count}; i++)                      \n' +
    '        z_n = {js_generated_expr};                                   \n' +
    '                                                                     \n' +
    '    gl_FragColor = getRgbaByArg(z_n);                                \n' +
    '}                                                                    \n' +
    '                                                                     \n';
    
    let parser = null;
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let iterations = 1;
    
    // WebGL pointers to shader variables
    let a_Position = 0;
    let u_width = 0;
    let u_height = 0;
    let u_zoom = 0;
    let u_offsetX = 0;
    let u_offsetY = 0;
    // let u_paramA = 0;
    
    let gl = {};
    
    // Amount to offset view window from origin-centered, in
    // canvas pixels.
    let offsetX = 0.0;
    let offsetY = 0.0;
    
    let zoom = 1.0;
    
    let currExpr = '';
    let currShaderExpr = '';

    function mouseUp(event) {
        dragging = false;
    }

    function mouseDown(event) {
        dragging = true;
        dragStart.x = event.offsetX;
        dragStart.y = event.offsetY;
    }

    function mouseMove(event) {

        if (dragging) {
            offsetX += dragStart.x - event.offsetX;
            offsetY += dragStart.y - event.offsetY;
            dragStart.x = event.offsetX;
            dragStart.y = event.offsetY;
        }
        
        gl.uniform1f(u_offsetX, offsetX);
        gl.uniform1f(u_offsetY, offsetY);
        
        draw();
    }

    function plotAreaResize() {
        
        canvas.width = $('#plotArea').width();
        canvas.height = $('#plotArea').height();
        
        var n = initVertexBuffers();
        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }
        
        draw();
    }

    function mouseWheel(event) {
        
        var zoomFactor = 1.0;
        
        if (event.deltaY > 0)
            zoomFactor *= 1.03;
        else if (event.deltaY < 0)
            zoomFactor *= 0.97;
        
        zoom *= zoomFactor;
        
        offsetX += event.offsetX - (canvas.clientWidth / 2);
        offsetY += event.offsetY - (canvas.clientHeight / 2);
        
        offsetX *= zoomFactor;
        offsetY *= zoomFactor;
        
        offsetX -= event.offsetX - (canvas.clientWidth / 2);
        offsetY -= event.offsetY - (canvas.clientHeight / 2);
        
        gl.uniform1f(u_offsetX, offsetX);
        gl.uniform1f(u_offsetY, offsetY);
        gl.uniform1f(u_zoom, zoom);
        
        draw();
        
        console.log('wheel');
        
        return false;
    }

    function grammarReady(grammar) {
        parser = PEG.buildParser(grammar);
        
        var hash = window.location.hash;
        if (hash.length > 0) {
            var expr = decodeURIComponent(hash.substring(1));
            $('#expr').val(expr);
            updateExpr(expr);
        }
    }

    function exprChange(event) {
        
        var newExpr = $(this).val().replace(/\s/g, '');
        
        if (newExpr === currExpr) {
            return;
        }
        
        updateExpr(newExpr);
    }
    
    function iterationsChange(event) {
        iterations = Number($(this).val());
        updateShader();
    }
    
    function paramChange(newVal) {
        gl.uniform2f(u_paramA, newVal.real, newVal.img);
        draw();
    }

    function updateExpr(newExpr) {
        
        currExpr = newExpr;
        
        $('#parseStatus').removeClass('ok error unknown');
        $('#ast').val('');
        
        if (parser) {
            
            try {
                var parsedExprAst = parser.parse(newExpr);
                $('#ast').val(JSON.stringify(parsedExprAst));
                
                var shaderExpr = astToShaderExpr(parsedExprAst);
                $('#shaderExpression').val(JSON.stringify(shaderExpr));
                
                offsetX = 0.0;
                offsetY = 0.0;
                zoom = 1.0;
                
                currShaderExpr = shaderExpr;
                updateShader();
                
                var uriExpr = encodeURIComponent(currExpr);
                window.location = '#' + uriExpr
            }
            catch (exp) {
                console.log(exp);
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

    function getShaderSource(expression) {
        return FSHADER_SOURCE.replace('{js_generated_expr}', expression)
                             .replace('{iteration_count}', iterations);
    }

    function updateShader() {
        
        const shaderSrc = getShaderSource(currShaderExpr.str);
        
        if (!initShaders(gl, VSHADER_SOURCE, shaderSrc)) {
            console.log('Failed to intialize shaders.');
        }
        
        initVertexBuffers();
        
        draw();
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
                case 'z_n':
                    return { str: 'z_n' };
                case 'A':
                    return { str: 'u_paramA' };
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
        const shaderFuncName = 'c' + ast.name.charAt(0).toUpperCase() + ast.name.slice(1);
        
        let paramsString = '';
        let usedParams = [];
        
        let first = true;
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

    function draw() {
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function initVertexBuffers() {
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
        
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        
        u_width = getLocation('u_width');
        u_height = getLocation('u_height');
        u_offsetX = getLocation('u_offsetX');
        u_offsetY = getLocation('u_offsetY');
        u_zoom = getLocation('u_zoom');
        u_paramA = getLocation('u_paramA', false);
        
        gl.uniform1f(u_width, canvas.clientWidth);
        gl.uniform1f(u_height, canvas.clientHeight);
        gl.uniform1f(u_offsetX, offsetX);
        gl.uniform1f(u_offsetY, offsetY);
        gl.uniform1f(u_zoom, zoom);
        gl.uniform2f(u_paramA, 0.0, 0.0);
        
        // Enable the generic vertex attribute array
        gl.enableVertexAttribArray(a_Position);
        
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    function getLocation(varName, throwOnFail = true) {
        const offset = gl.getUniformLocation(gl.program, varName);
        
        if (!offset && throwOnFail)
            throw 'Failed to get the storage location of ' + varName;
        
        return offset;
    }
    
    jQuery.get('grammar.txt', function(data) { grammarReady(data); });
    
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert('Failed to get the rendering context for WebGL');
        return;
    }
    
    $('#expr').on('change keyup paste', exprChange);
        
    $(document).mousemove(mouseMove);
    $(document).mouseup(mouseUp);
    $(canvas).mousedown(mouseDown);
    $(canvas).mousewheel(mouseWheel);
        
    $(window).resize(plotAreaResize);
    
    $('#iterations').val(iterations);
    $('#iterations').on('change keyup paste', iterationsChange);
    
    // Prevent change to text-selection "i-beam" cursor on mouse down.
    canvas.onselectstart = function() { return false; }
        
    const shaderSrc =  getShaderSource('z');
    if (!initShaders(gl, VSHADER_SOURCE, shaderSrc)) {
        console.log('Failed to intialize shaders.');
    }
    
    const paramWidgetA = new COMPLOT.ParamWidget($(hostElem).find('#sidebar'));
    paramWidgetA.onChange(paramChange);
    
    plotAreaResize();
}
