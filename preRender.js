mm._instances = {};

mm._id = 0;
mm._updateId = 0; // 每帧会自动恢复到初始值，jsonCopy函数希望在一帧中每次调用时都创建新的id，但是在update方法内调用时，又希望下一帧不会重复创建。
mm._width = 450;
mm._height = 800;

mm._instances['_defaultMatP'] = mm.getProjectionMatrix(25, mm._width / mm._height, 1, 100);
var _matp2d = mm.eye4();
mm.scaleY(_matp2d, mm._width / mm._height);
mm._instances['_defaultMatP2D'] = _matp2d;
mm._instances['_defaultMatV2D'] = mm.eye4();;
var _matV = mm.eye4();
mm.translateZ(_matV, -4.8);
mm._instances['_defaultMatV'] = _matV;
mm._instances['_defaultMatM'] = mm.eye4();
mm._instances['_defaultTextureUrl'] = "res/black.png";


mm.getId = function () {
    // 唯一标识 shapeJson，shaderJson
    mm._id++;
    return mm._id;
}

mm.getUpdateId = function () {
    mm._updateId++;
    return mm._updateId + 10000;
}

mm.get = function (key) {
    return mm._instances[key];
}

mm.set = function (key, value) {
    mm._instances[key] = value;
}

mm.getElseCreate = function (key, fn) {
    if (!mm._instances[key] && fn) {
        mm._instances[key] = fn();
    }
    return mm._instances[key];
}

mm.loadTxt = function (url) {
    return mm.getElseCreate("_loadText_" + url, () => {
        cc.loader.loadTxt(url, function (err, data) {
            mm.loadTxtData = data;
        })
        return mm.loadTxtData;
    })
}

mm.loadTexture = function (url) {
    return mm.getElseCreate("_texture_" + url, () => {
        var t = cc.textureCache.addImage(url);
        t.width = t._getWidth();
        t.height = t._getHeight();
        t.texture_id = t.getName();
        return t;
    })
}

mm.jsonCopy = function (json0, initFunc) {
    return mm.getElseCreate(mm.getUpdateId(), () => {
        // var json = JSON.parse(JSON.stringify(json0));
        var json = {};
        for (let key in json0) {
            json[key] = json0[key];
        }

        if (initFunc) initFunc(json);
        return json;
    })
}

mm.getShaderFromJson = function (shaderJson) {
    if (!shaderJson['id']) shaderJson['id'] = mm.getId();
    return mm.getElseCreate(shaderJson['id'], () => {
        var vertCode = shaderJson['vertCode'];
        var fragCode = shaderJson['fragCode'];

        var baseFragShader = mm.loadTxt("src/baseShader.fs");
        fragCode = baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();

        return shader;
    })
}

mm.bindShader = function (shaderJson) {
    if (mm.get('_currentShaderJson') &&
        mm.get('_currentShaderJson')['id'] == shaderJson['id']) {
        return;
    }

    var isShaderExist = mm.get(shaderJson['id']);
    var shader = mm.getShaderFromJson(shaderJson);
    shader.use();

    mm.set('_currentShader', shader);
    mm.set('_currentShaderJson', shaderJson);

    if (!isShaderExist) {
        if (shaderJson['initFunc']) {
            // init function generate float int mat array ...
            shaderJson['initFunc'](shaderJson);
        }

        var list = shaderJson['float'];
        for (let key in list) {
            mm.uniform1f(key, list[key]);
        }

        var list = shaderJson['int'];
        for (let key in list) {
            mm.uniform1i(key, list[key]);
        }

        var list = shaderJson['mat'];
        for (let key in list) {
            mm.uniformMatrix4fv(key, list[key]);
        }

        var list = shaderJson['array'];
        for (let key in list) {
            mm.uniform1fv(key, list[key]);
        }
    }


    mm.bindShape(mm.getElseCreate('_currentShapeJson', () => {
        return mm.shapeRectangle;
    }));

    mm.bindTexture(mm.getElseCreate('_currentTextureUrl', () => {
        return mm.get('_defaultTextureUrl');
    }));

    // mm.uniformMatrix4fv("uMatP", mm.getElseCreate("_currentMat_" + "uMatP", () => {
    //     return mm.get('_defaultMatP');
    // }));

    // mm.uniformMatrix4fv("uMatV", mm.getElseCreate("_currentMat_" + "uMatV", () => {
    //     return mm.get('_defaultMatV');
    // }));

    mm.uniformMatrix4fv("uMatM", mm.getElseCreate("_currentMat_" + "uMatM", () => {
        return mm.get('_defaultMatM');
    }));

}

mm.bindTexture = function (texture_url) {
    var texture = mm.loadTexture(texture_url);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
    mm.set("_currentTextureUrl", texture_url);
}

