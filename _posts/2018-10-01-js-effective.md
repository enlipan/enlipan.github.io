---
layout: post
title:   编写高质量的 js
category: js
keywords: [improvement,web,js]
---

### Effective Javascript 

* 了解你所使用的JavaScript 版本差异,版本转译为什么在Javascript 这么重要.        
* Javascript 浮点数, Js 中的数字都是 Double 类型,js 中的计算都是讲数字转换为32位二进制表示后进行混合计算, 注意浮点数二进制表示的与计算的不准确性, 最好使用整数进行精度计算. 

`(0.1 + 0.2) + 0.3 !== 0.6`
        
* 隐式转换,隐式转换掩盖问题,一旦计算时出现问题,应该层层寻找中间结果,直到找到`出错前的最终节点`.   

+ 的处理, toString 与 valueOf 函数.        

真值表达式处理,隐式计算. js 中除了 false/0/-0/ “”/NaN/null/undefined 之外都为真.

* Javascript 中的原始类型,布尔/数字 number/ 字符串/null/undefined     

typeof null  === object 


* == 运算符的强制转换规则,避免对混合类型使用,增加理解的难度,需要记忆转换规则才能正确理解代码的执行.             
* 自动分号插入有其规则: 

> 分号仅在随后的输入无法正确识别时插入            
> 分号仅在 } 之前,一个或多个换行之后以及程序输入结尾插入.              

为减少程序的理解复杂度,WebStorm 等 IDM 会警告未添加分号的语句.  

* Java 与 Javascript 的 16位编码字符串.而对于扩展字符则使用代理表示,利用一对16位编码共同编码,扩展字符的 length 属性会与预期不一致.

**UTF-16本质也是一种可变长度的编码.**      

— 

### 作用域相关  

* 警惕全局变量与全局作用域.语言层面为什么要从全局作用域引入局部作用域的概念?全局作用域的问题在哪? 

> 不利于模块化,会造成模块之间的耦合问题.                
> 大型应用的命名冲突问题,以及后续维护问题.            

全区命名空间的不可避免的使用,用来维护模块之间的交互,因而如何管理全局作用域非常重要.  

* 合理利用 lint 检测不规范的全局变量.没有 var 声明的变量会被升级为全局变量,需要警惕.    


* 闭包的重要性,熟练掌握闭包.                 
> 闭包允许函数使用在当前函数之外定义的局部变量.内部函数拥有外部函数的作用域空间,作用域的寻找从内向外.                                
> 闭包本质是作用域的扩展.即使外部函数已经返回,内部函数依旧可以使用外部函数中定义的变量.        

JavaScript 函数值包含了比函数调用被执行时所需要的代码更多的信息.函数值在内部存储函数可能会引用的定义在其内部封闭空间的变量.

函数可以引用定义在其作用域内的任意变量,包括参数变量与外部函数变量.       
> **闭包是外部函数变量的引用**,而非拷贝,也就是说值可以被更新.             

* 理解变量声明的提升.  

ES6之前的时代 JavaScript 没有块级作用域,在 ES6才补充了 let; 如果在函数中的 for 循环中定义的 var 变量,事实上是函数级变量,而非 for 代码块的块级变量. 

例外:  Catch 异常时的变量,仅仅作用于 Catch 代码块.  


* 使用立即调用的函数表达式创建局部作用域    

{% highlight javascript %} 

function wrapElements(a){
  var result = [];
  for(var i = 0, n = a.length; i< n; i++) {
    result[i] = function(){
      return a[i];
    }
  }
  return result;
}

console.log(wrapElements([10,20])[0]())


{% endhighlight %}

闭包使用外部变量的引用,所有返回的function闭包共享插槽 i;

利用立即调用的函数表达式构建块级作用域,IIFE.

* 慎用 eval, 间接调用优于直接调用.警惕对于作用域的破坏力. 


—

### 对象与原型: 

        

* 理解 JS 基于原型的继承,prototype/ __proto__/getProtoTypeOf()

>  C.prototype 用于建立由 New C() 构造函数创建的对象的原型           
>  obj.__proto__ 是获取对象 obj 的原型对象的属性                
>  Object.getPrototypeOf(obj) 是获取obj 对象原型的非标准方法    


