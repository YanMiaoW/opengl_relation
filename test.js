

        // "src/test.js",


var BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function () {
        this._super();
        if ('opengl' in cc.sys.capabilities) {


            this.totalFrame = 100;
            // this.frameRate = 60;
            this.count = 0;

            this.init();

            mm.draw();   

            var glnode = new cc.GLNode();
            this.addChild(glnode, 10);
            this.glnode = glnode;

            glnode.draw = function () {

                var ut = this.count / this.totalFrame;

                this.count++;

                mm.setInstance("_isVertexAttribPointer", false);

                this.update(ut);

                gl.depthMask(false);
                gl.disable(gl.DEPTH_TEST);

                // 将所有矩阵类的使用状态变为否，类似于 “线程池”，
                // 因为矩阵会频繁的创建，而这里调用了cocos的cc.class类，
                // 创建对象过程有开销，这里会复用矩阵对象，做一下尝试。
                // var matrices = mm.getInstanceElseCreate("_matrices", () => { return [] });
                // for (let i = 0; i < matrices.length; i++) {
                //     matrices[i]._using = false;
                // }

            }.bind(this);

            // glnode.draw();
        }

        return true;
    },
    setTotalFrame: function (v) {
        this.totalFrame = v;
    },
    init: function () {
        // override
    },
    update: function (ut) {
        // override
        // this function will calling at each frame.
    }
})

mm._instances = {};

mm._init = function () {
    mm._instances['_defaultMatP'] = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
    var matV = mm.eye4();
    mm.translateZ(matV, -4);
    mm._instances['_defaultMatV'] = matV;
    mm._instances['_defaultMatM'] = mm.eye4();
    mm._instances['_defaultTexture'] = mm.loadTexture("res/black.png");


    mm.bindShader(mm.shaderDoNothing);
    // var shader = mm.getShaderFromJson(mm.shaderDoNothing);
    // shader.use();
    // gl.uniformMatrix4fv("uMatP", false,new Float32Array( mm._instances['_defaultMatP']));
    // gl.uniformMatrix4fv("uMatV", false, new Float32Array( mm._instances['_defaultMatV']));
    // gl.uniformMatrix4fv("uMatM", false, new Float32Array( mm._instances['_defaultMatM']));
    // gl.bindTexture(gl.TEXTURE_2D, mm._instances['_defaultTexture']);


    // mm._instances['uMatP'] = mm._instances['_defaultMatP'];
    // mm._instances['uMatV'] = mm._instances['_defaultMatV'];
    // mm._instances['uMatM'] = mm._instances['_defaultMatM'];
    // mm._instances['texture'] = mm._instances['_defaultTexture'];


}

mm.getInstance = function (key) {
    return mm._instances[key];
}

mm.setInstance = function (key, name) {
    mm._instances[key] = name;
}

mm.getInstanceElseCreate = function (name, fn) {
    if (!mm._instances.hasOwnProperty(name) && fn) {
        mm._instances[name] = fn();
    }
    return mm._instances[name];
}

mm.loadTxt = function (url) {
    return mm.getInstanceElseCreate("_loadText_" + url, () => {
        cc.loader.loadTxt(url, function (err, data) {
            mm.loadTxtData = data;
        })
        return mm.loadTxtData;
    })
}

mm.rotatePlane = function (alphaBeta, v) {
    var alpha = alphaBeta[0] * Math.PI / 180;
    var Beta = alphaBeta[1] * Math.PI / 180; // 描述法向量方向，经纬度

    var rz = Math.sin(alpha) * v;
    var rx = Math.sin(Beta) * v;
    var ry = Math.cos(Beta) * v;

    mm.rotateZ(rz);
    mm.rotateX(rx);
    mm.rotateY(ry);
}

mm.debugLine = function (u) {
    console.log();
    console.log('-----------------------------------------');
    console.log(u);
}


