---
layout: post
title:   前端进阶知识(2)
category: js
keywords: [improvement,web,js]
---


核心知识均来源于<你所不知道的JavaScript>

### Proxy

    
Proxy 对象: 在目标对象之前架设一层拦截,handler, 外界对于该对象的访问需要通过该拦截,进而提供对于外界访问的过滤与改写.

通过在代理对象上注册特殊处理函数,在代理上执行各种操作时会执行相应的函数,除了可以执行原始的操作转发之外还能执行额外的逻辑.  

Proxy 也被称之为 代理器.


#### 代理在先与代理在后

**代理在先模式**: 操作完全与代理对象交互,通过代理对象与目标对象交互.  


**代理在后模式**: 代理在先模式的反转,让目标与代理交互,操作直接与目标对象交互,而代理对象作为最后的访问保障. 

代理在后模式通过采用原型链设置,将代理对象利用 Object.setPrototypeOf()设置为目标对象的保障.当目标对象没有对应的属性时,才通过代理对象寻找.

[从__proto__和prototype来深入理解JS对象和原型链](https://github.com/creeperyang/blog/issues/9)

#### 防御性编程(No such Method/Property)

{% highlight javascript %} 

var  handler = {get(target,key,context){}},
     proxyObj = new Proxy({},handler),
     obj={foo(){}};

Object.setPrototypeOf(obj,proxyObj);

{% endhighlight %}


[处理 undefined 值的7个建议](https://github.com/dwqs/blog/issues/64)

#### Proxy 在 RN 中的使用

**polyfill Proxy** 

> Polyfill: 抹平新老浏览器标准原生 API 的支持差距的封装实现.实现浏览器并不支持的原生API 代码.
    

> Proxy is not pollyfilled in react native by default. It works in chrome debugger because react native uses chrome js engine during debugging see Document on js environment. You may try using Proxy pollyfill.   
    
[proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill)

#### Proxy/Reflect 元编程

元编程: 在语言层面做出修改,针对编程语言的编程.


[ES6 入门-Proxy](http://es6.ruanyifeng.com/#docs/proxy)

—


## Export / Import 模块

##### 来自 Node 社区的CommonJS 规范

{% highlight javascript %} 

module.exports = {proxy};


const obj = require("fs") // 整体加载fs 模块,返回对应对象. 这种加载称之为动态加载,无法做编译时静态优化.

obj.proxy;// 获取proxy 对象

{% endhighlight %}

##### ES6 模块

ES6 模块的设计思想: 尽可能的静态化,进而可以在编译时确定模块依赖关系,获取输入输出变量.

利用静态编译时加载,做更多的静态分析,进一步实现更多的优化与js 语法拓展.

**export**

* ES6 的导出基于文件模块,一个文件一个模块.  
* 针对模块暴露的 API 是静态的,无法在暴露之后动态修改.           
* ES6 暴露的模块是单例的,也就是说模块的导出是针对导出变量(对象)的绑定(类似于指针),export 的模块只有一个实例,其中维护了暴露模块的状态.每次其他模块导入时,引入的都是同一个实例的引用.这里与 ES6之前有非常大的差异,在 ES6之前的属性赋值是利用值赋值,而不是引用绑定,也就是如果对应导入变量的更新不修影响 API 对象的公开复制.         
* 导入模块和静态请求加载在原理上形成相同的效果,如果在浏览器中则是网络阻塞加载.

* 无 export 导出的一切都被隐藏在模块内部保持私有属性.

{% highlight javascript %} 


export default express(表达式);

export {express  as  default};

{% endhighlight %}

看起来二者一样,但是实际上第一种导出的是在导出时函数表达式的绑定,即使之后在对应导出模块内部给 express 重新赋值赋值,并不会干扰导出.而第二种则隐含了导出的是绑定到 express 的标识符,也就是绑定行为.  

* 不允许双向绑定,也就是导入的变量不允许被修改.


**import**

`import  标识符  from "模块指定符"`


标识符:

标识符必须匹配模块的 export API.

与export 类似,import 也有 es6推荐的语法糖: 

{% highlight javascript %} 

import foo from "foo";

import {default as foo} from "foo";

// 混合引入 default 与其他
import foo, {a,b,c} from "foo";

//命名空间导入,将模块中所有暴露的 API 全部导入到单个模块命名空间绑定
//命名空间的导入,要么指定导入模块全有要么全无 
import * as foo from "foo";


{% endhighlight %}


所有导入的绑定都是不可变的,如果尝试对于导入之后的模块进行赋值操作,会抛出异常 TypeErrors

指定符:        

模块指定符必须是字符串字面量,且由于 import 需要被用于静态分析,其中也不能引入变量. 

模块加载器将该指定符解释为决定去何处寻找所需模块的指令.(URL 路径/本地文件路径)

#### export 与 module.exports 以及 require 与 import

module.exports 遵循 CommonJS 规范;

require 使用相当于 module.exports 对称使用方式, module.exports 内容是什么, require 获取的结果就是什么,相当于吧 require 与 module.exports 进行平行空间的位置重叠. 


与之对应的 import 则与 require 运行时赋值不同, import 是编译时,必须防止在文件头,使用格式确定,不会整个模块运行后赋值给某个变量,性能相对 require 更好.

但需要注意的是,如果利用 babel 做 transpiling 转译, import 语法为了兼容浏览器会被转码为 require. 这也解释了为什么用 module.exports, 在引入时也可用 import,因为本质是转换成了 require. 


> * module.exports 初始值为空对象{}    
> * exports 指向 module.exports 的引用        
> * require 返回 module.exports     



[exports 和 module.exports 的区别](https://cnodejs.org/topic/5231a630101e574521e45ef8)



### ES6  Class

本质上 class Foo 表示创建了一个函数名为 Foo 的函数;而 extends 则实际是建立了两个函数原型之间的委托链接.

### Static 

静态方法直接在类上进行,不能在类实例上调用.

static 成员不在类的原型链上,而在函数构造器之间的双向链上.实际上js 中是没有严格意义的静态类变量/类方法,因为没有严格意义的类.直接用类名(构造函数名)访问的属性,实际上也就是绑定在构造函数对象上的属性与方法,也就是所说的静态属性.

{% highlight javascript %} 

// 定义在构造函数上的方法与属性会被定义为静态的
// 定义构造函数
function StaticMethod() {
}

StaticMethod.func = function () {
    console.log("static method");
};

StaticMethod.func();

StaticMethod.func();// 静态函数.
StaticMethod.propName = "propName";// 静态属性

//原型方法/属性
StaticMethod.prototype.propName = "prototype_propName";
StaticMethod.prototype.func = function(){
    console.log("prototype func");
}


{% endhighlight %}



### 原型链



### 委托 






