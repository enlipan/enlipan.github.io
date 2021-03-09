---
layout: post
title:  groovy and Gradle
category: android
keywords: [improvement,android]
---

**写在最开头**

从Eclipse到AS进化过程中，构建工具也从Ant随之进化到Google所钦定的Gradle，要明确的一点是Gradle作为一个基于Groovy语言的动态DSL，有其所设定的规则，其本质是一个构建工具，一个编程框架，同时有着依赖管理版本构建等强大的功能；正如Gradle Doc中所表达：

> Build Scripts are code

Gradle作为编程框架，有其API，gradle的学习也不能仅仅依赖死记硬背，加一行减一行这类不科学的学习方式，而应该站在更高的角度，借助其Doc以及Api去完成自己的目的；

从最开始接触Gradle莫名其妙开始每次遇到问题，不明就里，为什么加一行可以减去一行又不可以，死记硬背，遇事无法有自己的理解去排查问题，实在是走了不少弯路。到最后痛下决心，逐步开始进一步学习Gradle其规则，将其作为一门工程实践工具来学习，看文档，了解语法，不再一问三不知全靠Google答案这样或者那样，改变看待Gradle这一工具的思路，逐步才有了一种豁然开朗的感觉，明白诸多为什么，为什么可以这样写不能那样写，这样写有没有类似的写法，是不是用了什么语法糖，是不是可以自己选择自己觉得更加清晰的写法等...


### Groovy

Groovy 是运行在JVM虚拟机上的动态/脚本语言；Groovy是动态类型但并不是弱类型，只是相对于Java其将类型的检查推迟到了运行期，在运行期如果类型错误同样会报出对应的错误；

#### Groovy Diff Java

* Groovy 是Java的超集，Java程序在Groovy环境中能够很好的运行，但反之则不一定可以

* Groovy类成员变量会自动生成Getter以及Setter属性，如 person.name -> person.setName()，针对Person类中的name属性，可以利用setName的函数对其赋值，该函数由groovy自动添加，针对这种特性我们在查询groovy api的时候要尤其注意 class.feild 的doc中可能并没有feild这一属性，只有其对应的setter函数，其实是等同的；    

* Groovy 中的String - GString：`"$foo + foo = ${foo + "foo"}"`

* Groovy 作为动态语言，其声明函数与字段可以用def的形式不直接指定类型，当然也可以借用java的形式指定类型，当函数不指定类型时，其函数的最后一个表达式值将作为函数的返回值。不指定的类型默认为Object；

* Groovy语言的脚本语言特性，其无需像Java那样通过构建对象调用函数亦或是调用Main才能执行，但当利用groovyc(类似javac) 编译groovy源码为class之后，反编译可以看出，groovy通过编译器生成了java执行环境，将函数对象包裹到main函数中call调用执行

* Groovy中大括号被保留用于闭包，其数组的初始化需要利用[]执行，而数组的声明也是非常有特色，如 int[] nums 声明为 数组对象，def nums = [] 则将nums声明为了 ArrayList对象，需使用 def nums = [] as int []声明为数组对象；

* Groovy中的 == 操作以及 is 关键字

* Grovy 中的闭包以及各类IO操作语法糖都非常简洁，但使用稍有不慎也同样容易引起无法理解的错误，同时闭包的委托机制也是需要额外注意的，后面会详细说到；

#### Closure

闭包是Groovy中的重点部分，Groovy中的闭包非常简洁，简洁到如果不了解其规则，会在编写Gradle脚本的时候，看得莫名其妙；

闭包作为胶水代码，对比Java的匿名内部类而言有明显的简洁性，灵活性，以及复用性优势，闭包通常是对于其他代码片段的优化以及增强；

>  闭包通常应该保持短小，保证其内聚性，在设计时闭包应该作为函数的附加代码片段执行，谨慎的使用闭包的动态属性，以及编写过于复杂的闭包代码片段；



闭包的语法糖

闭包的参数传递：

单参数闭包： 默认 it

多参数闭包： 借助有效的变量名传递，针对参数，可以指定类型也可以不指定，不指定类型默认Object，但如果命名了有效的参数名可以很好的起到类型指示作用，起到精简代码的作用；

{%  highlight groovy %}

showTime(){
  it ->
    closure...
}

showTime(){
  todayData,tomorrowData ->
    closure...
}

{%  endhighlight %}

对于作为函数参数的闭包，如果闭包是函数的最后一个参数，则函数的 ()可以省略：

{%  highlight groovy %}

showTime{
  it->
    closure...
}

{%  endhighlight %}


若只有当参数，it也可以省略：

{%  highlight groovy %}

showTime{
  closure...
}

{%  endhighlight %}

闭包的curry与 rcurry，对于闭包的多参数，可能出现参数的默认设定的情形，通过curry函数绑定一个或多个连续参数作为默认参数，在后续调用时，则只需要传入剩下的参数即可调用闭包；

