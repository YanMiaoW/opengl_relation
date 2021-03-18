


        // "src/mod11test.js",

BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function (obj_config) {
        this._super();
        if ('opengl' in cc.sys.capabilities) {

            this.init(obj_config);

            var glnode = new cc.GLNode();
            this.addChild(glnode, 10);
            this.glnode = glnode;
            glnode.draw = function () {
                this.update();
            }.bind(this);
        }

        return true;
    },
    init: function () {
        // override
    },
    update: function () {
        // override
        // this function will calling at each frame.
    }
})

var mm = mm || {};

mm.shaderError = function (vertCode, fragCode) {
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if (!compiled) {
        console.log('Vertex Shader compiled successfully: ' + compiled);
        var compilationLog = gl.getShaderInfoLog(vertShader);
        console.log('Vertex Shader compiler log: ' + compilationLog);
    }

    var compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if (!compiled) {
        console.log('Fragment Shader compiled successfully: ' + compiled);
        var compilationLog = gl.getShaderInfoLog(fragShader);
        console.log('Fragment Shader compiler log: ' + compilationLog);
    }

    var compiled = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!compiled) {
        console.log('program linked successfully: ' + compiled);
        var compilationLog = gl.getProgramInfoLog(program);
        console.log('program linked log: ' + compilationLog);
    }
}

mm.uniformMatrix4fv = function (attr, value) {
    gl.uniformMatrix4fv(attr, false, new Float32Array(value));
}

mm.bindTexture = function (cur, texture) {
    gl.bindTexture(cur, texture.getName());
    mm._currentTexture = texture;
}

mm.getCurrentTexture = function () {
    return mm._currentTexture;
}

mm.index2Array = function (array, step, indics) {
    var result = [];
    for (let i = 0; i < indics.length; i++) {
        var v = indics[i];
        for (let j = 0; j < step; j++) {
            result.push(array[step * v + j]);
        }
    }
    return result;
}

mm.loadTxt = function (url) {
    cc.loader.loadTxt(url, function (err, data) {
        mm.loadTxtData = data;
    })
    return mm.loadTxtData;
}

mm.showProperty = function (obj) {
    // 用来保存所有的属性名称和值 
    var attributes = '';
    var methods = ''
    // 开始遍历 
    for (var p in obj) {
        // 方法 
        if (typeof (obj[p]) === "function") {
            attributes += '方法：' + p + '\r\n'
            // obj[p](); 
        } else {
            // p 为属性名称，obj[p]为对应属性的值 
            methods += '属性：' + p + " = " + obj[p] + "\r\n";
        }
    }
    // 最后显示所有的属性 
    console.log(attributes);
    console.log(methods);
    return attributes, methods
}

mm.timeLoop = function (dt, begin, end, speedx) {
    var period = end - begin;
    dt = dt * speedx;
    dt = dt % period;
    return begin + dt;
}

mm.sum = function (arr) {
    var arrSum = 0
    for (var i = 0; i < arr.length; i++) {
        arrSum += arr[i]
    }
    return arrSum
}

mm.divid = function (v, a) { return v / a };

mm.boardcast = function (arr, value, func) {
    newarr = [];
    for (let i = 0; i < arr.length; i++) {
        newarr.push(func(arr[i], value));
    }
    return newarr;
}

mm.easeQuadraticActionInOut = function (time) {
    time *= 2;
    if (time < 1) {
        resultTime = time * time * 0.5;
    } else {
        time = time - 1;
        resultTime = -0.5 * (time * (time - 2) - 1)
    }
    return resultTime;
}

mm.easeQuadraticActionIn = function (time) {
    var resultTime = Math.pow(time, 2);
    resultTime *= c;
    return resultTime + time_int;
}

mm.easeQuadraticActionOut = function (time) {
    var resultTime = -time * (time - 2);
    return resultTime;
}

mm.easeExFastActionOut = function (time) {
    var a = 1 / 16.0;
    var f = (x) => { return Math.pow(a, x) / Math.log(a) };
    var resultTime = (f(time) - f(0.0)) / (f(1.0) - f(0.0));
    return resultTime;
}

mm.countSum = function (array) {
    var newarr = [];
    var s = 0;
    for (let i = 0; i < array.length; i++) {
        s += array[i];
        newarr.push(s);
    }
    return newarr;
}

