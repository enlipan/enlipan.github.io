---
layout: post
title:  Annotation Processor
category: java
keywords: [anroid,java]
---

### Annotation Processing 是什么？

 Annotation Processing 发生于JVM虚拟机编译java源码的编译阶段 —— **Compile Time**




### 用途？



### 如何用？

> An annotation processor for a certain annotation takes java code (or compiled byte code) as input and generate files (usually .java files) as output.

--> generate java code! The generated java code is in a generated .java file. So you can not manipulate an existing java class for instance adding a method.

这意味着我们可以生成 Java源码（.java文件），所以并不能编辑已有的源码文件，新增或删除函数等；


Annatation Processor 实现工厂模式：


Can  debug！！--> Have  SourceCode


Element —— maybe class method  field

ErrorHanding -->  Messager 和 普通Exception区别
>  If you throw an exception in process() then the jvm which runs annotation processing crashs (like any other java application) and the third party developer who is using our FactoryProcessor will get an error from javac with a hardly understandable Exception, because it contains the stacktrace of FactoryProcessor.

> As said before, the problem is that if an unhandled exception is thrown in process() javac will print the stacktrace of the internal NullPointerException and NOT your error message of Messager.


> annotation processor runs in it’s own jvm.


> An Annotation Processor is still a java application. So use object oriented programming, interfaces, design patterns and anything else you would use in any other java application!


#### 代码生成库

JavaWriter  /  JavaPoet(Squre)


#### Processing 循环轮回问题

> Annotation processing happens in a sequence of rounds.

生成的Java源码文件，也可能含有对应的自定义注解，需要再次经历process()过程，直到检测不到需要处理的代码；




#### 注解分离

分离注解和Processor,前面说到由于Processor功能的独立性，可以再该processor中应用各种开源工具辅助生成代码，而如果注解和processor合并，在后期打包继承过程中，这些开源库会随着processor一起集成到应用中，造成应用代码膨胀；而事实上processor只需要再编译时期有效即可；




---

Quote:

[Lesson: Annotations](http://docs.oracle.com/javase/tutorial/java/annotations/index.html)

[annotationprocessing101](https://github.com/sockeqwe/annotationprocessing101)

[THE 10-STEP GUIDE TO ANNOTATION PROCESSING IN ANDROID STUDIO](http://blog.stablekernel.com/the-10-step-guide-to-annotation-processing-in-android-studio)

[The Checker Framework](http://types.cs.washington.edu/checker-framework/)

[在 Android Studio 中使用 Annotation Processor](http://blog.chengyunfeng.com/?p=1021)

[Annotation-Processing-Tool详解](http://qiushao.net/2015/07/07/Annotation-Processing-Tool%E8%AF%A6%E8%A7%A3/#augad)
