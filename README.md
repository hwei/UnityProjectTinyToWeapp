Unity Project Tiny 编译到微信小游戏
========

总体介绍
--------

[hwei/UnityProjectTinyToWeapp](https://github.com/hwei/UnityProjectTinyToWeapp) 项目用于验证Unity Project Tiny 编译到微信小游戏的可行性。

### 前提条件
* Project Tiny 的版本是 com.unity.tiny.all@0.24
* 使用 asmjs 模式编译
* 微信小游戏的调试基础版本是 2.10.4
* 使用[Unity-Technologies/ProjectTinySamples](https://github.com/Unity-Technologies/ProjectTinySamples) 中的Tiny3D 工程作为验证对象。
* 使用[finscn/weapp-adapter](https://github.com/finscn/weapp-adapter) 代替默认的weapp-adapter。并稍加改造，让它读取本地包文件的时候自动加`.scene`后缀s。
* 在iPhone 6s 上测试运行。

### 结论
* Unity Project Tiny 的确可以编译为微信小游戏，并在**实机**上运行。
* 运行性能很低，无法接受。Draw call 非常高。
* 音频适配有问题。微信小游戏不支持AudioContext。需要手动开发音频系统。
* 触摸事件的适配是正常的。但欠缺UI 模块，交互开发比较困难。


源码目录介绍
--------
```
./Data                       // Tiny 编译结果的Data 目录，文件名增加 .scene 后缀
./js/libs/weapp-adapter      // 来自 /finscn/weapp-adapter，改造支持 .scene 后缀
./tiny           
├── Tiny3D.asm.js            // Tiny 编译结果直接copy 过来
├── Tiny3D.global.js         // 配置全局变量的代码，相当于编译结果中的 Tiny3D.html
├── Tiny3D.js                // Tiny 编译结果中的Tiny3D.js，有一些兼容性修改
└── Tiny3D.mem.scene         // Tiny 编译结果中的Tiny3D.mem，文件名添加 .scene 后缀
./game.js                    // 游戏入口
```

适配细节
--------

### `com.unity.tiny.web@0.24.0-preview.1` 包改造

这个改造可以修正Tiny 的编译结果。让它兼容微信小程序环境。

* InputHTMLLib.js
    * 删掉`document.exitPointerLock =`这一行。
    * `(this, Module)` 改成`(self, Module)`
* AudioHTML.js
    * 删掉两处 `var self = this;`
    * 把所有`this` 替换成`self`
    * `js_html_audio_Free` 函数第一行插入 `
if (!self.audioContext || audioClipIdx < 0) return;`

### `Tiny3D.js` 改造

在编译结果中删除第一行的 `var Module = Mudule;`。
这个暂时不清楚怎么通过修改Unity 包源码来修正。

### `weapp-adapter` 改造

这里用 [/finscn/weapp-adapter](https://github.com/finscn/weapp-adapter) 代替默认的weapp-adapter。
因为它支持加载本地包文件，并且容易修改。

找到`XMLHttpRequest.js` 文件中的`'filePath': url,` 改成 `'filePath': url + '.scene',`

### `Tiny3D.global.js` 内容

这个文件相当于`Tiny3D.html` 所作的事情。

* 第2行为`Tiny3D.js` 构造全局`Module` 对象，并加载`Tiny3D.mem.scene` 文件。
* 第3行修改主canvas 的ID。以便让`Tiny3D.js` 能通过`UT_CANVAS` 找到主canvas。

```javascript
const fs = wx.getFileSystemManager()
GameGlobal.Module = {
    mem: fs.readFileSync('/tiny/Tiny3D.mem.scene')
}
GameGlobal.canvas.id = 'UT_CANVAS'
```

### `game.js` 内容

这是微信小游戏入口。依次加载相关JS 文件，顺序不能错了。

```javascript
import './js/libs/weapp-adapter/index.js'

import './tiny/Tiny3D.global.js'
import './tiny/Tiny3D.asm.js'
import './tiny/Tiny3D.js'
```
