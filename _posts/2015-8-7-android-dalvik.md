---
layout: post
title: Dalvik、ART虚拟机小结
category: android
---

####关于Dalvik虚拟机

Dalvik虚拟机是google针对移动设备特征而对于JVM的改进型，使其更加试用于移动设备应用程序解释运行。

####JVM与Dalvik虚拟机对比

* 最主要区别Dalvik 基于寄存器，而 JVM 基于栈。基于寄存器的虚拟机虽然降低兼容性但是对于更大的程序来说，虚拟器中解释执行程序的时候，其核心指令分发时间大大缩短，花费的时间更短。故而执行时效率更高。               
* 由于delvik虚拟机指令都大多数都包含寄存器的地址，所以它的指令通常比java虚拟机的指令更长。一般而言基于栈的机器需要更多指令，而基于寄存器的机器的每条指令更长。

{:.center}
![stack-vs-registers](\assets\img\20150808\stackvsregisters.png)

* Dalvik更好的安全机制，SandBox机制，每一个App运行在独立的虚拟机实例中，其代码在虚拟机的解释下得以执行。 另外可以让虚拟机更多的依赖操作系统的线程调度机制和管理机制。

* .dex格式文件为利用dx工具合并链接.class文件生成，.class文件实际属于编译过程中间件，整合过程中去除冗余信息，进而减小文件尺寸.提高IO速度，而odex是为了在运行过程中进一步提高性能，对dex文件的进一步优化。 

{:.center}
![stack-vs-registers](\assets\img\20150808\dexfile.png)

* 合并常量池，将各个类中常量用一个常量池管理。

* 特殊的虚拟机进程zygote，虚拟机实例的孵化器。如果系统需要一个新的虚拟机实例，它会迅速复制自身，以最快的数据提供给系统。同时对于一些只读的系统库，所有虚拟机实例都和Zygote共享一块内存区域。（copy on write share）共享区间提升跨进程数据共享。

{:.center}
![stack-vs-registers](\assets\img\20150808\zygote.png)

* 基于Trace，针对项目中Hot Method所占程序全部代码比例较低的情况进行优化，只讲那些最常使用的Mehod加载进虚拟机中。


 
####Dalvik GC

GingerBread之前，Dalvik虚拟使用的垃圾收集机制有以下特点：

* Stop-the-word，也就是垃圾收集线程在执行的时候，其它的线程都停止；              
* Full heap collection，也就是一次收集完全部的垃圾；                           
* 一次垃圾收集造成的程序中止时间通常都大于100ms。

在GingerBread以及更高的版本中，Dalvik虚拟使用的垃圾收集机制得到了改进，如下所示：

* Cocurrent，也就是大多数情况下，垃圾收集线程与其它线程是并发执行的；     
* Partial collection，也就是一次可能只收集一部分垃圾；也就是会新开一个线程执行GC操作，但是依旧会很占用内存，过多的GC灰造成卡顿。                 
* 一次垃圾收集造成的程序中止时间通常都小于5ms。


####JIT(Just-In-Time)：

早期JIT，在Java运行时环境下，每次遇到一个新的类就会针对类进行编译以及优化成指定的精简原生机器码，通过花费少量的编译优化时间去节省后面的运行时间，增加效率，但是在程序运行过程中大量代码的编译时间也往往会被计算进入执行时间，所以影响性能体验。为了解决这个问题，目前的JIT动态编译器具体会采用内部优化判别机制，分析那些Hot Method，将编译系统资源分配给那些最频执行的方法，也就是针对常用方法去优化编译为机器码。低编译开销带来反复执行的热代码的执行性能优势的提升。当然这是针对那些程序中只大量执行少量代码的情形，而产生的优化，事实上一些列的优化措施都是有指定情景的。

>动态编译器的一个主要的复杂性在于权衡了解编译代码的预期获益使方法的执行对整个程序的性能起多大作用。一个极端的例子是，程序执行后，您非常清楚哪些方法对于这个特定的执行的性能贡献最大，但是编译这些方法毫无用处，因为程序已经完成。而在另一个极端，程序执行前无法得知哪些方法重要，但是每种方法的潜在受益都最大化了。大多数动态编译器的操作介于这两个极端之间，方法是权衡了解方法预期获益的重要程度。

从这里看可以看出，由于JIT是优化成相应的精简机器码也就是实质上的编译器，可以揣测同一个JIT优化产生的机器码不可能对应所有的运行平台。

从这个角度来看，Java目前似乎也不能简单的被分为先编译后解释型运行的语言机制了。



####附带提一下：

ART虚拟机，其采用更加彻底的方式，采用AOT（Ahead of time），通过在安装时就将App预编译为机器码，从而提升其加载速度，而省去了多余的加载转换的过程。其副作用在于相较于Dalvik虚拟机中，会导致App占用内存空间变大，但能实现更加流畅的用户体验。


---

参考引用：

[Dalvik虚拟机的启动过程分析](http://blog.csdn.net/luoshengyang/article/details/8885792)

[ART (AOT) vs DALVIK (JIT)](http://www.slideshare.net/limaniBhavik/artaot-vs-dalvikjit)

[rednaxelafx-基于栈和基于寄存器虚拟机](http://rednaxelafx.iteye.com/blog/492667)

[程序的编译与解释有什么区别](http://www.zhihu.com/question/21486706)

[Real-time Java--IBM](http://www.ibm.com/developerworks/views/java/libraryview.jsp?search_by=Real+time+Java+Part)