mm.draw = function () {
    if (mm.getInstance('_draw_dimensions') != '3d') {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);

        var program = mm.getInstance('_currentShader').getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        gl.uniformMatrix4fv(uMatP, false, new Float32Array(mm.getInstance('_defaultMatP')));

        var uMatV = gl.getUniformLocation(program, "uMatP");
        gl.uniformMatrix4fv(uMatV, false, new Float32Array(mm.getInstance('_defaultMatV')));

        mm.setInstance('_draw_dimensions', '3d');
    }

    if(!mm.getInstance("_isVertexAttribPointer")){
        var shader =  mm.getInstance('_currentShader');
        
        var program = shader.getProgram();
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");

        var pattern = shader.get("pattern");

        gl.bindBuffer(gl.ARRAY_BUFFER, pattern["vertex_buffer"]);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, pattern["texCoord_buffer"]);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

        mm.setInstance("_isVertexAttribPointer", true);
    }

    gl.drawArrays(gl.TRIANGLES, 0,  mm.getInstance('_currentShader').get("pattern")["arrayNum"]);
}

mm.draw2d = function () {
    if (mm.getInstance('_draw_dimensions') != '2d') {
        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

        var program = mm.getInstance('_currentShader').getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        gl.uniformMatrix4fv(uMatP, false, new Float32Array(mm.eye4()));

        mm.setInstance('_draw_dimensions', '2d');
    }
    if(!mm.getInstance("_isVertexAttribPointer")){
        var shader =  mm.getInstance('_currentShader');
        
        var program = shader.getProgram();
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");

        var pattern = shader.get("pattern");

        gl.bindBuffer(gl.ARRAY_BUFFER, pattern["vertex_buffer"]);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, pattern["texCoord_buffer"]);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

        mm.setInstance("_isVertexAttribPointer", true);
    }

    gl.drawArrays(gl.TRIANGLES, 0, mm.getInstance('_currentShader').get("pattern")["arrayNum"]);
}

mm.getShaderFromJson = function (shaderJson) {
    var name = shaderJson['name'];

    var shader = mm.getInstance(name);
    if (shader) {
        return shader;
    }


    var vertCode = shaderJson['vertCode'];
    var fragCode = shaderJson['fragCode'];

    var baseFragShader = mm.loadTxt("src/baseShader.fs");

    fragCode = baseFragShader + fragCode;

    mm.shaderError(vertCode, fragCode);

    var shader = cc.GLProgram();
    shader.initWithString(vertCode, fragCode);
    shader.retain();
    shader.link();

    shader.use();
    var program = shader.getProgram();

    shader._instances = {};
    shader.get = function(key){
        return this._instances[key];
    }
    shader.set = function(key, value){
        this._instances[key] = value;
    }

    shader.set("name", name);

    var matP = mm.getInstance('_defaultMatP');
    var matV = mm.getInstance('_defaultMatV');
    var matM = mm.getInstance('_defaultMatM');

    var texture = mm.getInstance('_defaultTexture');
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shader.set("texture", texture);

    var pattern = mm.getPatternFromJson(mm.shapeRectangle);
    var aPosition = gl.getAttribLocation(program, "aPosition");
    var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    gl.enableVertexAttribArray(aTexCoord);
    gl.enableVertexAttribArray(aPosition);
    shader.set("pattern", pattern);


    var uMatP = gl.getUniformLocation(program, "uMatP");
    gl.uniformMatrix4fv(uMatP, false, new Float32Array(matP));
    shader.set("uMatP", matP);

    var uMatV = gl.getUniformLocation(program, "uMatV");
    gl.uniformMatrix4fv(uMatV, false, new Float32Array(matV));
    shader.set("uMatV", matV);

    var uMatM = gl.getUniformLocation(program, "uMatM");
    gl.uniformMatrix4fv(uMatM, false, new Float32Array(matM));
    shader.set("uMatM", matM);

    var list = shaderJson['float'];
    for (let key in list) {
        var keyL = gl.getUniformLocation(program, key);
        var v = list[key];
        gl.uniform1fv(keyL, new Float32Array([v]));
        shader.set(key, v);
    }

    var list = shaderJson['int'];
    for (let key in list) {
        var keyL = gl.getUniformLocation(program, key);
        var v = list[key];
        gl.uniform1i(keyL, v);
        shader.set(key, v);
    }

    var list = shaderJson['mat'];
    for (let key in list) {
        var keyL = gl.getUniformLocation(program, key);
        var v = list[key];
        gl.uniformMatrix4fv(keyL, false, new Float32Array(v));
        shader.set(key, v);
    }

    var list = shaderJson['array'];
    for (let key in list) {
        var keyL = gl.getUniformLocation(program, key);
        var v = list[key];
        gl.uniform1fv(keyL, new Float32Array(v));
        shader.set(key, v);
    }

    mm.setInstance(name, shader);

    return shader;
}

