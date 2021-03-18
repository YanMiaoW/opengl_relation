

var Cube = cc.Class.extend({
    init: function (texture1, texture2) {
        this.mixmap1 = new MixMap();
        this.mixmap2 = new MixMap();
        this.mixmap3 = new MixMap();
        this.mixmap4 = new MixMap();
        this.mixmap5 = new MixMap();
        this.mixmap6 = new MixMap();

        this.mixmap1.init(texture1, texture2);
        this.mixmap2.init(texture1, texture2);
        this.mixmap3.init(texture1, texture2);
        this.mixmap4.init(texture1, texture2);
        this.mixmap5.init(texture1, texture2);
        this.mixmap6.init(texture1, texture2);
        
    },
    draw: function (m0){
        
        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap1.draw(m);

        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.rotateY(m, 90);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap2.draw(m);

        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.rotateY(m, 180);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap3.draw(m);

        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.rotateY(m, 270);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap4.draw(m);

        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.rotateX(m, 90);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap5.draw(m);

        var m = mm.eyes4();
        mm.translateZ(m, 0.5);
        mm.rotateX(m, -90);
        mm.matrixMutiplyCover(m, m0);
        this.mixmap6.draw(m);

    }
});


var MixMap = cc.Class.extend({
    init: function (texture1, texture2) {
        this.map1 = new Square();
        this.map2 = new Square();
        this.map3 = new Square();
        this.map4 = new Square();
        this.map5 = new Square();
        this.map6 = new Square();
        this.map7 = new Square();
        this.map8 = new Square();
        this.map9 = new Square();

        this.map1.init(texture1);
        this.map2.init(texture2);
        this.map3.init(texture1);
        this.map4.init(texture2);
        this.map5.init(texture1);
        this.map6.init(texture2);
        this.map7.init(texture1);
        this.map8.init(texture2);
        this.map9.init(texture1);

    },
    draw: function (m0) {

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, -1/3);
        mm.translateY(m, 1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map1.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 0);
        mm.translateY(m, 1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map2.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 1/3);
        mm.translateY(m, 1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map3.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, -1/3);
        mm.translateY(m, 0);
        mm.matrixMutiplyCover(m, m0);
        this.map4.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 0);
        mm.translateY(m, 0);
        mm.matrixMutiplyCover(m, m0);
        this.map5.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 1/3);
        mm.translateY(m, 0);
        mm.matrixMutiplyCover(m, m0);
        this.map6.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, -1/3);
        mm.translateY(m, -1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map7.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 0);
        mm.translateY(m, -1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map8.draw(m);

        var m = mm.eyes4();
        mm.scaleXY(m, 1/3);
        mm.translateX(m, 1/3);
        mm.translateY(m, -1/3);
        mm.matrixMutiplyCover(m, m0);
        this.map9.draw(m);

    }
})



var Square = cc.Class.extend({
    init: function (texture) {

        var baseFragShader = mm.loadTxt("src/baseShader.fs");

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
                gl_FragColor = color;\
            }';


        fragCode = baseFragShader + fragCode;

        mm.shaderError(vertCode, fragCode);

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();

        // 类重复变量变成父类来做，不用多次创建。或者全局对象


        var points = [
            0.5, 0.5, 0,
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
        ];

        var coords = [
            0, 0,
            0, 1,
            1, 1,
            1, 0
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


        this.arrayNum = pointIndics.length;
        this.vertex_buffer = vertex_buffer;
        this.texCoord_buffer = texCoord_buffer;
        this.shader = shader;

        this.texture = texture;

    },
    draw: function (matM) {
        // 做离屏渲染
        this.shader.use();

        var program = this.shader.getProgram();

        var uMatP = gl.getUniformLocation(program, "uMatP");
        var uMatV = gl.getUniformLocation(program, "uMatV");
        var uMatM = gl.getUniformLocation(program, "uMatM");
        var aPosition = gl.getAttribLocation(program, "aPosition");
        var aTexCoord = gl.getAttribLocation(program, "aTexCoord");
        gl.enableVertexAttribArray(aTexCoord);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

        mm.bindTexture(gl.TEXTURE_2D, this.texture);

        var matP = mm.getProjectionMatrix(25, 720 / 1280, 1, 100);
        var matV = mm.eyes4();
        mm.translateZ(matV, -4);

        mm.uniformMatrix4fv(uMatP, matP);
        mm.uniformMatrix4fv(uMatV, matV);
        mm.uniformMatrix4fv(uMatM, matM);
        gl.drawArrays(gl.TRIANGLES, 0, this.arrayNum);

    }
})



var nightSkyLayer = BaseNode.extend({
    init: function () {
        var girl1 = cc.textureCache.addImage("res/girl1.jpg");
        var girl2 = cc.textureCache.addImage("res/girl2.jpg");
        var girl3 = cc.textureCache.addImage("res/girl3.jpg");
        var girl4 = cc.textureCache.addImage("res/girl4.jpg");

        this.cube1 = new Cube();
        this.cube2 = new Cube();
        
        this.cube1.init(girl1, girl3);
        this.cube2.init(girl2, girl4);

        // this.rate = 60; // 视频的导出帧率
        this.totalcount = 600;
        this.count = 0;
    },
    update: function () {

        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


        var ut = this.count / this.totalcount;



        var m = mm.eyes4();
        mm.rotateY(m, -360 * ut);
        mm.translateX(m, 1);
        mm.translateY(m, 0.5);
        mm.sequence(ut, [0.5, 0.5], [
            (ut) => { mm.translateY(m, 0.5 * mm.easeExFastActionOut(ut)); },
            (ut) => { mm.translateY(m, -0.5 * mm.easeExFastActionOut(ut)); },
        ]);
        mm.rotateY(m, -360 * ut);
        this.cube1.draw(m);



        var m = mm.eyes4();
        mm.rotateY(m, -360 * ut);
        mm.translateX(m, 1);
        mm.translateY(m, -0.5);
        mm.sequence(ut, [0.5, 0.5], [
            (ut) => { mm.translateY(m, -0.5 * mm.easeExFastActionOut(ut)); },
            (ut) => { mm.translateY(m, 0.5 * mm.easeExFastActionOut(ut)); },
        ]);
        mm.rotateY(m, -360 * ut -180    );
        this.cube2.draw(m);



        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

        this.count++;
    }
});


