---
layout: post
title:  Android Tips part (18)
category: android
keywords: [improvement,android,java]
---

### Split Apk 

将 apk 按照 gradle 设定配置的 屏幕密度, abi 等信息将


### 正则回顾 

利用正则匹配数据的方法论总结: **定锚点，去噪点，取数据**

* 寻找匹配数据的定位标识          
* 数据的筛选,通配符去除无关数据       
* 利用()子模式获取匹配数据集合

[我眼里的正则表达式入门教程](http://www.zjmainstay.cn/my-regexp)

### CPU 中断 

> 中断是用以提高计算机工作效率、增强计算机功能的一项重要技术。最初引入硬件中断，只是出于性能上的考量。如果计算机系统没有中断，则处理器与外部设备通信时，它必须在向该设备发出指令后进行忙等待（Busy waiting），反复轮询该设备是否完成了动作并返回结果。这就造成了大量处理器周期被浪费。引入中断以后，当处理器发出设备请求后就可以立即返回以处理其他任务，而当设备完成动作后，发送中断信号给处理器，后者就可以再回过头获取处理结果。
> 

CPU中断: 计算机运行期间,系统内部发生了急需处理事件,CPU 暂时中断当前执行任务转而执行该急需处理的事件,处理完毕之后返回原点继续执行任务;

正常情况下程序的执行由指令,指令地址,程序计数器等组合执行,当中断产生时地址寄存器被赋予中断寄存器中所存储的地址值,进而跳转执行;

中断处理通常由中断请求,中断排队(多中断同时产生,中断优先级确认),中断处理等组合

### Python 生成器

[Python生成器详解](http://codingpy.com/article/python-generator-notes-by-kissg/)

### Python 协程 

由于无线程切换损耗,协程执行效率高;且由于无需多线程的同步机制,资源共享无需加锁,只需要状态判断,执行效率比多线程高很多;

协程的应用: 当线程执行某些函数涉及到IO 以及网络相关的等待操作时,线程跳转到其他地方继续指定而非简单的挂起等待,等待收到前面的耗时操作完成的事件时重新跳转回原来的执行流程,但与多线程不一样的地方在于当前的执行流程跳转都在一个线程中,没有做线程的切换,不涉及上下文的切换,因而执行效率极高;

[Python协程：从yield/send到async/await](http://python.jobbole.com/86069/)

[python协程1：yield 10分钟入门](https://segmentfault.com/a/1190000009769387)

[python协程2：yield from 从入门到精通](https://segmentfault.com/a/1190000009781688)

> send 方法可以向暂停的协程发送状态,其参数将成为 yield 表达式值,如果协程还未激活（GEN_CREATED 状态）要调用next(my_coro) 激活协程，也可以调用my_coro.send(None)

{% highlight python %} 

import async


def fib(n):
    index = 0
    a = 0
    b = 1
    while index < n:
        # yield 保存 fib 计算现场,暂停 fib, 将 b 返回
        yield b
        a, b = b, a + b
        index += 1


def test_y():
    # 每一次 for 循环都会调用 next() 唤醒生成器
    for fib_res in fib(20):
        print(fib_res)


######################

def slow_fib(n):
    index = 0
    a = 0
    b = 1
    while index < n:
        sleep_cnt = yield b
        import time
        time.sleep(sleep_cnt)
        a, b = b, a + b
        index += 1


def test_slow():
    N = 20
    sfib = slow_fib(N)
    # 等同于 next(sfib) 启动生成器
    sfib_res = sfib.send(None)
    while True:
        print(sfib_res)
        try:
            import random
            sfib_res = sfib.send(random.uniform(0, 0.8))
        except StopIteration:
            break


###############################
# yield from 生成器重构/
def copy_fib(n):
    print("copy")
    yield from fib(n)


def test_cp():
    for lib_res in copy_fib(20):
        print(lib_res)


###################################

import asyncio


@asyncio.coroutine
def async_s_demo(i):
    print("test 1_", i)
    # 通过 yield from 将协程 asyncio.sleep唤醒的控制权上交至 loop 时间循环,然后挂起当前的协程
    # 具体何时唤醒 sleep 由事件循环 loop 决定,唤醒之后继续协程执行流程向下执行代码流程
    r = yield from asyncio.sleep(1)
    print("test 2_", i)


def test_as_sl():
    loop = asyncio.get_event_loop()
    tasks = [
        async_s_demo(i) for i in range(100)
    ]
    # 等待 asyncio.sleep(1) 完成,重新跳转回原来的流程
    loop.run_until_complete(asyncio.wait(tasks))
    loop.close()


###################
async def asy_wait_demo(i):
    await asyncio.sleep(2)

# 如何控制协程数量?
loop = asyncio.get_event_loop()
tasks = []
loop.run_until_complete(asyncio.wait(tasks))
loop.close()



{% endhighlight %}