* __proto__ 的非标准化,不推荐使用,建议转而使用 Object.getPrototypeOf()     
* 始终不要修改 __proto__ 属性的值,而使用 Object.create() 为新对象设置自定义原型              


* 注意构造函数不使用 new 函数直接调用的非特殊场景,构造函数中的 this 会变成全局变量,利用 Object.create() 增强构造函数的健壮性,防止误用构造函数                

{% highlight javascript %} 

function User(name,passwd) {
  var self = this instanceof User ? this : Object.create(User.prototype);
  self.name = name;
  self.passwd = passwd;
}

{% endhighlight %}


* 公有函数存储在原型中可以优化内存使用,减少函数副本的使用             

* 利用闭包隐藏对象信息          

* this 变量的隐式绑定, this 作用域由其最近的封闭函数确定.         

* 避免继承 ES 标准类.某些内置属性无法被正确使用.

* **原型与对象,对象定义了提供的能力,原型提供能力实现细节. 注意 hasOwnProperty 的使用造成的超视距依赖,检查细节会导致在独立的组件之间形成不可见的依赖.如果不可控的对象属性更改,会导致其他不可见组件被影响,这种间接依赖的引入尤其需要慎重.**     

* 在子类的构造函数中调用父类的构造函数,注意子类构造函数的链式调用,以及子类原型对象的指定. 

{% highlight javascript %} 

Actor 是 SpaceShip 的父类: 

SpaceShip(){
    Actor.call(this);
}

// 返回继承自 Actor.prototype 原型的对象
SpaceShip.prototype = Object.create(Actor.prototype);


{% endhighlight %}

— 
### 库与 API 设计

* 保持一致的约定,约定的范畴包含: 平台约定, 开发常识, 以及库中的变量, 函数等约定 

* 将 undefined 理解为 “未设置值”.     

* 由于参数蔓延导致函数的可读性,可维护性下降, 多参数问题无法正确得到理解.借助参数的选项对象,帮助参数自解释,另一方面选项对象中的参数是可选的.
  * 副作用是: 实现一个接受选项对象的函数比普通函数需要做更多的处理工作.    
  * JS 库函数的基础函数: 抽象 extend 函数,接受 target 对象和 source 对象, 将后者属性复制到 target 中.

{% highlight javascript %} 

function extend(target,source){
  if(source) {
    for(var key in source) {
      var val = source[key];
      
      if(typeof val !== "undefined") {
        target[key] = val;
      }
    }
  }
}

{% endhighlight %}


* 避免不必要的状态   
  * 无状态的 API 更容易上手, 状态之间的影响对API使用者更加复杂         
  * 有状态的 API 通常需要额外的配置属性辅助,有状态的API 应该标识出操作与哪些状态关联     


* 谨慎使用强制类型转换   
  * 根据参数类型重载的函数中避免强制转换参数           
  * 防御性编程: 以额外的检测来抵御潜在错误,一旦遇到错误,检测能够帮助尽早的捕获错误的出现,使问题更容易被调试诊断.    

* 数组与类数组区分    
  * API 不应该重载与其他类型参数有重叠的类型        

* 通过支持方法链式调用的形式去消除中间变量可以让程序更加简洁,避免啰嗦的重复声明.   
  * 在无状态方法中返回新对象支持方法链        
  * 在有状态方法中返回 this 支持         

      
### 并发  

* 不要使用阻塞 IO 事件. JS 并发接受事件,但使用事件队列按序列处理事件.     

* 异步事件的有序处理逻辑, 使用异步嵌套事件? 回调地狱的处理.   

* JS 事件发生的序列不可预知.当一个应用程序依赖特定事件顺序才能正常工作时,这个程序就遭受数据竞争(多个并发操作可以修改共享数据结构, 取决于并发操作的发生顺序).  

* **在异步回调函数中应该确保回调函数异步执行. 如缓存逻辑中如果存在缓存也不应该立即同步的执行回调逻辑. 同步调用异步逻辑会让外部回调不可控,扰乱预期的操作序列, 导致意料之外的交错代码. 同时让异常无法正确抛出.**   

