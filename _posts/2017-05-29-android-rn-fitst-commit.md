---
layout: post
title:  React Native First Commit
category: android
keywords: [improvement,react,android]
---

最近一直忙的不像样，连续半个多月一直在开发公司的RN模块，好在前面已经有同学有相关经验踩了些坑，但自己还是狠狠的突击加急了一番才完成任务，这里借着这一番高强度的开发之后总结一番：

### JavaScript重点:


### null 与 undefined

js中的null是一个很神奇的东西，很有必要弄懂，否则在编程中会很纠结，尤其是判断时不知道该使用谁，尤其是写习惯了java的同学；尤其是typeof null 是 Object，而且null == undefined，实在是傻傻分不清楚；

事实上，如果深入了解之后，可以简单的将null看作定义为空的变量，而undefined则更应该被看作未定义；这样一来二者就有了区别；

同时在JS中null与undefine在if语句中会自动转换为false，这也是很灵活的一点，事实上，在我写js的过程中很多时候都由于JS的过于灵活而让我这个Java选手很是郁闷，写出了很多不够专业的代码，这点在随着我对js的逐步深入的了解之后有了一些改善；

#### 作用域
在ES6引入let之前，JS中只有对象作用域以及函数作用域，而缺失块级作用域，这就意味着在传统Java等语言中 if以及for后面的{}的作用域在JS中并不存在，进而带来的作用域升级问题，这在最初我写JS中式非常恶心的一块，但在有了let之后这一现象被弥补了上来，let引入的块级作用域意味着该变量仅在该{}中有效；

Js的执行环境在程序运行时创建，这与词法作用域有本质差异，执行环境才是真实的内存储值区域，而执行环境的配置也是层层包裹，内层的执行环境可以访问外层执行环境，有一种同心圆由内到外的感觉；

函数在每次执行时都会构建独有的自有执行环境，在复杂的函数执行时，可以通过简单的绘制其执行环境，确定其引用的变量或者属性究竟位于哪一层次，是属于自身的还是全局的；

#### 闭包   

理解了作用域之后，闭包就好理解了，闭包本质上是函数作用域的扩张，让原本在该作用域内无法使用的变量以及对象可以被使用，访问；

闭包代表着其外部作用域执行完毕之后，其函数作用域通过闭包得以保存，闭包保存了函数执行时的执行环境，而内层执行环境又是可以访问外层环境，进一步闭包又保存了其外部执行环境；

由于闭包可以访问父作用域的变量，错误的使用闭包作用链表会导致内存泄漏问题；


在不使用闭包的情况下，一个函数执行完毕之后，其作用域随之消失，函数作用域内的局部对象会被销毁回收，但有了闭包之后，该函数作用域被另一个函数的执行环境所引用，进而使得在另一个函数执行时可以访问到该函数的作用域空间，也当然就可以访问到闭包中的变量；





#### this

函数在执行时，会开辟空间构建函数的作用域，函数的作用域与函数的定义时无关，而只与函数执行时相关，事实上函数只是一个对象，函数可以被赋予任何对象执行，因而函数中定义的this对象是可以变化的，谁引用该函数执行，则其对应的this则变更为该对象；


#### 箭头函数

箭头函数作为匿名函数的语法糖，与带function声明的函数还是有一些差异的，尤其是函数中让人困惑的this指针问题，箭头函数内部没有自身的this值，其this继承自外部作用域；

在定义函数中我们经常用这样的hack实现去明确函数对象的this：

{% highlight JavaScript%}

{
  ...
  method:  function (){
      var that = this;

      that.thatmethod()

      ...
  }

}

{% endhighlight %}

这是一段很郁闷的代码，如果我们将that换成this.thatmethod，则通常会产生错误，因为这里的this对象是window全局对象，而并不是我们所期望的继承自外层函数的this对象，在内层函数中如果不用这种方式，就需要使用内层函数的执行 .bind(this)的方式，显示的绑定this域；

而如果我们使用箭头函数，则没有这一问题，箭头函数中的this域来自外层作用域，而外层作用域的this是其调用者，进而有了this域的统一性；


#### 原型 prototype

Js中继承通常利用原型来实现，Js中的原型有些类似 Groovy中的Delegate代理委托机制，当在对象中某个属性或函数没有找到时，则追寻原型链向上寻找，直至根Object对象；需要注意的是Js中的原型对象有几种，如数组的Array对象以及函数的Function对象；但二者的原型都为Object对象；

Object中有诸多属性，如 constractor 以及 toString等属性；



#### Js中的重载     

重载是什么？事实上重载可以看作是不同的函数，只是名字相同而已，重载函数具有不同的方法签名；但在JS中却原声没有函数的重载逻辑，但通常有两种思路去实现JS的函数重载逻辑，一为从方法签名着手，不同的方法签名不同的的参数长度以及参数类型，进而区分函数的执行逻辑；

另一种思路更加巧妙，其借助Js的闭包特性保存了多个函数；有点类似 js中 this that的逻辑：

{% highlight Javascript %}