mm.bindShader = function (shaderJson) {
    var currentShader = mm.getInstance('_currentShader');
    if (currentShader) {
        if (currentShader.name == shaderJson['name']) {
            return;
        }
    }

    var shader = mm.getShaderFromJson(shaderJson);
    shader.use();

    mm.setInstance('_currentShader', shader);
    mm.setInstance("_isVertexAttribPointer", false);
}

mm.getPatternFromJson = function (patternJson) {

    var name = patternJson['name'];
    var pattern = mm.getInstance(name);
    if (pattern) {
        return pattern;
    }

    var points = patternJson['points'];
    var coords = patternJson['coords'];
    var pointIndics = patternJson['pointIndics'];
    var coordIndics = patternJson['coordIndics'];

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


    // mm.debugThrow();

    var pattern = {};
    pattern["vertex_buffer"] = vertex_buffer;
    pattern["texCoord_buffer"] = texCoord_buffer;
    pattern["arrayNum"] = pointIndics.length;
    pattern["name"] = name;

    mm.setInstance(name, pattern);

    return pattern;
}

mm.bindPattern = function (patternJson) {
    var shader =  mm.getInstance('_currentShader');
    var pattern =shader.get('pattern');
    if (pattern) {
        if (pattern['name'] == patternJson['name']) {
            return;
        }
    }

    var pattern = mm.getPatternFromJson(patternJson);
    shader.set('pattern', pattern);
    mm.setInstance("_isVertexAttribPointer", false);
}

mm.bindTexture = function (texture) {
    var shader =  mm.getInstance('_currentShader');
    var texture0 = shader.get('texture');
    if(texture0 != texture){
        shader.set('texture', texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }
}

mm.uniform1fv = function(key, array){
    var shader =  mm.getInstance('_currentShader');
    var v = shader.get(key);
    if(v != array){
        var keyL = gl.getUniformLocation(shader.getProgram(), key);
        gl.uniform1fv(keyL, new Float32Array(v));
        shader.set(key, v);
    }
}

mm.uniform1f = function(key, fv){
    var shader =  mm.getInstance('_currentShader');
    var v = shader.get(key);
    if(v != fv){
        var keyL = gl.getUniformLocation(shader.getProgram(), key);
        gl.uniform1fv(keyL, new Float32Array([v]));
        shader.set(key, v);
    }
}

mm.uniformMatrix4fv = function(key, mat){
    var shader =  mm.getInstance('_currentShader');
    var v = shader.get(key);
    if(v != mat){
        var keyL = gl.getUniformLocation(shader.getProgram(), key);
        gl.uniformMatrix4fv(keyL, false, new Float32Array(v));
        shader.set(key, v);
    }
}

mm.uniform1i = function(key, iv){
    var shader =  mm.getInstance('_currentShader');
    var v = shader.get(key);
    if(v != iv){
        var keyL = gl.getUniformLocation(shader.getProgram(), key);
        gl.uniform1i(keyL, v);
        shader.set(key, v);
    }
}



mm.shaderDoNothing = {
    "name": "shaderDoNothing",
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
            vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
            vec4 color = texture2D(sampler2d, texCoord);\
            gl_FragColor = color;\
        }',
}

mm.shaderHueOffset = {
    "name": "ShaderHueOffset",
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
            vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
            vec4 color = hueOffset(sampler2d, texCoord, uOffset[1], uScaleA[1], uUt[1]);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.1,
        "uOffset": 0.2,
        "uScaleA": 0.3
    },
}