mm.getUT = function (ts, begin, end) {
    var ts2 = [];
    for (let i = 0; i < ts.length; i++) {
        if( i==0) a = (ts[0] - begin) / (end - begin);
        else{ a = ((ts[i] - ts[i-1])) / (end - begin)}
        ts2.push(a);
    }
    return ts2;
}

mm.sequence = function (dt, blocks, events) {
    var length = Math.min(blocks.length, events.length);
    var uts = mm.boardcast(blocks, mm.sum(blocks), mm.divid);
    var endTimes = mm.countSum(uts);
    dt = dt % 1;
    for (let i = 0; i < length; i++) {
        if (dt < endTimes[i]) {
            if (i == 0) events[i](dt / (uts[0]));
            else events[i]((dt - endTimes[i - 1]) / uts[i]);
            break;
        } else {
            events[i](1.0);
        }
    }
}

mm.compose = function (dt, blocks, events) {
    var length = Math.min(blocks.length, events.length);
    var uts = mm.boardcast(blocks, mm.sum(blocks), mm.divid);
    var endTimes = mm.countSum(uts);
    dt = dt % 1;
    for (let i = 0; i < length; i++) {
        if (dt < endTimes[i]) {
            if (i == 0) events[i](dt / (uts[0]));
            else events[i]((dt - endTimes[i - 1]) / uts[i]);
            break;
        }
    }
}

mm.getNormalVector = function (p1, p2, p3) {
    p1.x = p1[0];
    p1.y = p1[1];
    p1.z = p1[2];
    p2.x = p2[0];
    p2.y = p2[1];
    p2.z = p2[2];
    p3.x = p3[0];
    p3.y = p3[1];
    p3.z = p3[2];

    // 内积
    // var a = ( (p2.y-p1.y)*(p3.z-p1.z)-(p2.z-p1.z)*(p3.y-p1.y) );
    // var b = ( (p2.z-p1.z)*(p3.x-p1.x)-(p2.x-p1.x)*(p3.z-p1.z) );
    // var c = ( (p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x) );

    // 外积
    v1 = {};
    v2 = {};
    v1.x = p2.x - p1.x;
    v1.y = p2.y - p1.y;
    v1.z = p2.z - p1.z;
    v2.x = p3.x - p2.x;
    v2.y = p3.y - p2.y;
    v2.z = p3.z - p2.z;

    var a = v1.y * v2.z - v2.y * v1.z;
    var b = v1.z * v2.x - v2.z * v1.x;
    var c = v1.x * v2.y - v2.x * v1.y;

    return [a, b, c];
}

mm.getProjectionMatrix = function (angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

mm.rotateZ = function (m, angle) {
    angle = angle * Math.PI / 180;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
}

mm.rotateX = function (m, angle) {
    angle = angle * Math.PI / 180;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

mm.rotateY = function (m, angle) {
    angle = angle * Math.PI / 180;
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

mm.translateX = function (m, l) {
    m[12] += l;
}

mm.translateY = function (m, l) {
    m[13] += l;
}

mm.translateZ = function (m, l) {
    m[14] += l;
}

mm.scaleXYZ = function (m, s) {
    m[0] = m[0] * s;
    m[5] = m[5] * s;
    m[10] = m[10] * s;
}

mm.scaleXYZ3 = function (m, s1, s2, s3) {
    m[0] = m[0] * s1;
    m[5] = m[5] * s2;
    m[10] = m[10] * s3;
}

mm.matrixMutiply = function (m1, m2) {
    var len = Math.sqrt(m1.length);
    var arr = [];
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len; j++) {
            arr[i * len + j] = 0;
            for (var k = 0; k < len; k++) {
                arr[i * len + j] += m1[i * len + k] * m2[k * len + j];
            }
        }
    }
    return arr;
}

mm.matrixInverse = function (me) {

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    var te = [],

        n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
        n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
        n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
        n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {

        var msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";

        if (true) {

            throw new Error(msg);

        } else {

            console.warn(msg);

        }

        return this.identity();

    }

    var detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return te;
}

mm.matrixTranspose = function (m) {
    var arr = [];
    var len = Math.sqrt(m.length);
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len; j++) {
            arr[i * len + j] = m[j * len + i];
        }
    }
    return arr
}

mm.getNormalMatrix = function (m) {
    return mm.matrixTranspose(mm.matrixInverse(m));
}

mm.matrixCopy = function (m) {
    m2 = [...m];
    return m2;
}

