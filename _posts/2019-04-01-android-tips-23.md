---
layout: post
title:  Android Tips part (23)
category: android
keywords: [improvement,android,java,js]
---

## 管道

最初是为了进程间通信,输出重定向.  

管道本质是一个文件,进程间通信时,一端读一端写入,完成通信过程,管道的设计遵循 Unix 的一切皆文件的设计原则.  

Linux 的实现上, 管道形态上是文件,但却是占用内存空间,因而 Linux 的管道本质是一个操作方式为文件的内存缓冲区.

## 类型

### 匿名管道  

| 管道符号, 用于在父子管道之间通信,除了父子进程其他人不知道管道文件描述符,也就无法通过管道与之通信.  

父子进程利用管道通信前,父进程先开辟管道文件,fork 产生子进程通过拷贝父进程地址空间获得管道文件的描述符,进而二者完成通信通道的建立.

通用性被限制.


管道实际是一个内核缓冲区,由于是缓冲区,就有容量限制, PIPESIZE.

### 命名管道 

mkfifo 指令: 创建命名管道;

管道中一端写入,但如果没有读操作, 写操作会阻塞.这是内核对于管道文件定义的默认行为.

命名管道在系统中存在全局可见的文件名,可被 open 使用.



### 系统编程手册

#### IPC

POSIX : 可移植操作系统接口.即操作系统为应用程序提供的接口的标准定义.

![](http://img.oncelee.com/20190310213600.png)

#### Pipe & FIFO

管道处理进程间数据传递.

进程本身不关注管道的存在, 由于管道本质是文件,进程只是在针对文件读取或者写入数据.

管道是字节流, 由于其字节流属性,因而其中数据的传递是有序的,读取顺序与写入顺序一致.

管道的读取与写入,针对空管道读取数据默认会阻塞,知道写入端开始写入数据,而写入端关闭后,读取端在读取完所有数据后,会看到文件结束.

通常所说的管道是单向的.

### IPC 通信之 LocalSocket 

Android IPC 通信方式. AIDL / LocalSocket 

--- 

## Android 存储系统

Quote: https://xiaozhuanlan.com/topic/1745298630

###  Android 存储空间的内部空间: 

data/app 目录是安装时将 apk 文件提取存放的位置.

而 data/data/目录则是对应 app 的内部存储空间.

* getCacheDir() 

* getDir()

* getFileDir()

* openFileOutput(): 在 getFileDir 目录下打开或创建指定文件.


###  Android 外部存储空间: 

/Storage 目录

#### 公有目录, 与App 中的 Context 无关

{% highlight java %} 

Environment.getExternalStoragePublicDirectory(String type) 

Environment.DIRECTORY_PICTURES 图片目录
Environment.DIRECTORY_DCIM 相册目录
Environment.DIRECTORY_DOCUMENTS 文档目录
Environment.DIRECTORY_DOWNLOADS 下载目录
Environment.DIRECTORY_MOVIES 视频


{% endhighlight %}

#### App 私有外部存储空间  

Context.getExternalFilesDirs() 外部文件根目录.


### 内部存储空间的 data/user 目录

{% highlight java %} 

/data/data/com.example.interviewroad/shared_prefs
/data/user/0/com.example.interviewroad/shared_prefs

{% endhighlight %}

两个目录的绝对路径指向同一个文件,6.0以上支持多用户,文件的实际路径是 data/user, 0代表用户ID.
data/data目录是为了便于访问创建的引用目录,其目录的获取在6.0以上有时会返回 data/user/0 这样的目录,而在5.0及以下版本则返回 data/data/ 目录.



### Exception 


{% highlight java %} 

File /data/data/com.alex.datasave/files/user.txt contains a path separator

fis = this.context.openFileInput("/data/data/com.alex.datasave/files/user.txt");


File file = new File("/data/data/com.alex.datasave/files/user.txt");
fis = new FileInputStream(file);

{% endhighlight %}


---

## 门面模式 

日志框架的封装使用. 

借助门面模式封装底层多形态日志框架Log4j/ Log4j2 等形态的框架由于暴露接口不一样会存在差异,而利用门面模式中间层封装进行转换成统一形态, 为将来的日志框架更换提供可能.  

SLF4J 框架.     

## 线程池  

线程池的创建不允许使用 Excutors 创建, 而应该利用 ThreadPoolExecutor 让创建者/开发者关注底层细节, 防止使用问题.

线程池中的 BlockingQueue: ArrayBlockingQueue / LinkedBlockingQueue.  

ArrayBlockingQueue 是有界队列, FIFO 原则. 必须制定容量.

LinkedBlockingQueue 则可以不设置容量,如果不设置容量, 则属于无界队列,可以最大加入MAX_VALUE 大小的任务, 可能造成OOM.  


Excutors 中的 fixed/ single 模型中默认使用了 LinkedBlockingQueue 可能堆积请求.   

Excutors 中的 Cachepool/ schedulthreadpool  则可以允许创建无限多的 Thread 同样造成OOM.  


制定线程的 keep-alive 时间.  

---

## 内存泄漏

程序中不再使用的的无用对象依旧存在来自 GC Root根引用的的引用链,导致对象被占用,无法被GC正常回收该对象所占用的内存.

内存泄漏导致,可用内存减少,占用内存被Block,随着系统的运行,可用内存会越来越少,进而导致系统性能降低.  

### Finalizer 函数

最佳实践: 永远不要复写 Finalizer 函数.(Java9 已经废弃该函数)


原因: 

1. Finalizer 函数不可用, GC 的触发由系统控制,在任何时候都可能触发.同时由于 GC 的垃圾回收策略算法是系统独立,可能针对某一系统适配的 Finalizer 函数在其他场景又无法适用.  


2. 性能影响.系统为了保证 Finalizer 函数在对象回收之前的执行,需要大量额外的系统开销(百倍).此外,一旦 GC 发生时,Finalizer 函数执行导致对象无法被立即回收,对象将被存入回收队列中,等待下一次 GC 触发时再次去尝试释放内存,这种场景下属于一种内存泄漏.  


3. 异常问题.Finalizer 缺少异常处理,一旦异常发生,将使对象一个异常的状态,同时系统还无法实际感知,大大增加问题的排查复杂度.