mm.bindTexture2 = function (texture_url) {
    var texture = mm.loadTexture(texture_url);
    var shader = mm.get('_currentShader');
    var sampler2d2 = gl.getUniformLocation(shader.getProgram(), "sampler2d2");
    var c = 2;
    gl.uniform1i(sampler2d2, c);
    gl.activeTexture(gl.TEXTURE0 + c);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
    gl.activeTexture(gl.TEXTURE0);
}

mm.createTexture = function (width, height) {
    return mm.getElseCreate("createTexture_" + mm.getUpdateId(), () => {
        var texture = gl.createTexture();
        texture.width = width;
        texture.height = height;
        gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint32Array([]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, 0);
        var key = "createTexture" + String(mm._updateId);
        mm.set("_texture_" + key, texture);
        return key;
    })
}


mm.textureRender = function (texture_url, xywh, fn) {
    var texture = mm.loadTexture(texture_url);
    var frame = mm.getElseCreate("_renderBuffer", () => {
        var frame = gl.createFramebuffer();

        return frame;
    });

    var depth_texture = mm.getElseCreate("_renderBufferDepth" + String(texture.width) + " " + String(texture.height), () => {
        var depth_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depth_texture.texture_id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, texture.width, texture.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, new Uint32Array([]));
        gl.bindTexture(gl.TEXTURE_2D, 0);
        return depth_texture;
    })




    gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer_id);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture_id, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth_texture.texture_id, 0);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE)
        console.log("Frame: could not attach texture to framebuffer");


    var _defaultMatV2D = mm.get("_defaultMatV2D");
    var _defaultMatV = mm.get("_defaultMatV");


    var _defaultMatV2D_render = mm.eye4();
    mm.scaleY(_defaultMatV2D_render, -texture.width / texture.height * mm._height / mm._width);

    var _defaultMatV_render = mm.eye4();
    mm.scaleY(_defaultMatV_render, -texture.width / texture.height * mm._height / mm._width);
    mm.translateZ(_defaultMatV_render, -4.8);

    mm.set('_defaultMatV2D', _defaultMatV2D_render);
    mm.set('_defaultMatV', _defaultMatV_render);


    gl.viewport(texture.width * (1 - xywh[2] - xywh[0]),
        texture.height * (1 - xywh[3] - xywh[1]),
        texture.width * xywh[2],
        texture.height * xywh[3]);

    // mm.showProperty(gl);
    // gl.clearColor(0, 0, 0, 0);
    // mm.clearColor();

    gl.clearDepthf(1);
    mm.clearDepth();

    fn();


    gl.bindFramebuffer(gl.FRAMEBUFFER, 0);

    gl.viewport(0, 0, mm._width, mm._height);

    mm.set('_defaultMatV2D', _defaultMatV2D);
    mm.set('_defaultMatV', _defaultMatV);


    // Todo buffer暂时不删除 gl.deleteFramebuffer(frame); 
}

mm.texParameterRepeat = function () {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

mm.texParameterMirrorRepeat = function () {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
}

mm.getShapeFromJson = function (shapeJson) {
    if (!shapeJson['id']) shapeJson['id'] = mm.getId();
    return mm.getElseCreate(shapeJson['id'], () => {
        if (shapeJson['initFunc']) {
            // init function generate points coords...
            shapeJson['initFunc'](shapeJson);
        }


        // console.log(shapeJson['initFunc']);
        // console.log(shapeJson['points']);

        var points = shapeJson['points'];
        var coords = shapeJson['coords'];
        var pointIndics = shapeJson['pointIndics'];
        var coordIndics = shapeJson['coordIndics'];

        var vertices = mm.index2Array(points, 3, pointIndics);
        var texCoords = mm.index2Array(coords, 2, coordIndics);

        vertices = new Float32Array(vertices);
        texCoords = new Float32Array(texCoords);

        var vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var texCoord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        var shape = {};
        shape["vertex_buffer"] = vertex_buffer;
        shape["texCoord_buffer"] = texCoord_buffer;
        shape["arrayNum"] = pointIndics.length;

        return shape;
    })
}

mm.bindShape = function (shapeJson) {
    var shape = mm.getShapeFromJson(shapeJson);

    var program = mm.get("_currentShader").getProgram();

    var aPosition = gl.getAttribLocation(program, "aPosition");
    var aTexCoord = gl.getAttribLocation(program, "aTexCoord");

    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, shape["vertex_buffer"]);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    if (aTexCoord != -1) {
        gl.enableVertexAttribArray(aTexCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, shape["texCoord_buffer"]);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    }

    mm.set("_currentShape", shape);
    mm.set("_currentShapeJson", shapeJson);
}

