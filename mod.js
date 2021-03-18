
var mm = mm || {};

mm._ENABLE_LOG = true;

mm._MobilePhone = false;
// mm._width = cc.winSize.width;
// mm._height = cc.winSize.height;
if (mm._MobilePhone) {
    mm._width = 720;
    mm._height = 1280;
} else {
    mm._width = 450;
    mm._height = 800;
}

mm._FPS15 = false;
if (mm._FPS15) {
    mm._fps = 15;
} else {
    mm._fps = 60;
}

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

    gl.deleteProgram(program);

}

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

mm.easeExp = function (base, time) {
    var resultTime = (Math.pow(base, time) - 1.0) / (base - 1.0);
    return resultTime;
}

mm.easeLog = function (base, time) {
    var resultTime = Math.log(time * (base - 1) + 1.0) / Math.log(base);
    return resultTime;
}

mm.easeExpLog = function (base, time) {
    time *= 2;
    var resultTime = 0;
    if (time < 1) {
        resultTime += mm.easeExp(base, time);
    } else {
        resultTime += 1;
    }
    time = time - 1;
    if (time > 0) {
        resultTime += mm.easeLog(base, time);
    }
    resultTime *= 0.5;
    return resultTime;
}

mm._scaleXYZ = function (m, s) {
    m[0] = s;
    m[5] = s;
    m[10] = s;
}

mm._scaleX = function (m, s) {
    m[0] *= s;
}

mm._scaleY = function (m, s) {
    m[5] *= s;
}

mm._scaleZ = function (m, s) {
    m[10] *= s;
}


mm._scaleXYZ3 = function (m, s1, s2, s3) {
    m[0] = s1;
    m[5] = s2;
    m[10] = s3;
}

