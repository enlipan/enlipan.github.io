---
layout: post
title:   前端进阶知识(1)
category: js
keywords: [improvement,web,js]
---

#### Javascript 异步

javascript 利用主线程单线程解释执行命令;其他工作线程如 AJax 工作线程,Dom 操作线程等

JavaScript 的异步过程: 异步回调的执行,工作线程执行完毕之后通过消息传递到消息队列,主线程从队列中取出消息处理,进而获取到异步工作结果,完成与主线程的通知交互;

这里的消息本质就是异步任务执行过程中所传递的回调函数:

> 异步过程的回调函数执行一定不在当前本轮事件循环过程中执行;


{% highlight javascript %} 

// 典型异步过程 耗时的2000ms进入异步工作线程
// 异步过程结束发送消息通知主线程执行 callback
setTimeOut(function(){
  callbackaction();
},2000);

{% endhighlight %}


[并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)

[Javascript 异步编年史，从“纯回调”到Promise](https://zhuanlan.zhihu.com/p/30630902)

[Javascript 异步](https://segmentfault.com/a/1190000004322358)


#### JavaScript 原型链 

// 函数Function对象的 prototype 属性
函数的 prototype 属性指向了一个对象,该对象是利用该函数作为构造函数创建对象实例的**原型对象**;   

除开 null 对象,所有 javascript对象的都有 __proto__ 属性,该属性指向对象的原型对象;

{% highlight javascript %} 

function Person(name, age) {
    this.name = name;
    this.age = age;
}

let p1= new Person('lee',15);
console.log(p1);

// Fucntion class

console.log(p1.prototype);
// 对象的 __proto__ 属性指向构建该对象的函数对象的 原型对象
console.log(p1.__proto__ === Person.prototype);

// 原型对象的构造 constructor 属性
console.log(Person);
console.log(Person === Person.prototype.constructor);

// Function 对象
console.log(Person.length); // 函数的参数个数

//
Person.prototype.name = 'paul';
console.log(p1.name);
// 原型链
delete  p1.name;
console.log(p1.name);

console.log(p1.__proto__.__proto__ === Object.prototype); // true
// 原型的原型
// 原型对象是一个对象
console.log(Object);// Object 函数对象
console.log(Object.prototype); // Object 的原型 {}
console.log(Object.prototype.__proto__); // null null 是原型链的末端

// 函数对象
console.log(Person.__proto__); // Function
console.log(Person.__proto__ === Function.prototype); // true
console.log(Person.__proto__.__proto__ === Object.prototype); // true

{% endhighlight %}

Javascript 的这种继承方式很奇怪,总有一种不伦不类的感觉,虽然 ES6之后引入 extend 这样的模式,但是没有从根本上解决问题;

正如<你不知道的JavaScript>所指出: 这种形式更像是建立一种对象之间的关联,一个对象通过委托的形式去访问另一个对象的属性;

那为什么 Javascript 要做出如此奇特而反人类的设计? 从为什么的角度去理解原型链的设计比单纯只是知道原型链是什么可能更有用;

[Javascript原型链](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)


#### Javascript 柯里化

> 在计算机科学中，柯里化（英语：Currying），又译为卡瑞化或加里化，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。柯里化（Currying）是产生一系列连锁函数的一种方法，其中每个函数只有一个参数。

{% highlight javascript %} 

// 准备性知识 apply call
let ar = [1, 2, 3];
console.log([].slice.call(ar));
console.log([].shift.call(ar));// 删除并且返回首元素
console.log([].slice.call(ar));


// 函数的形参可以不声明
function fn() {
    console.log(arguments);
}

fn(1, 2, 3, 4);

// 柯里化
let sub_curry = function (fn) {
    let args = [].slice.call(arguments, 1); // 第0 个参数是函数调用对象 Context

    return function () {
        let newArgs = args.concat([].slice.call(arguments));
        return fn.apply(this, newArgs);
    }
};

// 柯里化本质是将参数利用闭包封装,实现链式调用,当参数匹配时则进行函数逻辑调用

function curry(fn, length) {
    length = length || fn.length; // Function.length 函数形参个数

    let slice = Array.prototype.slice;

    return function () {
        if (arguments.length < length) {
            let combinedArg = [fn].concat(slice.call(arguments));
            return curry(sub_curry(this, combinedArg), length - arguments.length);
        } else {
            return fn.apply(this, arguments);
        }
    }
}


{% endhighlight %}


[Javascript 函数柯里化](https://github.com/mqyqingfeng/Blog/issues/42)

#### Javascript 深拷贝 

{% highlight javascript %} 

function log(value) {
    console.log(value);
}

let arr = [1, 2, 3, 4];

let copyArr = arr.concat();
copyArr.push(5);

log(arr);
log(copyArr);

let objArr = [{name: 'lee'}, {age: 10}];
let copyObjArr = objArr.concat();
objArr[0].name = 'paul';

// concat 的浅拷贝, 基本类型直接拷贝,对象和数组则拷贝引用
// 浅拷贝: 对象内容改变,引用该对象的对象均被改变
log(objArr);
log(copyObjArr);

// 深拷贝: 完全拷贝对象内容
let copyObjDeep = JSON.parse(JSON.stringify(objArr));
copyObjDeep[0].name = 'lee';
log(copyObjDeep);
log(objArr);

// 自行实现拷贝?
// 遍历对象属性,将对象属性与属性值放入新对象, 引用对象则对应新对象属性值为引用地址
let shadowCopy = function (obj) {
    if (typeof obj === 'object') {
        let newObj = obj instanceof Array ? [] : {};

        // 遍历 obj
        for (let key in obj) {
            newObj[key] = obj[key];
        }
        return newObj;
    }
};

// 深拷贝的实现则借助于递归实现,当属性是基本类型,直接拷贝,当属性是对象则利用递归实现深拷贝


{% endhighlight %}

#### require.ensure()

* @ 等价于 /src 目录

默认情况下,打包时会将所有 js 代码统一打包为一个 bundle,导致加载较慢,而按需加载(懒加载),将庞大的 js bundle 分离进而在SPA运行时按需加载,提升运行时加载速度;  

> 把一些js模块给独立出一个个js文件，然后需要用到的时候，在创建一个script对象，加入
到document.head对象中即可;

{% highlight javascript %} 
  //获取 文档head对象
  var head = document.getElementsByTagName('head')[0];
  //构建 <script>
  var script = document.createElement('script');
  //设置src属性
  script.async = true;
  script.src = "http://map.baidu.com/.js"
  //加入到head对象中
  head.appendChild(script);

{% endhighlight %}


利用 webpack 的Code Splitting将代码分割为 Chunk;通过在代码编写时介入后期的代码编译分片过程;

{% highlight javascript %} 

// 利用 webpack 进行代码分片  
require.ensure([],
function(require){
    require('@/js/a)
},
chunkName
)
//a.js 文件被打包为单独的 chunk 文件,当指定了 chunkName 时则带有该名称标识;

// 当 require 多个文件,则将多个文件打包合并,如下 a/b/c 合并  
require.ensure([],
function(require){
    require('@/js/a)
    require('@/js/b)
    require('@/js/c)
},
chunkName
)

// webpack include 预加载 (懒执行)
// 也就是指定ensure所依赖的其他模块代码
require.ensure([],
function(require){
     require.include('@/js/a');//js 代码加载
     require('@/js/a')  // js 代码引入执行
},
chunkName
)

{% endhighlight %}

[Code Splitting 按需加载](http://www.alloyteam.com/2016/02/code-split-by-routes/)

[webpack代码分离 ensure 看了还不懂，你打我](https://cnodejs.org/topic/586823335eac96bb04d3e305)


#### Vue router 懒加载

{% highlight javascript %} 

// promise 
const Foo = () => Promise.resolve({ /* 组件定义对象 */ })
//es 6
const Baz = () => import(/* webpackChunkName: "group-foo" */ './Baz.vue')

{% endhighlight %}

Promise.resolve 是 New Promise 的语法糖,用于将现有对象转换为 Promise 对象

> 立即 resolved 的 Promise 是在本轮事件循环的末尾执行，总是晚于本轮循环的同步任务。

[Promise ](http://es6.ruanyifeng.com/#docs/promise) 

[Promise 迷你书](http://liubin.org/promises-book/#chapter2-how-to-write-promise)


#### Webpack 

* Codeing Splitting :  entry && chunk : 编译文件入口 entry 与 chunk(entry 所依赖的代码块)    


* Loader  :资源转换器,可以使用正则处理匹配资源,不同的资源使用不同的 loader 处理

* Plugin : 各种注册式功能插件/ 常用插件使用          

---


[webpack 从入门到工程实践](http://gitbook.cn/books/599270d5625e0436309466c7/index.html)

#### JS 内存管理  



[JavaScript 内存机制](https://juejin.im/post/5b10ba336fb9a01e66164346)