mm.uniformMatrix4fv = function (key, mat) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniformMatrix4fv(keyL, false, new Float32Array(mat));
        mm.set("_currentMat_" + key, mat);
    } else {
        console.log(key + " not exist.");
    }

}

mm.uniform1fv = function (key, array) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1fv(keyL, array.length, new Float32Array(array));
    } else {
        console.log(key + " not exist.");
    }
}

mm.uniform1f = function (key, fv) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1fv(keyL, 1, new Float32Array([fv]));
    } else {
        console.log(key + " not exist.");
    }
}

mm.uniform1i = function (key, iv) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1i(keyL, iv);
    } else {
        console.log(key + " not exist.");
    }
}

mm.clearDepth = function () {
    gl.clear(gl.DEPTH_BUFFER_BIT);
}

mm.clearColor = function () {
    gl.clear(gl.COLOR_BUFFER_BIT);
}

mm.draw = function () {

    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);

    mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

    gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.draw2d = function () {

    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);

    mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
    mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));

    gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.drawLine = function () {
    mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

    gl.drawArrays(gl.LINES, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.drawPoint = function () {
    mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

    gl.drawArrays(gl.POINTS, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.createPolygonShape = function (sliceNum, json) {
    return mm.getElseCreate("createPolygonShape_" + String(sliceNum), () => {
        var indices = [];
        var points = [];
        var coords = [];

        points.push(0); // center x
        points.push(0); // center y
        points.push(0); // z = 0
        coords.push(1); // center x
        coords.push(1); // center y



        var AngleStep = 2 * Math.PI / sliceNum;
        for (let i = 0; i < sliceNum; i++) {
            var px = Math.sin(i * AngleStep);
            var py = Math.cos(i * AngleStep);
            var cx = (px + 1) / 2;
            var cy = (py + 1) / 2;
            points.push(px);
            points.push(py);
            points.push(0); // z = 0
            coords.push(cx);
            coords.push(cy);
        }

        for (let i = 0; i < sliceNum; i++) {
            indices.push(0) // center point
            indices.push(i + 1);
            indices.push(i + 2);
        }

        indices.push(0) // center point
        indices.push(sliceNum);
        indices.push(1);
        if (!json) {
            json = {};
        }
        json['points'] = points;
        json['coords'] = coords;
        json['pointIndics'] = indices;
        json['coordIndics'] = indices;

        return json;
    })

}

mm.createPolygonStarShape = function (sliceNum, json) {
    return mm.getElseCreate("createPolygonStarShape_" + String(sliceNum), () => {
        var indices = [];
        var points = [];
        var coords = [];

        points.push(0); // center x
        points.push(0); // center y
        points.push(0); // z = 0
        coords.push(1); // center x
        coords.push(1); // center y

        var short = Math.cos(2 * Math.PI / sliceNum) / Math.cos(Math.PI / sliceNum);

        var AngleStep = 2 * Math.PI / sliceNum / 2;
        for (let i = 0; i <= sliceNum * 2; i++) {
            if (i % 2 == 0) {
                var px = Math.sin(i * AngleStep);
                var py = Math.cos(i * AngleStep);
            } else {
                var px = Math.sin(i * AngleStep) * short;
                var py = Math.cos(i * AngleStep) * short;
            }
            var cx = (px + 1) / 2;
            var cy = (py + 1) / 2;
            points.push(px);
            points.push(py);
            points.push(0); // z = 0
            coords.push(cx);
            coords.push(cy);
        }

        for (let i = 0; i < sliceNum * 2; i++) {
            indices.push(0) // center point
            indices.push(i + 1);
            indices.push(i + 2);
        }

        indices.push(0) // center point
        indices.push(sliceNum);
        indices.push(1);

        if (!json) {
            json = {};
        }
        json['points'] = points;
        json['coords'] = coords;
        json['pointIndics'] = indices;
        json['coordIndics'] = indices;

        return json;
    })

}

mm.debugLine = function (u) {
    console.log();
    console.log('-----------------------------------------');
    console.log(u);
}

mm.debugThrow = function () {
    throw new Error("debug throw");
}

mm.debugPerformanceTest = function (n, fn) {
    var d = new Date();
    var a = d.getTime();
    for (let i = 0; i < n; i++) {
        fn();
    }
    var b = d.getTime();
    console.log("cost time : ", (b - a));
}


mm.shaderDoNothing = {
    "vertCode": '\
        attribute vec3 aPosition;\
        attribute vec2 aTexCoord;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        varying vec2 vTexCoord;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
            vTexCoord = aTexCoord;\
        }',
    "fragCode": '\
        uniform sampler2D sampler2d;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = texture2D(sampler2d, texCoord);\
            gl_FragColor = color;\
        }',
}

mm.shaderColor = {
    "vertCode": '\
        attribute vec3 aPosition;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
        }',
    "fragCode": '\
        uniform float uColor[4];\
        void main(void) {\
            gl_FragColor = vec4(uColor[0], uColor[1], uColor[2], uColor[3]);\
        }',
    "array": {
        "uColor": [0.0, 0.0, 0.0, 1.0],
    },
}


mm.shaderScaleShake = {
    "vertCode": '\
        attribute vec3 aPosition;\
        attribute vec2 aTexCoord;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        varying vec2 vTexCoord;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
            vTexCoord = aTexCoord;\
        }',
    "fragCode": '\
        uniform sampler2D sampler2d;\
        uniform float uUt[1];\
        uniform float uScaleA[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = scaleShake(sampler2d, texCoord, uScaleA[0], uUt[0]);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 1.0,
        "uScaleA": 0.4
    }
}