mm.shaderScaleShake = {
    "name": "shaderScaleShake",
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
            vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
            vec4 color = scaleShake(sampler2d, texCoord, uScaleA[1], uUt[1]);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 1.0,
        "uScaleA": 0.4
    }
}

// mm._recordShape = function (name, points, pointIndics, coords, coordIndics) {
//     var vertices = mm.index2Array(points, 3, pointIndics);
//     var texCoords = mm.index2Array(coords, 2, coordIndics);

//     vertices = new Float32Array(vertices);
//     texCoords = new Float32Array(texCoords);

//     var vertex_buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//     var texCoord_buffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
//     gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

//     var shape = {};
//     shape["vertex_buffer"] = vertex_buffer;
//     shape["texCoords"] = texCoords;
//     shape["arrayNum"] = pointIndics.length;
//     mm._instances[name] = shape;

//     return shape;
// }

mm.shapeRectangle = {
    "name": "shapeRectangle",
    "points": [
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 0,
        1, -1, 0,
    ],
    "coords": [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ],
    "pointIndics": [
        0, 1, 2, 0, 2, 3
    ],
    "coordIndics": [
        3, 0, 1, 3, 1, 2
    ]
}

var angle = 30 * Math.PI / 180;
mm.shapeTriangle = {
    "name": "shapeTriangle",
    "points": [
        0, 1, 0,
        -Math.cos(angle), -Math.sin(angle), 0,
        Math.cos(angle), -Math.sin(angle), 0,
    ],
    "coords": [
        0, 0,
        0, 1,
        1, 1,
    ],
    "pointIndics": [
        0, 1, 2
    ],
    "coordIndics": [
        2, 0, 1
    ]
}

mm.shapeCube = {
    "name": "shapeCube",
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
        0, 1, 2, 0, 2, 3,
        4, 0, 3, 4, 3, 7,
        5, 4, 7, 5, 7, 6,
        1, 5, 6, 1, 6, 2,
        4, 5, 1, 4, 1, 0,
        3, 2, 6, 3, 6, 7
    ],
    "pointIndics": [
        0, 0, 0, 1, 1, 1, 1, 0
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


mm.circleRoute = function (r, angle) {
    var angle = angle * Math.PI / 180;
    return [r * Math.cos(angle), r * Math.sin(angle), 0];
}



mm.createTexture = function (width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint32Array([]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, 0);
    return texture.texture_id;
}

// mm.bindFrameBufferTexture2D = function (texture) {
//     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
//     var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
//     if (status !== gl.FRAMEBUFFER_COMPLETE)
//         console.log("Frame: could not attach texture to framebuffer");
//     // 深度buffer和模板buffer用renderbuffer来加速，renderbuffer是不可读可写的。
//     // var renderbuffer = gl.createRenderbuffer();
//     // gl.bindRenderBuffer(gl.RENDERBUFFER, renderbuffer.renderbuffer_id);
// }

mm.textureRender = function (c, xywh, fn) {
    var frame = mm.getInstanceElseCreate("_renderBuffer", () => { return gl.createFramebuffer() });
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer_id);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, c, 0);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE)
        console.log("Frame: could not attach texture to framebuffer");

    gl.viewport(xywh[0], xywh[1], xywh[2], xywh[3]);

    fn(c);

    gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
    // Todo buffer暂时不删除 gl.deleteFramebuffer(frame); 
}

mm.loadTexture = function (url) {
    return cc.textureCache.addImage(url).getName();
}


mm.debugThrow = function () {
    throw new Error("debug throw");
}

mm._init();