##### Closure Delegate    

闭包的委托机制也是闭包非常巧妙的部分，如果不理解很容易错误的使用闭包，对于闭包有三个上下文环境，this，owner,delegate，其委托上下文环境默认为：OWNER_FIRST，当然可通过设定其resolveStrategy 参数的形式去更换，这段代码：

{%  highlight groovy %}

class GroovyGreeter {
    String greeting = "Default greeting"
    def printGreeting(){println "Greeting: $greeting"}
}
def myGroovyGreeter = new GroovyGreeter()
myGroovyGreeter.printGreeting()
myGroovyGreeter.greeting = "My custom outer greeting"
myGroovyGreeter.printGreeting()
def greetingClosure = {
	println greeting
	println this.class
	println owner.class
	println delegate.class
    greeting = "Setting the greeting from a closure"
    printGreeting()
    delegate.greeting = "setting the greeting from delegate.greeting..."
    printGreeting()
}
// greetingClosure() // This doesn't work, because `greeting` isn't defined
greetingClosure.delegate = myGroovyGreeter
// greetingClosure.resolveStrategy = Closure.DELEGATE_FIRST
greetingClosure() // This works as `greeting` is a property of the delegate

{%  endhighlight %}

通常情况下，闭包的owner == this;但当出现闭包嵌套的情况，owner则会出现变化，对于闭包的上下文环境，其查找顺序默认为 this -> owner -> delegate;通过制定其 resolveStrategy 更改其上下文环境的查找策略；

### Gradle

As delegate it's build process to Gradle:  Gradle Android Plugin

DSL作为专门针对莫伊特定问题的计算机语言，

#### DSL

Domain Special Language： 领域专用语言

通常DSL是简洁的，DSL强调对于相关业务的的紧密连接，结合思维上的简洁性，使我们容易上手看懂其代码所对应的业务意义，也使得业务模型和程序模型之间具有较简洁的对应关系；大多数有Eclipse开发经验的同学，在从Eclispe转到AS时，看其Gradle脚本是较为清晰的，如其versionCode等配置都是非常简洁清晰，且和业务紧密联系的；

DSL的文本代码属性，鉴于文本代码的易于修改以及修改效率高，但在复杂业务领域中文本代码并不足以用很好的形式去表现业务领域概念，因而DSL又不能局限于文本代码的特性；同时DSL的描述性是非常强的，大多数DSL的语法都是尽可能的去接近自然语言（DSL的非程序员编程语言属性），通过类自然语言推动业务人员与开发人员的沟通；**Groovy丰富的语法糖支撑着Gradle的文本代码以及自然语言属性**

一个很是有意思的是，恰恰是Gradle具有的DSL的这些特性，导致我们容易上手，也很容易不轻易之间就走上弯路，进而忽视了Gradle的编程框架的特性，将其作为自然语言看待，忽视其Api以及编程语法规则，导致加一行可以，为什么不知的现象的存在；

#### Task

{% highlight groovy %}

gradle tasks --all

group  
---
TaskName - Description

// Define Task
task myTask {
    description("Description") // Function call works
    //description "Description" // This is identical to the line above
    group = "Some group" // Assignment also works
    doLast { // We can also omit the parentheses, because Groovy syntax
        println "Here's the action"
    }
}

{% endhighlight %}


##### task 依赖

- dependsOn

- finalizedBy

- mustRunAfter

- Project 中Task 匹配依赖：


{% highlight groovy %}

task getEquipped {
    dependsOn tasks.matching{ task -> task.name.startsWith("mathingName")}
    doLast {
        println "All geared up!"
    }
}

{% endhighlight %}

中断Task — 继续其他Task：

- StopExecutionException

- task.enable


##### LifeCycle

* initial

* config: DAG(有向无环图)

* excute





##### AS 应用：

{:.center}
![android_variant_mergeres](http://img.oncelee.com/assets/img/20170505/android_variant_mergeres.JPG)

---

Quote:


**Gradle Doc**

**Groovy Doc**

《Groovy程序设计》

[领域专用语言(DSL)迷思](http://www.infoq.com/cn/articles/dsl-discussion#anch23878)

[Groovy Doc](http://groovy-lang.org/documentation.html)

[Introduction to Gradle](https://www.bignerdranch.com/blog/introduction-to-gradle/)

[Gradle, the Applidium way](https://en.fabernovel.com/insights/tech-en/gradle-the-applidium-way)

[深入理解Android之Gradle](http://blog.csdn.net/innost/article/details/48228651)

[Android项目中如何用好构建神器Gradle？](http://www.csdn.net/article/2015-08-10/2825420)

[Android 必备技能：我和Gradle的约会](http://www.println.net/post/Android-Gradle)

[Android打包的那些事](http://www.jayfeng.com/2015/11/07/Android%E6%89%93%E5%8C%85%E7%9A%84%E9%82%A3%E4%BA%9B%E4%BA%8B/)
