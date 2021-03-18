
var BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function () {
        this._super();
        if ('opengl' in cc.sys.capabilities) {

            this.init();

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
        var compilationLog = gl._getProgramInfoLog(program.program_id);
        console.log('program linked log: ' + compilationLog);
        throw new Error("shader complied fail");
    }
}

// mm.uniformMatrix4fv = function (attr, value) {
//     gl.uniformMatrix4fv(attr, false, new Float32Array(value));
// }

mm.index2Array = function (array, step, indics) {
    // 将索引转化成实际值
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

    if (typeof (obj) === 'function') {
        console.log(obj.toString());
    }

    return attributes, methods
}

mm.cutUt = function (dt, begin, end, speedx) {
    var period = end - begin;
    dt = dt * speedx;
    dt = dt % period;
    return begin + dt;
}

mm.getUt = function (ts, begin, end) {
    var ts2 = [];
    for (let i = 0; i < ts.length; i++) {
        if (i == 0) { a = (ts[0] - begin) / (end - begin); }
        else { a = ((ts[i] - ts[i - 1])) / (end - begin); }
        ts2.push(a);
    }
    return ts2;
}

mm.sequence = function (dt, blocks, events) {
    var length = Math.min(blocks.length, events.length);
    var bs = mm.sum(blocks);
    var uts = blocks.map((v) => { return v / bs; });
    var endTimes = mm.accumulate(uts);
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
    var bs = mm.sum(blocks);
    var uts = blocks.map((v) => { return v / bs; });
    var endTimes = mm.accumulate(uts);
    for (let i = 0; i < length; i++) {
        if (dt < endTimes[i] || dt == 1.0) {
            if (i == 0) events[i](dt / (uts[0]));
            else events[i]((dt - endTimes[i - 1]) / uts[i]);
            break;
        }
    }
}

// mm.normpdf = function (x, sigma) {
//     return 0.39894 * Math.exp(-0.5 * x * x / (sigma * sigma)) / sigma;
// }

// mm.getGaussianKernel = function (mSize, sigma) {

//     var kSize = (mSize - 1) / 2;
//     kernel = Array(mSize).fill(0);
//     for (let j = 0; j <= kSize; j++) {
//         n = mm.normpdf(j, sigma);
//         kernel[kSize + j] = n;
//         kernel[kSize - j] = n;
//     }
//     return kernel;
// }

mm.sum = (arr) => { return arr.reduce((v, a) => { return v + a; }); }

mm.accumulate = function (array) {
    var newarr = [];
    var s = 0;
    for (let i = 0; i < array.length; i++) {
        s += array[i];
        newarr.push(s);
    }
    return newarr;
}

mm.routeCircle = function (r, angle) {
    var angle = angle * Math.PI / 180;
    return [r * Math.cos(angle), r * Math.sin(angle), 0];
}

mm.easeQuadraticActionInOut = function (time) {
    time *= 2;
    if (time < 1) {
        var resultTime = time * time * 0.5;
    } else {
        time = time - 1;
        var resultTime = -0.5 * (time * (time - 2) - 1)
    }
    return resultTime;
}