var preRenderLayer2 = BaseNode.extend({
    init: function () {

        this.setTotalFrame(600);

        this.girl1 = mm.loadTexture("res/girl1.jpg");
        // this.girl2 = mm.loadTexture("res/girl2.jpg");
        // this.girl3 = mm.loadTexture("res/girl3.jpg");
        // this.girl4 = mm.loadTexture("res/girl4.jpg");

        // this.girl1Blur = mm.createTexture(128, 128);

        // mm.textureRender(this.girl1Blur, [0, 0, 128, 128], () => {

        //     mm.bindShader(mm.shaderScaleShake);
        //     mm.bindPattern(mm.shapeRectangle);
        //     mm.bindTexture(this.gir1);

        //     var m = mm.eye4();
        //     var m2 = mm.eye4();

        //     mm.draw2d();

        //     mm.rotateZ(m, 30);
        //     mm.translateX(m, 0.5);
        //     mm.translateY(m, 0.5);

        //     mm.translateX(m2, 0.5);

        //     mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyList([m, m2]));
        //     mm.draw2d();

        // });
    },
    update: function (ut) {
        mm.bindShader(mm.shaderDoNothing);
        mm.bindPattern(mm.shapeCube);
        mm.bindTexture(this.girl1);

        // var m = mm.eye4();
        // var m2 = mm.eye4();
        // var m3 = mm.eye4();

        // mm.compose(ut, [0.25, 0.25, 0.25, 0.25], [
        //     (ut) => {
        //         mm.rotateX(m, 30 * ut);

        //         mm.rotateX(m2, 30 * dt);

        //     },
        //     (ut) => {

        //     },
        //     (ut) => {

        //     },
        //     (ut) => {

        //     },
        // ])
        var a =0;
        var b =0;
        mm.debugLine("adsa");
        for(let i=0;i<1000;i++){
            if(a%2 == a%3){
                b+=1;
            }
            gl.bindTexture(gl.TEXTURE_2D, this.girl1);
        }



        // mm.uniformMatrix4fv("uMatM", mm.matrixMutiplyArray([m, m2, m3]));
        // mm.uniform1f("uUt", ut);
        mm.draw2d();


    }

});


// mm.shapeRectangle = function () {

//     return mm.getInstanceElseCreate("shapeRectangle", () => {

//         var points = [
//             1, 1, 0,
//             -1, 1, 0,
//             -1, -1, 0,
//             1, -1, 0,
//         ];

//         var coords = [
//             0, 0,
//             0, 1,
//             1, 1,
//             1, 0
//         ];

//         var pointIndics = [
//             0, 1, 2, 0, 2, 3
//         ];

//         var coordIndics = [
//             3, 0, 1, 3, 1, 2
//         ];

//         return mm._recordShape(name, points, pointIndics, coords, coordIndics);

//     })

// }

// mm.shapeTriangle = function () {

//     return mm.getInstanceElseCreate("shapeTriangle", () => {

//         var angle = 30 * Math.PI / 180;

//         var points = [
//             0, 1, 0,
//             -Math.cos(angle), -Math.sin(angle), 0,
//             Math.cos(angle), -Math.sin(angle), 0,
//         ];

//         var coords = [
//             0, 0,
//             0, 1,
//             1, 1,
//         ];

//         var pointIndics = [
//             0, 1, 2
//         ];

//         var coordIndics = [
//             2, 0, 1
//         ];

//         return mm._recordShape(name, points, pointIndics, coords, coordIndics);

//     })

// }


// mm.shapeCube = function () {

//     return mm.getInstanceElseCreate("shapeCube", () => {

//         var points = [
//             1, 1, 1,
//             -1, 1, 1,
//             -1, -1, 1,
//             1, -1, 1,
//             1, 1, -1,
//             -1, 1, -1,
//             -1, -1, -1,
//             1, -1, -1,
//         ];

//         var pointIndics = [
//             0, 1, 2, 0, 2, 3,
//             4, 0, 3, 4, 3, 7,
//             5, 4, 7, 5, 7, 6,
//             1, 5, 6, 1, 6, 2,
//             4, 5, 1, 4, 1, 0,
//             3, 2, 6, 3, 6, 7
//         ];

//         var coords = [
//             0, 0, 0, 1, 1, 1, 1, 0
//         ];

//         var coordIndics = [
//             3, 0, 1, 3, 1, 2,
//             3, 0, 1, 3, 1, 2,
//             3, 0, 1, 3, 1, 2,
//             3, 0, 1, 3, 1, 2,
//             3, 0, 1, 3, 1, 2,
//             3, 0, 1, 3, 1, 2
//         ];