function addOverrideMethod(addedObject, functionName, fn) {
    let oldFunction = addedObject[functionName];
    addedObject[functionName] = function () {
        //Function.length Specifies the number of arguments expected by the function.
        if (fn.length === arguments.length) {
            return fn.apply(this, arguments);
        } else if (typeof  oldFunction === 'function') {  // 这里用了闭包的特性，后添加的function属性会保存前一个function属性，层层保存
            return oldFunction.apply(this, arguments);
        }
    }

}

{% endhighlight %}

#### Promise

Promise 是一种很优秀的编程实践方式，早在ES6之前就有各种方式去实现Promise，ES6更是将其标准化。Promise的核心在于分离了函数的执行逻辑与对于函数执行结果处理的逻辑，二者分离之后在编程思路还是在代码方面带来了更加清晰的实践；事实上在构建Promise时有一种让我在写RxJava的感觉，当我在看了Promise的链式串联结构之后，更是加深了我写RxJava的感觉；

事实上如上所说，Promise并不是一个函数，而是一种编程形式，Promise意味承诺，预先告知你未来可能发生的事情，进而规划好成功失败后的处理逻辑，无需等待结果，进而也就没有了异步的等待感知，化异步为同步的感知；

async 与 wait:

async函数作为 Generator函数的语法糖，async组合wait使用时，wait关键字表明该函数含有异步逻辑，先返回，等待触发的异步逻辑完成后继续后续函数体逻辑，async函数返回一个Promise对象，进而可以使用Promise的链式 Promise.then逻辑处理；

需要指出的是在默认的node环境中是不支持 async这类异步操作，需要借助Bable等解释器；


#### ES6 中的模板字符串



### React重点知识：

JSX

JSX是一种混合JS与HTML的语法，但在最终React会将JSX解析为对应的DOM树，事实上我们可以完全的利用JavaScript代码创建DOM元素，但是这样的代码可读性非常之差：

`var child1 = React.createElement('li', null, 'First Text Content');`

鉴于Dom元素在丰富之后，满屏幕的这类代码是非常痛苦的，因而JSX随之诞生，利用JS中嵌套的HTM元素来快速构建虚拟DOM，JSX最终通过React中的翻译器转换为JS，最终由浏览器执行，构建DOM渲染，所以React事实上并不依赖于JSX；

JSX中的{}特性，{}中可以构建JS表达式而JS中又可以混合HTML，一种无限JS与HTML混合的语法机制；


#### React Dom

React的虚拟Dom，以及高效　Diff算法，通过内存中的Diff算法，减少实际的Dom对象操作，进而提升性能；

#### ReactNative 组件生命周期

props || state

提到组件的生命周期不能不提其props以及state属性，React中抽象出了props作为组件之间联系的接口；通常组件之间很少有对外公开函数，props作为父子组件之间的通信桥梁；通常可以认为外部传入的props是该组件的只读属性，无法自身做出修改，只能外部组件调用该组件时在外部修改后传入；

state属性则是组件内部状态属性，主要用于存储逐渐自身维护组件状态所需要的数据；组件中默认定义了setState函数，每次调用时更新组件的状态触发组件的render函数重新渲染UI状态；需要注意的是Ract中的异步问题，render的异步与setState的异步性，为了保证React的性能，可能会批量执行多次setState转变以及合并render Dom渲染；

在构建React应用时，考虑最小可变state数据对象模型的集合是最优先事项，如果我们借助于Mobx或者redux等框架管理，则是区分哪些对象需要被可观测，不必要的state对象在改变是会影响render，进而产生冗余绘制，影响性能；

*  defaultProps

*  constructor(props)

*  Mount

*  render  

*  Update

*  unMount

ReactNative Web Component

Web组件化是一种趋势，但是作为一个原声Android程序员，在层层抽象构建Reat组件的过程中，与以往抽象View层层封装的思路是相近的，所以写起来也是比较畅快，同时其样式的调试更加迅速，结合自带的Inspector工具，实在是开心的不行；从最初的摸摸索索到后面熟悉之后写UI的效率竟然是一点不比原声差，值得说的是这还是在我仅仅使用RN开发UI一月不到的时间，很多UI特性还需要我去Google或者翻阅官方文档去看检索，甚至有的特性在文档中没有还需要看CSS的一些特性，所以说RN的UI开发效率真的非常之高；

但同时不得不说的是其Android 中 ListView的复用机制的缺失，导致的Android中列表的卡顿问题还是比较恶心的；这一块一般都是要自己实现一个，通过借助原生RecylerView构建；

### MobX

好像没啥说的，几个核心的概念：

* observerable

* observer

* computed   利用conputed属性可以进行多值的组合，进而实现值条件的筛选，减少Render次数，提升性能；

* action  





### 其他

CSS在ReactNative中使用可以使用的非常精妙，很多特性可以使用CSS快速的绘制，如边线，绘制各类形状等都是非常简洁快速的，简直让我等操作Canvas的脑洞大开；



---

Quote：

#### React：

ReactNative Doc

MobX Doc

InfoQ-深入浅出React


#### JS语言相关：

你所不知道的Javascript

ES6 入门经典

InfoQ- 深入浅出ES6


#### 视频：

[Udacity Advanced  Object-Oriented JavaScript]

#### 文章：

[ReactJs入门教程](http://www.cocoachina.com/webapp/20150721/12692.html)

[React Native 组件生命周期(ES6)](http://www.jianshu.com/p/72f8c1da0b65)