mm.shaderHueOffset = {
    "vertCode": '\
        attribute vec3 aPosition;\
        attribute vec2 aTexCoord;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        varying vec2 vTexCoord;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
            vTexCoord = aTexCoord;\
        }',
    "fragCode": '\
        uniform sampler2D sampler2d;\
        uniform float uUt[1];\
        uniform float uOffset[1];\
        uniform float uScaleA[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = hueOffset(sampler2d, texCoord, uOffset[0], uScaleA[0], uUt[0]);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.1,
        "uOffset": 0.2,
        "uScaleA": 0.3
    },
}


mm.shaderMatrixTransform = {
    "vertCode": '\
        attribute vec3 aPosition;\
        attribute vec2 aTexCoord;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        varying vec2 vTexCoord;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
            vTexCoord = aTexCoord;\
        }',
    "fragCode": '\
        uniform sampler2D sampler2d;\
        uniform mat4 uMatTexture;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = matrixTransform(sampler2d, texCoord, uMatTexture);\
            gl_FragColor = color;\
        }',
    "mat": {
        "uMatTexture": mm.eye4()
    },
}

mm.shaderStripeSwitch = {
    "vertCode": '\
        attribute vec3 aPosition;\
        attribute vec2 aTexCoord;\
        uniform mat4 uMatP;\
        uniform mat4 uMatV;\
        uniform mat4 uMatM;\
        varying vec2 vTexCoord;\
        void main(void){\
            gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
            vTexCoord = aTexCoord;\
        }',
    "fragCode": '\
        uniform sampler2D sampler2d;\
        uniform sampler2D sampler2d2;\
        uniform int uStripeNum;\
        uniform float uUt[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = stripeSwitch(sampler2d, sampler2d2, texCoord, uStripeNum, uUt[0]);\
            gl_FragColor = color;\
        }',
    "int": {
        "uStripeNum": 6,
    },
    "float": {
        "uUt": 0.1,
    },
}





mm.shapeRectangle = {
    "points": [
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 0,
        1, -1, 0,
    ],
    "coords": [
        1, 1,
        1, 0,
        0, 0,
        0, 1,
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3
    ],
    "coordIndics": [
        3, 0, 1, 3, 1, 2
    ]
}

var srf = mm._height / mm._width;
mm.shapeRectangleFullScreen = {
    "points": [
        1, srf, 0,
        -1, srf, 0,
        -1, -srf, 0,
        1, -srf, 0,
    ],
    "coords": [
        1, 1,
        1, 0,
        0, 0,
        0, 1,
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3
    ],
    "coordIndics": [
        3, 0, 1, 3, 1, 2
    ]
}



mm.shapeTriangle = {
    "initFunc": function (json) {
        mm.createPolygonShape(3, json);
    }
}

mm.shapeCircle = {
    "initFunc": function (json) {
        mm.createPolygonShape(100, json);
    }
}

mm.shapeHexagon = {
    "initFunc": function (json) {
        mm.createPolygonShape(6, json);
    }
}

mm.shapeFivePointedStar = {
    "initFunc": function (json) {
        mm.createPolygonStarShape(5, json);
    }
}

mm.shapeCube = {
    "points": [
        1, 1, 1,
        -1, 1, 1,
        -1, -1, 1,
        1, -1, 1,
        1, 1, -1,
        -1, 1, -1,
        -1, -1, -1,
        1, -1, -1,
    ],
    "coords": [
        1, 1,
        1, 0,
        0, 0,
        0, 1,
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3,
        4, 0, 3, 4, 3, 7,
        5, 4, 7, 5, 7, 6,
        1, 5, 6, 1, 6, 2,
        4, 5, 1, 4, 1, 0,
        3, 2, 6, 3, 6, 7
    ],
    "coordIndics": [
        3, 0, 1, 3, 1, 2,
        3, 0, 1, 3, 1, 2,
        3, 0, 1, 3, 1, 2,
        3, 0, 1, 3, 1, 2,
        3, 0, 1, 3, 1, 2,
        3, 0, 1, 3, 1, 2
    ]
}