//         return mm._recordShape(name, points, pointIndics, coords, coordIndics);

//     })

// }

// mm._recordShader = function (name, vertCode, fragCode) {
//     var baseFragShader = mm.loadTxt("src/baseShader.fs");

//     fragCode = baseFragShader + fragCode;

//     mm.shaderError(vertCode, fragCode);

//     var shader = cc.GLProgram();
//     shader.initWithString(vertCode, fragCode);
//     shader.retain();
//     shader.link();

//     shader._instances = {};
//     shader._name = name;

//     shader.uniformMatrix4fv = function (key, value) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_key_" + key;
//         if (this._instances[name] == value) {
//             return;
//         }
//         var keyL = gl.getUniformLocation(this.getProgram(), key);
//         if (!keyL) console.log(key + " not found in shader.");
//         gl.uniformMatrix4fv(keyL, false, new Float32Array(value));
//         this._instances[name] = value;
//     }

//     shader.uniform1i = function (key, value) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_key_" + key;
//         if (this._instances[name] == value) {
//             return;
//         }
//         var keyL = gl.getUniformLocation(this.getProgram(), key);
//         if (!keyL) console.log(key + " not found in shader.");
//         gl.uniform1i(keyL, value);
//         this._instances[name] = value;
//     }

//     shader.uniform1f = function (key, value) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_key_" + key;
//         if (this._instances[name] == value) {
//             return;
//         }
//         var keyL = gl.getUniformLocation(this.getProgram(), key);
//         if (!keyL) console.log(key + " not found in shader.");
//         gl.uniform1fv(keyL, new Float32Array([value]));
//         this._instances[name] = value;
//     }

//     shader.uniform1fv = function (key, value) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_key_" + key;
//         if (this._instances[name] == value) {
//             return;
//         }
//         var keyL = gl.getUniformLocation(this.getProgram(), key);
//         if (!keyL) console.log(key + " not found in shader.");
//         gl.uniform1fv(keyL, new Float32Array(value));
//         this._instances[name] = value;
//     }

//     shader.updateTexture = function (texture) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_currentTexture";
//         if (this._instances[name] == texture) {
//             return;
//         }
//         gl.bindTexture(gl.TEXTURE_2D, texture);
//         this._instances[name] = texture;
//     }

//     // Todo updateTexture2;

//     shader.updateShape = function (shapeFn) {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }

//         var shape = shapeFn();
//         var name = "_currentShape";
//         if (this._instances[name] && this._instances[name]["vertex_buffer"] == shape["vertex_buffer"]) {
//             return;
//         }

//         var program = this.getProgram();
//         var aPosition = gl.getAttribLocation(program, "aPosition");
//         var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
//         gl.enableVertexAttribArray(aTexCoord);
//         gl.enableVertexAttribArray(aPosition);

//         gl.bindBuffer(gl.ARRAY_BUFFER, shape["vertex_buffer"]);
//         gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

//         gl.bindBuffer(gl.ARRAY_BUFFER, shape["texCoord_buffer"]);
//         gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

//         this._instances[name] = shape;

//     }

//     shader.draw = function () {
//         if (mm._instances["_currentShader"] != this.getProgram()) {
//             mm._instances["_currentShader"] = this.getProgram();
//             this.use();
//         }
//         var name = "_currentShape";
//         gl.drawArrays(gl.TRIANGLES, 0, this._instances[name]["arrayNum"]);
//     }

//     shader.clear = function () {
//         mm._instances[this._name] = null;
//     }



//     // default init
//     shader.updateShape(mm.shapeRectangle);

//     var matP = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
//     var matV = mm.eye4();
//     var matM = mm.eye4();
//     mm.translateZ(matV, -4);
//     shader.uniformMatrix4fv("uMatP", matP);
//     shader.uniformMatrix4fv("uMatV", matV);
//     shader.uniformMatrix4fv("uMatM", matM);

//     var defaultTexture = cc.textureCache.addImage("res/black.png").getName();
//     shader.updateTexture(defaultTexture);

