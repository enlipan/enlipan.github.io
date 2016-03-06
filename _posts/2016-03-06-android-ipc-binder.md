---
layout: post
title: Android IPC Binder
category: android
---

Binder作为Android的核心，一直想了解，也查阅了比较多的资料，但国内的资料总是似懂非懂，国外的资料有的说的太繁杂，有的又说的太简单没有含金量，了解到Android框架揭秘这本书对于Binder的讲解不错，特地购入之后研读一番，收益匪浅，光这一章节的知识感觉就值了这本书的价格，读下来酣畅淋漓。

不得不说Binder的设计实在巧妙，逻辑严密考虑周全，这里简单的概括总结一下书中知识：

核心概念：  IPC，RPC，用户空间，内核空间，虚拟地址空间，内存映射，BinderDriver，Binder协议，ServiceServer，ContextManager


### Binder起源？

OpenBinder项目：项目旨在研究一个高效的信号传递工具，允许软件的各个组成要素相互传递信号，进而使多软件相互协作，共同形成一个软件系统；

AndroidBinder基于OpenBinder，用于管理Android进程，旨在使得当前进程调用另一进程函数就像调用自身函数同样的简单；

### 为何要采用BinderDriver实现？

Android基于Linux，每个进程又独立的用户空间，而又相互之间共享内核空间；用户代码与相关库分别运行在用户空间中的代码区数据区以及堆栈区；而进程运行在内核空间的代码是运行在内核空间的各个区域中，虽然用户空间彼此独立无法共享，而运行在内核空间不同区域的代码却是在同一共有内核空间中，这就给彼此之间的数据交互传递构建了桥梁；两个进程通过内核空间实现交互信息，完成IPC通信；

BinderDriver 运行在内核空间中的抽象驱动程序；Binder采用Linux内存管理(mmap())技术，通过内核空间传递数据时可确保数据的可靠性，此外用户空间与内核空间之间的交互通过Binder协议传递IPC数据，保证了IPC之间的安全性；


IPC 数据主要包含待调用服务号（Handle），待调函数名，Binder协议构成，待调用服务号旨在标记区分各个不同服务，用于区分服务，BinderDriver借此确定指定调用服务，确定IPC数据传递对象；Binder协议表示IPC数据的解析处理方法，类似于网络协议Binder协议同样是数据接收方与发送方共同遵守的规则，因而使用BinderIPC的进程与BinderDriver在头文件中定义了Binder协议；

### ContextManager

ContextManager用于为服务分配Handle编号（用作BinderIPC目的地址），提供服务的添加，检索等管理功能，而ContextManager自身作为特殊服务，自身的Handle公开编号为0，用于为其他Server以及Client提供服务；

Binder寻址与服务注册过程：BinderDriver根据相关进程的注册Handle号，进行ServiceServer的查找；为了顺利的寻址，首先ServiceServer要有正确的Handle号，这一过程是ServiceSever将自身服务的访问信息注册到ContextManager中完成，注册过程中ServiceServer向BinderDriver发送 Handle为0的IPC数据，BinderDriver受到后校验其Handle时，发现其Handle为0，随机转发给对应ContextManager，并在Binder节点列表中生成对应节点，同时建立所传递的IPC注册数据与刚刚生成的Binder节点之间的联系，ContextManager根据接收到的IPC数据中的服务名称与Binder节点编号将服务注册到自身所管理的服务目录列表中；

客户端服务检索过程：


### 过程总结

* 服务注册

* 服务检索

* 服务调用

纵观这三个阶段，虽然过程很复杂，其核心却是利用内存映射，开辟IPC数据接收Buffer空间，完成IPC数据的中转以及转换；其他的技术围绕此处展开，IPC数据传递到何处？如何传递IPC数据？如何确定目的Service地址？其中为确定目的Service地址，同时保证数据的安全性作出了诸多复杂的数据处理，服务的注册于服务检索都是为此服务，但是抽象来看就是如此一个过程；

Binder在Android中无处不在，如Intent数据传递是基于Binder完成的高级抽象封装；




















---

Quote:

《Android框架揭秘》

[Android IPC Mechanism](https://www.dre.vanderbilt.edu/~schmidt/cs282/PDFs/android-binder-ipc.pdf)

[Binder解析PPT](http://www.devtf.cn/?p=983)
