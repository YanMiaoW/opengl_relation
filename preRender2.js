mm._instances = {};

mm._id = 0;
mm._updateId = 0; // 每帧会自动恢复到初始值，jsonCopy函数希望在一帧中每次调用时都创建新的id，但是在update方法内调用时，又希望下一帧不会重复创建。
mm._width = 450;
mm._height = 800;
mm._fps = 60;

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
    // 全局唯一标识 shapeJson，shaderJson
    mm._id++;
    return mm._id;
}

mm.getUpdateId = function () {
    // 每次update后回归初始值
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
        var v = fn();
        if (!v) v = "not return."
        mm._instances[key] = v;
    }
    return mm._instances[key];
}

mm.getAspectRadio = function () {
    return mm._height / mm._width;
}

mm.log = function (x) {
    console.log(x);
}

mm.normpdf = function (x, sigma) {
    return 0.39894 * Math.exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

mm.getGaussianKernel = function (mSize, sigma) {
    return mm.getElseCreate('getGaussianKernel_' + String(mSize) + ' ' + String(sigma), () => {
        var kSize = (mSize - 1) / 2;
        kernel = Array(mSize).fill(0);
        for (let j = 0; j <= kSize; j++) {
            n = mm.normpdf(j / kSize * 2, sigma);
            kernel[kSize + j] = n;
            kernel[kSize - j] = n;
        }
        return kernel;
    })
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
    if (!url) console.log(url);

    return mm.getElseCreate("_texture_" + url, () => {
        var t = cc.textureCache.addImage(url);
        if (!t) {
            console.log(url + " url  not found");
        }
        t.width = t._getWidth();
        t.height = t._getHeight();
        t.texture_id = t.getName();
        return t;
    })
}

mm.jsonCopy = function (json0, initFunc, key) {
    if (!mm._isInit && !key) {
        console.log('jsonCopy should use in init function or use hashkey.');
    }
    if (!key) key = mm.getUpdateId();
    return mm.getElseCreate(key, () => {
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

mm.createTexture = function (width, height, key) {
    if (!mm._isInit && !key) {
        console.log('createTexture should use in init function or use hashkey.');
    }

    if (width % 2 != 0 || height % 2 != 0) {
        console.log('createTexture width height not % 2 == 0');
    }

    if (!key) key = mm.getUpdateId();
    return mm.getElseCreate("createTexture_" + width + "_" + height + "_" + key, () => {
        var texture = gl.createTexture();
        texture.width = width;
        texture.height = height;
        gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint32Array([]));
        gl.bindTexture(gl.TEXTURE_2D, 0);
        var textureUrl = "createTextureUrl" + key;
        mm.set("_texture_" + textureUrl, texture);
        return textureUrl;
    })
}

mm.textureRender = function (texture_url, fn, xywh) {

    var texture = mm.loadTexture(texture_url);

    var frame = mm.getElseCreate("_renderBuffer", () => {
        var frame = gl.createFramebuffer();
        return frame;
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer_id);
    var depth_texture = mm.getElseCreate("_renderBufferDepth" + String(texture.width) + " " + String(texture.height), () => {
        var depth_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depth_texture.texture_id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, texture.width, texture.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, new Uint32Array([]));
        gl.bindTexture(gl.TEXTURE_2D, 0);
        return depth_texture;
    })


    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture_id, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth_texture.texture_id, 0);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE)
        mm.log("Frame: could not attach texture to framebuffer");


    var _defaultMatV2D = mm.get("_defaultMatV2D");
    var _defaultMatV = mm.get("_defaultMatV");


    var _defaultMatV2D_render = mm.eye4();
    mm.scaleY(_defaultMatV2D_render, -texture.width / texture.height * mm._height / mm._width);

    var _defaultMatV_render = mm.eye4();
    mm.scaleY(_defaultMatV_render, -texture.width / texture.height * mm._height / mm._width);
    mm.translateZ(_defaultMatV_render, -4.8);

    mm.set('_defaultMatV2D', _defaultMatV2D_render);
    mm.set('_defaultMatV', _defaultMatV_render);

    if (!xywh) {
        xywh = [0, 0, 1, 1];
    }

    gl.viewport(
        texture.width * (xywh[0]),
        texture.height * (1 - xywh[3] - xywh[1]),
        texture.width * xywh[2],
        texture.height * xywh[3]
    );


    // mm.showProperty(gl);
    gl.clearColor(0, 0, 0, 0);
    // gl.clearDepthf(0.0);

    // 更新深度缓冲需要开启深度写入才行。
    gl.depthMask(true);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.depthMask(false);

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

mm.texParameterNearest = function () {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

mm.texParameterLinear = function () {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

mm.getShapeFromJson = function (shapeJson) {
    if (!shapeJson['id']) shapeJson['id'] = mm.getId();
    return mm.getElseCreate(shapeJson['id'], () => {
        if (shapeJson['initFunc']) {
            // init function generate points coords...
            shapeJson['initFunc'](shapeJson);
        }


        // mm.log(shapeJson['initFunc']);
        // mm.log(shapeJson['points']);

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
        mm.log(key + " not exist.");
    }

}

mm.uniform1fv = function (key, array) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1fv(keyL, array.length, new Float32Array(array));
    } else {
        mm.log(key + " not exist.");
    }
}

mm.uniform1f = function (key, fv) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1fv(keyL, 1, new Float32Array([fv]));
    } else {
        mm.log(key + " not exist.");
    }
}

mm.uniform1i = function (key, iv) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniform1i(keyL, iv);
    } else {
        mm.log(key + " not exist.");
    }
}