mm.shapeSphere = {
    "initFunc": function (json) {
        var indices = [];
        var points = [];
        var coords = [];

        var sliceNum = json["sliceNum"];
        // var sliceNum = 4;

        var AngleStep = Math.PI / sliceNum;
        for (let j = 0; j <= sliceNum; j++) {
            for (let i = 0; i <= sliceNum * 2; i++) {
                var py = Math.cos(j * AngleStep);
                var rxz = Math.sin(j * AngleStep);
                var px = - Math.cos(i * AngleStep) * rxz;
                var pz = Math.sin(i * AngleStep) * rxz;
                var cx = i / sliceNum / 2;
                var cy = j / sliceNum;
                points.push(px);
                points.push(py);
                points.push(pz);
                coords.push(cx);
                coords.push(cy);
            }
        }

        for (let j = 0; j < sliceNum; j++) {
            for (let i = 0; i < sliceNum * 2; i++) {
                var k = j * (sliceNum * 2 + 1);
                indices.push(i + k);
                indices.push(i + sliceNum * 2 + 1 + k);
                indices.push(i + sliceNum * 2 + 2 + k);
                indices.push(i + k);
                indices.push(i + sliceNum * 2 + 2 + k);
                indices.push(i + 1 + k);
            }
        }


        json['points'] = points;
        json['coords'] = coords;
        json['pointIndics'] = indices;
        json['coordIndics'] = indices;
    },
    "sliceNum": 30
}



var BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function (configs) {
        this._super();

        this.texturePaths = [];
        for (var item in configs) {
            if (item == 'data') {
                var datas = configs[item]
                for (var index in datas) {
                    var obj_data = datas[index];
                    if (jsb.fileUtils.isFileExist(obj_data['name'])) {
                        this.texturePaths.push(obj_data['name']);
                    } else {
                        console.log(obj_data['name'] + " not found.");
                    }
                }
            }
        }


        if ('opengl' in cc.sys.capabilities) {

            this.speed = 1;
            this.totalFrame = 200;
            this.count = 0;

            // default shader init
            mm.bindShader(mm.shaderDoNothing);

            this.init(config);

            var initShaderJson = mm.get('_currentShaderJson');
            var initShapeJson = mm.get('_currentShapeJson');
            var initTextureUrl = mm.get('_currentTextureUrl');
            var initUMatM = mm.get("_currentMat_" + "uMatM");

            var initUpdateId = mm._updateId;

            var glnode = new cc.GLNode();
            this.addChild(glnode, 10);
            this.glnode = glnode;

            glnode.draw = function () {

                if (this.count > this.totalFrame) this.count = 0;

                if (this.period) {
                    if (this.count < this.period[0] || this.count > this.period[1]) this.count = this.period[0];
                }

                var ut = this.count / this.totalFrame;


                this.count += 1 * this.speed;

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                mm._updateId = initUpdateId;
                // reuse shader every frame
                mm.set("_currentTextureUrl", initTextureUrl);
                mm.set("_currentShapeJson", initShapeJson);
                mm.set("_currentMat_" + "uMatM", initUMatM);

                mm.set('_currentShaderJson', null);
                mm.bindShader(initShaderJson);


                this.update(ut);

                gl.depthMask(false);
                gl.disable(gl.DEPTH_TEST);

            }.bind(this);

            // 提前进行一些初始化，预热程序
            glnode.draw();
            this.count = 0;

        }

        return true;
    },
    setTotalFrame: function (v) {
        this.totalFrame = v;
    },
    setPlaySpeed: function (v) {
        this.speed = v;
    },
    cutFrame: function (begin, end) {
        this.period = [begin, end];

    },
    getTextureByIndex: function (index) {
        return this.texturePaths[index % this.texturePaths.length];
    },
    init: function (config) {
        // override
    },
    update: function (ut) {
        // override
        // this function will calling at each frame.
    }
})





