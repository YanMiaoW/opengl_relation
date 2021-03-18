#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define NOISE_SIMPLEX_1_DIV_289 0.00346020761245674740484429065744

uniform float uKernel[300];

float normpdf(in float x, in float sigma)
{
    return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}

float normpdf3(in vec3 v, in float sigma)
{
    return 0.39894*exp(-0.5*dot(v,v)/(sigma*sigma))/sigma;
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float rand(float co){
    return rand(vec2(co,1.0));
}

float wiggle(int times, float ut, float extent, float seed)
{
    return rand(vec2(floor(float(times)*ut), seed)) * extent;
}


float easeExp2(float time)
{
    float resultTime = exp2(time) - 1.0;
    return resultTime;
}

float easeLog2(float time)
{
    float resultTime = log2(time + 1.0);
    return resultTime;
}


vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 gamma(vec4 col, float gamma){
    return vec4(pow(col.rgb, vec3(1.0/gamma)), col.a);
}

vec4 toGray(vec4 col){
    float gray = col.r * 0.299 + col.g * 0.587 + col.b * 0.114;
    return vec4(vec3(gray), col.a);
}

vec4 toInvert(vec4 col){
    return vec4(1.0 - col.rgb, col.a);
}



vec4 gaussianBlurHeight(sampler2D sampler2d, vec2 texCoord, int height, int mSize){
    int kSize = (mSize - 1) / 2;
    vec4 cc;
    float factor;
    vec4 final_colour = vec4(0.0);
    float Z = 0.0;
    for (int j = -kSize; j <= kSize; ++j)
    {
        cc = texture2D(sampler2d, vec2(texCoord.x, texCoord.y + float(j) / float(height)));
        factor = uKernel[kSize + j];
        Z += factor;
        final_colour += factor * cc;
    }
    return final_colour / Z;
}

vec4 gaussianBlurWidth(sampler2D sampler2d, vec2 texCoord, int width, int mSize){
    int kSize = (mSize - 1) / 2;
    vec4 cc;
    float factor;
    vec4 final_colour = vec4(0.0);
    float Z = 0.0;
    for (int j = -kSize; j <= kSize; ++j)
    {
        cc = texture2D(sampler2d, vec2(texCoord.x + float(j) / float(width), texCoord.y ));
        factor = uKernel[kSize + j];
        Z += factor;
        final_colour += factor * cc;
    }
    return final_colour / Z;
}




vec4 scaleShake(sampler2D sampler, vec2 texCoord, float scaleA, float ut){
    float progress = fract(ut * 1.0);
    float scale = 1.0 + scaleA * progress;
    vec2 scaleTextureCoord = vec2(0.5, 0.5) + (texCoord - vec2(0.5, 0.5)) / scale;
    vec4 curColorL = texture2D(sampler, scaleTextureCoord);
    vec4 curColorS = texture2D(sampler, texCoord);
    vec4 resultColor = mix(curColorS, curColorL, (1.0 - progress) * scaleA);
    return resultColor;
}

vec4 hueOffset(sampler2D sampler, vec2 texCoord, float offset, float scaleA, float ut){
    float progress = ut;
    vec2 offsetCoord = vec2(offset, offset) * progress;
    float scale = 1.0 + 0.3 * progress;
    vec2 scaleTextureCoord = vec2(0.5, 0.5) + (texCoord - vec2(0.5, 0.5)) / scale;
    vec4 curColorL = texture2D(sampler, scaleTextureCoord + offsetCoord);
    vec4 curColorR = texture2D(sampler, scaleTextureCoord - offsetCoord);
    vec4 resultColor = vec4(curColorL.r, curColorR.gba);
    return resultColor;
}




vec4 stripeSwitch(sampler2D sampler1, sampler2D sampler2, vec2 texCoord, int stripeNum, float ut)
{
    float snf = float(stripeNum);
    float tstep = 1.0 / (2.0 * snf - 1.0);
    float base = exp2(2.0 * snf - 1.0);
    float n1 = pow(base, tstep * snf) - 1.0;
    float door = (pow(base, ut - floor(texCoord.y * snf ) * tstep) - 1.0) / n1;
    door = clamp(door, 0.0, 1.0);
    door = 1.0 - door;
    vec4 color;
    if( door > texCoord.x){
        color = texture2D(sampler1, texCoord + vec2(1.0 - door, 0.0));
    }else{
        color = texture2D(sampler2, texCoord + vec2(- door, 0.0));
    }
    return color;
}

vec4 matrixTransform(sampler2D sampler2d, vec2 texCoord, mat4 mat)
{
    vec4 color;
    vec2 texCoord2 = vec2(texCoord.x * 2.0 - 1.0, texCoord.y * 2.0 - 1.0);
    vec2 texCoord3 = (mat * vec4(texCoord2, 0., 1.)).xy;
    vec2 texCoord4 = vec2((texCoord3.x + 1.0) * 0.5, (texCoord3.y + 1.0) * 0.5);
    color = texture2D(sampler2d, texCoord4);
    return color;
}

vec4 dilateOnce(sampler2D sampler2d, vec2 texCoord, int width, int height)
{
    vec4 color = texture2D(sampler2d, texCoord);

    for(int i = -1; i <= 1; i++){
        for(int j = -1; j <= 1; j++){
            vec2 texCoord2 = vec2(texCoord.x + float(i) / float(width), texCoord.y + float(j) / float(height));
            vec4 color2 = texture2D(sampler2d, texCoord2);
            color = max(color, color2);
        }
    }
    return color;
}   

vec4 frameBurning(sampler2D sampler2d, vec2 texCoord, int width, int height, float ut, int times)
{
    float ex = 10.0;
    float bias_width = wiggle(times, ut,  ex / float(width), 0.5);
    float bias_height = wiggle(times, ut, ex / float(height), 0.2);
    vec4 colorR = texture2D(sampler2d, texCoord + vec2(bias_width, 0.0));
    bias_width = wiggle(times, ut,  ex / float(width), 0.3) + 0.01;
    bias_height = wiggle(times, ut, ex / float(height), 0.6);
    vec4 colorG = texture2D(sampler2d, texCoord );
    bias_width = wiggle(times, ut,  ex / float(width), 0.1) - 0.01;
    bias_height = wiggle(times, ut, ex / float(height), 0.8);
    vec4 colorB = texture2D(sampler2d, texCoord + vec2(bias_width, 0.0));
    vec4 color = vec4(colorR.r ,colorG.g ,colorB.b ,colorB.a);


    return color;
}

vec4 barDisappear(sampler2D sampler2d, vec2 texCoord, int stripeNum, mat4 mat, float ut)
{
    vec2 texCoord2 = vec2(texCoord.x * 2.0 - 1.0, texCoord.y * 2.0 - 1.0);
    vec2 texCoord3 = (mat * vec4(texCoord2, 0., 1.)).xy;
    vec2 texCoord4 = vec2((texCoord3.x + 1.0) * 0.5, (texCoord3.y + 1.0) * 0.5);

    float x = texCoord4.x * float(stripeNum);
    x = x - floor(x);
    if(x>=(1.0-ut))
    {
        discard;
    }

    return texture2D(sampler2d, texCoord);

}

vec4 blockGlitch(sampler2D sampler2d, vec2 texCoord, float ut)
{

    vec2 uv = texCoord;
    float _BlockLayer1_U = 9.0;
    float _BlockLayer1_V = 9.0;
    float _BlockLayer2_U = 5.0;
    float _BlockLayer2_V = 5.0;
    float _BlockLayer1_Indensity = 8.0;
    float _BlockLayer2_Indensity =4.0 ;
    float _RGBSplit_Indensity = 0.5;
    float _Offset = 4.0;
    float _Fade = 1.0;
    
    //求解第一层blockLayer
    vec2 blockLayer1 = floor(uv * vec2(_BlockLayer1_U, _BlockLayer1_V));
    vec2 blockLayer2 = floor(uv * vec2(_BlockLayer2_U, _BlockLayer2_V));

    //return vec4(blockLayer1, blockLayer2);
    
    float lineNoise1 = pow(rand(blockLayer1 * floor(ut * 300.0)), _BlockLayer1_Indensity);
    float lineNoise2 = pow(rand(blockLayer2 * floor(ut * 300.0)), _BlockLayer2_Indensity);
    float RGBSplitNoise = pow(rand(5.1379), 7.1) * _RGBSplit_Indensity;
    float lineNoise = lineNoise1 * lineNoise2 * _Offset  - RGBSplitNoise;
    
    vec4 colorR = texture2D(sampler2d,  uv);
    vec4 colorG = texture2D(sampler2d,  uv + vec2(lineNoise * 0.05 * rand(7.0), 0.0));
    vec4 colorB = texture2D(sampler2d,  uv - vec2(lineNoise * 0.05 * rand(23.0), 0.0));
    
    vec4 result = vec4(vec3(colorR.x, colorG.y, colorB.z), colorR.a + colorG.a + colorB.a);
    result = mix(colorR, result, _Fade);
    
    return result;
}



vec4 bokehBlur(sampler2D sampler2d, vec2 texCoord, float _Radius, int _Iteration, int width, int height)
{
    vec4 accumulator = vec4(0.0);
    vec4 divisor = vec4(0.0);

    float r = 1.0;
    vec2 angle = vec2(0.0, _Radius);
    float s = sin(2.39996323);
    float c = cos(2.39996323);
    float _PixelSizeHeight = 1.0 / float(height);
    float _PixelSizeWidth = 1.0 / float(width);
    for (int j = 0; j < _Iteration; j++)
    {
        r += 1.0 / r;
        angle = vec2(c * angle.x   - s * angle.y, s * angle.x +  c * angle.y);
        
        vec4 bokeh = texture2D(sampler2d, vec2(texCoord.x + _PixelSizeWidth * (r - 1.0) * angle.x, 
        texCoord.y + _PixelSizeHeight * (r - 1.0) * angle.y));
        accumulator += bokeh * bokeh;
        divisor += bokeh;
    }
    return accumulator / divisor;
}

vec4 grainyBlur(sampler2D sampler2d, vec2 texCoord,float _BlurRadius, int _Iteration, int width, int height)
{
    vec2 randomOffset = vec2(0.0, 0.0);
    vec4 finalColor = vec4(0.0, 0.0, 0.0, 0.0);
    float random = rand(texCoord);
    
    for (int k = 0; k < _Iteration; k++)
    {
        random = frac(43758.5453 * random + 0.61432);;
        randomOffset.x = (random - 0.5) * 2.0;
        random = frac(43758.5453 * random + 0.61432);
        randomOffset.y = (random - 0.5) * 2.0;
        
        finalColor += texture2D(sampler2d, vec2(texCoord.x + randomOffset.x * _BlurRadius / float(width),
        texCoord.y + randomOffset.y * _BlurRadius / float(height)));
    }
    return finalColor / float(_Iteration);
}




float mod289(float x)
{
	return x - floor(x * NOISE_SIMPLEX_1_DIV_289) * 289.0;
}

vec2 mod289(vec2 x)
{
	return x - floor(x * NOISE_SIMPLEX_1_DIV_289) * 289.0;
}

vec3 mod289(vec3 x)
{
	return x - floor(x * NOISE_SIMPLEX_1_DIV_289) * 289.0;
}

vec3 permute(vec3 x)
{
	return mod289(x * x * 34.0 + x);
}


vec4 radialBlur(sampler2D sampler2d, vec2 texCoord, float _BlurRadius, int _Iteration, int width, int height)
{
    vec2 blurVector = (vec2(0.5,0.5) - texCoord) * vec2(_BlurRadius / float(width),_BlurRadius / float(height));

    vec4 acumulateColor = vec4(0.0, 0.0, 0.0, 0.0);

    for (int j = 0; j < _Iteration; j++)
    {
        acumulateColor +=  texture2D(sampler2d, texCoord);
        texCoord += blurVector;
    }

    return acumulateColor / float(_Iteration);
}

vec3 taylorInvSqrt(vec3 r)
{
	return 1.79284291400159 - 0.85373472095314 * r;
}


float snoise(vec2 v)
{
	const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
	0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
	- 0.577350269189626, // -1.0 + 2.0 * C.x
	0.024390243902439); // 1.0 / 41.0
	// First corner
	vec2 i = floor(v + dot(v, C.yy));
	vec2 x0 = v - i + dot(i, C.xx);
	
	// Other corners
	vec2 i1;
	i1.x = step(x0.y, x0.x);
	i1.y = 1.0 - i1.x;
	
	// x1 = x0 - i1  + 1.0 * C.xx;
	// x2 = x0 - 1.0 + 2.0 * C.xx;
	vec2 x1 = x0 + C.xx - i1;
	vec2 x2 = x0 + C.zz;
	
	// Permutations
    
	i = mod289(i); // Avoid truncation effects in permutation
	vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
	+ i.x + vec3(0.0, i1.x, 1.0));
	
	vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
	m = m * m;
	m = m * m;
	
	// Gradients: 41 points uniformly over a line, mapped onto a diamond.
	// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
	vec3 x = 2.0 * frac(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	
	// Normalise gradients implicitly by scaling m
	m *= taylorInvSqrt(a0 * a0 + h * h);
	
	// Compute final noise value at P
	vec3 g;
	g.x = a0.x * x0.x + h.x * x0.y;
	g.y = a0.y * x1.x + h.y * x1.y;
	g.z = a0.z * x2.x + h.z * x2.y;
	return 130.0 * dot(m, g);
}


