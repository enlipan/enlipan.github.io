---
layout: post
title:  Android Tips part (19)
category: android
keywords: [improvement,android,java,js]
---

#### Jenkins Pipeline

[Top 10 Best Practices for Jenkins Pipeline Plugin | CloudBees](https://www.cloudbees.com/blog/top-10-best-practices-jenkins-pipeline-plugin)


[Ten Things I Wish I’d Known Before Using Jenkins Pipelines – zwischenzugs](https://zwischenzugs.com/2017/04/23/things-i-wish-i-knew-before-using-jenkins-pipelines/)

[jenkins-pipeline-plugin-tutorial](https://dzone.com/articles/jenkins-pipeline-plugin-tutorial)


#### ES6 解构

* 数组的解构(数组索引)          
* 对象解构赋值(属性名称)            
* 解构时属性默认值处理              
* 解构应用: 赋予更加良好的 API 设计,可以有效解决碎片化的参数问题,以及多参数时可能的参数传入错误问题,将多参数进行对象封装在参数传入时通过解构传入对象进行参数赋值;             

#### CAS  

悲观锁: 其他需要访问的线程挂起等待,直到当前锁持有者释放锁才能访问,无论读写;

CompareAndSwap: 比较交换, CAS 是乐观锁(free-lock)实现的基础;由 CPU 提供支撑实现,CAS 是对于三个值的操作,当前内存值,旧的期望值,新的值,当旧的期望值与当前内存值相等时,操作内存地址,将其内存值替换为新值,整个过程是原子性操作;CAS的执行结果包含成功与失败,对于失败时的情况可以选择将不停的重试与放弃操作;    

如何保证原子性? Java CAS 通过借助CPU 原子指令,其实质是通过调用了sun.misc.Unsafe的原子特性的 JNI 操作,Unsafe 提供了程序员直接操作特定内存数据的能力(强大而危险的后门);

借助于 CPU 指令的特性(指令原子性,以及内存屏障特性)保证了 CAS 具有 volatile读/写(可见性)内存语义;

缺陷:  

* ABA 问题             
* 可能循环时间开销过大                
* 仅能保证单共享变量的原子性操作,如果有多共享变量需要使用锁机制或者共享变量合并;

concurrent 对于 CAS 的应用: 

同步安全包含原子性与可见性,悲观锁 synchronize 关键字提供了这两项能力的支撑,而 CAS 保证了原子性,对于可见性则借助于 volatile实现,因而在 concurrent包中大量了使用了 volatile 结合 CAS 组合的线程安全实现: 

1. volatile共享变量          
2. 借助CAS 原子性更新实现线程间的同步操作                 
3. 以CAS所具有的volatile读和写的内存语义来实现线程之间的通信     


quote: 

[Java Magic. Part 4: sun.misc.Unsafe](http://ifeve.com/sun-misc-unsafe/)

[JAVA CAS原理深度分析](http://zl198751.iteye.com/blog/1848575)

[ CAS ，要多了解](http://www.importnew.com/27811.html)

#### ABA 

问题举例: 

多线程栈操作: 当前内存状态原始栈 A -> B ,栈顶元素为 A;        
线程1使用 CAS 操作做 pop 操作,将栈顶元素换为 B;        
程序执行过程中,此时线程2在线程1操作前插入执行,将 A,B元素 pop, 同时入栈 C 与 A, 线程2执行完毕,切换至线程1执行时发现程序栈顶元素未更改,进而将 A 出栈,同时将 B 元素作为栈顶元素返回,而此时 B 已经出栈,作为游离元素;


解决方案: 添加变量的操作记录,对于变量追加版本号用于区别同变量值的问题;如 AtomicInteger 对比 AtomicStampedReference;


#### 红黑树  



#### 异步 IO 

从阻塞开始:  

在操作服务端 Socket IO 数据时,当读取 Socket 流数据时,若服务端数据未返回,流数据未到达时,IO 线程持续等待,直到数据返回,这就是阻塞等待;  

非阻塞: 

当流数据未返回时,程序继续向下执行,CPU 完成其他操作,直到数据返回时通知程序恢复当前操作数栈,完成后续逻辑;



进一步加深对于 epoll 的理解: 

poll 与 epoll 差异:  poll 利用代理线程轮询IO 事件, 当没有 IO 事件发生时,线程挂起阻塞,节约 CPU 资源,当IO 流数据到来时则唤醒代理线程进行所有流通道的无差别轮询操作,找到唤醒的对应流;O(n)

与之不同的 epoll (Event poll) 则借助事件唤醒机制直接告诉代理线程哪个流发生了事件;O(1)

> 阻塞:  CPU 资源已从此代码片段释放,但代码段后续的代码还没有被执行;比如你调用了阻塞版本的write，然后对端没有读取，那么线程就阻塞在那里，没有cpu会去执行后面的代码。

[异步IO是什么？](https://zhuanlan.zhihu.com/p/37640811)


#### Android 截屏检测  

针对截屏事件 Android 系统和并没有开放对应的系统通知API事件,但根据所产生的行为可以归纳如下: 


* 使用ContentObserver，监听MediaStore.Images.Media.EXTERNAL_CONTENT_URI资源的变化

* 使用FileObserver，监听Screenshots目录下的图片文件变化定位截屏图片；


Quote: 

[RxScreenshotDetector：Android 截屏检测](https://blog.piasy.com/2016/01/29/Android-Screenshot-Detector/)

#### 匿名类 

Gson 中的 TypeToken 的实例化为啥要添加 {} 后缀? 

事实上 TypeToken 类的构造函数是 protected, 也就是 new TypeToken(){} 并不是构造了一个 TypeToken 的实例,而是定义了一个继承自 TypeToken 的匿名类,构造了匿名类对象,同时使用了 TypeToken 的 public 函数;

#### 动态代理

我们知道静态代理利用 Proxy 实现了接口实现的功能增强,是基于开闭原则的优秀实践. 那仔细考虑动态代理究竟解决了什么问题? 又是如何实现? 

先考虑下动态代理的实现,如果没有动态代理而使用静态代理,我们对于代理的每个函数的通用逻辑需要在每个代理是现在中去进行实现增强逻辑,而有了动态代理对于这个代理 Target 接口的每个实现我们都可以添加通用增强拦截处理以及事后的干涉操作;

来看看实现: 

{% highlight java %} 

//构建 proxy 
Proxy.newProxyInstance();
// Proxy 实现
ProxyClassFactory 

 /**
     * A factory function that generates, defines and returns the proxy class given
     * the ClassLoader and array of interfaces.
     */
    private static final class ProxyClassFactory
        implements BiFunction<ClassLoader, Class<?>[], Class<?>>
    {
        // prefix for all proxy class names
        private static final String proxyClassNamePrefix = "$Proxy";

        // next number to use for generation of unique proxy class names
        private static final AtomicLong nextUniqueNumber = new AtomicLong();

        @Override
        public Class<?> apply(ClassLoader loader, Class<?>[] interfaces) {

            Map<Class<?>, Boolean> interfaceSet = new IdentityHashMap<>(interfaces.length);
            for (Class<?> intf : interfaces) {
                /*
                 * Verify that the class loader resolves the name of this
                 * interface to the same Class object.
                 */
                Class<?> interfaceClass = null;
                try {
                    interfaceClass = Class.forName(intf.getName(), false, loader);
                } catch (ClassNotFoundException e) {
                }
                if (interfaceClass != intf) {
                    throw new IllegalArgumentException(
                        intf + " is not visible from class loader");
                }
                /*
                 * Verify that the Class object actually represents an
                 * interface.
                 */
                if (!interfaceClass.isInterface()) {
                    throw new IllegalArgumentException(
                        interfaceClass.getName() + " is not an interface");
                }
                /*
                 * Verify that this interface is not a duplicate.
                 */
                if (interfaceSet.put(interfaceClass, Boolean.TRUE) != null) {
                    throw new IllegalArgumentException(
                        "repeated interface: " + interfaceClass.getName());
                }
            }

            String proxyPkg = null;     // package to define proxy class in
            int accessFlags = Modifier.PUBLIC | Modifier.FINAL;

            /*
             * Record the package of a non-public proxy interface so that the
             * proxy class will be defined in the same package.  Verify that
             * all non-public proxy interfaces are in the same package.
             */
            for (Class<?> intf : interfaces) {
                int flags = intf.getModifiers();
                if (!Modifier.isPublic(flags)) {
                    accessFlags = Modifier.FINAL;
                    String name = intf.getName();
                    int n = name.lastIndexOf('.');
                    String pkg = ((n == -1) ? "" : name.substring(0, n + 1));
                    if (proxyPkg == null) {
                        proxyPkg = pkg;
                    } else if (!pkg.equals(proxyPkg)) {
                        throw new IllegalArgumentException(
                            "non-public interfaces from different packages");
                    }
                }
            }

            if (proxyPkg == null) {
                // if no non-public proxy interfaces, use com.sun.proxy package
                proxyPkg = ReflectUtil.PROXY_PACKAGE + ".";
            }

            /*
             * Choose a name for the proxy class to generate.
             */
            long num = nextUniqueNumber.getAndIncrement();
            String proxyName = proxyPkg + proxyClassNamePrefix + num;

            /*
             * Generate the specified proxy class.
             */
            byte[] proxyClassFile = ProxyGenerator.generateProxyClass(
                proxyName, interfaces, accessFlags);
            try {
                return defineClass0(loader, proxyName,
                                    proxyClassFile, 0, proxyClassFile.length);
            } catch (ClassFormatError e) {
                /*
                 * A ClassFormatError here means that (barring bugs in the
                 * proxy class generation code) there was some other
                 * invalid aspect of the arguments supplied to the proxy
                 * class creation (such as virtual machine limitations
                 * exceeded).
                 */
                throw new IllegalArgumentException(e.toString());
            }
        }
    }

// 其本质就是根据 target 以及其实现的接口生成具体的 Proxy Class 字节码,同时加载所生成的 ProxyClass;

{% endhighlight %}

动态代理应用广泛存在于各类 AOP 编程中,如 Retrofit, Spring ...

### INSTALL_FAILED_DUPLICATE_PERMISSION

通常产生于当前需要安装的APP的自定义权限与手机上已有APP的自定义权限名字相同，但两个APP具有不同的签名信息,进而导致的安装失败,一般在开发中是 debug 包与 release 包不同的包名,但是共享了同一个自定义权限.


