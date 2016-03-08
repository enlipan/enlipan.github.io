---
layout: post
title: 从Volley的使用看源码分析
category: android
---

源码是揭漏一切的真相，阅读源码是开发绕不过去的坎，而初学者由于经验有限，同时知识面有限，很多时候在阅读源码的时候容易陷入泥潭，不知所云；一般情况出现这样的情况很大可能是由于网子撒得太大导致阅读过于零散，无法收拢汇聚回来；源码的阅读在我看来应该从点出发最终又回到点上来，以点带面，串联各个面，最终形成网络，理清头绪，绘制流程草图，理清框架原理；

自己其实也是一个源码阅读的Newbie，恰好最近突然想起了Volley，加上最近版本锁版加班有点多，下班之后也干不了什么大的开发学习，就利用下班之后的这段零散时间看了看Volley的源码，顺道归纳总结一下自己看Volley源码时的方法，以此为起点，逐步迭代改进源码阅读的方法，找到一个适合自己的节奏：

Volley的源码并不复杂，但是里面的编程思想思想的确非常优秀，值得学习模仿。Volley的源码阅读从使用开始，我们知道Volley的使用很简单，请求队列初始化以及将自定义请求Add到请求队列中，一个Volley的使用就上手了，那么从这为起点开始追踪其实可以看出很多东西：

{% highlight java %}

Volley.newRequestQueue(Context context);
if (stack == null) {
    if (Build.VERSION.SDK_INT >= 9) {
        stack = new HurlStack();
    } else {
        // Prior to Gingerbread, HttpUrlConnection was unreliable.
        // See: http://android-developers.blogspot.com/2011/09/androids-http-clients.html
        stack = new HttpClientStack(AndroidHttpClient.newInstance(userAgent));
    }
}

Network network = new BasicNetwork(stack);

RequestQueue queue = new RequestQueue(new DiskBasedCache(cacheDir), network);
queue.start();

{% endhighlight %}

这一部分可以看到 :HttpStack的版本适应，以及 RequestQueue 的建立以及 RequestQueue.start();

而后进一步进入 RequestQueue 的构造函数，可以构建一个对象间的依赖关系，在这个过程中可以不需要进一步深入 各个类的继承以及实现层级关系，往下继续走start()函数流程;

发现  `mCacheDispatcher.start();    networkDispatcher.start();` 进去看一眼类的实现，二者都属于继承Thread的的工作线程，可以适当的看一看 run()函数走一下工作流程，熟悉的BlockingQueue 出现在眼前也就是生产消费者模型建立，看一下mQueue 初始化可以发现这些工作线程的生产者全部是指向同一引用`PriorityBlockingQueue<Request<?>>`，到这里类间关系以及初始化的流程好像挖掘殆尽，最好陷入各种工作线程的worker过程，防止各种类间关系让自己迷糊，应该重新回到Volley的使用过程 request的添加过程中来，也就是add()函数；

{% highlight java %}

RequestQueue.add(Request<T> request);

if (!request.shouldCache()) {
    mNetworkQueue.add(request);
    return request;
}

{% endhighlight %}

可以看到当一个request不需要Cache缓存时，直接add到mNetworkQueue中，而后会直接唤醒某个networkDispatcher触发网络请求，当我们需要数据实时最新，确定不需要缓存时可以自定义 不需要Cache，否则默认是开启Cache；其实看到这里可以打下Tag，重新回到 `networkDispatcher`线程的run过程中，查看请求如何产生以及如何执行的过程；

{% highlight java %}

// Perform the network request.
NetworkResponse networkResponse = mNetwork.performRequest(request);

{% endhighlight %}

  request请求的执行，是需要我们Care的要点，追踪进入查看，发现mNetWorek 是Network接口类型，想必是利用了多态灵活实践实践，我们需要看看初始化时传入的具体实现类，发现是  RequestQueue 初始化时传入的 `Network network = new BasicNetwork(stack);` 网络请求的执行具体实现在 BasicNetwork.performRequest(); 返回一个 封装二进制byte[]数据的NetworkResponse，具体逻辑暂时可以不关心，回到run()函数继续跟踪网络请求执行主实践流程；随后`mCache.put(request.getCacheKey(), response.cacheEntry);`,将需要缓存的请求response放入缓存中，最后 `mDelivery.postResponse(request, response);` 同样最终类的具体实现，可以看出 mDelivery的具体实现是 `new ExecutorDelivery(new Handler(Looper.getMainLooper()))` 依旧是利用Handler 将消息post到UI线程刷新界面；

{% highlight java %}

// Deliver a normal response or error, depending.
if (mResponse.isSuccess()) {
  mRequest.deliverResponse(mResponse.result);
} else {
  mRequest.deliverError(mResponse.error);
}

{% endhighlight %}

消息Post回调如上，整体的一条主线到此就基本走完了，Volley的第一个无缓存的网络请求流程就理清头绪，继续回头绕回 Add函数后面的 Cache过程：

`CacheDispatcher` 类似于上面的网络请求 `networkDispatcher`，需要注意的一点，进入run实现可以发现默认的请求是先走 `CacheDispatcher` 判断是否需要缓存，是否有缓存，是否缓存过期，而后分发到`networkDispatcher`；
