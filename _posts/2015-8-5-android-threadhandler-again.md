---
layout: post
title: HandlerThread 真的停止了吗？
category: android
---

关于三点疑惑的再说明：

* HandlerThread.getLooper.quit()以及HandlerThread.quit()             
* Handler.post()                        
* View.post()                  

自己的小Demo利用了Handler去做了一个消息回调循环，但是当点击按钮再启动HandlerThread时，App Crash，显示Thread has started，觉得很奇怪明明自己利用了Quit方法退出了消息循环，也很多人说Quit()可以停止HandlerThread，再利用Thread.isAlive()检测线程状态，显示False。

这时候更加奇怪了，isAlive显示False，HandlerThread又不能再启动，公司给我配的渣渣电脑源码看的心碎，那电脑我用的想死，还管控那么严，自己的小黑也不让带。所以上Stackoverflow问了一发，最后别人说，同一个AsynTask对象不能启动两次，我们知道这货的本质也就是一个Handler的使用机制，要再次启动需要重新new一个对象，这我早就知道重新new一个对象可以，但是虽然知道结果但是不知道为啥，心里难受，而且本来就是觉得一直new对象是不是太浪费内存了，所以才这么纠结尝试的。

回来利用Source Insight查看源码：

先看HandlerThread.quit（）,发现这货就是调用的getLooper().quit();

{%  highlight java  %}

    public boolean quit() {
        Looper looper = getLooper();
        if (looper != null) {
            looper.quit();
            return true;
        }
        return false;
    }

{% endhighlight %}

不多说，直接进入Looper看quit();

{%  highlight java  %}

    public void quit() {
        mQueue.quit(false);
    }
    public void quitSafely() {
        mQueue.quit(true);
    }

{% endhighlight %}

Ok,开始找成员变量mQueue，这货是在这里被初始化的：

{%  highlight java  %}

    private Looper(boolean quitAllowed) {
        mQueue = new MessageQueue(quitAllowed);
        mThread = Thread.currentThread();
    }

{% endhighlight %}

啥也没有，直接new obj对象，再直接去MessageQueue找：

{%  highlight java  %}

    MessageQueue(boolean quitAllowed) {
        mQuitAllowed = quitAllowed;
        mPtr = nativeInit();
    }
        void quit(boolean safe) {
        if (!mQuitAllowed) {
            throw new IllegalStateException("Main thread not allowed to quit.");
        }
        synchronized (this) {
            if (mQuitting) {
                return;
            }
            mQuitting = true;
            if (safe) {
                removeAllFutureMessagesLocked();
            } else {
                removeAllMessagesLocked();
            }
            // We can assume mPtr != 0 because mQuitting was previously false.
            nativeWake(mPtr);
        }
    }
        private void removeAllMessagesLocked() {
        Message p = mMessages;
        while (p != null) {
            Message n = p.next;
            p.recycleUnchecked();
            p = n;
        }
        mMessages = null;
    }

{% endhighlight %}

真的好像没有干啥，无非就是把消息Looper清空，这时候再结合官方文档看一看，发现Google意为清空目前的Looper同时不再接收消息Message，就算结合Looper.looper()中所讲的接收到空消息，也代表着会退出无限消息循环处理机制。其实这在Looper.looper()方法的文档已经说明了的，需要处理完消息之后调用quit()方法。

{%  highlight java  %}

    /**
     * Run the message queue in this thread. Be sure to call
     * {@link #quit()} to end the loop.
     */
    public static void loop() {
        final Looper me = myLooper();
        if (me == null) {
            throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
        }
        final MessageQueue queue = me.mQueue;
        // Make sure the identity of this thread is that of the local process,
        // and keep track of what that identity token actually is.
        Binder.clearCallingIdentity();
        final long ident = Binder.clearCallingIdentity();
        for (;;) {
            Message msg = queue.next(); // might block
            if (msg == null) {
                // No message indicates that the message queue is quitting.
                return;
            }
            ......
        }

{% endhighlight %}

看到这里有点迷茫了，线程为啥不能再启动呢？去看看Thread.start()

{%  highlight java  %}

    public synchronized void start() {
        checkNotStarted();
        hasBeenStarted = true;
        nativeCreate(this, stackSize, daemon);
    }
    private void checkNotStarted() {
        if (hasBeenStarted) {
            throw new IllegalThreadStateException("Thread already started");
        }
    }

{% endhighlight %}

关键点来了"Thread already started"是在这里出现的，也就是说线程的运行与否是仅仅判断标志位hasBeenStarted,hasBeenStarted初始默认为False，但是一旦启动之后就为True，而且不再更改回来，所以说，这个线程对象一旦启动之后就不再回归位置，不能再被启动，要想再次执行线程必须重新new一个新的标志位为默认False的对象，有点奇葩啊，不过想想也可以理解，这样做的安全性。

最后再看一下Thread.isAlive()方法，只有当线程正在运行的时候才显示True啊，google的文档果然还是很严谨的，自己平时没注意导致的问题，欠的债，以后要注意。

{%  highlight java  %}

    /**
     * Returns <code>true</code> if the receiver has already been started and
     * still runs code (hasn't died yet). Returns <code>false</code> either if
     * the receiver hasn't been started yet or if it has already started and run
     * to completion and died.
     *
     * @return a <code>boolean</code> indicating the liveness of the Thread
     * @see Thread#start
     */
    public final boolean isAlive() {
        return (nativePeer != 0);
    }

{% endhighlight %}



* 附带的总结一下Handler.post()，简单的说是将线程当作消息CallBack发送出去，进入Handler所绑定的消息队列，并在那个线程中执行回调。

* View.post()是将Runnable发送到UI线程的消息队列之中，类似上面那样的执行，所以可以表现的更新UI，因为Run方法已经路由跳转到了UI线程中，所以放心的更新UI吧。




---
[HandlerThread Start Second Time](http://stackoverflow.com/questions/31833963/got-illegalthreadstateexception-when-invoking-handlerthread-start-second-time/31835834#31835834)

[Android 异步消息处理机制 让你深入理解 Looper、Handler、Message三者关系](http://blog.csdn.net/lmj623565791/article/details/38377229)