mm.clearDepth = function () {
    gl.clear(gl.DEPTH_BUFFER_BIT);
}

mm.clearColor = function (rgba) {
    gl.clearColor(rgba[0], rgba[1], rgba[2], rgba[3]);
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

mm.drawSelect = function (enableDepth, enableBlend, enable3D, enableLine) {
    if (enableDepth) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
    } else {
        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);
    }

    if (enableBlend) {
        gl.enable(gl.BLEND);

    } else {
        gl.disable(gl.BLEND);
    }

    if (enable3D) {
        mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
        mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));
    } else {
        mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
        mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));
    }

    if (enableLine) {
        gl.drawArrays(gl.LINES, 0, mm.get('_currentShape')["arrayNum"]);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
    }
}


mm.drawCover2d = function () {

    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    mm.uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
    mm.uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));

    gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
    gl.enable(gl.BLEND);

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
        coords.push(0.5); // center x
        coords.push(0.5); // center y



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
        coords.push(0.5); // center x
        coords.push(0.5); // center y

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

mm.createCircumferenceFromJsonShape = function (json0) {
    if (!json0['id']) {
        mm.getShapeFromJson(json0);
    }
    return mm.getElseCreate("createCircumferenceFromJsonShape_" + String(json0['id']), () => {
        var pointIndics = [];
        var coordIndics = [];

        var pointIndics0 = json0["pointIndics"];
        var coordIndics0 = json0["coordIndics"];

        for (let i = 0; i < pointIndics0.length; i += 3) {
            pointIndics.push(pointIndics0[i + 1]);
            pointIndics.push(pointIndics0[i + 2]);
        }

        for (let i = 0; i < coordIndics0.length; i += 3) {
            coordIndics.push(coordIndics0[i + 1]);
            coordIndics.push(coordIndics0[i + 2]);
        }

        json = {};
        json['points'] = json0['points'];
        json['coords'] = json0['coords'];
        json['pointIndics'] = pointIndics;
        json['coordIndics'] = coordIndics;

        return json;
    })
}

mm.createLineFromJsonShape = function (json0) {
    if (!json0['id']) {
        mm.getShapeFromJson(json0);
    }
    return mm.getElseCreate("createLineFromJsonShape_" + String(json0['id']), () => {
        var pointIndics = [];
        var coordIndics = [];

        var pointIndics0 = json0["pointIndics"];
        var coordIndics0 = json0["coordIndics"];

        for (let i = 0; i < pointIndics0.length; i += 3) {
            pointIndics.push(pointIndics0[i]);
            pointIndics.push(pointIndics0[i + 1]);
            pointIndics.push(pointIndics0[i + 1]);
            pointIndics.push(pointIndics0[i + 2]);
            pointIndics.push(pointIndics0[i + 2]);
            pointIndics.push(pointIndics0[i]);
        }

        for (let i = 0; i < coordIndics0.length; i += 3) {
            coordIndics.push(coordIndics0[i]);
            coordIndics.push(coordIndics0[i + 1]);
            coordIndics.push(coordIndics0[i + 1]);
            coordIndics.push(coordIndics0[i + 2]);
            coordIndics.push(coordIndics0[i + 2]);
            coordIndics.push(coordIndics0[i]);
        }

        json = {};
        json['points'] = json0['points'];
        json['coords'] = json0['coords'];
        json['pointIndics'] = pointIndics;
        json['coordIndics'] = coordIndics;

        return json;
    })

}

mm.debugLine = function (u) {
    mm.log();
    mm.log('-----------------------------------------');
    mm.log(u);
}

mm.debugThrow = function () {
    throw new Error("debug throw");
}

mm.debugPerformanceTest = function (n, fn) {
    // 测试性能， n是运算次数，fn是计算的函数。
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

mm.shaderDiscardTransparent = {
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
            if(color.a < 0.1) discard;\
            gl_FragColor = color;\
        }',
}

mm.shaderLight = {
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
            float alpha = max(color.r, color.g);\
            alpha = max(color.g, color.b);\
            if(alpha < 0.01)discard;\
            gl_FragColor = vec4(color.r, color.g, color.b, alpha);\
        }',
}

mm.shaderColorTransparent = {
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
        uniform float uColor[4];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = texture2D(sampler2d, texCoord);\
            if(color.a < 0.1) discard;\
            gl_FragColor = vec4(uColor[0], uColor[1], uColor[2], color.a);\
        }',
    "array": {
        "uColor": [0.0, 0.0, 0.0, 1.0],
    },
}

mm.shaderGaussianBlurHeight = {
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
        uniform float uKernel[300];\
        uniform int uKernelSize;\
        uniform int uTextureHeight;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = gaussianBlurHeight(sampler2d, texCoord, uTextureHeight, uKernel, uKernelSize);\
            gl_FragColor = color;\
        }',
    "int": {
        "uKernelSize": 11,
        "uTextureHeight": 512,
    },
    "array": {
        "uKernel": mm.getGaussianKernel(11, 10.0),
    },
}