mm.eyes4 = function () {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

mm.matrixPrint = function (m) {
    var len = Math.sqrt(m.length);
    for (let i = 0; i < len; i++) {
        console.log(m.slice(i * len, i * len + len));
    }
}
































var mod11Layer = BaseNode.extend({
    init: function (configs) {

        this.baseFragShader = "";

        this.spiritArr = [];
		for(var item in configs){
	　　　　if(item == 'data'){
				var datas = configs[item]
	　　　　　　for(var index in datas){
					var obj_data = datas[index];
					if( jsb.fileUtils.isFileExist(obj_data['name'])){
	　　　　　　　　	this.spiritArr.push(cc.textureCache.addImage(obj_data['name']));
					}
	　　　　　　}
	　　　　}
　　	}

        spiritArr2 = [];
        for(let i=0; i <10;i++){
            spiritArr2.push(this.spiritArr[i % this.spiritArr.length]);
        }

        this.spiritArr = spiritArr2;

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
            float normpdf(in float x, in float sigma)\
            {\
            return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;\
            }\
            vec4 guassianBlur(sampler2D sampler, vec2 texCoord, int mSize, float step, float sigma){\
                int kSize = (mSize - 1) / 2;\
                float kernel[100];\
                for (int j = 0; j <= kSize; ++j)\
                {\
                    kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);\
                }\
                vec3 cc;\
                float factor;\
                vec3 final_colour = vec3(0.0);\
                float Z = 0.0;\
                for (int i=-kSize; i <= kSize; ++i)\
                {\
                    for (int j=-kSize; j <= kSize; ++j)\
                    {\
                        cc = texture2D(sampler, texCoord.xy+vec2(float(i) * step, float(j) * step)).rgb;\
                        factor = kernel[kSize + j] * kernel[kSize + i];\
                        Z += factor;\
                        final_colour += factor*cc;\
                    }\
                }\
                return vec4(final_colour/Z, 1.0);\
            }\
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
            float normpdf(in float x, in float sigma)\
            {\
            return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;\
            }\
            vec4 guassianBlur(sampler2D sampler, vec2 texCoord, int mSize, float step, float sigma){\
                int kSize = (mSize - 1) / 2;\
                float kernel[100];\
                for (int j = 0; j <= kSize; ++j)\
                {\
                    kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);\
                }\
                vec3 cc;\
                float factor;\
                vec3 final_colour = vec3(0.0);\
                float Z = 0.0;\
                for (int i=-kSize; i <= kSize; ++i)\
                {\
                    for (int j=-kSize; j <= kSize; ++j)\
                    {\
                        cc = texture2D(sampler, texCoord.xy+vec2(float(i) * step, float(j) * step)).rgb;\
                        factor = kernel[kSize + j] * kernel[kSize + i];\
                        Z += factor;\
                        final_colour += factor*cc;\
                    }\
                }\
                return vec4(final_colour/Z, 1.0);\
            }\
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
            vec4 scaleShake(sampler2D sampler, vec2 texCoord, float dt){\
                float progress = fract(dt*1.0);\
                float scale = 1.0 + 0.4 * progress;\
                vec2 scaleTextureCoord = vec2(0.5, 0.5) + (texCoord - vec2(0.5, 0.5)) / scale;\
                vec4 curColorL = texture2D(sampler, scaleTextureCoord);\
                vec4 curColorS = texture2D(sampler, texCoord);\
                vec4 resultColor = mix(curColorS, curColorL, (1.0 - progress) * 0.4);\
                return resultColor;\
            }\
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



Player = cc.ComponentJS.extend({
    onEnter: function (config) {
        console.log(config)
		var obj_config= JSON.parse(config);
        var owner = this.getOwner();
        owner.playerComponent = this;
        // var background = new cc.Sprite("res/background.jpg");
        // var size = cc.winSize;
        // background.attr({
        //     x: size.width / 2,
        //     y: size.height / 2
        // });
        // owner.test = new LightCubeLayer();
        // "src/mod11test.js",

        
        owner.test = new mod11Layer(obj_config);
        // owner.test = new LightCubeLayer();
        // background.addChild(owner.gllayer);
        //this.getOwner().getParent().addChild(background);
        this.getOwner().getParent().addChild(owner.test);
    },
    update: function (dt) {
        //var owner = this.getOwner();
        //owner.gllayer.draw();
    },
	onExit: function() {
		this.getOwner().getParent().removeChild(this.getOwner().test);
	}
});