mm._rotateX = function (m, angle) {
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

mm._rotateY = function (m, angle) {
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

mm._rotateZ = function (m, angle) {
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

mm._rotateByPitchYawRoll = function (mat, pitch, yaw, roll) {
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


mm._rotateByAxis = function (m2, axis, angle) {

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

    var m = mm._eye4();

    m[0] = c + tx * x;
    m[1] = txy + sz;
    m[2] = txz - sy;

    m[4] = txy - sz;
    m[5] = c + ty * y;
    m[6] = tyz + sx;

    m[8] = txz + sy;
    m[9] = tyz - sx;
    m[10] = c + tz * z;

    var m3 = mm._matrixMutiply(m2, m);

    for (let i = 0; i < m2.length; i++) {
        m2[i] = m3[i];
    }


}

mm._translateX = function (m, l) {
    m[12] += l;
}

mm._translateY = function (m, l) {
    m[13] += l;
}

mm._translateZ = function (m, l) {
    m[14] += l;
}

mm._translateXYZ = function (m, xyz) {
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

mm._matrixInverse = function (m) {
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

mm._matrixTranspose = function (m) {
    var arr = [];
    var len = Math.sqrt(m.length);
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len; j++) {
            arr[i * len + j] = m[j * len + i];
        }
    }
    return arr
}

mm._getProjectionMatrix = function (angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

mm._getNormalMatrix = function (m) {
    return mm._matrixTranspose(mm._matrixInverse(m));
}

mm._matrixCopy = function (m) {
    var m2 = [...m];
    return m2;
}

mm._matrixPrint = function (m) {
    var len = Math.sqrt(m.length);
    for (let i = 0; i < len; i++) {
        console.log(m.slice(i * len, i * len + len));
    }
    console.log();
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

mm._eye4 = function () {
    var m = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    return m;
}


mm._instances = {};
mm._deleteArray = {
    shaders: [],
    buffers: [],
    framebuffers: [],
    textures: [],
}

mm._id = 0;
mm._updateId = 0; // 每帧会自动恢复到初始值，jsonCopy函数希望在一帧中每次调用时都创建新的id，但是在update方法内调用时，又希望下一帧不会重复创建。




mm.init = function () {
    mm.getElseCreate('_defaultMatP', () => {
        return mm._getProjectionMatrix(25, mm._width / mm._height, 1, 100);
    })

    mm.getElseCreate('_defaultMatP2D', () => {
        var _matp2d = mm._eye4();
        mm._scaleY(_matp2d, mm._width / mm._height);
        return _matp2d;
    })

    mm.getElseCreate('_defaultMatV2D', () => {
        return mm._eye4();
    })

    mm.getElseCreate('_defaultMatV', () => {
        var _matV = mm._eye4();
        mm._translateZ(_matV, -4.8);
        return _matV;
    })

    mm.getElseCreate('_defaultMatM', () => {
        return mm._eye4();
    })

    mm.getElseCreate('_defaultTextureUrl', () => {
        return "res/black.png";
    })
}

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

mm.log = function (...s) {
    console.log(...s);
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

mm.matrixPrint = function (m) {

    console.log("t:", m._translateX, m._translateY, m._translateZ);
    console.log("r:", m._rotatePitch, m._rotateYaw, m._rotateRoll);
    console.log("s:", m._scaleX, m._scaleY, m._scaleZ);
    console.log();
}

mm._mix = function (oldv, newv, ut) {
    if (ut == 1.0) return newv;
    else return oldv + (newv - oldv) * ut;
}
mm.translateX = function (m, l, ut = 1.0) {
    m._translateX = mm._mix(m._translateX, l, ut);
}

mm.translateY = function (m, l, ut = 1.0) {
    m._translateY = mm._mix(m._translateY, l, ut);
}

mm.translateZ = function (m, l, ut = 1.0) {
    m._translateZ = mm._mix(m._translateZ, l, ut);
}

mm.translateXYZ = function (m, x, y, z, ut = 1.0) {
    mm.translateX(m, x, ut)
    mm.translateY(m, y, ut)
    mm.translateZ(m, z, ut)
}

mm.rotateX = function (m, l, ut = 1.0) {
    m._rotatePitch = mm._mix(m._rotatePitch, l, ut);
}

mm.rotateY = function (m, l, ut = 1.0) {
    m._rotateYaw = mm._mix(m._rotateYaw, l, ut);
}

mm.rotateZ = function (m, l, ut = 1.0) {
    m._rotateRoll = mm._mix(m._rotateRoll, l, ut);
}

mm.rotateXYZ = function (m, p, y, r, ut = 1.0) {
    mm.rotateX(m, p, ut)
    mm.rotateY(m, y, ut)
    mm.rotateZ(m, r, ut)
}

mm.scaleX = function (m, s, ut = 1.0) {
    m._scaleX = mm._mix(m._scaleX, s, ut);
}

mm.scaleY = function (m, s, ut = 1.0) {
    m._scaleY = mm._mix(m._scaleY, s, ut);
}

mm.scaleZ = function (m, s, ut = 1.0) {
    m._scaleZ = mm._mix(m._scaleZ, s, ut);
}

mm.scaleXYZ = function (m, s, ut = 1.0) {
    mm.scaleX(m, s, ut);
    mm.scaleY(m, s, ut);
    mm.scaleZ(m, s, ut);
}

mm.getMatrix = function (mc) {
    let m = mm._eye4();
    mm._rotateByPitchYawRoll(m, mc._rotatePitch, mc._rotateYaw, mc._rotateRoll)
    if (mc._scaleX != 1 || mc._scaleY != 1 || mc._scaleZ != 1) {
        let m2 = mm._eye4();
        mm._scaleXYZ3(m2, mc._scaleX, mc._scaleY, mc._scaleZ)
        m = mm._matrixMutiply(m2, m)
    }
    mm._translateXYZ(m, [mc._translateX, mc._translateY, mc._translateZ])
    return m;
}

mm.uniformMatrix4fv = function (key, ms) {
    if (!Array.isArray(ms)) {
        var mat = mm.getMatrix(ms);
        mm._uniformMatrix4fv(key, mat);
    } else {
        ms = ms.map(m => mm.getMatrix(m))
        let mat = mm._matrixMutiplyList(ms)
        mm._uniformMatrix4fv(key, mat);
    }
}

mm.bindMatM = function (ms = mm.eye4()) {
    mm.uniformMatrix4fv('uMatM', ms);
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

mm.clear = function () {
    // mm.showProperty(gl)

    let { framebuffers, textures, shaders, buffers } = mm._deleteArray;
    for (let framebuffer of framebuffers) {
        gl.deleteFramebuffer(framebuffer);
    }
    for (let texture of textures) {
        gl.deleteTexture(texture)
    }
    for (let buffer of buffers) {
        gl.deleteBuffer(buffer)
    }
    for (let shader of shaders) {
        // shader.release()
        // shader will autoRelease
    }
    mm._instances = [];
    mm.init();

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

mm.jsonCopy = function (json0, key, initFunc) {
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
        json.id = null
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
        if (mm._ENABLE_LOG) { mm.shaderError(vertCode, fragCode); }

        var shader = cc.GLProgram();
        shader.initWithString(vertCode, fragCode);
        shader.retain();
        shader.link();
        mm._deleteArray.shaders.push(shader);

        return shader;
    })
}

mm.bindShader = function (shaderJson = mm.shaderDoNothing) {

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
            mm._uniformMatrix4fv(key, list[key]);
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

    mm._uniformMatrix4fv("uMatM", mm.getElseCreate("_currentMat_" + "uMatM", () => {
        return mm.get('_defaultMatM');
    }));

}

mm.bindTexture = function (texture_url = "res/black.png") {
    if (typeof texture_url == "number") {
        texture_url = mm.getTextureByIndex(texture_url)
    }
    var texture = mm.loadTexture(texture_url);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
    mm.set("_currentTextureUrl", texture_url);
}

mm.bindTexture2 = function (texture_url) {
    if (typeof texture_url == "number") {
        texture_url = mm.getTextureByIndex(texture_url)
    }
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

    var array = mm.getElseCreate("createTexture_initarray", () => new Uint32Array(600 * 600))

    return mm.getElseCreate("createTexture_" + width + "_" + height + "_" + key, () => {
        var texture = gl.createTexture();
        mm._deleteArray.textures.push(texture.texture_id);
        texture.width = width;
        texture.height = height;
        gl.bindTexture(gl.TEXTURE_2D, texture.texture_id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, array);
        gl.bindTexture(gl.TEXTURE_2D, 0);
        var textureUrl = "createTextureUrl" + key;
        mm.set("_texture_" + textureUrl, texture);
        return textureUrl;
    })
}

mm.textureRender = function (texture_url, fn, isClearColor = true, isClearDepth = true, xywh = [0, 0, 1, 1]) {

    var texture = mm.loadTexture(texture_url);

    var frame = mm.getElseCreate("_renderBuffer", () => {
        var frame = gl.createFramebuffer();
        mm._deleteArray.framebuffers.push(frame.framebuffer_id);
        return frame;
    });

    var array = mm.getElseCreate("_renderBufferDepth_initarray" + String(texture.width) + " " + String(texture.height), () => new Uint32Array(600 * 600))

    // GL_DRAW_FRAMEBUFFER_BINDING  0x8CA6
    let oldFramebuffer = gl.getParameteri(0x8CA6)

    gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer_id);
    var depth_texture = mm.getElseCreate("_renderBufferDepth" + String(texture.width) + " " + String(texture.height), () => {
        var depth_texture = gl.createTexture();
        mm._deleteArray.textures.push(depth_texture.texture_id);
        gl.bindTexture(gl.TEXTURE_2D, depth_texture.texture_id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        // console.log("before depth"+texture_url);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, texture.width, texture.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, array);
        // console.log(texture.width+texture_url+"textureRender depth");
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


    var _defaultMatV2D_render = mm._eye4();
    mm._scaleY(_defaultMatV2D_render, -texture.width / texture.height * mm._height / mm._width);

    var _defaultMatV_render = mm._eye4();
    mm._scaleY(_defaultMatV_render, -texture.width / texture.height * mm._height / mm._width);
    mm._translateZ(_defaultMatV_render, -4.8);

    mm.set('_defaultMatV2D', _defaultMatV2D_render);
    mm.set('_defaultMatV', _defaultMatV_render);

    gl.viewport(
        texture.width * (xywh[0]),
        texture.height * (1 - xywh[3] - xywh[1]),
        texture.width * xywh[2],
        texture.height * xywh[3]
    );


    // mm.showProperty(gl);
    // gl.clearDepthf(0.0);

    // 更新深度缓冲需要开启深度写入才行。
    if (isClearColor) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    if (isClearDepth) {
        gl.depthMask(true);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.depthMask(false);
    }

    fn();

    gl.bindFramebuffer(gl.FRAMEBUFFER, oldFramebuffer);

    let rect = cc.view.getViewPortRect();
    gl.viewport(rect.x, rect.y, rect.width, rect.height);

    mm.set('_defaultMatV2D', _defaultMatV2D);
    mm.set('_defaultMatV', _defaultMatV);

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
        mm._deleteArray.buffers.push(vertex_buffer.buffer_id);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var texCoord_buffer = gl.createBuffer();
        mm._deleteArray.buffers.push(texCoord_buffer.buffer_id);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        var shape = {};
        shape["vertex_buffer"] = vertex_buffer;
        shape["texCoord_buffer"] = texCoord_buffer;
        shape["arrayNum"] = pointIndics.length;

        return shape;
    })
}

mm.bindShape = function (shapeJson = mm.shapeRectangle) {
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

mm._uniformMatrix4fv = function (key, mat) {
    var shader = mm.get('_currentShader');
    var keyL = gl.getUniformLocation(shader.getProgram(), key);
    if (keyL != -1) {
        gl.uniformMatrix4fv(keyL, false, new Float32Array(mat));
        if (key == "uMatM") {
            mm.set("_currentMat_" + key, mat);
        }
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

mm.blendNormal = function () {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

mm.draw = function () {

    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);

    mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

    gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.draw2d = function () {

    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);

    mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
    mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));

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
        mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
        mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));
    } else {
        mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
        mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));
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

    mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP2D'));
    mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV2D'));

    gl.drawArrays(gl.TRIANGLES, 0, mm.get('_currentShape')["arrayNum"]);
    gl.enable(gl.BLEND);

}


mm.drawLine = function () {
    mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

    gl.drawArrays(gl.LINES, 0, mm.get('_currentShape')["arrayNum"]);
}

mm.drawPoint = function () {
    mm._uniformMatrix4fv("uMatP", mm.get('_defaultMatP'));
    mm._uniformMatrix4fv("uMatV", mm.get('_defaultMatV'));

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

mm.debugLine = function (u) {
    mm.log();
    mm.log('-----------------------------------------');
    mm.log('-----------------------------------------');
    mm.log('-----------------------------------------');
    mm.log('-----------------------------------------');
    mm.log('-----------------------------------------');
    mm.log('-----------------------------------------');
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
        uniform int uKernelSize;\
        uniform int uTextureHeight;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = gaussianBlurHeight(sampler2d, texCoord, uTextureHeight, uKernelSize);\
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
        uniform int uKernelSize;\
        uniform int uTextureWidth;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = gaussianBlurWidth(sampler2d, texCoord, uTextureWidth,  uKernelSize);\
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

mm.shaderTransparentSet = {
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
        uniform float uAlpha[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = texture2D(sampler2d, texCoord);\
            gl_FragColor = vec4(color.rgb, uAlpha[0]);\
        }',
    "float": {
        "uAlpha": 0.5,
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
        "uMatTexture": mm._eye4()
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
        uniform int uTextureHeight;\
        uniform int uTextureWidth;\
        uniform int uTimes;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = frameBurning(sampler2d, texCoord, uTextureWidth, uTextureHeight, uUt[0], uTimes);\
            gl_FragColor = color;\
        }',
    "int": {
        "uTextureWidth": 512,
        "uTimes": 10
    },
    "float": {
        "uUt": 0
    }
}

mm.shaderBarDisappear = {
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
        uniform mat4 uMatTexture;\
        uniform int uStripeNum;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = barDisappear(sampler2d, texCoord, uStripeNum, uMatTexture, uUt[0]);\
            gl_FragColor = color;\
        }',
    "int": {
        "uStripeNum": 15,
    },
    "float": {
        "uUt": 0.5
    },
    "mat": {
        "uMatTexture": mm._eye4()
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

mm.shapeRingSlice = {
    "initFunc": function (json) {
        var indices = [];
        var points = [];
        var coords = [];

        var sliceNum = json["sliceNum"];
        var rBig = json["rBig"];
        var rSmall = json["rSmall"];


        var AngleBigStep = Math.PI * 2 / sliceNum;
        var AngleSmallStep = Math.PI * 2 / sliceNum;
        for (let j = 0; j <= sliceNum; j++) {
            for (let i = 0; i <= sliceNum; i++) {
                let alpha = AngleSmallStep * i;
                let beta = AngleBigStep * j;
                let x = rSmall * Math.sin(alpha)
                let yy = rBig + rSmall * Math.cos(alpha)
                let y = yy * Math.cos(beta)
                let z = yy * Math.sin(beta)

                let cx = i / sliceNum
                let cy = j / sliceNum
                points.push(x);
                points.push(y);
                points.push(z);
                coords.push(cx);
                coords.push(cy);
            }
        }

        for (let j = 0; j < sliceNum; j++) {
            for (let i = 0; i < sliceNum; i++) {
                var k = j * (sliceNum + 1);
                indices.push(i + k);
                indices.push(i + sliceNum + 1 + k);
                indices.push(i + sliceNum + 2 + k);
                indices.push(i + k);
                indices.push(i + sliceNum + 2 + k);
                indices.push(i + 1 + k);
            }
        }


        json['points'] = points;
        json['coords'] = coords;
        json['pointIndics'] = indices;
        json['coordIndics'] = indices;
    },
    "sliceNum": 200,
    "rBig": 1,
    "rSmall": 0.5,
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
    var m = mm._eye4();
    mm._scaleY(m, height / width);

    // 两次高斯滤波，纵向
    mm.textureRender(texture_blur1, () => {
        mm.bindShader(mm.shaderGaussianBlurHeight);
        mm.bindTexture(texture_url);
        mm.bindShape(mm.shapeRectangle);
        mm.uniform1fv("uKernel", mm.getGaussianKernel(kernel_size, sigma));
        mm.uniform1i("uKernelSize", kernel_size);
        mm.uniform1i("uTextureHeight", texture.height);
        mm._uniformMatrix4fv("uMatM", m);
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
        mm._uniformMatrix4fv("uMatM", m);
        mm.draw2d();
    })

    return texture_url0;

}

mm.textureDilation = function (texture_url0, texture_url, n) {

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
    m = mm._eye4();
    mm._scaleY(m, height / width);
    mm._uniformMatrix4fv("uMatM", m);

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

mm.seq = function (start, pause, end, fn) {
    if (typeof pause == 'function') {
        fn = pause;
        end = mm._lastEnd;
        pause = start;
        start = mm._lastStart;
    }
    mm._lastEnd = end;
    mm._lastStart = pause;

    if (typeof start == 'string') start = mm._compSeqDict[start];
    if (typeof pause == 'string') pause = mm._compSeqDict[pause];
    if (typeof end == 'string') end = mm._compSeqDict[end];


    if (mm._count >= start && mm._count < end) {
        if (mm._count < pause) {
            fn((mm._count - start) / (pause - start));
        } else {
            fn(1.0);
        }
    }
}

mm.comp = function (start, end, fn) {
    if (typeof end == 'function') {
        fn = end;
        end = start;
        start = mm._lastEnd;
    }
    mm._lastEnd = end;

    if (typeof start == 'string') start = mm._compSeqDict[start];
    if (typeof end == 'string') end = mm._compSeqDict[end];

    if (mm._count >= start && mm._count < end) {
        fn((mm._count - start) / (end - start));
    }
}



var BaseNode = cc.Node.extend({
    sprite: null,
    ctor: function (config) {
        this._super();

        mm._texturePaths = [];
        for (var item in config) {
            if (item == 'data') {
                var datas = config[item]
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
            // init default instance
            mm.init();

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


                this.count += this.fps / mm._fps;
                if (this.count >= this.endFrame) this.count = this.startFrame;
                var ut = (this.count - this.startFrame) / totalFrame;

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
    init: function (config) {
        // override
    },
    update: function (ut) {
        // override
        // this function will calling at each frame.
    },
    clear: function () {
        mm.clear();
        //mm.debugLine();
    }
})

mm.setStartEndFps = function (start = 0, end = 600, fps = 60) {
    mm._startFrame = start;
    mm._endFrame = end;
    mm._fpsVideo = fps;
}

mm.setCompSeqDict = function (json) {
    mm._compSeqDict = json;
}


mm.shaderBlockGlitch = {
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
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = blockGlitch(sampler2d, texCoord, uUt[0]);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.5
    }
}

mm.shaderBokehBlur = {
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
        uniform float uR[1];\
        uniform int uIter;\
        uniform int uTextureHeight;\
        uniform int uTextureWidth;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = bokehBlur(sampler2d, texCoord, uR[0], uIter, uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "float": {
        "uR": 2
    },
    "int": {
        "uIter": 100,
        "uTextureHeight": 512,
        "uTextureWidth": 512
    }
}

mm.shaderGrainyBlur = {
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
        uniform float uR[1];\
        uniform int uIter;\
        uniform int uTextureHeight;\
        uniform int uTextureWidth;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = grainyBlur(sampler2d, texCoord, uR[0], uIter, uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "float": {
        "uR": 8
    },
    "int": {
        "uIter": 50,
        "uTextureHeight": 512,
        "uTextureWidth": 512
    }
}


mm.shaderRadialBlur = {
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
        uniform float uR[1];\
        uniform int uIter;\
        uniform int uTextureHeight;\
        uniform int uTextureWidth;\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = radialBlur(sampler2d, texCoord, uR[0], uIter, uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "float": {
        "uR": 8
    },
    "int": {
        "uIter": 50,
        "uTextureHeight": 512,
        "uTextureWidth": 512
    }
}

mm.shaderFragHorizontal = {
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
        uniform float uUt[1];\
        uniform float uFrequence[1];\
        uniform float uStrength[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = fragHorizontal(sampler2d, texCoord, uUt[0], uFrequence[0], uStrength[0], uTextureWidth);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.0,
        "uFrequence": 3.0,
        "uStrength": 10.0
    },
    "int": {
        "uTextureWidth": 512,
    }
}

mm.shaderSimplexNoiseHorizontal = {
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
        uniform float uUt[1];\
        uniform float uFrequence[1];\
        uniform float uStrength[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = simplexNoiseHorizontal(sampler2d, texCoord, uUt[0], uFrequence[0], uStrength[0], uTextureWidth, uTextureHeight);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.0,
        "uFrequence": 5.0,
        "uStrength": 30.0
    },
    "int": {
        "uTextureWidth": 512,
        "uTextureHeight": 512,
    }
}

mm.shaderSubtractiveColor = {
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
        uniform float uUt[1];\
        varying vec2 vTexCoord;\
        void main(void) {\
            vec2 texCoord = vec2(vTexCoord.s, 1.0 - vTexCoord.t);\
            vec4 color = subtractiveColor(sampler2d, texCoord, uUt[0], uTextureWidth);\
            gl_FragColor = color;\
        }',
    "float": {
        "uUt": 0.0,
    },
    "int": {
        "uTextureWidth": 512,
    }
}

mm.createHollowShapeFromJsonShape = function (json0, scale = 1.1) {
    if (!json0['id']) {
        mm.getShapeFromJson(json0);
    }
    return mm.getElseCreate("createHollowShapeFromJsonShape_" + String(json0['id'] + String(scale * 100)), () => {
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


var Mod15Layer = BaseNode.extend({
    init: function () {
        // mm.setStartEndFps(539, 1154, 50.49 / 1) // 539， 1154
        mm.setStartEndFps(604, 650, 50.49 / 1) // 539， 1154
    },
    update: function (ut) {
        let ease1 = ut => mm.easeExp(10, ut)
        let ease2 = ut => mm.easeLog(10, ut)
        let ease22 = ut => mm.easeLog(10, ut)
        let ease3 = ut => mm.easeExpLog(10, ut)

        let action1 = function (ut) {
            mm.setCompSeqDict({
                start: 539, end: 604,
                center: 575,
            })
            mm.bindShader(mm.shaderDiscardTransparent)
            mm.bindShape()
            mm.bindTexture(0)
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.scaleXYZ(m2, 4)
            mm.seq("start", "center", "end", ut => mm.rotateY(m, 5, ease1(ut)))
            mm.seq("end", ut => mm.rotateY(m, 0, ease2(ut)))
            mm.bindMatM([m2, m])
            mm.draw()

        }

        let action2 = function (ut) {
            // mm._count = 649
            mm.setCompSeqDict({
                start: 604, end: 650,
                rotateBegin1: 611, rotateBegin2: 616, changeTexture: 623, rotateEnd2: 638
            })

            mm.bindShader(mm.shaderMatrixTransform)

            mm.comp("start", "changeTexture", ut => mm.bindTexture(1))
            mm.comp("end", ut => mm.bindTexture(2))


            let m3 = mm.eye4()
            mm.seq("start", "rotateBegin1", "end", ut => { mm.rotateX(m3, 35); mm.rotateX(m3, 10, ease22(ut)); })
            mm.seq("rotateEnd2", ut => { mm.rotateX(m3, 0, ease22(ut)); })
            mm.seq("start", "rotateEnd2", "end", ut => { mm.rotateZ(m3, -3, ut); })
            mm.seq("start", "rotateBegin2", "end", ut => { mm.translateZ(m3, -1.4); mm.translateZ(m3, 0.7, ease22(ut)); })
            mm.comp("rotateEnd2", "end", ut => mm.translateX(m3, -1.33, ease1(ut)))
            mm.comp("rotateBegin1", "rotateEnd2", ut => mm.translateY(m3, -0.2 * Math.sin(Math.PI * 2 * ut)))

            let angle = 0
            mm.seq("rotateBegin1", "rotateBegin2", "changeTexture", ut => { angle = ease1(ut) * 10; })
            mm.seq("changeTexture", ut => { angle = 10 - 45 * ease1(ut); })
            mm.comp("changeTexture", "rotateEnd2", ut => { angle = 37 - 37 * ease2(ut); })

            let radio = 1.25
            let m4 = mm.eye4()
            mm.scaleX(m4, 1 / radio)
            let m5 = mm.eye4()
            mm.scaleX(m5, 1 / radio)

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, -0.5, -0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', [m, m4])
            let m2 = mm.eye4()
            mm.translateXYZ(m2, -1, 1, 0)
            mm.rotateX(m2, angle)
            mm.bindMatM([m2, m5, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, 0.5, -0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', [m, m4])
            let m2 = mm.eye4()
            mm.rotateY(m2, -angle)
            mm.translateXYZ(m2, 1, 1, 0)
            mm.bindMatM([m2, m5, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, -0.5, 0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', [m, m4])
            let m2 = mm.eye4()
            mm.translateXYZ(m2, -1, -1, 0)
            mm.rotateY(m2, angle)
            mm.bindMatM([m2, m5, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, 0.5, 0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', [m, m4])
            let m2 = mm.eye4()
            mm.rotateX(m2, -angle)
            mm.translateXYZ(m2, 1, -1, 0)
            mm.bindMatM([m2, m5, m3])
            mm.draw()

        }
        let action3 = function (ut) {
            mm.setCompSeqDict({
                start: 650, end: 674,
                center: 663,
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(3)
            let m = mm.eye4()
            mm.seq("start", "center", "end", ut => {
                mm.rotateY(m, -60)
                mm.rotateY(m, 0, ut)
                mm.translateZ(m, 3)
                mm.translateZ(m, 1, ut)
                mm.translateX(m, -0.2)
                mm.translateX(m, 0, ut)
            })
            mm.seq("end", ut => {
                mm.rotateY(m, 80, ut)
                mm.translateZ(m, 2, ut)

            })
            mm.bindMatM(m)
            mm.draw()

        }
        let action4 = function (ut) {
            mm.setCompSeqDict({
                start: 674, end: 695,
                center: 681,
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(4)
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.seq("start", "center", "end", ut => {
                mm.rotateZ(m, 5)
                mm.rotateZ(m, 15, ut)
                mm.translateZ(m2, 0)
                mm.translateZ(m2, 1.5, ut)
                // mm.translateX(m, -0.2)
                // mm.translateX(m, 0, ut)
            })
            mm.seq("end", ut => {
                mm.rotateY(m2, 60, ut)
                // mm.translateZ(m, 2, ut)

            })
            mm.bindMatM([m, m2])
            mm.draw()
        }
        let action5 = function (ut) {
            mm.setCompSeqDict({
                start: 695, end: 719,
                center: 710,
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(5)
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.seq("start", "center", "end", ut => {
                mm.rotateZ(m, 5)
                mm.rotateZ(m, 15, ut)
                mm.translateZ(m2, 0)
                mm.translateZ(m2, 1.5, ut)
                // mm.translateX(m, -0.2)
                // mm.translateX(m, 0, ut)
            })
            mm.seq("end", ut => {
                mm.rotateY(m2, 80, ut)
                // mm.translateZ(m, 2, ut)

            })
            mm.bindMatM([m, m2])
            mm.draw()
        }
        let action6 = function (ut) {
            mm.setCompSeqDict({
                start: 719, end: 742,
                center: 728,
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(6)
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.seq("start", "center", "end", ut => {
                mm.rotateZ(m, -15)
                mm.rotateY(m2, -60)
                mm.rotateY(m2, -20, ut)
                mm.translateZ(m2, 1.5)
                // mm.translateZ(m2, 1.5, ut)
            })
            mm.seq("end", ut => {
                // mm.rotateY(m2, 80, ut)
                mm.translateZ(m2, 3, ut)

            })
            mm.bindMatM([m, m2])
            mm.draw()
        }
        let action7 = function (ut) {
            mm.setCompSeqDict({
                start: 742, end: 841,
                rotateXEnd1: 754, changeTexture1: 769, rotateYEnd2: 785,
                changeTexture2: 795, rotateXEnd2: 805, changeTexture3: 815,
                rotateYEnd3: 832,

            })


            mm.bindShader()
            mm.bindShape()
            mm.comp("start", "changeTexture1", ut => mm.bindTexture(7))
            mm.comp("changeTexture2", ut => mm.bindTexture(8))
            mm.comp("changeTexture3", ut => mm.bindTexture(9))
            mm.comp("end", ut => mm.bindTexture(10))
            let m2 = mm.eye4()
            mm.comp("rotateXEnd1", "rotateYEnd2", ut => mm.translateY(m2, 0.3 * Math.sin(- Math.PI * ut)))
            mm.comp("rotateXEnd2", "rotateYEnd3", ut => mm.translateY(m2, 0.3 * Math.sin(- Math.PI * ut)))
            let m = mm.eye4()
            mm.scaleXYZ(m, 1.5)
            mm.seq("start", "rotateXEnd1", "end", ut => { mm.rotateX(m, 30); mm.rotateX(m, 0, ut) })
            mm.seq("changeTexture1", ut => { mm.rotateY(m, -55, ut) })
            mm.seq("rotateYEnd2", ut => { mm.rotateY(m, 60); mm.rotateY(m, 0, ut) })
            mm.seq("changeTexture2", ut => { mm.rotateX(m, -40, ut) })
            mm.seq("rotateXEnd2", ut => { mm.rotateX(m, 50); mm.rotateX(m, 0, ut) })
            mm.seq("changeTexture3", ut => { mm.rotateY(m, 60, ut); })
            mm.seq("rotateYEnd3", ut => { mm.rotateY(m, -60); mm.rotateY(m, 0, ut); })
            mm.seq("end", ut => { mm.rotateX(m, -40, ut); })

            mm.bindMatM([m, m2])
            mm.draw()

        }
        let action8 = function (ut) {
            mm.setCompSeqDict({
                start: 841, end: 942,
                rotateXEnd1: 853, changeTexture1: 867, rotateYEnd2: 881,
                changeTexture2: 893, rotateXEnd2: 903, changeTexture3: 917,
                rotateYEnd3: 931,
            })

            // mm._count =  841 - 1

            mm.bindShader()
            mm.bindShape()
            mm.comp("start", "changeTexture1", ut => mm.bindTexture(11))
            mm.comp("changeTexture2", ut => mm.bindTexture(12))
            mm.comp("changeTexture3", ut => mm.bindTexture(13))
            mm.comp("end", ut => mm.bindTexture(14))
            let m2 = mm.eye4()
            mm.comp("rotateXEnd1", "rotateYEnd2", ut => mm.translateY(m2, 0.3 * Math.sin(- Math.PI * ut)))
            mm.comp("rotateXEnd2", "rotateYEnd3", ut => mm.translateY(m2, 0.3 * Math.sin(- Math.PI * ut)))
            let m = mm.eye4()
            mm.scaleXYZ(m, 1.5)
            mm.seq("start", "rotateXEnd1", "end", ut => { mm.rotateX(m, 30); mm.rotateX(m, 0, ut) })
            mm.seq("changeTexture1", ut => { mm.rotateY(m, -55, ut) })
            mm.seq("rotateYEnd2", ut => { mm.rotateY(m, 60); mm.rotateY(m, 0, ut) })
            mm.seq("changeTexture2", ut => { mm.rotateX(m, -40, ut) })
            mm.seq("rotateXEnd2", ut => { mm.rotateX(m, 50); mm.rotateX(m, 0, ut) })
            mm.seq("changeTexture3", ut => { mm.rotateY(m, 60, ut); })
            mm.seq("rotateYEnd3", ut => { mm.rotateY(m, -60); mm.rotateY(m, 0, ut); })
            mm.seq("end", ut => { mm.rotateX(m, -40, ut); })

            mm.bindMatM([m, m2])
            mm.draw()


        }
        let action9 = function (ut) {
            mm.setCompSeqDict({
                start: 942, end: 968,
                center: 956
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(15)
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.seq("start", "center", "end", ut => { mm.rotateZ(m, 10); mm.scaleXYZ(m, 1.5, ut) })
            mm.seq("end", ut => mm.rotateY(m2, 80, ut))
            mm.bindMatM([m, m2])
            mm.draw()


        }
        let action10 = function (ut) {
            mm.setCompSeqDict({
                start: 968, end: 995,
                rotateBegin1: 976, rotateBigBeginZ1: 980, rotateBigEndX1: 985, rotateBegin2: 983
            })

            mm.bindShader(mm.shaderMatrixTransform)
            mm.bindTexture(16)

            let m3 = mm.eye4()
            mm.comp("start", "rotateBigEndX1", ut => { mm.rotateX(m3, 30); mm.rotateX(m3, 0, ut); })
            mm.comp("rotateBigBeginZ1", "end", ut => mm.rotateZ(m3, -5, ut))
            mm.comp("start", "end", ut => { mm.translateZ(m3, -3); mm.translateZ(m3, 0, ut) })

            let angle = 0
            mm.seq("rotateBegin1", "rotateBegin2", "end", ut => { angle = ut * 15; })
            mm.seq("end", ut => { angle = 15 - 95 * ut; })

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, -0.5, -0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', m)
            let m2 = mm.eye4()
            mm.translateXYZ(m2, -1, 1, 0)
            mm.rotateX(m2, angle)
            mm.bindMatM([m2, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, 0.5, -0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', m)
            let m2 = mm.eye4()
            mm.rotateY(m2, -angle)
            mm.translateXYZ(m2, 1, 1, 0)
            mm.bindMatM([m2, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, -0.5, 0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', m)
            let m2 = mm.eye4()
            mm.translateXYZ(m2, -1, -1, 0)
            mm.rotateY(m2, angle)
            mm.bindMatM([m2, m3])
            mm.draw()

            let m = mm.eye4()
            mm.scaleXYZ(m, 0.5)
            mm.translateXYZ(m, 0.5, 0.5, 0)
            mm.uniformMatrix4fv('uMatTexture', m)
            let m2 = mm.eye4()
            mm.rotateX(m2, -angle)
            mm.translateXYZ(m2, 1, -1, 0)
            mm.bindMatM([m2, m3])
            mm.draw()
        }
        let action11 = function (ut) {
            mm.setCompSeqDict({
                start: 995, end: 1015,
                center: 1005,
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(17)
            let m = mm.eye4()
            mm.seq("start", "center", "end", ut => {
                mm.rotateY(m, -60)
                mm.rotateY(m, 0, ut)
                mm.translateZ(m, 3)
                mm.translateZ(m, 1, ut)
                mm.translateX(m, -0.2)
                mm.translateX(m, 0, ut)
            })
            mm.seq("end", ut => {
                mm.rotateY(m, 80, ut)
                mm.translateZ(m, 2, ut)
                mm.translateX(m, 0.2, ut)

            })
            mm.bindMatM(m)
            mm.draw()
        }
        let action12 = function (ut) {
            mm.setCompSeqDict({
                start: 1015, end: 1065,
                rotateBegin: 1027, changeTexture: 1037, rotateEnd: 1047,
            })

            mm.bindShader()
            mm.bindShape()
            mm.comp("start", "changeTexture", ut => mm.bindTexture(18))
            mm.comp("end", ut => mm.bindTexture(19))
            let m = mm.eye4()
            let m2 = mm.eye4()
            mm.seq("start", "rotateBegin", "end", ut => {
                mm.rotateZ(m, 6)
                mm.rotateZ(m, 12, ut)
                // mm.rotateY(m2, -60)
                // mm.rotateY(m2, -20, ut)
                // mm.translateZ(m2, 1.5)
                mm.translateZ(m2, 1.5, ut)
            })
            mm.seq("rotateBegin", "rotateEnd", "end", ut => mm.rotateY(m2, 160, ut))
            mm.seq("end", ut => { mm.rotateY(m2, 170, ut); mm.rotateZ(m, 5, ut); mm.scaleXYZ(m2, 1.5, ut) })

            mm.bindMatM([m, m2])
            mm.draw()
        }
        let action13 = function (ut) {
            mm.setCompSeqDict({
                start: 1065, end: 1114,
                rotateXEnd1: 1077, changeTexture1: 1092, rotateYEnd2: 1105,
            })

            // mm._count =  841 - 1

            mm.bindShader()
            mm.bindShape()
            mm.comp("start", "changeTexture1", ut => mm.bindTexture(20))
            mm.comp("end", ut => mm.bindTexture(21))
            let m2 = mm.eye4()
            mm.comp("rotateXEnd1", "rotateYEnd2", ut => mm.translateY(m2, 0.3 * Math.sin(- Math.PI * ut)))
            let m = mm.eye4()
            mm.scaleXYZ(m, 1.5)
            mm.seq("start", "rotateXEnd1", "end", ut => { mm.rotateX(m, 30); mm.rotateX(m, 0, ut) })
            mm.seq("changeTexture1", ut => { mm.rotateY(m, -55, ut) })
            mm.seq("rotateYEnd2", ut => { mm.rotateY(m, 60); mm.rotateY(m, 0, ut) })
            mm.seq("end", ut => { mm.rotateX(m, -40, ut); })

            mm.bindMatM([m, m2])
            mm.draw()

        }
        let action14 = function (ut) {
            mm.setCompSeqDict({
                start: 1114, end: 1154,
                rotateXEnd1: 1127
            })

            mm.bindShader()
            mm.bindShape()
            mm.bindTexture(22)
            let m2 = mm.eye4()
            let m = mm.eye4()
            mm.scaleXYZ(m, 1.5)
            mm.seq("start", "rotateXEnd1", "end", ut => { mm.rotateX(m, 30); mm.rotateX(m, 0, ut) })

            mm.bindMatM([m, m2])
            mm.draw()
        }

        mm.comp(539, 604, action1)
        mm.comp(604, 650, action2)
        mm.comp(650, 674, action3)
        mm.comp(674, 695, action4)
        mm.comp(695, 719, action5)
        mm.comp(719, 742, action6)
        mm.comp(742, 841, action7)
        mm.comp(841, 942, action8)
        mm.comp(942, 968, action9)
        mm.comp(968, 995, action10)
        mm.comp(995, 1015, action11)
        mm.comp(1015, 1065, action12)
        mm.comp(1065, 1114, action13)
        mm.comp(1114, 1154, action14)


    }

})



Player = cc.ComponentJS.extend({
    onEnter: function (config) {
        console.log(config)
        var obj_config = JSON.parse(config);
        var owner = this.getOwner();
        owner.playerComponent = this;

        owner.test = new Mod15Layer(obj_config);
        this.getOwner().getParent().addChild(owner.test);
    },
    update: function (dt) { },
    onExit: function () {
        this.getOwner().test.clear();
        this.getOwner().getParent().removeChild(this.getOwner().test);
    }
})