mm.shaderGaussianBlurWidth = {
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
        uniform float uKernel[300];\
        uniform int uKernelSize;\
        uniform int uTextureWidth;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = gaussianBlurWidth(sampler2d, texCoord, uTextureWidth, uKernel, uKernelSize);\
            gl_FragColor = color;\
        }',
    "int": {
        "uKernelSize": 11,
        "uTextureWidth": 512,
    },
    "array": {
        "uKernel": mm.getGaussianKernel(11, 10.0),
    },
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


mm.shaderDilation = {
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
        uniform int uTextureWidth;\
        uniform int uTextureHeight;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = dilateOnce(sampler2d, texCoord, uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "int": {
        "uTextureWidth": 512,
        "uTextureHeight": 512,
    },
}

mm.shaderDilation = {
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
        uniform int uTextureWidth;\
        uniform int uTextureHeight;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = dilateOnce(sampler2d, texCoord, uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "int": {
        "uTextureWidth": 512,
        "uTextureHeight": 512,
    },
}

mm.shaderFrameBurning = {
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
        uniform int uTextureWidth;\
        uniform int uTextureHeight;\
        uniform int uTimes;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = frameBurning(sampler2d, texCoord, uTextureWidth, uTextureHeight, uUt[0], uTimes);\
            gl_FragColor = color;\
        }',
    "int": {
        "uTextureWidth": 512,
        "uTextureHeight": 512,
        "uTimes": 10
    },
    "float": {
        "uUt": 0
    }
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
        0, 1,
        0, 0,
        1, 0,
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3
    ],
    "coordIndics": [
        0, 1, 2, 0, 2, 3
    ]
}