var PreRender = BaseNode.extend({
    init: function () {
        this.setTotalFrame(600);
        this.setPlaySpeed(60 / 60 / 1);
        this.cutFrame(0 + 0, 600 - 0);
    },
    update: function (ut) {
        var m = mm.eye4();
        var m2 = mm.eye4();
        var m3 = mm.eye4();
        // console.log("aaa");
        // var texture = mm.createTexture(512, 512);
        // texture = this.getTextureByIndex(11);

        // mm.textureRender(texture, [0, 0, 1, 1], () => {
        //     // mm.clearColor();
        //     // mm.bindShape(mm.shapeCube);
        //     mm.bindShape(mm.shapeRectangle);
        //     mm.bindShader(mm.shaderMatrixTransform);
        //     // mm.uniform1fv("uColor", [0, 1, 0, 0.0001]);
        //     // mm.scaleXYZ(m, 0.6);
        //     // mm.uniformMatrix4fv("uMatTexture", m2);

        //     mm.bindTexture(this.getTextureByIndex(11));
        //     mm.texParameterMirrorRepeat();

        //     // mm.rotateX(m, 60);
        //     mm.rotateY(m, 360 * ut);
        //     // mm.translateZ(m, 4);
        //     // mm.translateZ(m, 2);

        //     mm.uniformMatrix4fv("uMatM", m);

        //     // mm.drawLine();
        //     // mm.draw2d();
        //     mm.draw();
        // })

        mm.bindShader(mm.shaderDoNothing);
        // mm.bindShape(mm.shapeRectangleFullScreen);
        // mm.bindShape(mm.createPolygonShape(4));
        mm.bindShape(mm.shapeSphere);
        // mm.bindShape(mm.shapeSphere);
        // mm.bindTexture(texture);
        mm.bindTexture(this.getTextureByIndex(11));


        m = mm.eye4();
        // mm.scaleXYZ(m, 0.5);
        // mm.scaleY(m, 16 / 9);
        // mm.translateXYZ(m,[-1,-1,0]);
        // mm.rotateY(m, 360 * ut);

        mm.uniformMatrix4fv("uMatM", m);


        // // mm.drawLine();
        mm.draw2d();
        // mm.draw();
    }
})