vec4 gaussianBlurWidth2(sampler2D sampler2d, vec2 texCoord, float cSize){

    int kSize = 11;
    vec4 cc;
    float factor;
    vec4 final_colour = vec4(0.0);
    float Z = 0.0;
    float kernel[50]; 
    float n;
    float sigma = 10.0;
    for (int j = 0; j <= kSize; j++) 
    {
        n = normpdf(float(j) / float(kSize), sigma);
        kernel[j] = n;
    }
    for (int j = 0; j <= kSize; ++j)
    {
        cc = texture2D(sampler2d, vec2(texCoord.x + float(j) * cSize, texCoord.y ));
        factor = kernel[j];
        Z += factor;
        final_colour += factor * cc;
    }
    return final_colour / Z;
}

vec4 subtractiveColor(sampler2D sampler2d, vec2 texCoord, float ut, int width)
{

    
    vec2 uv = texCoord;
    float _BlockLayer1_U = 9.0;
    float _BlockLayer1_V = 9.0;
    float _BlockLayer2_U = 5.0;
    float _BlockLayer2_V = 5.0;
    float _BlockLayer1_Indensity = 8.0;
    float _BlockLayer2_Indensity =4.0 ;
    float _RGBSplit_Indensity = 0.5;
    float _Offset = 4.0;
    float _Fade = 1.0;
    
    //求解第一层blockLayer
    vec2 blockLayer1 = floor(uv * vec2(_BlockLayer1_U, _BlockLayer1_V));
    vec2 blockLayer2 = floor(uv * vec2(_BlockLayer2_U, _BlockLayer2_V));

    //return vec4(blockLayer1, blockLayer2);
    
    float lineNoise1 = pow(rand(blockLayer1 * floor(ut * 300.0)), _BlockLayer1_Indensity);
    float lineNoise2 = pow(rand(blockLayer2 * floor(ut * 300.0)), _BlockLayer2_Indensity);
    float RGBSplitNoise = pow(rand(5.1379), 7.1) * _RGBSplit_Indensity;
    float lineNoise = lineNoise1 * lineNoise2 * _Offset  - RGBSplitNoise;
    
    // vec4 colorR = texture2D(sampler2d,  uv);
    // vec4 colorG = texture2D(sampler2d,  uv + vec2(lineNoise * 0.05 * rand(7.0), 0.0));
    // vec4 colorB = texture2D(sampler2d,  uv - vec2(lineNoise * 0.05 * rand(23.0), 0.0));
    
    // vec4 result = vec4(vec3(colorR.x, colorG.y, colorB.z), colorR.a + colorG.a + colorB.a);
    // result = mix(colorR, result, _Fade);

    float xx = (snoise(vec2(ut*2.0, 2.0+lineNoise))+(rand(texCoord.y+ut)-0.5)*0.1)*0.2  / float(width);
    // float xx = 0.14 / float(width);

    float rx = 2.0 * xx;
    float gx = 5.0 * xx;
    float bx = 10.0 * xx;

    float colorR;
    float colorG;
    float colorB;
    float alpha;
    vec4 color;

    colorR = gaussianBlurWidth2(sampler2d, texCoord, rx).r;
    colorG = gaussianBlurWidth2(sampler2d, texCoord, gx).g;
    colorB = gaussianBlurWidth2(sampler2d, texCoord, bx).b;
    alpha = texture2D(sampler2d, texCoord).a;
    color = vec4(colorR, colorG, colorB, alpha);

    return color;
}