mm.shapeFullScreen = {
    "points": [
        1, mm.getAspectRadio(), 0,
        -1, mm.getAspectRadio(), 0,
        -1, - mm.getAspectRadio(), 0,
        1, - mm.getAspectRadio(), 0,
    ],
    "coords": [
        1, 1,
        0, 1,
        0, 0,
        1, 0,
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3
    ],
    "coordIndics": [
        0, 1, 2, 0, 2, 3
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
        0, 1,
        0, 0,
        1, 0,
        1, 1,
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

mm.shapeCubeLine = {
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
        0, 1,
        0, 0,
        1, 0,
        1, 1,
    ],
    "pointIndics": [
        0, 1, 1, 2, 2, 3, 3, 0,
        4, 0, 0, 3, 3, 7, 7, 4,
        5, 4, 4, 7, 7, 6, 6, 5,
        1, 5, 5, 6, 6, 2, 2, 1,
        4, 5, 5, 1, 1, 0, 0, 4,
        3, 2, 2, 6, 6, 7, 7, 3
    ],
    "coordIndics": [
        3, 0, 0, 1, 1, 2, 2, 3,
        3, 0, 0, 1, 1, 2, 2, 3,
        3, 0, 0, 1, 1, 2, 2, 3,
        3, 0, 0, 1, 1, 2, 2, 3,
        3, 0, 0, 1, 1, 2, 2, 3,
        3, 0, 0, 1, 1, 2, 2, 3
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
                var cy = 1 - j / sliceNum;
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



mm.getTextureByIndex = function (index) {
    return mm._texturePaths[index % mm._texturePaths.length];
}


mm.textureGaussianBlur = function (texture_url0, texture_url, kernel_size, sigma) {
    if (kernel_size % 2 == 0) {
        mm.log('textureGaussianBlur kernel_size must odd number.');
    }
    if (kernel_size > 300) {
        mm.log('textureGaussianBlur kernel_size must < 300');
    }

    var texture = mm.loadTexture(texture_url);
    var texture_blur2 = mm.loadTexture(texture_url0);

    var width = texture_blur2.width;
    var height = texture_blur2.height;
    // var width = Math.floor(texture.width * scale);
    // var height = Math.floor(texture.height * scale);

    var texture_blur1 = mm.createTexture(width, height, 'textureGaussianBlur1');

    // if (kernel_size < texture.width * 2 / 3 && kernel_size < texture.height * 2 / 3) {
    //     // 放大高斯模糊，因为高斯模糊向内腐蚀了，这里最好的效果是通过平移来做，
    //     // 不过比较难实现，因此选用放大来做，同时限定下范围。
    //     var ccc = 1.5;
    //     mm.scaleXYZ3(m,
    //         texture.width / (texture.width - kernel_size / ccc),
    //         texture.height / (texture.height - kernel_size / ccc),
    //         1
    //     );
    // }
    var m = mm.eye4();
    mm.scaleY(m, height / width);

    // 两次高斯滤波，纵向
    mm.textureRender(texture_blur1, () => {
        mm.bindShader(mm.shaderGaussianBlurHeight);
        mm.bindTexture(texture_url);
        mm.bindShape(mm.shapeRectangle);
        mm.uniform1fv("uKernel", mm.getGaussianKernel(kernel_size, sigma));
        mm.uniform1i("uKernelSize", kernel_size);
        mm.uniform1i("uTextureHeight", texture.height);
        mm.uniformMatrix4fv("uMatM", m);
        mm.draw2d();
    })


    // 两次高斯滤波，横向
    mm.textureRender(texture_url0, () => {
        mm.bindShader(mm.shaderGaussianBlurWidth);
        mm.bindTexture(texture_blur1);
        mm.bindShape(mm.shapeRectangle);
        mm.uniform1fv("uKernel", mm.getGaussianKernel(kernel_size, sigma));
        mm.uniform1i("uKernelSize", kernel_size);
        mm.uniform1i("uTextureWidth", texture.width);
        mm.uniformMatrix4fv("uMatM", m);
        mm.draw2d();
    })

    return texture_url0;

}

mm.textureDilation = function (texture_url0, texture_url, n) {
    var m = mm.eye4();

    var texture = mm.loadTexture(texture_url);

    var width = texture.width;
    var height = texture.height;
    // var width = Math.floor(texture.width * scale);
    // var height = Math.floor(texture.height * scale);

    var texture_dilation1 = texture_url0;
    var texture_dilation2 = mm.createTexture(width, height, "textureDilation2");

    mm.bindTexture(texture_dilation1);

    mm.bindTexture(texture_dilation2);

    mm.bindShader(mm.shaderDilation);
    mm.uniform1i('uTextureWidth', width);
    mm.uniform1i('uTextureHeight', height);
    // mm.bindShader(mm.shaderDoNothing);

    mm.bindShape(mm.shapeRectangle);
    m = mm.eye4();
    mm.scaleY(m, height / width);
    mm.uniformMatrix4fv("uMatM", m);

    mm.textureRender(texture_dilation1, () => {
        mm.bindTexture(texture_url);
        mm.draw2d();
    })


    for (let i = 0; i < n - 1; i++) {
        mm.textureRender(texture_dilation2, () => {
            mm.bindTexture(texture_dilation1);
            mm.draw2d();
        })

        var t = texture_dilation1;
        texture_dilation1 = texture_dilation2;
        texture_dilation2 = t;
    }

    mm.bindTexture(mm.get('_currentTextureUrl'));

    return texture_dilation1;

}

mm.createLineByRoute = function (sliceNum, fn) {
    if (mm._isUpdate) {
        console.log('createLineByRoute should use in init function.');
    }
    var indices = [];
    var points = [];
    var coords = [];

    for (let i = 0; i <= sliceNum; i++) {
        var m = fn(i / sliceNum);
        var x = m[12];
        var y = m[13];
        var z = m[14];

        points.push(x);
        points.push(y);
        points.push(z);
        coords.push(i / sliceNum);
        coords.push(0.5);

    }

    for (let i = 0; i < sliceNum; i++) {
        indices.push(i);
        indices.push(i + 1);
    }

    var json = {};
    json['points'] = points;
    json['coords'] = coords;
    json['pointIndics'] = indices;
    json['coordIndics'] = indices;

    return json;

}






var BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function (configs) {
        this._super();

        mm._texturePaths = [];
        for (var item in configs) {
            if (item == 'data') {
                var datas = configs[item]
                for (var index in datas) {
                    var obj_data = datas[index];
                    if (jsb.fileUtils.isFileExist(obj_data['name'])) {
                        mm._texturePaths.push(obj_data['name']);
                    } else {
                        mm.log(obj_data['name'] + " not found.");
                    }
                }
            }
        }


        if ('opengl' in cc.sys.capabilities) {


            this.speed = 1;

            // default shader init
            mm.bindShader(mm.shaderDoNothing);

            mm._isInit = true;
            this.init(config);
            mm._isInit = false;

            this.startFrame = mm._startFrame;
            this.endFrame = mm._endFrame;
            this.fps = mm._fpsVideo;
            this.count = mm._startFrame;

            var initShaderJson = mm.get('_currentShaderJson');
            var initShapeJson = mm.get('_currentShapeJson');
            var initTextureUrl = mm.get('_currentTextureUrl');
            var initUMatM = mm.get("_currentMat_" + "uMatM");

            var initUpdateId = mm._updateId;

            var glnode = new cc.GLNode();
            this.addChild(glnode, 10);
            this.glnode = glnode;

            glnode.draw = function () {

                var totalFrame = this.endFrame - this.startFrame;

                var ut = (this.count - this.startFrame) / totalFrame;
                this.count += 1 * this.speed * this.fps / mm._fps;
                if (this.count >= this.endFrame) this.count = this.startFrame;


                // if (this.period) {
                //     if (this.count < this.period[0] || this.count >= this.period[1]) this.count = this.period[0];
                // }

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                mm._updateId = initUpdateId;
                // reuse shader every frame
                mm.set("_currentTextureUrl", initTextureUrl);
                mm.set("_currentShapeJson", initShapeJson);
                mm.set("_currentMat_" + "uMatM", initUMatM);

                mm.set('_currentShaderJson', null);
                mm.bindShader(initShaderJson);
                mm._count = this.count;
                this.update(ut);


                gl.depthMask(false);
                gl.disable(gl.DEPTH_TEST);

            }.bind(this);

            // 提前进行一些初始化，预热程序
            glnode.draw();
            this.count = mm._count;

        }

        return true;
    },
    // setTotalFrame: function (v) {
    //     this.totalFrame = v;
    // },
    setPlaySpeed: function (v) {
        this.speed = v;
    },
    cutFrame: function (begin, end) {
        this.period = [begin - this.beginFrame, end - this.beginFrame];
    },
    setBeginEndFps: function (begin, end, fps) {
        this.beginFrame = begin;
        this.endFrame = end;
        this.fps = fps;
    },
    init: function (config) {
        // override
    },
    update: function (ut) {
        // override
        // this function will calling at each frame.
    }
})





mm.setStartEndFps = function (start = 0, end = 600, fps = 60) {
    mm._startFrame = start;
    mm._endFrame = end;
    mm._fpsVideo = fps;
}

// mm.seq = function (start = mm._startFrame) {
//     return {
//         start,
//         then(timeNode, fn) {
//             if (mm._count < this.start) {
//                 return { then() { return this } }
//             }
//             if (typeof timeNode == 'function') {
//                 fn = timeNode;
//                 timeNode = mm._endFrame;
//             }
//             if (fn) {
//                 if (mm._count < timeNode) {
//                     fn((mm._count - this.start) / (timeNode - this.start))
//                 }else{
//                     fn(1.0);
//                     this.start = timeNode;
//                 }

//             }
//             return this;
//         }
//     }
// }

mm.seq = function (start = mm._startFrame, fn) {
    if (typeof start == 'function') {
        fn = start;
        start = mm._startFrame;
    }
    if (fn) { fn(1.0); }
    let doNothing = { then: function () { return this } };

    return {
        start,
        then: function (timeNode, fn) {
            if (mm._count < this.start) {
                return doNothing
            }
            if (typeof timeNode == 'function') {
                fn = timeNode;
                timeNode = mm._endFrame;
            }
            if (fn) {
                if (mm._count < timeNode) {
                    fn((mm._count - this.start) / (timeNode - this.start))
                    return doNothing
                } else {
                    fn(1.0);
                    this.start = timeNode;
                }

            }
            return this
        },
    }
}

mm.comp = function (start = mm._startFrame, fn) {
    if (typeof start == 'function') {
        fn = start;
        start = mm._startFrame;
    }
    if (fn) { fn(1.0); }
    let doNothing = { then: function () { return this } };

    return {
        start,
        then: function (timeNode, fn) {
            if (mm._count < this.start) {
                return doNothing
            }
            if (typeof timeNode == 'function') {
                fn = timeNode;
                timeNode = mm._endFrame;
            }
            if (fn) {
                if (mm._count < timeNode) {
                    fn((mm._count - this.start) / (timeNode - this.start))
                    return doNothing
                } else {
                    this.start = timeNode;
                }

            }
            return this
        },
    }
}





mm.translateX = function (m, l, ut = 1.0) {
    let old = m._translateX;
    m._translateX = old + (l - old) * ut;
}

mm.translateY = function (m, l, ut = 1.0) {
    let old = m._translateY;
    m._translateY = old + (l - old) * ut;
}

mm.translateZ = function (m, l, ut = 1.0) {
    let old = m._translateZ;
    m._translateZ = old + (l - old) * ut;
}

mm.rotatePitch = function (m, l, ut = 1.0) {
    let old = m._rotatePitch;
    m._rotatePitch = old + (l - old) * ut;
}

mm.rotateYaw = function (m, l, ut = 1.0) {
    let old = m._rotateYaw;
    m._rotateYaw = old + (l - old) * ut;
}

mm.rotateRoll = function (m, l, ut = 1.0) {
    let old = m._rotateRoll;
    m._rotateRoll = old + (l - old) * ut;
}

mm.scaleXYZ = function (m, s, ut = 1.0) {
    mm.scaleX(m, s, ut);
    mm.scaleY(m, s, ut);
    mm.scaleZ(m, s, ut);
}

mm.scaleX = function (m, s, ut = 1.0) {
    let old = m._scaleX;
    m._scaleX = old + (s - old) * ut;
}

mm.scaleY = function (m, s, ut = 1.0) {
    let old = m._scaleY;
    m._scaleY = old + (s - old) * ut;
}

mm.scaleZ = function (m, s, ut = 1.0) {
    let old = m._scaleZ;
    m._scaleZ = old + (s - old) * ut;
}

mm._eye = function () {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

mm.getMatrix = function (m) {
    let matTranslate = mm._eye();
    let matRotate = mm._eye();
    let matScale = mm._eye();
    matTranslate[12] = m._translateX;
    matTranslate[13] = m._translateY;
    matTranslate[14] = m._translateZ;
    matRotate = mm._rotateByPitchYawRoll(matRotate, m._rotatePitch, m._rotateYaw, m._rotateRoll)
    matScale[0] = m._scaleX;
    matScale[5] = m._scaleY;
    matScale[10] = m._scaleZ;
    // console.log(matTranslate);


    return mm._matrixMutiplyList([matScale, matRotate, matTranslate])

}

mm._uniformMatrix4fv = function (key, m) {
    var mat = mm.getMatrix(m);
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniformMatrix4fv(keyL, false, new Float32Array(mat));
        mm.set("_currentMat_" + key, m);
    } else {
        mm.log(key + " not exist.");
    }

}

mm.matrixMutiplyList = function (ms) {
    ms = ms.map(m => mm.getMatrix(m))
    return mm._matrixMutiplyList(ms)
}

mm.bindMatM = function (m) {
    mm.uniformMatrix4fv('uMatM', m);
}



var preRender = BaseNode.extend({
    init: function () {
        mm.setStartEndFps(0, 120, 30); //25, 501

    },
    update: function () {

        var m = mm.eye4()
        var texture = 1;
        // mm.seq(ut => { mm.translateX(m, -1); mm.translateY(m, -1); })
        //     .then(30, ut => mm.translateX(m, 1, ut))
        //     .then(60, ut => mm.translateY(m, 1, ut))
        //     .then(90, ut => mm.translateX(m, -1, ut))
        //     .then(ut => mm.translateY(m, -1, ut))

        // mm.comp()
        //     .then(30, ut => texture = 1)
        //     .then(60, ut => texture = 2)
        //     .then(90, ut => texture = 3)
        //     .then(ut => texture = 4)

        mm.bindShader(mm.shaderDoNothing)
        mm.bindShape(mm.shapeRectangle)
        mm.bindTexture(mm.getTextureByIndex(texture))
        mm.bindMatM(m)
        mm.draw()



    }
})













var PreRender3 = BaseNode.extend({
    init: function () {
        this.setBeginEndFps(25, 501, 30);
        this.setPlaySpeed(1);
        this.cutFrame(25, 501);

        mm.setTimeFrames({
            "begin": 25, "end": 501,
            1: 25, 2: 41, 3: 58,
        })

        var initGuassianBackground = function () {
            for (let i = 0; i < 6; i++) {
                mm.getElseCreate("gaussianBackground_" + i, () => {
                    var texture = mm.createTexture(270, 270 * mm.getAspectRadio(), "texture22_gaussian" + i);
                    var texture2 = mm.createTexture(180, 180 * mm.getAspectRadio(), "texture22Background_" + i);
                    mm.textureRender(texture2, () => {
                        mm.bindShader(mm.shaderMatrixTransform);
                        var m = mm.eye4();
                        mm.scaleXYZ(m, 1 / 2);
                        mm.uniformMatrix4fv('uMatTexture', m);
                        mm.bindTexture(mm.getTextureByIndex(i));
                        var m2 = mm.eye4();
                        var cc = 32;
                        mm.scaleXYZ3(m2, (cc - 1 / 2) / cc, (cc - 1 / mm.getAspectRadio()) / cc, 1);
                        mm.uniformMatrix4fv('uMatM', m2);
                        mm.clearColor([0.95, 0.95, 0.95, 1.0]);
                        mm.bindShape(mm.shapeFullScreen);
                        mm.draw2d();
                    })
                    mm.textureGaussianBlur(texture, texture2, 17, 11);
                    return texture;
                })
            }
        }

        initGuassianBackground();


    },
    update: function (ut) {

        var drawBackground = function () {

            var ease = function (ut) { return mm.easeExpLog(2, ut); }

            var m = mm.eye4();
            var m2 = mm.eye4();
            var texture1;
            var texture2;
            mm.compose(ut, mm.getUt([58, 167, 227, 289, 391, 501], 25, 501), [
                (ut) => {
                    mm.sequence(ut, mm.getUt([41, 58], 25, 58), [
                        (ut) => { texture1 = 0; texture2 = 1; mm.translateX(m2, 2); },
                        (ut) => { mm.translateX(m, -2 * ease(ut)); },
                    ])
                },
                (ut) => {
                    mm.sequence(ut, mm.getUt([138, 167], 58, 167), [
                        (ut) => { texture1 = 1; texture2 = 2; mm.translateY(m2, -2); },
                        (ut) => { mm.translateY(m, 2 * ease(ut)); },
                    ])
                },
                (ut) => {
                    mm.sequence(ut, mm.getUt([206, 227], 167, 227), [
                        (ut) => { texture1 = 2; texture2 = 3; mm.translateX(m2, -2); },
                        (ut) => { mm.translateX(m, 2 * ease(ut)); },
                    ])
                },
                (ut) => {
                    mm.sequence(ut, mm.getUt([268, 289], 227, 289), [
                        (ut) => { texture1 = 3; texture2 = 4; mm.translateX(m2, -2); },
                        (ut) => { mm.translateX(m, 2 * ease(ut)); },
                    ])
                },
                (ut) => {
                    mm.sequence(ut, mm.getUt([369, 391], 289, 391), [
                        (ut) => { texture1 = 4; texture2 = 2; mm.translateY(m2, -2); },
                        (ut) => { mm.translateY(m, 2 * ease(ut)); },
                    ])
                },
                (ut) => {
                    mm.sequence(ut, mm.getUt([426, 451, 501], 391, 501), [
                        (ut) => { texture1 = 2; texture2 = 5; mm.translateX(m2, -2); },
                        (ut) => { mm.translateX(m, 2 * ease(ut)); },
                        (ut) => { },
                    ])
                }
            ])
            var m3 = mm.eye4();
            mm.scaleY(m3, 16 / 9);

            mm.bindTexture(mm.get("gaussianBackground_" + texture1));
            mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m, m3]));
            mm.draw2d();
            mm.bindTexture(mm.get("gaussianBackground_" + texture2));
            mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m, m2, m3]));
            mm.draw2d();
        }

        drawBackground();

        // var drawCube = function () {



        //     mm.bindShader(mm.shaderDoNothing);
        //     mm.bindShape(mm.shapeRectangle);
        //     var m5 = mm.eye4();
        //     mm.translateZ(m5, 1);
        //     var m6 = mm.eye4();
        //     for (let i = 0; i < 6; i++) {
        //         if (i == 1) { mm.rotateY(m6, 90); }
        //         if (i == 2) { mm.rotateZ(m6, 90); }
        //         if (i == 3) { mm.rotateZ(m6, 90); }
        //         if (i == 4) { mm.rotateZ(m6, 90); }
        //         if (i == 5) { mm.rotateZ(m6, -180); mm.rotateX(m6, -90); }
        //         mm.bindTexture(mm.getTextureByIndex(i));
        //         mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m5, m6, m3]));
        //         mm.draw();
        //     }
        // }

        // drawCube();


    }
})














