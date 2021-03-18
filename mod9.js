
var mod9Layer = BaseNode.extend({
    init: function () {
        var vertCode = 'attribute vec3 position;' +
            'uniform mat4 uMatP;' +
            'uniform mat4 uMatV1;' +
            'uniform mat4 uMatV2;' +
            'uniform mat4 uMatM;' +
            'attribute vec2 vTexCoord;' +
            'varying vec2 v_texCoord;' +
            // 'varying float positionZ;'+

            'void main(void) { ' +//pre-built function
            'gl_Position = uMatP*uMatV2*uMatV1*uMatM*vec4(position, 1.);' +
            'v_texCoord = vTexCoord;' +
            '}';

        var fragCode = 'precision mediump float;' +
            'uniform sampler2D sampler2d;' +
            'varying vec2 v_texCoord;' +

            'void main(void) {' +
            'vec2 texCoord = vec2(v_texCoord.s, v_texCoord.t);' +
            'vec4 color = texture2D(sampler2d, texCoord);' +
            'color[3]=0.96;' +
            // 'color[3]=0.96-(positionZ-0.2)*0.05;'+
            'gl_FragColor = color;' +
            '}';

        // shader error log
        mm.shaderError(vertCode, fragCode);

        this.shader = cc.GLProgram();
        this.shader.initWithString(vertCode, fragCode);
        this.shader.retain();
        this.shader.link();
        this.program = this.shader.getProgram();

        this.uMatP = gl.getUniformLocation(this.program, "uMatP");
        this.uMatV1 = gl.getUniformLocation(this.program, "uMatV1");
        this.uMatV2 = gl.getUniformLocation(this.program, "uMatV2");
        this.uMatM = gl.getUniformLocation(this.program, "uMatM");
        this.position = gl.getAttribLocation(this.program, "position");
        this.vTexCoord = gl.getAttribLocation(this.program, "vTexCoord");



        var points = [
            -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
            1,-1,1, 1,-1,-1, 1,1,-1,1,1,1,
            1,1,1, 1,1,-1, -1,1,-1,-1,1,1,
            1,1,-1, 1,-1,-1, -1,-1,-1, -1,1,-1,
            -1,1,-1, -1,-1,-1, -1,-1,1,-1,1,1,
            -1,-1,-1, 1,-1,-1, 1,-1,1,-1,-1,1,
        ];

        var pointIndics = [
            0,1,2, 0,2,3, 
            4,5,6, 4,6,7,
            8,9,10, 8,10,11,
             12,13,14, 12,14,15,
            16,17,18, 16,18,19,
             20,21,22, 20,22,23 
        ];

        // this.indics = pointIndics;

        this.vertices = mm.index2Array(points, 3, pointIndics);

        this.vertices = new Float32Array(this.vertices);

        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.texCoord_buffer = gl.createBuffer();



        this.spiritArr = [];
        this.spiritArr.push(cc.textureCache.addImage("res/girl1.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl2.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl3.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl4.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl5.jpg"));
        this.spiritArr.push(cc.textureCache.addImage("res/girl6.jpg"));

        this.dt = 0.0;
        // mm.showProperty(cup);


    },
    update: function () {
        this.shader.use();
        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(gl.LEQUAL);

        var dt = this.dt;
        this.dt += 1 / 60.0;

        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);

        gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[0].getName());




        var matP = mm.getProjectionMatrix(30, 720 / 1280, 1, 100);
        var matV1 = mm.eyes4();
        var matV2 = mm.eyes4();
        var matM = mm.eyes4();

        // mm.rotateX(matV1, 20 * dt);
        // mm.rotateY(matV2, -30 * Math.sin(dt / 4));
        // mm.rotateX(matM, 20);
        // mm.rotateX(matM, Math.cos(dt) * 10);
        mm.translateZ(matV2, -18);

        matP = new Float32Array(matP);
        matV1 = new Float32Array(matV1);
        matV2 = new Float32Array(matV2);
        matM = new Float32Array(matM);

        gl.uniformMatrix4fv(this.uMatP, false, matP);
        gl.uniformMatrix4fv(this.uMatV1, false, matV1);
        gl.uniformMatrix4fv(this.uMatV2, false, matV2);
        gl.uniformMatrix4fv(this.uMatM, false, matM);



        var a = 7;
        var b = 7;
        var border = 0.1;
        var r = 1;
        for (let i = 0; i < a; i++) {
            for (let j = 0; j < b; j++) {

                var matM = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];


                var ca = r * 2 * a + (a - 1) * border;
                var cb = r * 2 * b + (b - 1) * border;

                mm.translateX(matM, i * (r * 2 + border) - ca / 2 + 1);
                mm.translateY(matM, -(j * (r * 2 + border) - cb / 2 + 1));

                var coords = [];

                var coordIndices = [
                    0,1,2, 0,2,3, 
                    4,5,6, 4,6,7,
                    8,9,10, 8,10,11,
                     12,13,14, 12,14,15,
                    16,17,18, 16,18,19,
                     20,21,22, 20,22,23 
                ];

                for (let k = 0; k < 6; k++) {
                    coords.push(
                        i * (r * 2 + border) / ca, j * (r * 2 + border) / cb + r * 2 / cb,
                        i * (r * 2 + border) / ca + r * 2 / ca, j * (r * 2 + border) / cb + r * 2 / cb,
                        i * (r * 2 + border) / ca + r * 2 / ca, j * (r * 2 + border) / cb,
                        i * (r * 2 + border) / ca, j * (r * 2 + border) / cb
                    );
                }


                dt = dt % 6;
                // dt = 0;

                if (dt > 0 && dt < 1) {
                    var et = dt;

                    var c = 0.3;
                    if (et < c) ct = 0;
                    else if (et > 1 - c) ct = 1;
                    else ct = (et - c) / (1 - 2 * c);


                    mm.rotateY(matM, -90 * ct);

                }
                if (dt > 1 && dt < 2) {
                    var et = dt - 1;



                    mm.rotateY(matM, -90);
                    mm.rotateX(matM, 90 * et);
                }
                if (dt > 2 && dt < 3) {
                    var et = dt - 2;


                    mm.rotateY(matM, -90);
                    mm.rotateZ(matM, 90 * et);
                    mm.rotateX(matM, 90);
                }
                if (dt > 3 && dt < 4) {
                    var et = dt - 3;

                    var c = 0.1;
                    var ss = 0.4;
                    c = c + 0.06 * i + 0.06 * j;
                    if (et < c) ct = 0;
                    else if (et > c + ss) ct = 1;
                    else ct = (et - c) / ss;

                    mm.rotateY(matM, - 90 - 90 * ct);
                    mm.rotateZ(matM, 90);
                    mm.rotateX(matM, 90);
                }
                if (dt > 4 && dt < 5) {
                    var et = dt - 4;

                    var c = 0.1;
                    if (et < c) ct = 0;
                    else if (et > 1 - c) ct = 1;
                    else ct = mm.easeQuadraticActionInOut(1, (et - c) / (1 - 2 * c));

                    mm.rotateY(matM, -180);
                    mm.rotateZ(matM, 90 + 90 * ct);
                    mm.rotateX(matM, 90);
                }
                if (dt > 5 && dt < 6) {
                    var et = dt - 5;

                    var c = 0.1;
                    var ss = 0.4;
                    c = c + 0.03 * (i - a / 2 + 1 / 2) * (i - a / 2 + 1 / 2) + 0.03 * (j - b / 2 + 1 / 2) * (j - b / 2 + 1 / 2);
                    if (et < c) ct = 0;
                    else if (et > c + ss) ct = 1;
                    else ct = (et - c) / ss;


                    mm.rotateY(matM, -180);
                    mm.rotateZ(matM, 180);
                    mm.rotateX(matM, 90 + 90 * ct);
                }


                this.texCoords = mm.index2Array(coords, 2, coordIndices);


                this.texCoords = new Float32Array(this.texCoords);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this.texCoords, gl.STATIC_DRAW);

                matM = new Float32Array(matM);
                gl.uniformMatrix4fv(this.uMatM, false, matM);


                for (let k = 0; k < 6; k++) {
                    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 6);
                    gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[k].getName());
                    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT,12*k);
                    gl.drawArrays(gl.TRIANGLES, 6 * k, 6);


                }
            }
        }



        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

    }
})