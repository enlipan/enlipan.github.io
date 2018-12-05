---
layout: post
title:  js 事件机制的阅读
category: js
keywords: [improvement]
---


## JS 事件循环

多线程工作之事件循环: 构建线程并行完成 job,执行完毕事件通知并退出.



微观事件队列与宏观事件队列.


宏观: 多线程消息循环,setTimeout/Ajax/ 用户事件  

浏览器的多线程与页面进程: Chrome 常驻多线程,以及页面独立进程中的页面独立渲染线程.   

常驻线程中的消息循环,事件处理机制.

```

void MessagePumpDefault::Run(Delegate* delegate) {
  // 在一个死循环里面跑着
  for (;;) {
    // DoWork会去执行当前所有的pending_task（放一个队列里面）
    bool did_work = delegate->DoWork();
    if (!keep_running_)
      break;
    // 上面的pending_task可能会创建一些delay的task，如定时器
    // 获取到delayed的时间
    did_work |= delegate->DoDelayedWork(&delayed_work_time_);
    if (!keep_running_)
      break;

    if (did_work)
      continue;
    // idl的任务是在第一步没有执行被deferred的任务
    did_work = delegate->DoIdleWork();
    if (!keep_running_)
      break;

    if (did_work)
      continue;

    ThreadRestrictions::ScopedAllowWait allow_wait;
    if (delayed_work_time_.is_null()) {
      // 没有delay时间就一直睡着，直到有人PostTask过来
      event_.Wait();
    } else {
      // 如果有delay的时间，那么进行睡眠直到时间到被唤醒
      event_.TimedWaitUntil(delayed_work_time_);
    }
  }****
}

```

各种事件循环机制大多是类似的处理,如 Android 汇总的 MessageQueue

task_runner 对象,进入消息队列同时唤醒 hold 住的worker 线程.

#### 用户事件通信  

浏览器进程的事件监听与页面进程的事件监听


mojo 多进程通信.浏览器进程利用 mojo 做 Socket 通信,完成事件的通讯. 

页面进程的子 IO 线程 libevent 唤醒, 调用 PostTask 给消息循环 taskrunner.  

#### setTimeOut 

setTimeOut delay 时间设置, 通常使用系统普通时间, 如果 delay 比较小,如 1ms 会使用系统高精度时间 API, 需要操作系统支持, 同时非常耗电. 

setTimeOut delay 为0 , 同样会执行 post task ,只是该 task 的 delayed 时间是0,会在消息循环的 DoWork 中执行. 

setTimeOut 存在在 sequence_queue 中,这个可以保证执行的先后顺序.


#### 微观任务  

microtask :

* callback   
* callable    
* promiseFullfil        
* promiseReject      

微观任务的原理: 

```

主要的代码抽出来是这样的：

{
  v8::MicrotasksScope microtasks_scope();
  v8::MaybeLocal result = function->Call(receiver, argc, args);
}
```
> 这段代码先实例化一个scope对象，是放在栈上的，然后调function.call，这个function.call就是当前要执行的JS代码，等到JS执行完了，离开作用域，这个时候栈对象就会被解构，然后在解构函数里面执行microtask。注意C++除了构造函数之外还有解构函数，解构函数是对象被销毁时执行的，因为C++没有自动垃圾回收，需要有个解构函数让你自己去释放new出来的内存。

总结: js 的微观任务在当前 js 代码执行完之后同步执行,处于同一个调用栈. 

即 : A(B) , 实际调用栈为: A-B   


这与 setTimeOut 有明显差异 : 
> setTimeout 0是给主线程的消息循环任务队列添加了一个新的task（回调），而promise.then是在当前task的V8里的microtask插入了一个任务。那么肯定是当前正在执行的task执行完了才执行下一个task.


> 事件循环就是多线程的一种工作方式，Chrome里面是使用了共享的task_runner对象给自己和其它线程post task过来存起来，用一个死循环不断地取出task执行，或者进入休眠等待被唤醒。Mac的Chrome渲染线程和浏览器线程还借助了Mac的sdk Cococa的NSRunLoop来做为UI事件的消息源。Chrome的多进程通信（不同进程的IO线程的本地socket通信）借助了libevent的事件循环，并加入了到了主消息循环里面。

