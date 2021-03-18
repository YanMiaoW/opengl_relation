
var mod10Layer = BaseNode.extend({
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
            // 'positionZ = gl_Position.z;'+
            '}';

        var fragCode = 'precision mediump float;' +
            'uniform sampler2D sampler2d;' +
            'varying vec2 v_texCoord;' +
            // 'varying float positionZ;'+

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

        // cc.loader.loadTxt("src/player.js", function(err, data) {  
        //     console.log(data);
        // });

        var points2 = [];
        var coords2 = [];
        var indics2 = [];


        var segmentB2 = 30;
        var segmentA2 = 30;
        var r = 2;


        for (let segB = 0; segB <= segmentB2; segB++) {
            var angleB = -Math.PI / 2 + Math.PI / segmentB2 * segB;
            var z = r * Math.sin(angleB);
            var cosYZ = Math.cos(angleB);
            for (let segA = 0; segA <= segmentA2; segA++) {
                var angleA = Math.PI * 2 / segmentA2 * segA;
                var x = r * Math.cos(angleA) * cosYZ;
                var y = r * Math.sin(angleA) * cosYZ;
                points2.push(x, y, z);
            }
        }

        for (let b = 0; b <= segmentB2; b++) {
            for (let a = 0; a <= segmentA2; a++) {
                coords2.push(a * 2 / segmentA2 - 0.5, b / segmentB2);
            }
        }

        for (let i = 0; i < segmentB2; i++) {
            for (let j = 0; j < segmentA2; j++) {
                var seg = (segmentA2 + 1);
                var de = i * seg;
                indics2.push(j + de);
                indics2.push(j + seg + de);
                indics2.push(j + 1 + de);
                indics2.push(j + seg + de);
                indics2.push(j + 1 + seg + de);
                indics2.push(j + 1 + de);
            }
        }

        this.vertices2 = mm.index2Array(points2, 3, indics2);
        this.texCoords2 = mm.index2Array(coords2, 2, indics2);




        var points = [];
        var coords = [];
        var indics = [];



        // var segmentB = 73;
        // var segmentA = 44; 

        var segmentB = 20;
        var segmentA = 20;
        var fanA = 3;
        var fanB = 9;
        var ra = 2;
        var rb = 5;
        this.segDraw = fanA * fanB;

        for (let fb = 0; fb < fanB; fb++) {
            for (let fa = 0; fa < fanA; fa++) {
                // for(let angleB = Math.PI * 2 / fanB * fb; angleB <= Math.PI * 2 / fanB * (fb + 1)+0.01; angleB += Math.PI * 2 / segmentB / fanB){
                //     for(let angleA = Math.PI * 2 / fanA * fa; angleA <= Math.PI * 2 / fanA * (fa + 1); angleA += Math.PI * 2 / segmentA / fanA){
                for (let segB = 0; segB <= segmentB; segB++) {
                    for (let segA = 0; segA <= segmentA; segA++) {
                        var angleB = Math.PI * 2 / fanB * fb + segB * Math.PI * 2 / segmentB / fanB;
                        var angleA = Math.PI * 2 / fanA * fa + segA * Math.PI * 2 / segmentA / fanA + (110) / 180 * Math.PI;


                        var x = ra * Math.cos(angleA);
                        var y = (ra * Math.sin(angleA) + rb) * Math.cos(angleB);
                        var z = (ra * Math.sin(angleA) + rb) * Math.sin(angleB);
                        points.push(x, y, z);
                    }
                }

                // var rrr = rb/fanB / ra*fanA; 
                // for(let a = -rrr / 2 + 0.5 ; a <= rrr / 2 + 0.5; a += rrr / segmentB){
                for (let b = 0; b <= segmentB; b++) {
                    for (let a = 0; a <= segmentA; a++) {
                        coords.push(a / segmentA, b / segmentB);
                    }
                }

                for (let i = 0; i < segmentB; i++) {
                    for (let j = 0; j < segmentA; j++) {
                        var seg = (segmentA + 1);
                        var de = i * seg + (fb * fanA + fa) * (segmentA + 1) * (segmentB + 1);
                        indics.push(j + de);
                        indics.push(j + seg + de);
                        indics.push(j + 1 + de);
                        indics.push(j + seg + de);
                        indics.push(j + 1 + seg + de);
                        indics.push(j + 1 + de);
                    }
                }

            }
        }


        this.vertices = mm.index2Array(points, 3, indics);
        this.texCoords = mm.index2Array(coords, 2, indics);


        this.vertices = new Float32Array(this.vertices);
        this.vertices2 = new Float32Array(this.vertices2);
        this.texCoords = new Float32Array(this.texCoords);
        this.texCoords2 = new Float32Array(this.texCoords2);

        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.vertex_buffer2 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer2);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices2, gl.STATIC_DRAW);

        this.texCoord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoords, gl.STATIC_DRAW);

        this.texCoord_buffer2 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer2);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoords2, gl.STATIC_DRAW);




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

        this.start_time = (new Date()).getTime() / 1000;

        var cup = cc.shaderCache.getProgram("ShaderPositionColor");
        console.log(cup);
        mm.showProperty(cup);

        return true;

    },
    update: function () {
        // var cup = cc.shaderCache.getProgram(cc.SHADER_POSITION_LENGTHTEXTURECOLOR     );
        // var texture0 = cc.textureCache; 
        // console.log(texture0);
        // var cup = cc.shaderCache.getProgram("ShaderPositionColor");
        // console.log(cup);
        // var a = cc.shaderCache.getProgram("");
        this.shader.use();
        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(gl.LEQUAL);

        // Position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);

        gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[0].getName());

        var current_time = (new Date()).getTime() / 1000;
        var dt = current_time - this.start_time;



        var matP = mm.getProjectionMatrix(30, 720 / 1280, 1, 100);
        var matV1 = mm.eyes4();
        var matV2 = mm.eyes4();
        var matM = mm.eyes4();

        mm.rotateX(matV1, 20 * dt);
        mm.rotateY(matV2, -30 * Math.sin(dt / 4));
        // mm.rotateX(matM, 20);
        // mm.rotateX(matM, Math.cos(dt) * 10);
        mm.translateZ(matV2, -16);

        matP = new Float32Array(matP);
        matV1 = new Float32Array(matV1);
        matV2 = new Float32Array(matV2);
        matM = new Float32Array(matM);

        gl.uniformMatrix4fv(this.uMatP, false, matP);
        gl.uniformMatrix4fv(this.uMatV1, false, matV1);
        gl.uniformMatrix4fv(this.uMatV2, false, matV2);
        gl.uniformMatrix4fv(this.uMatM, false, matM);

        for (let i = 0; i < this.segDraw; i++) {
            ind = i % this.spiritArr.length;
            // console.log(this.spiritArr[i]);
            gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[ind].getName());
            // gl.drawElements(gl.TRIANGLES, this.indices.length/this.segDraw, gl.UNSIGNED_SHORT, 2 * this.indices.length/this.segDraw * i);
            gl.drawArrays(gl.TRIANGLES, this.vertices.length / 3 / this.segDraw * i, this.vertices.length / 3 / this.segDraw);

        }



        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer2);
        gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);

        // TexCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer2);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);

        for (let i = 0; i < 6; i++) {

            matM = mm.eyes4();
            matV1 = mm.eyes4();
            matV2 = mm.eyes4();

            mm.translateZ(matV2, -16);

            var ddd = 90;
            var ddc = 60;

            if (i < 3) {
                mm.rotateZ(matM, -ddd * dt - ddc * i);
                mm.translateY(matV1, 5);
                mm.translateY(matM, 5);
                mm.rotateZ(matV1, ddd * dt + ddc * i);

            }
            else {
                mm.rotateZ(matM, -ddd * dt - ddc * i);
                mm.translateY(matV1, -5);
                mm.translateY(matM, -5);
                mm.rotateZ(matV1, -ddd * dt - ddc * i);

            }

            mm.rotateX(matM, 90);
            mm.rotateY(matM, 90);
            mm.rotateY(matV2, -30 * Math.sin(dt / 4));

            // this.rotateY(matV2, -30);
            // this.translateX(matV2, 1);

            matV1 = new Float32Array(matV1);
            matV2 = new Float32Array(matV2);
            matM = new Float32Array(matM);


            gl.uniformMatrix4fv(this.uMatV1, false, matV1);
            gl.uniformMatrix4fv(this.uMatV2, false, matV2);
            gl.uniformMatrix4fv(this.uMatM, false, matM);



            gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[i].getName());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            // gl.drawElements(gl.TRIANGLES, this.indices2.length, gl.UNSIGNED_SHORT, 0);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices2.length / 3);
            // gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
            // gl.drawElements(gl.LINE_STRIP, this.indices2.length, gl.UNSIGNED_SHORT, 0);
            // mm.showProperty(cc);


            // mm.showProperty(a);
            // console.log(a);
            // a.use();
            // gl.useProgram(a);
        }

        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);
        // gl.disable(gl.BLEND);
        // var a = cc.textureCache.getTextureForKey("res/background.jpg");
        // console.log(a);
        // gl.bindTexture(gl.TEXTURE_2D, a.getName());

        // cup.use();

    }
})