//     mm._instances[name] = shader;



//     return shader;
// }



// mm.shaderDoNothing2 = function () {
//     var name = "shaderDoNothing";
//     if (mm._instances.hasOwnProperty(name)) {
//         return mm._instances[name];
//     }

//     var vertCode = '\
//         attribute vec3 aPosition;\
//         attribute vec2 aTexCoord;\
//         uniform mat4 uMatP;\
//         uniform mat4 uMatV;\
//         uniform mat4 uMatM;\
//         varying vec2 vTexCoord;\
//         void main(void){\
//             gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
//             vTexCoord = aTexCoord;\
//         }';

//     var fragCode = '\
//         uniform sampler2D sampler2d;\
//         varying vec2 vTexCoord;\
//         void main(void) {\
//             vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
//             vec4 color = texture2D(sampler2d, texCoord);\
//             gl_FragColor = color;\
//         }';

//     var shader = mm._recordShader(name, vertCode, fragCode);

//     return mm._instances[name];
// }



// mm.bindShader = function (shaderJson) {
//     var shader = mm.getInstanceElseCreate("_currentShader", () => {
//         var shaderJson = mm.shaderDoNothing;
//         return mm._recordShader(shaderJson["name"], shaderJson["vertCode"], shaderJson["fragCode"]);
//     })

//     if (shader._name != shaderJson["name"]) {
//         mm._instances["_currentShader"] = ;// recordShader 输入改成 输入json。法向量旋转用子类本身的矩阵。
//     }

//     shader["name"]
// }



// mm.shaderScaleShake = function () {
//     var name = "ShaderScaleShake";
//     if (mm._instances.hasOwnProperty(name)) {
//         return mm._instances[name];
//     }

//     var vertCode = '\
//         attribute vec3 aPosition;\
//         attribute vec2 aTexCoord;\
//         uniform mat4 uMatP;\
//         uniform mat4 uMatV;\
//         uniform mat4 uMatM;\
//         varying vec2 vTexCoord;\
//         void main(void){\
//             gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
//             vTexCoord = aTexCoord;\
//         }';

//     var fragCode = '\
//         uniform sampler2D sampler2d;\
//         uniform float uUt[1];\
//         uniform float uScaleA[1];\
//         varying vec2 vTexCoord;\
//         void main(void) {\
//             vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
//             vec4 color = scaleShake(sampler2d, texCoord, uScaleA[1], uUt[1]);\
//             gl_FragColor = color;\
//         }';

//     var shader = mm._recordShader(name, vertCode, fragCode);
//     shader.uniform1f("uUt", 1.0);
//     shader.uniform1f("uScaleA", 0.4);

//     return mm._instances[name];
// }

// mm.shaderHueOffset2 = function () {
//     var name = "ShaderHueOffset";
//     if (mm._instances.hasOwnProperty(name)) {
//         return mm._instances[name];
//     }

//     var vertCode = '\
//         attribute vec3 aPosition;\
//         attribute vec2 aTexCoord;\
//         uniform mat4 uMatP;\
//         uniform mat4 uMatV;\
//         uniform mat4 uMatM;\
//         varying vec2 vTexCoord;\
//         void main(void){\
//             gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
//             vTexCoord = aTexCoord;\
//         }';

//     var fragCode = '\
//         uniform sampler2D sampler2d;\
//         uniform float uUt[1];\
//         uniform float uOffset[1];\
//         uniform float uScaleA[1];\
//         varying vec2 vTexCoord;\
//         void main(void) {\
//             vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
//             vec4 color = hueOffset(sampler2d, texCoord, uOffset[1], uScaleA[1], uUt[1]);\
//             gl_FragColor = color;\
//         }';

//     var shader = mm._recordShader(name, vertCode, fragCode);
//     shader.uniform1f("uUt", 0.5);
//     shader.uniform1f("uOffset", 0.2);
//     shader.uniform1f("uScaleA", 0.3);

//     return mm._instances[name];
// }



// mm.bindShader = function (shaderJson) {

// }

// var Matrix = cc.class.extend({ 