mm.easeQuadraticActionIn = function (time) {
    var resultTime = Math.pow(time, 2);
    return resultTime;
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

mm.easeExp2 = function (time) {
    var resultTime = Math.pow(2,time) - 1.0;
    return resultTime;
}

mm.easeExp = function(base, time){
    var resultTime = (Math.pow(base,time) - 1.0) / (base - 1.0);
    return resultTime;
}

mm.easeLog2 = function (time) {
    var resultTime = Math.log(time + 1.0) / Math.log(2);
    return resultTime;
}

mm.easeLog = function (base, time) {
    var resultTime = Math.log(time * (base - 1) + 1.0) / Math.log(base);
    return resultTime;
}

mm.easeExp2Log2 = function (time) {
    time *= 2;
    var resultTime = 0;
    if (time < 1) {
        resultTime += mm.easeExp2(time);
    }else{
        resultTime += 1;
    }
    time = time - 1;
    if (time > 0) {
        resultTime += mm.easeLog2(time);
    }
    resultTime *= 0.5;
    return resultTime;
}

mm.easeExpLog = function (base, time) {
    time *= 2;
    var resultTime = 0;
    if (time < 1) {
        resultTime += mm.easeExp(base, time);
    }else{
        resultTime += 1;
    }
    time = time - 1;
    if (time > 0) {
        resultTime += mm.easeLog(base, time);
    }
    resultTime *= 0.5;
    return resultTime;
}

mm.scaleXYZ = function (m, s) {
    m[0] = s;
    m[5] = s;
    m[10] = s;
}

mm.scaleX = function (m, s) {
    m[0] *= s;
}

mm.scaleY = function (m, s) {
    m[5] *= s;
}

mm.scaleZ = function (m, s) {
    m[10] *= s;
}


mm.scaleXYZ3 = function (m, s1, s2, s3) {
    m[0] = s1;
    m[5] = s2;
    m[10] = s3;
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

mm._rotateByPitchYawRoll = function(mat, pitch, yaw, roll) {
    pitch = pitch * Math.PI / 180;
    yaw = yaw * Math.PI / 180;
    roll = roll * Math.PI / 180;
    var cr = Math.cos(pitch), sr = Math.sin(pitch);
    var cp = Math.cos(yaw), sp = Math.sin(yaw);
    var cy = Math.cos(roll), sy = Math.sin(roll);
    var srsp = sr * sp, crsp = cr * sp;

    mat[0] = cp * cy;
    mat[4] = cp * sy;
    mat[8] = -sp;

    mat[1] = srsp * cy - cr * sy;
    mat[5] = srsp * sy + cr * cy;
    mat[9] = sr * cp;

    mat[2] = crsp * cy + sr * sy;
    mat[6] = crsp * sy - sr * cy;
    mat[10] = cr * cp;

    mat[3] = mat[7] = mat[11] = 0.0;
    mat[15] = 1.0;
    return mat;
};


mm.rotateByAxis = function (m2, axis, angle) {

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];

    // Make sure the input axis is normalized.
    var n = x * x + y * y + z * z;
    if (n != 1.0) {
        // Not normalized.
        n = Math.sqrt(n);
        // Prevent divide too close to zero.
        if (n > 0.00001) {
            n = 1.0 / n;
            x *= n;
            y *= n;
            z *= n;
        }
    }

    angle = angle * Math.PI / 180;
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var t = 1.0 - c;
    var tx = t * x;
    var ty = t * y;
    var tz = t * z;
    var txy = tx * y;
    var txz = tx * z;
    var tyz = ty * z;
    var sx = s * x;
    var sy = s * y;
    var sz = s * z;

    var m = mm.eye4();

    m[0] = c + tx * x;
    m[1] = txy + sz;
    m[2] = txz - sy;

    m[4] = txy - sz;
    m[5] = c + ty * y;
    m[6] = tyz + sx;

    m[8] = txz + sy;
    m[9] = tyz - sx;
    m[10] = c + tz * z;

    var m3 = mm.matrixMutiply(m2, m);

    for (let i = 0; i < m2.length; i++) {
        m2[i] = m3[i];
    }


}

mm.translateX = function (m, l) {
    // var m = mm.eye4();
    m[12] += l;
    // mm.matrixMutiplyCover(m2, m);
}

mm.translateY = function (m, l) {
    // var m = mm.eye4();
    m[13] += l;
    // mm.matrixMutiplyCover(m2, m);
}

mm.translateZ = function (m, l) {
    // var m = mm.eye4();
    m[14] += l;
    // mm.matrixMutiplyCover(m2, m);
}

mm.translateXYZ = function (m, xyz) {
    m[12] += xyz[0];
    m[13] += xyz[1];
    m[14] += xyz[2];
}


mm._matrixMutiply = function (m1, m2) {
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

mm._matrixMutiplyList = function (array) {
    var m = array[0];
    for (let i = 1; i < array.length; i++) {
        m = mm._matrixMutiply(m, array[i]);
    }
    return m;
}

// mm.matrixMutiplyCover = function (m, m2) {
//     var m3 = mm.matrixMutiply(m, m2);
//     mm.matrixCover(m, m3);
// }

// mm.matrixCover = function(m1, m2){
//     for (let i = 0; i < m1.length; i++) {
//         m1[i] = m2[i];
//     }
// }

mm.matrixInverse = function (m) {
    var a0 = m[0] * m[5] - m[1] * m[4];
    var a1 = m[0] * m[6] - m[2] * m[4];
    var a2 = m[0] * m[7] - m[3] * m[4];
    var a3 = m[1] * m[6] - m[2] * m[5];
    var a4 = m[1] * m[7] - m[3] * m[5];
    var a5 = m[2] * m[7] - m[3] * m[6];
    var b0 = m[8] * m[13] - m[9] * m[12];
    var b1 = m[8] * m[14] - m[10] * m[12];
    var b2 = m[8] * m[15] - m[11] * m[12];
    var b3 = m[9] * m[14] - m[10] * m[13];
    var b4 = m[9] * m[15] - m[11] * m[13];
    var b5 = m[10] * m[15] - m[11] * m[14];

    // Calculate the determinant.
    var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

    // Close to zero, can't invert.
    if (det === 0) {
        throw new Error("THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0");
    }

    // Support the case where m == dst.
    var inv;

    inv[0] = m[5] * b5 - m[6] * b4 + m[7] * b3;
    inv[1] = -m[1] * b5 + m[2] * b4 - m[3] * b3;
    inv[2] = m[13] * a5 - m[14] * a4 + m[15] * a3;
    inv[3] = -m[9] * a5 + m[10] * a4 - m[11] * a3;

    inv[4] = -m[4] * b5 + m[6] * b2 - m[7] * b1;
    inv[5] = m[0] * b5 - m[2] * b2 + m[3] * b1;
    inv[6] = -m[12] * a5 + m[14] * a2 - m[15] * a1;
    inv[7] = m[8] * a5 - m[10] * a2 + m[11] * a1;

    inv[8] = m[4] * b4 - m[5] * b2 + m[7] * b0;
    inv[9] = -m[0] * b4 + m[1] * b2 - m[3] * b0;
    inv[10] = m[12] * a4 - m[13] * a2 + m[15] * a0;
    inv[11] = -m[8] * a4 + m[9] * a2 - m[11] * a0;

    inv[12] = -m[4] * b3 + m[5] * b1 - m[6] * b0;
    inv[13] = m[0] * b3 - m[1] * b1 + m[2] * b0;
    inv[14] = -m[12] * a3 + m[13] * a1 - m[14] * a0;
    inv[15] = m[8] * a3 - m[9] * a1 + m[10] * a0;

    return inv;
}

// mm.matrixInverse2 = function (me) {

//     // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
//     var te = [],

//         n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
//         n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
//         n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
//         n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

//         t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
//         t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
//         t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
//         t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

//     var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

//     if (det === 0) {

//         var msg = "THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";

//         if (true) {

//             throw new Error(msg);

//         } else {

//             console.warn(msg);

//         }

//     }

//     var detInv = 1 / det;

//     te[0] = t11 * detInv;
//     te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
//     te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
//     te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

//     te[4] = t12 * detInv;
//     te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
//     te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
//     te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

//     te[8] = t13 * detInv;
//     te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
//     te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
//     te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

//     te[12] = t14 * detInv;
//     te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
//     te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
//     te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

//     return te;
// }

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

mm.getProjectionMatrix = function (angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

mm.getNormalMatrix = function (m) {
    return mm.matrixTranspose(mm.matrixInverse(m));
}

mm.matrixCopy = function (m) {
    var m2 = [...m];
    return m2;
}

mm.matrixPrint = function (m) {
    var len = Math.sqrt(m.length);
    for (let i = 0; i < len; i++) {
        console.log(m.slice(i * len, i * len + len));
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
    var v1 = {};
    var v2 = {};
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


// mm.eye4 = function () {
//     var m = [
//         1, 0, 0, 0,
//         0, 1, 0, 0,
//         0, 0, 1, 0,
//         0, 0, 0, 1
//     ];

//     m._translateX = 0;
//     m._translateY = 0;
//     m._translateZ = 0;
//     m._scaleX = 1;
//     m._scaleY = 1;
//     m._scaleZ = 1;
//     m._rotateX = 0;
//     m._rotateY = 0;
//     m._rotateZ = 0;

//     return m;
// }

mm.matrixPrint = function (m) {
    // m = mm.getMatrix(m)
    // var len = Math.sqrt(m.length);
    // for (let i = 0; i < len; i++) {
    //     console.log(m.slice(i * len, i * len + len));
    // }
    // console.log();
    console.log("t:",m._translateX, m._translateY, m._translateZ);
    console.log("r:",m._rotatePitch, m._rotateYaw, m._rotateRoll);
    console.log("s:",m._scaleX, m._scaleY, m._scaleZ);
    console.log();
}

mm.eye4 = function () {
    var m = {}
    m._translateX = 0;
    m._translateY = 0;
    m._translateZ = 0;
    m._scaleX = 1;
    m._scaleY = 1;
    m._scaleZ = 1;
    m._rotatePitch = 0;
    m._rotateYaw = 0;
    m._rotateRoll = 0;
    return m;
}