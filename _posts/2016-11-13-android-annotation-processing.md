---
layout: post
title:  Annotation Processor
category: java
keywords: [anroid,java]
---

### Annotation Processing 是什么？

Annotation Processing是一个强大的自动代码生成工具,可以减少重复代码的编写—— 优秀的工程师借助一切工具来提升效率， Annotation Processing 发生于JVM虚拟机编译java源码的编译阶段 —— **Compile Time**.Annotation可以用来卸载Class信息，method信息，fields，parameters甚至是其他annotation信息，利用运行时注解通常称之为反射，而编译时的注解利用通常是此处所提到的 annotation processor.

### 用途？

> An annotation processor for a certain annotation takes java code (or compiled byte code) as input and generate files (usually .java files) as output.
annotation processor generate java code! The generated java code is in a generated .java file. So you can not manipulate an existing java class for instance adding a method.

annotation processor 通常呗用于分析代码库中存在某种特定的注解，并根据开发者需求去完成说定义的代码审查分析以及生成功能；某种程度上说，annotation processor 是java编译器的功能增强插件，通常被用于使用简洁的注释，生成复杂而重复琐碎java源码（.java）文件；

> annotation processor runs in it’s own jvm.

### 如何用？

*  自定义注解 @interface

*  自定义Processor 继承 AbstractProcessor实现其关键 process() 函数

*  针对Element处理，注意 Element 可以是类，属性，函数等

*  检查 Element规范性，审查自定义注解使用是否规范，符合条件    

*  利用代码生成工具快速构建java源码

#### Processor 中的异常处理 —— Messager

>  If you throw an exception in process() then the jvm which runs annotation processing crashs (like any other java application) and the third party developer who is using our FactoryProcessor will get an error from javac with a hardly understandable Exception, because it contains the stacktrace of FactoryProcessor.

> As said before, the problem is that if an unhandled exception is thrown in process() javac will print the stacktrace of the internal NullPointerException and NOT your error message of Messager.


#### annotation processor 构造

> An Annotation Processor is still a java application. So use object oriented programming, interfaces, design patterns and anything else you would use in any other java application!


#### 代码生成库

JavaWriter  /  JavaPoet(Squre)


#### Processing 循环轮回问题

> Annotation processing happens in a sequence of rounds.On each round, an annotation processor might be asked to process a subset of the annotations which were found on the source and class files produced by a prior round.

即根据源码所生成的Java源文件，也可能含有对应的自定义注解，会再次触发 process，再次经历process()过程，直到检测不到需要处理的代码；

{:.center}
![annotation_round](http://javaclee.com/assets/img/20161122/annotation_round.jpg)

图片引用自[Scripting, Compiling, and Annotation Processing in Java](http://www.informit.com/articles/article.aspx?p=2027052&seqNum=6)

#### 注解分离

分离注解和Processor,前面说到由于Processor功能的独立性，可以再该processor中应用各种开源工具辅助生成代码，而如果注解和processor合并，在后期打包继承过程中，这些开源库会随着processor一起集成到应用中，造成应用代码膨胀；而事实上processor只需要再编译时期有效即可；


---

Quote:

[Lesson: Annotations](http://docs.oracle.com/javase/tutorial/java/annotations/index.html)

[Annotation Processing in Android Studio](https://medium.com/@aitorvs/annotation-processing-in-android-studio-7042ccb83024#.djhnhr2q6)

[annotationprocessing101](https://github.com/sockeqwe/annotationprocessing101)

[THE 10-STEP GUIDE TO ANNOTATION PROCESSING IN ANDROID STUDIO](http://blog.stablekernel.com/the-10-step-guide-to-annotation-processing-in-android-studio)

[The Checker Framework](http://types.cs.washington.edu/checker-framework/)

[Java Annotation Processors](https://www.javacodegeeks.com/2015/09/java-annotation-processors.html)

[在 Android Studio 中使用 Annotation Processor](http://blog.chengyunfeng.com/?p=1021)

[Annotation-Processing-Tool详解](http://qiushao.net/2015/07/07/Annotation-Processing-Tool%E8%AF%A6%E8%A7%A3/#augad)