//     ctor: function () {
//         this.init();
//     },

//     init: function () {
//         this.sx = 1;
//         this.sy = 1;
//         this.sz = 1;

//         this.rx = 0;
//         this.ry = 0;
//         this.rz = 0;

//         this.tx = 0;
//         this.ty = 0;
//         this.tz = 0;

//         this._using = true
//     },

//     scaleX: function (v) { this.sx = v; },

//     scaleY: function (v) { this.sy = v; },

//     scaleZ: function (v) { this.sz = v; },

//     scaleXYZ: function (v) { this.sx = v; this.sy = v; this.sz = v; },

//     rotateX: function (v) { this.rx += v; },

//     rotateY: function (v) { this.ry += v; },

//     rotateZ: function (v) { this.rz += v; },

//     rotatePlane: function (alphaBeta, v) {
//         var alpha = alphaBeta[0] * Math.PI / 180;
//         var Beta = alphaBeta[1] * Math.PI / 180; // 描述法向量方向，经纬度

//         var rz = Math.sin(alpha) * v;
//         var rx = Math.sin(Beta) * v;
//         var ry = Math.cos(Beta) * v;

//         this.rotateZ(rz);
//         this.rotateX(rx);
//         this.rotateY(ry);
//     },

//     translateX: function (v) { this.tx += v; },

//     translateY: function (v) { this.ty += v; },

//     translateZ: function (v) { this.tz += v; },

//     translateXYZ: function (xyz) { this.tx += xyz[0]; this.ty += xyz[1]; this.tz += xyz[2]; },

//     getMatrixArray: function () {
//         var mat = mm.eye4();

//         if (this.sx != 1 || this.sy != 1 || this.sz != 1) {
//             mat[0] = this.sx;
//             mat[5] = this.sy;
//             mat[10] = this.sz;
//         }

//         if (this.rx != 0 ) {
//             var angle = this.rx * Math.PI / 180;
//             var cx = Math.cos(angle);
//             var sx = Math.sin(angle);

//             if(isScale){

//             }
//             mm.rotateX(mat, this.rx);
//         }
//         if () {
//             if (!mat) {
//                 mat = mm.eye4();
//             }
//             mm.rotateX(mat, this.ry);
//         }
//         if (this.rz != 0) {
//             if (!mat) {
//                 mat = mm.eye4();
//             }
//             mm.rotateX(mat, this.rz);
//         }
//         if (this.tx != 0 || this.ty != 0 || this.tz != 0) {
//             mat[12] = this.tx;
//             mat[13] = this.ty;
//             mat[14] = this.tz;
//         }



//     }
// })

// mm.createMatrix = function () {
//     var matrices = mm.getInstanceElseCreate("_matrices", () => { return []; });

//     for (let i = 0; i < matrices.length; i++) {
//         if (!matrices[i]._using) {
//             matrices[i].init();
//             return matrices[i];
//         }
//     }

//     var mat = new Matrix();
//     matrices.push(mat);
//     return mat;
// }

// mm.subMatrix = function (mat0, fn) {
//     var mat = mm.createMatrix();
//     mat.rx = mat0.rx; // 子节点的旋转量在父节点旋转的基础上继续积累
//     mat.ry = mat0.ry;
//     mat.rz = mat0.rz;
//     mat.ex = mat0.ex * mat0.sx; // 子节点的缩放系数是随着其层数加深而叠乘的，
//     mat.ey = mat0.ey * mat0.sy; // 子节点保存父节点的缩放系数，并在其基础上缩放，传递给更深的子节点。
//     mat.ez = mat0.ez * mat0.sz;
//     mat.tx2 = mat0.tx * mat0.ex + mat0.tx2; // 子节点的平移因子需要乘以其缩放系数，
//     mat.ty2 = mat0.ty * mat0.ey + mat0.ty2; // 平移量需要乘缩放系数，为了不影响父类的平移量，
//     mat.tz2 = mat0.tz * mat0.ez + mat0.tz2; // 需要用另外一个变量存储累加的所有的平移量。
//     fn(mat);
// }

