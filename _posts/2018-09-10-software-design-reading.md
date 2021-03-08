---
layout: post
title:  A Philosophy of Software Design 记录
category: others
keywords: [improvement]
---


A Philosophy of Software Design 老爷子的原版书有点小贵,只能仔细看了三遍视频并记录.老爷子的观点实在是醍醐灌顶,非常透彻.

### A Philosophy of Software Design 学习记录

YouTube地址: 

[A Philosophy of Software Design](https://www.youtube.com/watch?v=bmSAYlu0NcY)


[A Philosophy of Software Design-slides](https://platformlab.stanford.edu/Seminar%20Talks/retreat-2017/John%20Ousterhout.pdf)


## 软件复杂性

#### 软件设计最大目标:  **降低复杂性 **

复杂性 :  所有让软件难于理解和修改的因素都属于复杂性  

复杂性来源:  代码的含义模糊(自然语言的二义性/编程语言的确定性)与互相依赖

依赖性: 某个模块的理解如果不结合其他模块就无法理解   

模糊性: 代码中的信息无法理解,重要因素不明显.  


复杂性危害: 复杂性会递增.一旦有一个错误决定会导致后续代码基于前面的错误继续实现,导致软件变得越来越复杂.(先实现软件再改进的理念根本不现实)

—> 启迪: 针对架构基本面正确的项目做重构才有意义,如果设计从一开始就是错误的,软件复杂性过高,重构牵一发而动全身会非常痛苦.  


#### 复杂性的降低: 

系统的整体复杂性,与组成系统的各个模块的复杂性, 如果将各个模块的复杂性隔离封闭在模块内部,不与其他模块进行互动,就达到了消除复杂性的目的.

如果在改变软件的时候,修改的代码越少, 软件的复杂度就越低.

—> 模块隔离性非常重要, 如果针对一块的修改,需要各个模块到处修改,实际对于整体系统来说是非常不稳定的.  

复杂性应该尽量做出模块封装, 不要暴露, 如果多个模块之间互相耦合, 就把这些模块合并,进而将复杂性对于外部模块隔离.   


#### 接口与实现 

模块分成外部暴露的接口与内部实现.

对外暴露的接口应该简单,而内部实现则可以复杂. 好的 class 应该是小接口, 大功能.大量的功能隐藏在简单的接口之下,对其他开发者用户无感知(感觉不到这个模块的复杂性).

Unix 的文件读写接口与Java 读写接口;  

#### 减少抛出错误

只有必须告诉用户的错误才抛出,其他错误全部内部处理掉,不要抛出.

一遇到问题就抛出异常,代表着增加了使用者的复杂性.”反正我告诉你出错了, 怎么解决是你的事.”

java 举例: 

String.substring 抛出异常的反例.

String.indexOf() 抛出异常的正确性.

![](http://qpncgsvxc.bkt.gdipper.com/20180914041003.png)


#### 如何做软件设计? 秘诀是什么?   

设计可以学习吗? 
谁应该学习? 
如何学习? 


![](http://qpncgsvxc.bkt.gdipper.com/20180914021404.png)




做出最好的设计没有最好的原则,并不是遵循这些原则就可以得到好的设计:但是在整个学生的课程过程中,不断的总结反思,最终得到以下一些建议: 

![](http://qpncgsvxc.bkt.gdipper.com/20180914033210.png)

* 追求更好,正常运行是不够的,必须要让复杂度最小化,系统越简单越好           
* 复杂性来源于依赖和意义的模糊性            


red flag : 标志着错误的形式,即使你不知道如何设计正确的系统,但如果你知道这些标志是走向失败的, 那么就可以尽管尝试修改直到最终消除所有的 red flag.  


![class](http://qpncgsvxc.bkt.gdipper.com/20180914021404.png)


在整个软件设计背后的核心都是为将来服务, 我们今天在设计上的所做的都是为了明天我们的开发更加容易.因此你必须有一些超前的意识. 然而我们必须意识到传统的软件问题就是我们无法很好的预见未来.因而如果想的太远也会很危险,这称之为过度设计.  


* class should be deep;   将 class 比作方块,接口作为方块的出口.(shadow class  VS deep class)  

{% highlight java %} 

 shadow class : 
 
 //类似于 javaben 的 setter /getter, 没有任何内部实现


{% endhighlight %}

shadow class:  一个非常常见的问题就是系统中存在了 too many too small too shadow class. 产生这个事情的现象就是很多人被错误的告知,方法应该越小越好.比如强制规定方法不能超过多少行?  

![](http://qpncgsvxc.bkt.gdipper.com/20180914034759.png)
 
classitis: 有些新手错误的认为类越多越好.进而错误的构建了诸多shadow class.


deep class 与  shadow class 对比: 优雅的 Unix IO 与 丑陋的java IO 封装文化.

![Unix IO deep interface](http://qpncgsvxc.bkt.gdipper.com/20180914040625.png)

java 这种丑陋的 IO 封装实现, 缺少了一些控制整体复杂度想法,在一些通用 case 上就非常困难. 无论如何你应该让一些常见的 case 操作尽可能的简单.  

比如 buffer 的操作应该是,如果我不要 buffering 再去进行额外的特殊操作.而不是时刻提醒我我要手动进行 buffer 的申请使用.

因而方法中代码的长度不是根本上的问题.即使方法内部很长,但是相对外部是干净的.这才是真正的抽象化,这才是真正重要的东西. deep interface. 

与其在方法长度上挣扎,不如首先考虑 deep abstraction. 在此之外如果方法很长这时你可以进一步考虑方法的块拆分.


![](http://qpncgsvxc.bkt.gdipper.com/20180911013911.png)

![](http://qpncgsvxc.bkt.gdipper.com/20180911013201.png)
 


#### Tactical VS Strategic Programming

针对当下还是着眼未来? 

如果你想要做出一个好的设计, working code 是远远不够的,这不是唯一的目标,光实践是不够的.相反你应该在 Strategic 战略途径上定义优秀的设计目标.

我们想构建一个好系统设计的目标在于我们在未来能够走得更远,开发的更快更容易.如果系统不是一次性的,就代表着我们在未来的长期时间段中开发的时间要远远高于当前开发所花费的时间. 

如果我们今天实现了一套杂乱的系统,或者把系统弄乱了.我们只是减慢我们自己今后的开发效率罢了.因此, 无论何时在开发时都应该尝试找到最好的方式去控制系统的复杂度.(complexity 是最重要的).你今天的花费长远看来都是值得的.

在这里最大的挑战在于人们能够衡量自己当下开发所需要的事件,但很难看到对于自己将来的好处.

![](http://qpncgsvxc.bkt.gdipper.com/20180914041217.png)


> In my experience, coding standards tend to fall into one of two broad categories. There are strategic coding standards, which are general and outcome-oriented. And there are tactical coding standards, which are specific and mechanics-oriented.

 tactical 编码标准通常说明具体且导向非常机械死板.而strategic 编码标准则只描述大体且以具体实现结果为导向,并不机械说明应该如何.
 

> The reason people want tactical coding standards is simple. They bring a modicum of consistency to a wild and woolly world. You often can't trust that the guy writing code in the next cube can code his way out of a paper bag. So when you have to take over his code after he's gone it's nice to know that, at the very least, he followed the standards. If all else fails, there is one thing that will provide sure footing as you plumb the dangerous depths of their code.



> Strategic coding standards are broad. They do not tell the developer exactly what to write. Rather they set an expectation of the kind of code that should be written, and leave it to the developer as to how exactly that kind of code should be created. In my experience, these are the kinds of standards that are okay to mandate and enforce from a management perspective. Evoke the general feel of the code you want your team to produce, and then let them use their skill, experience, and professionalism to decide how to make it happen.


> If leaders can establish strategic standards that express high-level goals for clean code and understandable designs, then they can empower their teams to find solutions to the lower-granularity challenges such as understanding each other, and reducing the friction involved in cooperation on a shared codebase. 

[Strategy vs. Tactics in Coding Standards](http://www.whilenotdeadlearn.com/blog/2011/03/strategy-vs-tactics-in-coding-standards)



---

[如何降低软件的复杂性？](http://www.ruanyifeng.com/blog/2018/09/complexity.html)