vec4 fragHorizontal(sampler2D sampler2d, vec2 texCoord, float ut, float frequence, float strength, int width)
{
    // float strength = 1;
    float _Threshold = 0.0;
    strength = (0.5 + 0.5 * cos(ut * frequence)) / float(width) * strength;
    
    float jitter = rand(texCoord.y * ut) * 2.0 - 1.0;
    jitter *= step(_Threshold, abs(jitter)) * strength;
    
    vec4 sceneColor = texture2D(sampler2d,  frac(texCoord + vec2(jitter, 0.0)));
    
    return sceneColor;
}

vec4 simplexNoiseHorizontal(sampler2D sampler2d, vec2 texCoord, float ut, float frequence, float strength, int width, int height)
{
    float _Threshold = 0.0;
    strength = (0.5 + 0.5 * cos(ut * frequence)) / float(width) * strength;

    float _RGBSplit = 5000.0 / float(width);
    // Prepare UV
    float uv_y = texCoord.y * float(height);
    float noise_wave_1 = snoise(vec2(uv_y * 0.01, ut  * 20.0)) * (strength * 32.0);
    float noise_wave_2 = snoise(vec2(uv_y * 0.02, ut  * 10.0)) * (strength * 4.0);
    float noise_wave_x = noise_wave_1 * noise_wave_2 ;
    float uv_x = texCoord.x + noise_wave_x;

    float rgbSplit_uv_x = (_RGBSplit * 50.0 + (20.0 * strength + 1.0)) * noise_wave_x / float(width);

    // Sample RGB Color-
    vec4 colorG =  texture2D(sampler2d, vec2(uv_x, texCoord.y));
    vec4 colorRB =  texture2D(sampler2d, vec2(uv_x + rgbSplit_uv_x, texCoord.y));
    
    return  vec4(colorRB.r, colorG.g, colorRB.b, colorRB.a + colorG.a);
}