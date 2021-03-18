// "src/mod11.js",
var mod11Layer = BaseNode.extend({
    init: function () {

        this.baseFragShader = mm.loadTxt("src/baseShader.fs");

        this.spiritArr = [];
        this.spiritArr.push(cc.textureCache.addImage("res/girl1.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl2.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl3.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl4.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl5.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl6.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl7.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl8.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl9.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl10.jpg"));

        this.spiritArrB = [];
        this.spiritArrB.push(cc.textureCache.addImage("res/cubeLinen2.png"));
        this.spiritArrB.push(cc.textureCache.addImage("res/rosettem.png"));
        this.spiritArrB.push(cc.textureCache.addImage("res/moonm.png"));
        this.spiritArrB.push(cc.textureCache.addImage("res/star1m.png"));
        this.spiritArrB.push(cc.textureCache.addImage("res/star2m.png"));

        this.initBackground();
        this.initForeground1();
        this.initForeground2();
        this.initForeground3();

        this.dt = 0.0;
        this.frameRate = 60; // 视频的导出帧率
    },
    update: function () {

        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        var videoTotalTime = 180 / 15;
        var videoBeginTime = 0 /180 * videoTotalTime;
        var videoEndTime = 180 /180 * videoTotalTime;
        var speed = 1.0 /1;
        // var videoBeginTime = 8.0;
        // var videoEndTime = 11.0;
        // var speed = 0.3;

        var dt = mm.timeLoop(this.dt, videoBeginTime, videoEndTime, speed);
        var ut = dt / videoTotalTime;

        this.updateBackground(ut);



        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);

        mm.compose(ut, mm.getUT([35, 97, 180], 0, 180), [
            (ut) => { this.updateForeground1(ut); },
            (ut) => { this.updateForeground2(ut); },
            (ut) => { this.updateForeground3(ut); }
        ]);

        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

        this.dt += 1 / this.frameRate;

    },
    initBackground: function () {
        var vertCode = '\
            attribute vec3 aPosition;\
            attribute vec2 aTexCoord;\
            uniform mat4 uMatP;\
            uniform mat4 uMatV;\
            uniform mat4 uMatM;\
            varying vec2 vTexCoord;\
            void main(void){\
                gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
                vTexCoord = aTexCoord;\
            }';

        var fragCode = '\
            uniform sampler2D sampler2d;\
            varying vec2 vTexCoord;\
            void main(void) {\
                vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
                vec4 color = texture2D(sampler2d, texCoord);\
                color = guassianBlur(sampler2d, texCoord, 15, 1.5 / 512.0, 10.0);\
                color.rgb += 0.05;\
                gl_FragColor = color;\
            }';


        fragCode = this.baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();


        var points = [
            1, 1, 0,
            -1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
        ];

        var a = (1 - 720 / 1280.) / 2;
        var b = 1. - a;
        var coords = [
            a, 0, a, 1, b, 1, b, 0
        ];

        var pointIndics = [
            0, 1, 2, 0, 2, 3
        ];

        var coordIndics = [
            3, 0, 1, 3, 1, 2
        ];



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


        this.shaderB = shader;
        this.shaderB.arrayNum = pointIndics.length;
        this.shaderB.vertex_buffer = vertex_buffer;
        this.shaderB.texCoord_buffer = texCoord_buffer;



    },
    updateBackground: function (ut) {
        var shader = this.shaderB;
        shader.use();

        var vertex_buffer = shader.vertex_buffer;
        var texCoord_buffer = shader.texCoord_buffer;
        var arrayNum = shader.arrayNum;
        var program = shader.getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        var uMatV = gl.getUniformLocation(program, "uMatV");
        var uMatM = gl.getUniformLocation(program, "uMatM");
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(aTexCoord);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);



        var matP = mm.eyes4();
        var matV = mm.eyes4();
        var matM = mm.eyes4();

        mm.uniformMatrix4fv(uMatP, matP);
        mm.uniformMatrix4fv(uMatV, matV);
        mm.uniformMatrix4fv(uMatM, matM);

        mm.compose(ut, mm.getUT([25, 35, 68, 80, 87, 97, 124, 143, 180], 0, 180), [
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[0]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[1]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[2]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[3]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[4]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[5]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[6]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[7]); },
            (ut) => { mm.bindTexture(gl.TEXTURE_2D, this.spiritArr[8]); },
        ]);

        gl.drawArrays(gl.TRIANGLES, 0, arrayNum);

    },
    initForeground1: function () {
        var vertCode = '\
            attribute vec3 aPosition;\
            attribute vec2 aTexCoord;\
            uniform mat4 uMatP;\
            uniform mat4 uMatV;\
            uniform mat4 uMatM;\
            varying vec2 vTexCoord;\
            void main(void){\
                gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
                vTexCoord = aTexCoord;\
            }';

        var fragCode = '\
            uniform sampler2D sampler2d;\
            uniform float uUt;\
            varying vec2 vTexCoord;\
            void main(void) {\
                vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
                vec4 color = texture2D(sampler2d, texCoord);\
                vec4 colorBlur = guassianBlur(sampler2d, texCoord, 15, 1.5 / 512.0, 10.0);\
                gl_FragColor = color;\
            }';

        fragCode = this.baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();



        var points = [
            1, 1, 1,
            -1, 1, 1,
            -1, -1, 1,
            1, -1, 1,
            1, 1, -1,
            -1, 1, -1,
            -1, -1, -1,
            1, -1, -1,
        ];

        var pointIndics = [
            0, 1, 2, 0, 2, 3,
            4, 0, 3, 4, 3, 7,
            5, 4, 7, 5, 7, 6,
            1, 5, 6, 1, 6, 2,
            4, 5, 1, 4, 1, 0,
            3, 2, 6, 3, 6, 7
        ];

        var coords = [
            0, 0, 0, 1, 1, 1, 1, 0
        ];

        var coordIndics = [
            3, 0, 1, 3, 1, 2,
            3, 0, 1, 3, 1, 2,
            3, 0, 1, 3, 1, 2,
            3, 0, 1, 3, 1, 2,
            3, 0, 1, 3, 1, 2,
            3, 0, 1, 3, 1, 2
        ];



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


        this.shader1 = shader;
        this.shader1.arrayNum = pointIndics.length;
        this.shader1.vertex_buffer = vertex_buffer;
        this.shader1.texCoord_buffer = texCoord_buffer;

    },
    updateForeground1: function (ut) {
        var shader = this.shader1;
        shader.use();

        var vertex_buffer = shader.vertex_buffer;
        var texCoord_buffer = shader.texCoord_buffer;
        var arrayNum = shader.arrayNum;
        var program = shader.getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        var uMatV = gl.getUniformLocation(program, "uMatV");
        var uMatM = gl.getUniformLocation(program, "uMatM");
        var uUt = gl.getUniformLocation(program, "uUt");
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(aTexCoord);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

        var matP = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
        var matV = mm.eyes4();
        var matM = mm.eyes4();
        var matC = mm.eyes4();
        mm.compose(ut, mm.getUT([25, 35], 0, 35), [
            (ut) => {
                mm.sequence(ut, mm.getUT([10, 25], 0, 25), [
                    (ut) => { mm.scaleXYZ(matM, 4 - 3 * mm.easeExFastActionOut(ut)); },
                    (ut) => { },
                ]);

            },
            (ut) => {
                mm.rotateX(matV, 90);
            }
        ]);

        mm.rotateY(matM, -35 / 97 * 180 * ut);

        mm.translateZ(matV, -5);

        gl.uniform1f(uUt, ut);
        mm.uniformMatrix4fv(uMatP, matP);
        mm.uniformMatrix4fv(uMatV, matV);
        mm.uniformMatrix4fv(uMatM, matM);

        gl.drawArrays(gl.TRIANGLES, 0, arrayNum);

        gl.bindTexture(gl.TEXTURE_2D, this.spiritArrB[0].getName());

        // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        mm.scaleXYZ(matC, 250/202);
        matC = mm.matrixMutiply(matC, matM)
        mm.uniformMatrix4fv(uMatM, matC);
        gl.drawArrays(gl.TRIANGLES, 0, arrayNum);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        mm.bindTexture(gl.TEXTURE_2D, mm.getCurrentTexture());

    },
    initForeground2: function () {
        var vertCode = '\
            attribute vec3 aPosition;\
            attribute vec2 aTexCoord;\
            uniform mat4 uMatP;\
            uniform mat4 uMatV;\
            uniform mat4 uMatM;\
            varying vec2 vTexCoord;\
            void main(void){\
                gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
                vTexCoord = aTexCoord;\
            }';

        var fragCode = '\
            uniform sampler2D sampler2d;\
            uniform float uDt;\
            varying vec2 vTexCoord;\
            void main(void) {\
                vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
                vec4 color = texture2D(sampler2d, texCoord);\
                color.rgb += 0.05;\
                gl_FragColor = color;\
            }';


        fragCode = this.baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();


        var points = [
            1, 1, 1,
            -1, 1, 1,
            -1, -1, 1,
            1, -1, 1,
        ];

        var coords = [
            0, 0, 0, 1, 1, 1, 1, 0
        ];

        var pointIndics = [
            0, 1, 2, 0, 2, 3
        ];

        var coordIndics = [
            3, 0, 1, 3, 1, 2
        ];



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


        this.shader2 = shader;
        this.shader2.arrayNum = pointIndics.length;
        this.shader2.vertex_buffer = vertex_buffer;
        this.shader2.texCoord_buffer = texCoord_buffer;

    },
    updateForeground2: function (ut) {
        var shader = this.shader2;
        shader.use();

        var vertex_buffer = shader.vertex_buffer;
        var texCoord_buffer = shader.texCoord_buffer;
        var arrayNum = shader.arrayNum;
        var program = shader.getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        var uMatV = gl.getUniformLocation(program, "uMatV");
        var uMatM = gl.getUniformLocation(program, "uMatM");
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(aTexCoord);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);


        for (let i = 0; i < 6; i++) {
            var matP = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
            var matV = mm.eyes4();
            var matM = mm.eyes4();
            var matC1 = mm.eyes4();
            var matC2 = mm.eyes4();
            var matC3 = mm.eyes4();
            // 2.3, 0.6, 0.5, 0.6
            mm.sequence(ut, mm.getUT([50, 54, 77, 79, 97], 35, 97), [
                (ut) => { },
                (ut) => { mm.translateZ(matC1, ut * 0.5);},
                (ut) => { },
                (ut) => { mm.translateZ(matC1, -ut * 0.5); },
                (ut) => { },
            ]);

            mm.sequence(ut, mm.getUT([44, 48, 66, 68, 97], 35, 97), [
                (ut) => { },
                (ut) => { mm.translateZ(matC2, ut * 0.4); },
                (ut) => { },
                (ut) => { mm.translateZ(matC2, -0.4 * ut); },
                (ut) => { },
            ]);

            if (i < 4) mm.rotateY(matM, 90 * i);
            else if (i == 4) mm.rotateX(matM, 90);
            else if (i == 5) mm.rotateX(matM, -90);

            mm.rotateY(matV, -(97 - 35) / 97 * 180.0 * ut -35 / 97 * 180);
            mm.translateZ(matV, -5);
            matC1 = mm.matrixMutiply(matC1, matM);

            mm.uniformMatrix4fv(uMatP, matP);
            mm.uniformMatrix4fv(uMatV, matV);
            mm.uniformMatrix4fv(uMatM, matC1);

            gl.drawArrays(gl.TRIANGLES, 0, arrayNum);



            gl.bindTexture(gl.TEXTURE_2D, this.spiritArrB[0].getName());
            // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


            mm.scaleXYZ(matC3, 250 /202);
            matC3 = mm.matrixMutiply(matM, matC3);
            matC2 = mm.matrixMutiply(matC2, matC3);
            mm.uniformMatrix4fv(uMatM, matC2);
            gl.drawArrays(gl.TRIANGLES, 0, arrayNum);

            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            mm.bindTexture(gl.TEXTURE_2D, mm.getCurrentTexture());
        }

    },
    initForeground3: function () {
        var vertCode = '\
            attribute vec3 aPosition;\
            attribute vec2 aTexCoord;\
            uniform mat4 uMatP;\
            uniform mat4 uMatV;\
            uniform mat4 uMatM;\
            varying vec2 vTexCoord;\
            void main(void){\
                gl_Position = uMatP * uMatV * uMatM * vec4(aPosition, 1.);\
                vTexCoord = aTexCoord;\
            }';

        var fragCode = '\
            uniform sampler2D sampler2d;\
            uniform float uUt;\
            varying vec2 vTexCoord;\
            void main(void) {\
                float ut = uUt / 1000.0;\
                vec2 texCoord = vec2(vTexCoord.s, vTexCoord.t);\
                vec4 color;\
                if (ut > 0){color = scaleShake(sampler2d, texCoord, ut);}\
                else {color = texture2D(sampler2d, texCoord);}\
                gl_FragColor = color;\
            }';
            // if (uDt > 0.0){color = \


        fragCode = this.baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();



        var points = [
            1, 1, 0.3,
            -1, 1, 0.3,
            -1, -1, 0.3,
            1, -1, 0.3,
        ];

        var coords = [
            0, 0, 0, 1, 1, 1, 1, 0
        ];

        var pointIndics = [
            0, 1, 2, 0, 2, 3
        ];

        var coordIndics = [
            3, 0, 1, 3, 1, 2
        ];



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


        this.shader3 = shader;
        this.shader3.arrayNum = pointIndics.length;
        this.shader3.vertex_buffer = vertex_buffer;
        this.shader3.texCoord_buffer = texCoord_buffer;

    },
    updateForeground3: function (ut) {
        var shader = this.shader3;
        shader.use();

        var vertex_buffer = shader.vertex_buffer;
        var texCoord_buffer = shader.texCoord_buffer;
        var arrayNum = shader.arrayNum;
        var program = shader.getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        var uMatV = gl.getUniformLocation(program, "uMatV");
        var uMatM = gl.getUniformLocation(program, "uMatM");
        var uUt = gl.getUniformLocation(program, "uUt");
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(aTexCoord);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

        var matP = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
        var matV = mm.eyes4();
        var matM = mm.eyes4();

        var ss = [];

        mm.compose(ut, mm.getUT([124, 143, 180], 97, 180), [
            (ut) => {
                ss = [
                    [1.35, 180,0.29, 0.14, 0.3, 1],
                    [1.35, 0, 0.02, -0.2, 0.3, 1],
                ];
                mm.sequence(ut, mm.getUT([99,110.5, 122, 124], 97, 124), [
                    (ut) => { mm.rotateX(matM, 180 -180 * ut); },
                    (ut) => { mm.rotateY(matM, -9 * ut); },
                    (ut) => { mm.rotateY(matM, 9 * ut) },
                    (ut) => {
                        // mm.rotateZ(matM, -45);
                        // mm.rotateX(matM, 90 * ut);
                        mm.rotateY(matM, 90 * ut);
                    },
                ]);
                mm.translateZ(matV, -3.2);

            },
            (ut) => {
                ss = [
                    [2.0, 0, -0.05, -0.15, 1.7, 2],
                    [1.8, 180,-0.1, -0.1, 1.4, 3],
                    [1.7, 0,-0.0, -0.4, -0.3, 3],
                    [1.35, 180,-0.0, -0.1, 0.3, 2],
                ];
                mm.rotateZ(matM, 180);
                mm.rotateX(matM, 180);
                mm.sequence(ut,  mm.getUT([132, 142, 143], 124, 143), [
                    (ut) => {mm.rotateY(matM, -9 * ut);},
                    (ut) => { mm.rotateY(matM, 9 * ut) },
                    (ut) => { mm.rotateX(matM, 90 * ut) },
                ]);
                mm.translateZ(matV, -3.4);

            },
            (ut) => {
                ss = [
                    [1.8, 0, -0.3, 0.5, 0.6, 4],
                    [1.0, 180, 0.2, 0.1, -0.6, 4],
                ];
                mm.rotateZ(matM, 180);
                mm.rotateX(matM, 180);
                mm.sequence(ut, mm.getUT([153, 168, 180], 143, 180), [
                    (ut) => { mm.rotateY(matM, -20 * ut); },
                    (ut) => { mm.rotateY(matM, 20 * ut) },
                    (ut) => { },
                ]);
                mm.translateZ(matV, -3.4);

            },
        ]);

        mm.compose(ut, mm.getUT([110, 114, 127, 132,150, 155, 159, 164, 180], 97, 180), [
            (ut) => { },    
            (ut) => { gl.uniform1f(uUt, Math.floor(ut * 1000));},    
            (ut) => { },    
            (ut) => { gl.uniform1f(uUt, Math.floor(ut * 1000));},    
            (ut) => { },   
            (ut) => { gl.uniform1f(uUt, Math.floor(ut * 1000));},    
            (ut) => { },   
            (ut) => { gl.uniform1f(uUt, Math.floor(ut * 1000));},    
            (ut) => { },   
        ]);

        
        mm.uniformMatrix4fv(uMatP, matP);
        mm.uniformMatrix4fv(uMatV, matV);
        mm.uniformMatrix4fv(uMatM, matM);

        gl.drawArrays(gl.TRIANGLES, 0, arrayNum);

        gl.uniform1f(uUt, 0);

        for (let i = 0; i < ss.length; i++) {
            var matC = mm.eyes4();

            mm.scaleXYZ(matC, ss[i][0]);
            mm.rotateY(matC, ss[i][1]);
            mm.translateX(matC, ss[i][2]);
            mm.translateY(matC, ss[i][3]);
            mm.translateZ(matC, ss[i][4]);

            matC = mm.matrixMutiply(matC, matM);
            mm.uniformMatrix4fv(uMatM, matC);
            gl.bindTexture(gl.TEXTURE_2D, this.spiritArrB[ss[i][5]].getName());
            gl.drawArrays(gl.TRIANGLES, 0, arrayNum);

        }




        mm.bindTexture(gl.TEXTURE_2D, mm.getCurrentTexture());

    }
})