var TestNew = BaseNode.extend({
    init: function () {
        this.setTotalFrame(543 - 90);
        this.setPlaySpeed(44 / 60 / 1);
        this.cutFrame(90 - 90, 543 - 90);




    },
    update: function (ut) {

        // 前景
        var m = mm.eye4();
        var m2 = mm.eye4();
        var m3 = mm.eye4();



        // 前景
        mm.compose(ut, mm.getUt([252, 543], 90, 543), [
            (ut) => {

                mm.bindShape(mm.shapeRectangle);

                // 正方体离中心距离
                mm.translateZ(m3, 1);

                mm.compose(ut, mm.getUt([146, 252], 90, 252), [
                    (ut) => {
                        mm.bindShader(mm.shaderStripeSwitch);
                        mm.bindTexture(this.getTextureByIndex(0));
                        mm.bindTexture2(this.getTextureByIndex(1));

                        mm.sequence(ut, mm.getUt([124, 146], 90, 146), [
                            (ut) => {
                                var et = mm.easeExpLog(10, ut);
                                mm.translateZ(m3, 1 * et);
                                mm.rotateY(m, 90 * et);
                                mm.uniform1f("uUt", et);
                            },
                            (ut) => {
                                var et = mm.easeExp(30, ut);
                                mm.translateZ(m, 1.05 * et);
                            },
                        ])
                    },
                    (ut) => {
                        mm.bindShader(mm.shaderDoNothing);
                        var b = -0.35;
                        mm.sequence(ut, mm.getUt([154, 165, 183, 208, 239, 252], 146, 252), [
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(2));
                                var et = mm.easeExp2(ut);
                                mm.translateZ(m, 1.5 - b - 0.75 * et);
                                var a = 0;
                                mm.rotateX(m, -(90 + 45 + a) * et - 180 + a);
                            },
                            (ut) => {
                                var et = mm.easeExp2(ut);
                                mm.rotateX(m, 45 * et);
                            },
                            (ut) => {
                                var et = mm.easeExp(10, ut);
                                mm.translateZ(m, -(3 - b) * et);
                            },
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(3));
                                var et = mm.easeLog(10, ut);
                                mm.rotateX(m, (90 + 180));
                                mm.rotateY(m, 90);
                                mm.translateZ(m, 2.6 * et);
                            },
                            (ut) => {
                                var et = mm.easeExpLog(10, ut);
                                mm.translateZ(m3, 0.4 * et);
                                mm.rotateY(m, -(90 + 43) * et);
                            },
                            (ut) => {
                                var et = mm.easeExp(10, ut);
                                mm.translateZ(m, 1.7 * et);
                            },
                        ])
                    },
                ])

                for (let i = 0; i < 6; i++) {
                    // 正方体六个面

                    if (i < 4) mm.rotateY(m2, 90);
                    if (i == 4) mm.rotateX(m2, 90);
                    if (i == 5) mm.rotateX(m2, -180);

                    // 最开始的面（编号3）和 下面 (编号4) 镜像一下,在第一个运动里.
                    if (i == 3) {
                        mm.rotateY(m3, 180);
                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m3, m2, m]));
                        mm.draw();
                        mm.rotateY(m3, -180);
                        continue;
                    }

                    if (i == 4) {
                        mm.rotateY(m3, 180);
                        mm.rotateZ(m3, 180);
                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m3, m2, m]));
                        mm.draw();
                        mm.rotateZ(m3, -180);
                        mm.rotateY(m3, -180);
                        continue;
                    }

                    mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m3, m2, m]));
                    mm.draw();
                }


            },
            (ut) => {
                mm.compose(ut, mm.getUt([319, 407, 442, 543], 252, 543), [
                    (ut) => {
                        mm.bindShader(mm.shaderRepositionTexture);
                        mm.bindShape(mm.shapeRectangle);


                        mm.compose(ut, mm.getUt([298, 319], 252, 319), [
                            (ut) => { mm.bindTexture(this.getTextureByIndex(4)); },
                            (ut) => { mm.bindTexture(this.getTextureByIndex(5)); },
                        ])
                        mm.texParameterMirrorRepeat();

                        mm.sequence(ut, mm.getUt([278, 319], 252, 319), [
                            (ut) => {
                                var et = mm.easeLog(10, ut);
                                mm.translateZ(m, 2.55 - 0.9 * et);
                            },
                            (ut) => {
                                var et = mm.easeExpLog(20, ut);
                                mm.uniform1fv("uXYWH", [et, 0, 1, 1]);

                                mm.compose(ut, mm.getUt([307, 319], 278, 319), [
                                    (ut) => {
                                        var r = 0.04;
                                        mm.translateXYZ(m, [Math.random() * r, Math.random() * r, 0]);
                                    },
                                    (ut) => { }
                                ])
                            },
                        ])

                        mm.uniformMatrix4fv("uMatM", m);
                        mm.draw();
                        mm.uniform1fv("uXYWH", [0, 0, 1, 1]);

                    },
                    (ut) => {
                        mm.bindShader(mm.shaderRepositionTexture);
                        mm.bindShape(mm.shapeRectangle);

                        // left
                        mm.translateX(m, -1);
                        mm.compose(ut, mm.getUt([335, 407], 319, 407), [
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(5));
                                mm.uniform1fv("uXYWH", [1, 0, -1, 1]);
                                mm.scaleXYZ3(m, 1, 1, 1);
                                mm.translateZ(m, 1.65);
                            },
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(6));
                                mm.texParameterRepeat();
                                mm.uniform1fv("uXYWH", [0, 0, 1, 3]);
                                var a = 0.95;
                                mm.scaleXYZ3(m, 1 * a, 3 * a, 1 * a);
                                mm.translateY(m, -2);
                                mm.translateX(m, -13);
                            },
                        ])

                        mm.sequence(ut, mm.getUt([351, 390, 407], 319, 407), [
                            (ut) => {
                                var et = mm.easeExpLog(10, ut);
                                mm.translateY(m, 2 * et);
                            },
                            (ut) => { },
                            (ut) => {
                                var et = mm.easeQuadraticActionIn(ut);
                                mm.translateZ(m, 1.8 * et);
                                mm.scaleXYZ(m2, 1 + 0.05 * et);
                            },
                        ])
                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m2, m]));
                        mm.draw();



                        // right 
                        m = mm.eye4();
                        m2 = mm.eye4();

                        mm.translateX(m, 1);

                        mm.compose(ut, mm.getUt([368, 407], 319, 407), [
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(5));
                                mm.uniform1fv("uXYWH", [1, 0, -1, 1]);
                                mm.scaleXYZ3(m, 1, 1, 1);
                                mm.translateZ(m, 1.65);
                            },
                            (ut) => {
                                mm.bindTexture(this.getTextureByIndex(7));
                                mm.texParameterRepeat();
                                mm.uniform1fv("uXYWH", [0, 0, 1, 3]);
                                var a = 0.95;
                                mm.scaleXYZ3(m, 1 * a, 3 * a, 1 * a);
                                mm.translateY(m, 2);
                                mm.translateX(m, 13);
                            },
                        ])

                        mm.sequence(ut, mm.getUt([346, 390, 407], 319, 407), [
                            (ut) => { },
                            (ut) => {
                                var et = mm.easeExpLog(10, ut);
                                mm.translateY(m, -2 * et);
                            },
                            (ut) => {
                                var et = mm.easeQuadraticActionIn(ut);
                                mm.translateZ(m, 1.8 * et);
                                mm.scaleXYZ(m2, 1 + 0.05 * et);

                            },
                        ])

                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m2, m]));
                        mm.draw();
                        mm.uniform1fv("uXYWH", [0, 0, 1, 1]);

                    },
                    (ut) => {
                        mm.bindShader(mm.shaderRepositionTexture);
                        mm.bindShape(mm.shapeRectangle);
                        mm.bindTexture(this.getTextureByIndex(8));
                        mm.texParameterMirrorRepeat();
                        mm.uniform1fv("uXYWH", [1, 0, -3, 1]);
                        mm.scaleXYZ3(m, 3, 1, 1);

                        mm.sequence(ut, mm.getUt([429, 442], 407, 442), [
                            (ut) => {
                                var et = mm.easeQuadraticActionOut(ut);
                                mm.rotateZ(m, -45 + 45 * et);
                            },
                            (ut) => {
                                var et = mm.easeQuadraticActionIn(ut);
                                mm.rotateZ(m, - 45 * et);
                            },
                        ])

                        mm.uniformMatrix4fv("uMatM", m);
                        mm.draw2d();
                        mm.uniform1fv("uXYWH", [0, 0, 1, 1]);



                        // black 
                        mm.bindShape(mm.shapeRectangle);
                        mm.bindTexture("res/black.png");
                        m = mm.eye4();

                        mm.scaleXYZ(m2, 2);
                        mm.rotateZ(m2, 45);
                        var tx = 0;
                        mm.sequence(ut, mm.getUt([429, 442], 407, 442), [
                            (ut) => {
                                var et = mm.easeQuadraticActionOut(ut);
                                tx += 1.5 - 0.15 * et;
                            },
                            (ut) => {
                                var et = mm.easeQuadraticActionIn(ut);
                                tx += 0.15 * et;
                            },
                        ])

                        mm.translateX(m, tx);
                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m, m2]));
                        mm.draw2d();

                        mm.translateX(m, -2 * tx);
                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m, m2]));
                        mm.draw2d();


                    },
                    (ut) => {
                        mm.bindShader(mm.shaderRepositionTexture);
                        mm.compose(ut, mm.getUt([480, 543], 442, 543), [
                            (ut) => {
                                mm.bindShape(mm.shapeCircle);
                                mm.bindTexture(this.getTextureByIndex(9));
                                mm.uniform1fv("uXYWH", [0, 1, 1, -1]);
                                mm.sequence(ut, mm.getUt([456, 464, 480], 442, 480), [
                                    (ut) => {
                                        var et = mm.easeLog(10, ut);
                                        mm.scaleXYZ(m, 0.23 + 1.1 * et);
                                    },
                                    (ut) => {
                                        var et = mm.easeLog(10, ut);
                                        mm.rotateY(m2, -45 * et);
                                    },
                                    (ut) => {
                                        var et = mm.easeExp(10, ut);
                                        mm.rotateY(m2, (45 + 55) * et);
                                    }
                                ])
                            },
                            (ut) => {
                                mm.bindShape(mm.shapeRectangle);
                                var a = 1.2;
                                mm.scaleXYZ3(m, 1 * a, 3 * a, 1);
                                mm.uniform1fv("uXYWH", [0, 0, 1, 3]);

                                mm.sequence(ut, mm.getUt([497, 517, 537, 543], 480, 543), [
                                    (ut) => {
                                        mm.bindTexture(this.getTextureByIndex(10));
                                        mm.texParameterRepeat();
                                        var et = mm.easeLog(10, ut);
                                        mm.translateY(m, -1 + 1 * et);
                                    },
                                    (ut) => {
                                        var et = mm.easeExp(10, ut);
                                        // mm.rotateY(m, 30 * et);
                                        // mm.rotateX(m, -15 * et);
                                        mm.rotateByAxis(m, [-1, 2, 0], 45 * et);
                                        mm.rotateZ(m, -5 * et);

                                    },
                                    (ut) => {
                                        mm.bindTexture(this.getTextureByIndex(11));
                                        mm.texParameterRepeat();
                                        var et = mm.easeLog(10, ut);
                                        // mm.rotateX(m, +15 * et);
                                        // mm.rotateY(m, -30 * et);
                                        mm.rotateZ(m, 5 * et);
                                        mm.rotateByAxis(m, [-1, 2, 0], -45 * et);

                                    },
                                    (ut) => { }
                                ])

                            },
                        ])


                        mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m2, m]));
                        mm.draw();
                        mm.uniform1fv("uXYWH", [0, 0, 1, 1]);

                    },
                ])


            },
        ])

        // black mask up and down 遮罩层
        mm.bindShader(mm.shaderDoNothing);
        mm.bindShape(mm.shapeRectangle);
        mm.bindTexture("res/black.png");

        m = mm.eye4();
        var ty = 2;

        mm.translateY(m, -1 * ty);
        mm.uniformMatrix4fv("uMatM", m);
        mm.draw2d();

        mm.translateY(m, 2 * ty);
        mm.uniformMatrix4fv("uMatM", m);
        mm.draw2d();

    }
});



// 测试旋转， 路径， 添加光效， 球体表面法向量， 节点动态生成线，线，插值法制作线段， 预渲染， 二次渲染， 纹理渲染
// 问设计， 一些AE效果好制作么，比如 shader条带那种。


