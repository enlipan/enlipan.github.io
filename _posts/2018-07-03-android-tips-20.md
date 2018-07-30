---
layout: post
title:  Android Tips part (20)
category: android
keywords: [improvement,android,java,js]
---



### ExceptionInInitializerError  

静态资源初始化异常.

> ExceptionInInitializerError is thrown when an error occurs within the static initializer of a class or object. 
> 
 

通常发生在静态代码块执行代码未被初始化导致. 

静态代码块: 静态代码块事实上是一个在类加载时被执行的普通代码块.   

类变量:类变量的加载有其顺序,类变量的加载分为类变量加载内存分配与类变量顺序初始化(按照类变量定义顺序初始化)两个过程.  

> Just as importantly, since ExceptionInInitializerErrors aren’t ever going to cause a problem themselves, catching such an exception always contains an actual causal exception, which is the error that was thrown within a static initializer that led to the caught ExceptionInInitializerError.


[ExceptionInInitializerError](https://airbrake.io/blog/java/exceptionininitializererror)


### Android Profile   

优化度量校验指标: 性能检测指标通过系统检测工具的性能度量工具可以快速获取一致性数据.同时可以获得其他 App 优化数据做横向对比分析.

如: 冷启动时间优化,利用系统 ActivityManager Log 做数据对比:  

{% highlight java %} 

Displayed com.souche.fengche/.ui.activity.MainActivity: +247ms

{% endhighlight %}


Quote : 

[What does “I/ActivityManager: Displayed…activity…+850ms” ?](https://stackoverflow.com/questions/32844566/what-does-i-activitymanager-displayed-activity-850ms-comprised-of/33821515#33821515)

[知乎安卓客户端启动优化 - Retrofit 代理](https://zhuanlan.zhihu.com/p/40097338)


---

#### [Understanding Compilers — For Humans](https://medium.com/@CanHasCommunism/understanding-compilers-for-humans-ba970e045877)


tokenization                   
grammars           
parsing        
and code generation


高级语言 -> (Intel)汇编 -> 机器语言(二进制代码)      
 
符号化处理 : 为了计算器能够理解程序,将程序中的符号分解为计算机自身的符号.源代码被计算机分割标记为符号并保持在计算机内存中.           
解释器: 构建抽象语法树         
代码生成: 在代码生成之前,通常会进行中间阶段处理以及最终优化获取最终的 AST.最后才利用解释器的结果AST构建汇编码 --> 为什么不直接生成机器码?为了不同CPU 体系的适配.汇编码比机器码的兼容性更强.


LLVM: 完整的编译系统中间层.-- 作为编译器的基础设施,为任意编程语言而写的程序.

---


#### [Good code vs bad code: why writing good code matters, and how to do it](https://medium.com/@navdeepsingh_2336/good-code-vs-bad-code-35624b4e91bc)



---

### Module export 与 exports

> node 中每个文件被定义为一个独立模块, 为实现各模块独立运行,变量互不干扰,消除全局影响, 各模块独立运行在闭包之中,进而实现模块隔离.

 > 模块之间通过暴露指定变量来进行模块之间的联系与沟通.

 > Node 中定义了 Module 构造函数, 每个模块都是 Module 的实例, 而 Module 实例拥有 exports 属性.


> exports 作为模块的对外输出,可以指定模块对外输出内容. 但 export 不能直接指定对象赋值.但可以对 module.exports 进行直接赋值,赋值后 modul.exports 与 exports 关联断开.


> 系统自动给nodejs 文件增加2个变量 exports 和 module, module 又有一个属性 exports, 这个exports 属性指向一个空对象 {}; 同时 exports这个变量也指向了这个空对象{}; `exports => {} <=module.exports.` 这2个exports 其实是没有直接关系的,唯一的关系是: 他们初始都指向同一个空对象{};如果其中一个不指向做个空对象了, 那么他们的关系就没有了.


[exports 和 module.exports 的区别](https://cnodejs.org/topic/5231a630101e574521e45ef8)

[exports 和 module.exports 的区别 -- zhihu](Node.js模块里exports与module.exports的区别? - lout的回答 - 知乎
https://www.zhihu.com/question/26621212/answer/60692600)