> 而微观任务是不属于事件循环的，它是V8的一个实现，用来实现Promise的then/reject，以及其它一些需要同步延后的callback，本质上它和当前的V8调用栈是同步执行的，只是放到了最后面。除了Promise/MutationObserver，在JS里面发起的请求也会创建一个微观任务延后执行。

JS 中构建 Image 的 onload 是一个微观任务并不会阻塞当前的执行.

[从Chrome源码看事件循环](https://zhuanlan.zhihu.com/p/48522249)

[Tasks, microtasks, queues and schedules
](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

#### Async / Await 


Async 函数执行返回 Promise 对象.  


await 开销: 

> 对于每个 await，引擎都必须创建两个额外的 promise（即使右边的表达式已经是 promise）并且它需要至少三个 microtask 队列执行。


[V8 中更快的异步函数和 promises](https://zhuanlan.zhihu.com/p/51191817)

#### LibEvent / libev 

服务端如何处理多客户端连接问题,如何及时的响应某一个客户端的数据请求与响应.    

传统方式: 

* while true 无限循环遍历素有连接, 检查是否有数据需要读取处理.    

* select 使用静态结构,有连接数限制(1024)   

* poll / epoll  

* 利用 OS 支持,为链接启动新线程,将处理交给操作系统,但会导致线程之间的上下文切换很频繁.   

* 协程      


libevent 基于 select/poll 的基础机制,做针对特定平台的高效封装实现.

libevent 使用: 

* 基于事件注册事件监听,注册事件发生时触发的事件函数.       
* 启动主事件循环.  
* 事件系统进入自治事件处理.


```

int main(int argc, char **argv)
{
...
    ev_init();
 
    /* Setup listening socket */
 
    event_set(&ev_accept, listen_fd, EV_READ|EV_PERSIST, on_accept, NULL);
    event_add(&ev_accept, NULL);
 
    /* Start the event loop. */
    event_dispatch();
}

```


##### Select、Poll、Epoll 

IO 多路复用,监听 描述符读写事件. 

当某个描述符事件就绪,将事件通知通知关心事件的应用程序处理.事件机制.

IO 模型的核心处理的两个阶段: 
* 等待数据准备      
* 数据拷贝,从内核空间buffer拷贝至用户空间.       

阻塞/ 非阻塞   以及  同步/异步 两个维度的比对.不能混合而谈. 

考虑 IO 事件的核心,比如 socket 的处理,就 read 事件而言,其核心的需求就是关注某个 socket 是否有数据准备就绪,达到可读状态,也就是可读事件到达时的通知.

即针对多个 socket 的监听阻塞在监听事件的发生之上,一旦事件发生,解除 Block代表有某个 socket 数据准备就绪可读.

根据 wakeup callback 机制的处理,事件准备就绪的时间不得而知,也就是实际数据就绪事件到来时,不知道是监听的哪一个 socket 发生的事件,需要在 callback 中轮询是检查具体是哪一个 socket 的事件.


select 函数监听 IO 句柄列表,当用户进程调用 select 函数时, select 需要将监听的 fds 拷贝到内核空间, 同时遍历自己监控的 socket sk, 逐个调用 sk 的事件监测逻辑,查看是否有事件,遍历完监控的 socket, 如果没有事件,这 select 调用 schedule_time_out 进入循环,使得 process 进入休眠,直到有新的事件产生时唤醒.

select 的核心问题: 

* 被监控的 IO 句柄 fds 需要从用户控件拷贝到内核空间,为了减少数据拷贝带来的性能损失,内核对于大小利用宏进行了限制性定义, 1024.       
* 在被监控的 IO 句柄集合 fds 中只要有一个事件发生,都需要遍历调用 socket 的事件收集检测机制收集所有事件.而最初的原始设计只是在事件通知时,是否有数据准备就绪,而不清楚具体事件到达有多少被监控的 sk 就绪,只能遍历.


poll 的解决: 解决了 IO 句柄数量的限制,理论上无限制,但是随着监听事件数量增多,性能急速下降. 


epoll 优化: 进一步优化了事件监听,事件发生时不再轮询所有句柄,直接返回所有具体事件列表.同时使用 mmap 优化内核与用户空间的数据传递,由于内核与用户空间数据传递的不可避免性, mmap 使得内核与用户空间的虚拟内存映射为同一物理块,从而无需数据拷贝直接可以完成数据的共享访问.



非阻塞IO 本质是请求数据时加上 NoneBlock 标志立即返回.后续由轮询请求访问数据加载状态直到数据加载完成处理相应事件.而 IO 多路复用核心优化在于由操作系统处理轮询优化,当对应数据加载成功通知事件,监听事件的应用进而进行处理.

select/poll/epoll 本质是同步非阻塞 IO,对比普通 IO 其优势在于以较少代价监听处理多个 IO.  

* 程序等待数据准备好的通知后同步处理数据内核到用户空间的拷贝.




异步 IO 要求: 
> 程序调用读取数据后立即返回,等待 kernel 自行准备数据, 同时将数据从内核拷贝到进程用户空间完成之后通知程序处理.  
Linux 不存在这种形态的 IO 模型,只有 Windows 下的 IOCP 模型属于标准异步 IO 模型.   


[Select、Poll、Epoll](https://cloud.tencent.com/developer/article/1005481)

核心原理: Linux Socket wakeup callback 机制. 

##### Linux 文件系统 

###### Linux 文件描述符 

文件描述符是系统内核为高效管理已被打开文件所创建的索引,描述符值分为0/1/2. POSIX 标准规定打开文件或建立 Socket 连接时,描述号码则使用当前进程中的最小可用文件描述号码.


“Too many open files” 问题,文件描述符是系统重要资源,内核会做对应处理限制优化.

为防止单个进程消耗所有文件资源,也会对单个进程最大打开文件数做用户级限制处理. web 系统更改系统文件描述符最大值的默认设置是优化服务器的常见处理形式.   


文件描述符与打开文件关系: 每一个文件描述符对应一个打开文件, 文件可被打开多次.

文件描述符表: 

* 进程级别     
* 系统内核级         
* 文件系统i-node表   

内核对于所有打开文件维护系统级描述符表格,即文件表,表中各条目成为打开文件句柄, 存储了打开文件关联的全部信息: 

> 文件偏移量(read/write 更新)    
> 文件打开时的状态标识        
> 文件访问访问模式             
> 信号驱动相关设置          
> 对文件 inode 对象引用        
> 文件类型与访问权限           
> 指向文件持有的锁列表的指针          
> 文件属性        

###### Linux iNode   

文件系统: 磁盘数据存储格式系统.如: ext/ NTFS …     

磁盘的读取形式以扇区为单位,磁头扫描扇区(Sector),而文件的实际存储则以块(Block)为最小单位,块与扇区通常有一定的比例对应关系,常见的 Block 为 4K, 我们在固态硬盘测速中所常见的就是4K 速度.

既然文件的实际存储以 Block 形式,就需要其他地方存储文件的元数据信息,元数据作为针对描述信息的标准格式化数据信息, 即描述数据的数据信息.文件的元数据信息存储区域被称为 inode ,即索引节点.  


inode 中包含的描述文件的元信息包含:  
* 文件字节数      
* 文件权限信息        
* … 

`利用 stat 命令可以查看某个文件的 iNode 信息.`

inode 也消耗磁盘空间, 通常iNode 占用空间磁盘空间固定, 在磁盘初始化时针对每多少数据设置一个 inode, 这样总的 inode 空间就计算固定.磁盘在初始化时通常设定为两部空间,数据磁盘空间以及 inode 索引空间.

inode 号码作为 Linux/Unix 文件系统中文件的具体标识, 而相对应的文件名则仅仅是 inode 号码别名.即文件打开的过程通常是根据文件名查找 inode号码, 根据 inode 号码获取inode 信息,最后根据 inode 信息打开文件,打开文件时与文件名无关系.

`ls -i `   查看inode 信息.   

* 硬链接  

多文件名指向同一个 inode 号码,删除一个对另一个无影响.  

* 软链接  

新建的链接文件内容是源文件的目标路径,也就是新建链接文件依赖源文件,如果源文件被删除,新链接文件无法打开.在打开时,无论打开哪一个文件,最终读取打开的都是源文件.读取新链接文件时系统自动将访问者导向源文件.

[inode](http://www.ruanyifeng.com/blog/2011/12/inode.html)