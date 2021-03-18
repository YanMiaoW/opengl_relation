
var mod8Layer = BaseNode.extend({
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
                'if(v_texCoord.t<=0.0 || v_texCoord.t>=1.0){'+
                '    color=vec4(1,1,1,0.4);'+
                    // 'color[3]=0.3;'+
                '}'+
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



        this.vertices = [];
        this.texCoords=[];
        this.indices=[];

        var segmentXY=22;
        var segmentYZ=22;
        var r = 1;

        for(let angleXY = 0; angleXY <= Math.PI * 2; angleXY += Math.PI * 2 / segmentXY){
            var x = 0.03 * Math.cos(angleXY);
            var y = 0.03 * Math.sin(angleXY);
            this.vertices.push(x,y,-4);
        }

        for(let angleYZ = -Math.PI / 2; angleYZ <= Math.PI / 2; angleYZ += Math.PI / segmentYZ){
            var z = r * Math.sin(angleYZ);
            var cosYZ = Math.cos(angleYZ);
            for(let angleXY = 0; angleXY <= Math.PI * 2; angleXY += Math.PI * 2 / segmentXY){
                var x = r * Math.cos(angleXY) * cosYZ;
                var y = r * Math.sin(angleXY) * cosYZ;
                this.vertices.push(x,y,z);
            }
        }

        for(let a = -0.5 ; a <= 1.5; a += 2 / segmentYZ){
            for(let b = -0.5; b <= 3.5; b += 4 / segmentXY){

                this.texCoords.push(b, a);
            }
        }

        for(let i = 0; i < (segmentXY + 1) * segmentYZ; i++){
            this.indices.push(i);
            this.indices.push(segmentXY+i+1);
        }

        // this.indics = pointIndics;

        this.vertices = mm.index2Array(this.vertices, 3, this.indices);
        this.texCoords = mm.index2Array(this.texCoords, 2, this.indices);

        this.vertices = new Float32Array(this.vertices);
        this.texCoords = new Float32Array(this.texCoords);

        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.texCoord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoords, gl.STATIC_DRAW);   



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

        mm.rotateZ(matM, 20*dt);
        mm.rotateX(matM, 90);
        mm.translateY(matM, -4);
        mm.translateY(matV2, 2);
        mm.translateZ(matV2, -22);


        matP = new Float32Array(matP);
        matV2 = new Float32Array(matV2);

        gl.uniformMatrix4fv(this.uMatP, false, matP);
        gl.uniformMatrix4fv(this.uMatV1, false, new Float32Array(matV1));
        gl.uniformMatrix4fv(this.uMatV2, false, matV2);
        gl.uniformMatrix4fv(this.uMatM, false, new Float32Array(matM));

        for(let i=0;i<10;i++){
            var v1copy = mm.matrixCopy(matV1);
            var mcopy = mm.matrixCopy(matM);

            mm.rotateZ(v1copy, Math.cos(dt*2+i*0.6)*(50));

            mm.translateZ(mcopy, -2.5*i+15);

            gl.uniformMatrix4fv(this.uMatM, false, new Float32Array(mcopy));
            gl.uniformMatrix4fv(this.uMatV1, false, new Float32Array(v1copy));

            

            gl.bindTexture(gl.TEXTURE_2D, this.spiritArr[i].getName());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            // gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.indices.length);
        }

        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

    }
})