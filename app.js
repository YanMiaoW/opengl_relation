/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


var BackgroundLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;
        // this.sprite = new cc.Sprite("res/background.jpg");
        this.sprite = new cc.Sprite("res/black.png");
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite);
        return true;
    }
});

// var BackgroundLayer2 = cc.Layer.extend({
//     sprite:null,
//     ctor:function () {
//         this._super();
//         var size = cc.winSize;
//         // this.sprite = new cc.Sprite("res/girl3.jpg");
//         this.sprite = new cc.Sprite("res/background.jpg");
//         this.sprite.attr({
//             x: size.width / 4,
//             y: size.height / 4
//         });
//         this.addChild(this.sprite);
//         return true;
//     }
// });

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new BackgroundLayer();
        // var layer = new BackgroundLayer2();
        config = '{\"type\":4,\"name\":\"xxx\",\"count\":180,\"s_count\":0, \
        \"data\":\
        [{\"name\": \"res/girl1.jpg\"},\
        {\"name\": \"res/girl2.jpg\"},\
        {\"name\": \"res/girl3.jpg\"},\
        {\"name\": \"res/girl4.jpg\"},\
        {\"name\": \"res/girl5.jpg\"},\
        {\"name\": \"res/girl6.jpg\"},\
        {\"name\": \"res/girl7.jpg\"},\
        {\"name\": \"res/girl8.jpg\"},\
        {\"name\": \"res/girl9.jpg\"},\
        {\"name\": \"res/girl10.jpg\"},\
        {\"name\": \"res/girl11.jpg\"},\
        {\"name\": \"res/girl12.jpg\"},\
        {\"name\": \"res/girl13.jpg\"},\
        {\"name\": \"res/girl14.jpg\"},\
        {\"name\": \"res/girl15.jpg\"}]}';
		var obj_config= JSON.parse(config);

        // var layer2 = new Mod13Layer(obj_config);
        // var layer2 = new Mod14Layer(obj_config);
        var layer2 = new Mod15Layer(obj_config);
        // var layer2 = new Base2Layer(obj_config);
        // var layer2 = new TestNew(obj_config);s
        // var layer2 = new mod12Layer(obj_config);
        // var layer2 = new mod8Layer();
        this.addChild(layer);   
        this.addChild(layer2);
        // this.addChild(layer3);
    }
});