var PreRender2 = BaseNode.extend({
    init: function () {
        this.setTotalFrame(720);
        this.setPlaySpeed(60 / 60 / 1);
        this.cutFrame(0 + 0, 720 - 0);

        for (let i = 0; i < 6; i++) {
            mm.getElseCreate("gaussian_" + i, () => {
                var texture = mm.createTexture(256, 256, "texture22_" + i);
                mm.textureGaussianBlur(texture, mm.getTextureByIndex(i), 31, 11);
                return texture;
            })
        }

    },
    update: function (ut) {

        this.drawBackground(ut);

        this.drawCube(ut);

    },
    drawBackground: function (ut) {
        var m = mm.eye4();
        var m3 = mm.eye4();
        var texture1;
        var texture2;

        var swapFunc = function (ut, fn) {
            mm.sequenceSole(ut, 2, 3, 0, 3, (ut) => { fn(ut); });
        }

        mm.compose(ut, [3, 3, 3, 3, 3, 3, 2], [
            ut => { swapFunc(ut, (ut) => { mm.translateX(m, -2 * ut); }); mm.translateX(m3, 2); texture1 = 0; texture2 = 1; },
            ut => { swapFunc(ut, (ut) => { mm.translateY(m, 2 * 16 / 9 * ut); }); mm.translateY(m3, -2 * 16 / 9); texture1 = 1; texture2 = 2; },
            ut => { swapFunc(ut, (ut) => { mm.translateX(m, 2 * ut); }); mm.translateX(m3, -2); texture1 = 2; texture2 = 3; },
            ut => { swapFunc(ut, (ut) => { mm.translateY(m, -2 * 16 / 9 * ut); }); mm.translateY(m3, 2 * 16 / 9); texture1 = 3; texture2 = 4; },
            ut => { swapFunc(ut, (ut) => { mm.translateX(m, -2 * ut); }); mm.translateX(m3, 2); texture1 = 4; texture2 = 2; },
            ut => { swapFunc(ut, (ut) => { mm.translateY(m, 2 * 16 / 9 * ut); }); mm.translateY(m3, -2 * 16 / 9); texture1 = 2; texture2 = 5; },
            ut => { mm.translateY(m, 2 * 16 / 9); mm.translateY(m3, -2 * 16 / 9); texture1 = 2; texture2 = 5; },
        ])

        mm.bindShader(mm.shaderMatrixTransform);
        var m4 = mm.eye4();
        mm.scaleX(m4, 9 / 16);
        mm.uniformMatrix4fv('uMatTexture', m4);

        mm.bindShape(mm.shapeRectangle);
        var m2 = mm.eye4();
        mm.scaleY(m2, 16 / 9);

        mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m2, m]));
        mm.bindTexture(mm.get("gaussian_" + texture1));
        mm.draw2d();

        mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m2, m, m3]));
        mm.bindTexture(mm.get("gaussian_" + texture2));
        mm.draw2d();

    },
    drawCube: function (ut) {

        var m = mm.eye4();
        mm.sequence(ut, [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], [
            (ut) => { mm.rotateY(m, 10 - 20 * ut); },
            (ut) => { mm.rotateY(m, -80 * ut); },
            (ut) => { mm.rotateY(m, -10 * ut); },
            (ut) => {
                mm.rotateY(m, 10 * ut);
                mm.sequence(ut, [0.5, 0.5], [
                    (ut) => { mm.rotateZ(m, -45 * ut); },
                    (ut) => { mm.rotateZ(m, 45 * ut); mm.rotateX(m, 80 * ut); },
                ])
            },
            (ut) => { mm.rotateX(m, 20 * ut); mm.rotateY(m, -10 * mm.easeLog(5, ut)); },
            (ut) => { mm.rotateY(m, 10 * mm.easeExp(5, ut)); mm.rotateX(m, 70 * ut); },
            (ut) => { mm.rotateX(m, 20 * ut); },
            (ut) => { mm.rotateX(m, 70 * ut); },
            (ut) => { mm.rotateX(m, 20 * ut); },
            (ut) => { mm.rotateX(m, -180 * mm.easeExpLog(5, ut)); },
            (ut) => { mm.rotateX(m, -20 * ut); },
            (ut) => {
                ut = mm.easeExpLog(5, ut);
                mm.sequence(ut, [0.5, 0.5], [
                    (ut) => { mm.rotateX(m, 10 * ut); mm.rotateZ(m, -45 * ut); },
                    (ut) => { mm.rotateZ(m, 45 * ut); },
                ]);
                mm.rotateY(m, -90 * ut);
            },
            (ut) => { mm.rotateY(m, -10 * ut); }
        ])


        // cube light
        // var renderTexture = mm.createTexture(256, 256, "_lightCube");
        // var blurTexture = mm.createTexture(256, 256, "_lightBlurTexture");
        // mm.textureRender(renderTexture, () => {
        //     mm.bindShader(mm.shaderColor);
        //     mm.uniform1fv('uColor', [1, 1, 1, 1]);
        //     mm.bindShape(mm.shapeCube);
        //     mm.uniformMatrix4fv('uMatM', m);
        //     mm.draw();
        // })
        // mm.bindShader(mm.shaderDiscardTransparent);
        // mm.bindShape(mm.shapeRectangle);
        // mm.uniformMatrix4fv('uMatM', mm.eye4());

        // mm.textureGaussianBlur(blurTexture, renderTexture, 37, 11);
        // mm.bindTexture(renderTexture);
        // mm.draw2d();




        // cube

        var f1 = function () {
            mm.bindShader(mm.shaderColor);
            mm.uniform1fv('uColor', [1, 1, 1, 1]);
            mm.bindShape(mm.shapeSphere);
            var m2 = mm.eye4();
            mm.scaleXYZ(m2, 0.2);
            mm.translateZ(m2, 1.6);
            mm.translateX(m2, 1 * Math.cos(ut * 10));
            mm.translateY(m2, 1 * Math.sin(ut * 10));

            var m3 = mm.eye4();
            for (let i = 0; i < 6; i++) {
                if (i < 4) { mm.rotateY(m3, 90); }
                if (i == 4) { mm.rotateX(m3, 90); }
                if (i == 5) { mm.rotateX(m3, -180); }
                mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m2, m3, m]));
                mm.draw();
            }
        }

        var f2 = function () {
            mm.bindShader(mm.shaderColor);
            mm.uniform1fv('uColor', [1, 1, 1, 1]);
            mm.bindShape(mm.createCircumferenceFromJsonShape(mm.createPolygonShape(30)));
            var m2 = mm.eye4();
            // mm.scaleXYZ(m2, 0.2);
            mm.translateZ(m2, 1.6);
            var m3 = mm.eye4();
            for (let i = 0; i < 4; i++) {
                if (i == 0) { mm.rotateByAxis(m3, [1, 1, 0], 45); }
                if (i < 4) { mm.rotateByAxis(m3, [1, 1, 0], 90); }
                // if (i == 4) { mm.rotateByAxis(m3, [1, 1, 0], 90);}
                // if (i == 4) { mm.rotateX(m3, 90); }
                // if (i == 5) { mm.rotateX(m3, -180); }
                mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m2, m3, m]));
                // mm.showProperty(gl);
                gl.lineWidth(1);
                mm.drawLine();
            }
        }

        var f3 = function () {
            mm.bindShader(mm.shaderColor);
            mm.uniform1fv('uColor', [0, 0, 0, 1]);
            mm.bindShape(mm.shapeCube);
            mm.uniformMatrix4fv('uMatM', m);
            mm.draw();
        }

        mm.bindShader(mm.shaderFrameBurning);
        mm.uniform1i('uTimes', 200);
        mm.uniform1f('uUt', ut);
        // mm.bindShader(mm.shaderDoNothing);
        mm.bindShape(mm.shapeRectangle);
        var m3 = mm.eye4();
        mm.translateZ(m3, 1);
        var m2 = mm.eye4();
        for (let i = 0; i < 6; i++) {
            if (i == 1) { mm.rotateY(m2, 90); }
            if (i == 2) { mm.rotateZ(m2, 90); }
            if (i == 3) { mm.rotateZ(m2, 90); }
            if (i == 4) { mm.rotateZ(m2, 90); }
            if (i == 5) { mm.rotateZ(m2, -180); mm.rotateX(m2, -90); }
            mm.bindTexture(mm.getTextureByIndex(i));
            mm.uniformMatrix4fv('uMatM', mm.matrixMutiplyList([m3, m2, m]));
            mm.draw();
        }

        f1();
        // f2();

        // adds light
        var renderTexture2 = mm.createTexture(256, 380, "_lightCube2");
        var dilationTexture2 = mm.createTexture(256, 380, "_dilationTexture2");
        var blurTexture2 = mm.createTexture(256, 380, "_lightBlurTexture2");

        mm.textureRender(renderTexture2, () => {
            mm.clearColor([0, 0, 0, 1]);
            f1();
            // f2();
            f3();
        })

        mm.textureDilation(dilationTexture2, renderTexture2, 2);
        mm.textureGaussianBlur(blurTexture2, dilationTexture2, 37, 11);
        mm.bindTexture(blurTexture2);
        mm.bindShader(mm.shaderLight);
        // mm.bindShader(mm.shaderDoNothing);
        mm.bindShape(mm.shapeRectangle);
        var m4 = mm.eye4();
        mm.scaleY(m4, 380 / 256);
        mm.uniformMatrix4fv('uMatM', m4);
        mm.draw2d();


    }
})




// 路径， 添加光效， 球体表面法向量， 节点动态生成线，线，插值法制作线段，
// 问设计， 一些AE效果好制作么，比如 shader条带那种。


