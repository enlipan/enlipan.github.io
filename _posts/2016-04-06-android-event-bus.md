---
layout: post
title: Android EventBus 使用与源码探究
category: android
---

### EventBus 使用

#### 从直接使用开始


{% highlight groove %}

compile 'org.greenrobot:eventbus:3.0.0'

{% endhighlight %}  


参照 使用文档，结合注解，EventBus的使用上手简单到令人发指，对比之前的使用的一些情况现在的代码清晰度大大提升，这也是注解带来的一大优势：

{% highlight java %}

@Subscribe
public void onMessageEvent(MsgEvent event){
    Toast.makeText(this, event.msg, Toast.LENGTH_SHORT).show();
}

@Override
protected void onStart() {
    super.onStart();
    EventBus.getDefault().register(this);
}


@Override
protected void onStop() {
    super.onStop();
    EventBus.getDefault().unregister(this);
}

{% endhighlight %}  

对于注解我曾经在J2EE-SpringMVC中大量使用，其使用优势是精简大量代码，业务逻辑更加精炼清晰，劣势是影响性能，但是其对性能的影响有限，目前大多框架都大量使用了注解，关于注解的使用与相关文档详见 Quote ,


####  Sticky Events

一些业务逻辑对于事件的时效性并无强制要求，当事件没有发生时，订阅者取上一次发生的事件做出处理，一些常见的操作如： Location定位，如果当次Location定位没有，可以粗略的取上一次的定位事件的位置做出位置的判断也是可以大概确定位置继续业务逻辑的，粘性事件在这里属于缓存一样的存在，EventBus将 最后一个确定类型的事件保存在内存之中，需要注意的是  每一个 粘性事件的类型(对应 StickyEvents.class)只会有一个事件被保存在内存中，也就是最近的一个事件；同时可以利用   removeStickyEvent(StickyEvents.class); 从内存中移除该Sticky事件；也就是后续注册该粘性事件的 订阅者不会立即受到通知，因为内存中无事件；


####  ThreadMode

##### ThreadMode: POSTING

事件的发生和接受事件的线程是同一线程，无线程切换，事件的开销小，属于EventBus 默认事件线程模型；适用于可以快速返回的事件，同时尤其注意的是需要避免阻塞线程，因为其事件所处在的线程可能是 UI 线程；


{% highlight java %}

@Subscribe(threadMode = ThreadMode.POSTING) // ThreadMode is optional here

{% endhighlight %}  

##### ThreadMode: MAIN

指定 订阅者接受事件的线程为 主UI线程，若事件的 Post也在UI线程，则直接获取执行，事件的接受操作需要注意 耗时，避免阻塞UI线程；

#####  ThreadMode: BACKGROUND

订阅事件发生在 后台线程中，若 postEvent 产生于后台线程，则该订阅事件 直接发生在产生该事件的线程中，而若 postEvent 产生于UI线程，则 事件的订阅获取发生在一个发生在一个后台单线程中逐一处理，该后台线程属于唯一线程，为了避免其这类UI线程产生，唯一后台线程处理模式这类事件处理的阻塞情况，这类事件也不能阻塞该独立线程，需要避免阻塞情况发生；

##### ThreadMode: ASYNC

事件的处理永远发生在一个独立线程之后，这里的独立与 BACKGROUND 模式有明显差异，该订阅事件发生的线程是与事件的产生线程完全独立的子线程，这类事件的接受线程模式适合处理高耗时，易阻塞事件；针对这一模式特性 —— 单开线程处理，EventBus内部使用了线程池优化处理 —— 控制最大并发线程数，重用线程；


####  Subscriber Priorities

> Within the same delivery thread (ThreadMode), higher priority subscribers will receive events before others with a lower priority. The default priority is 0.
Note: the priority does NOT affect the order of delivery among subscribers with different ThreadModes!


### EventBus 优势

可以通过使用看出，EventBus在消息传递方面有明显优势，精简了业务逻辑代码，对于接口回调 ，BroadcastReceiver通知，以及 数据的临时缓存，页面的通信刷新，以及异步事件处理 都是非常适合，省去大量冗余逻辑，简化数据传输的流程；


###  EventBus 源码探究

#### EventBus 核心源码研究：


**Event Regester**

{% highlight java %}

/**
    * Registers the given subscriber to receive events. Subscribers must call {@link #unregister(Object)} once they
    * are no longer interested in receiving events.
    * <p/>
    * Subscribers have event handling methods that must be annotated by {@link Subscribe}.
    * The {@link Subscribe} annotation also allows configuration like {@link
    * ThreadMode} and priority.
    */
   public void register(Object subscriber) {
       Class<?> subscriberClass = subscriber.getClass();
       List<SubscriberMethod> subscriberMethods = subscriberMethodFinder.findSubscriberMethods(subscriberClass);
       synchronized (this) {
           for (SubscriberMethod subscriberMethod : subscriberMethods) {
               subscribe(subscriber, subscriberMethod);
           }
       }
   }

   // Must be called in synchronized block
   private void subscribe(Object subscriber, SubscriberMethod subscriberMethod) {
       //EventType 代表 Event事件对应Class-- 具体见 findSubscriberMethods(subscriberClass); 返回subscriberMethods的构造过程
       Class<?> eventType = subscriberMethod.eventType;
       Subscription newSubscription = new Subscription(subscriber, subscriberMethod);
       CopyOnWriteArrayList<Subscription> subscriptions = subscriptionsByEventType.get(eventType);
       if (subscriptions == null) {
           subscriptions = new CopyOnWriteArrayList<>();
           subscriptionsByEventType.put(eventType, subscriptions);
       } else {
           if (subscriptions.contains(newSubscription)) {
               throw new EventBusException("Subscriber " + subscriber.getClass() + " already registered to event "
                       + eventType);
           }
       }

       int size = subscriptions.size();
       for (int i = 0; i <= size; i++) {
           if (i == size || subscriberMethod.priority > subscriptions.get(i).subscriberMethod.priority) {
               subscriptions.add(i, newSubscription);
               break;
           }
       }

       List<Class<?>> subscribedEvents = typesBySubscriber.get(subscriber);
       if (subscribedEvents == null) {
           subscribedEvents = new ArrayList<>();
           typesBySubscriber.put(subscriber, subscribedEvents);
       }
       subscribedEvents.add(eventType);

       if (subscriberMethod.sticky) {
           if (eventInheritance) {
               // Existing sticky events of all subclasses of eventType have to be considered.
               // Note: Iterating over all events may be inefficient with lots of sticky events,
               // thus data structure should be changed to allow a more efficient lookup
               // (e.g. an additional map storing sub classes of super classes: Class -> List<Class>).
               Set<Map.Entry<Class<?>, Object>> entries = stickyEvents.entrySet();
               for (Map.Entry<Class<?>, Object> entry : entries) {
                   Class<?> candidateEventType = entry.getKey();
                   if (eventType.isAssignableFrom(candidateEventType)) {
                       Object stickyEvent = entry.getValue();
                       checkPostStickyEventToSubscription(newSubscription, stickyEvent);
                   }
               }
           } else {
               Object stickyEvent = stickyEvents.get(eventType);
               checkPostStickyEventToSubscription(newSubscription, stickyEvent);
           }
       }
   }

   private void checkPostStickyEventToSubscription(Subscription newSubscription, Object stickyEvent) {
       if (stickyEvent != null) {
           // If the subscriber is trying to abort the event, it will fail (event is not tracked in posting state)
           // --> Strange corner case, which we don't take care of here.
           postToSubscription(newSubscription, stickyEvent, Looper.getMainLooper() == Looper.myLooper());
       }
   }

{% endhighlight %}  

总结过程：

* 寻找所有注册 Class 中所有 注解 @Subscribe 的函数                  
* 每一个Event.class 绑定一个 读写ArrayList订阅者列表；            
* 注册事件，处理事件优先级权重问题                    
* 处理粘性事件            


**Event Post**

{% highlight java  %}

/** Posts the given event to the event bus. */
public void post(Object event) {
    // 类似 Looper 机制  利用ThreadLocal 构建线程独立 PostingThreadState
    PostingThreadState postingState = currentPostingThreadState.get();
    List<Object> eventQueue = postingState.eventQueue;
    eventQueue.add(event);

    if (!postingState.isPosting) {
       // Check 该线程ThreadLocal绑定的 PostingThreadState 是否位于UI线程；
        postingState.isMainThread = Looper.getMainLooper() == Looper.myLooper();
        postingState.isPosting = true;
        if (postingState.canceled) {
            throw new EventBusException("Internal error. Abort state was not reset");
        }
        try {
            while (!eventQueue.isEmpty()) {
                postSingleEvent(eventQueue.remove(0), postingState);
            }
        } finally {
            postingState.isPosting = false;
            postingState.isMainThread = false;
        }
    }
}

private void postSingleEvent(Object event, PostingThreadState postingState) throws Error {
    Class<?> eventClass = event.getClass();
    boolean subscriptionFound = false;
    if (eventInheritance) {
        //找到 所有  Event.class 的继承类，考虑多态针对基类Event注册的情况；
        List<Class<?>> eventTypes = lookupAllEventTypes(eventClass);
        int countTypes = eventTypes.size();
        for (int h = 0; h < countTypes; h++) {
            Class<?> clazz = eventTypes.get(h);
            //检查所有基类，检查是否有注册Event 的订阅者；
            subscriptionFound |= postSingleEventForEventType(event, postingState, clazz);
        }
    } else {
        subscriptionFound = postSingleEventForEventType(event, postingState, eventClass);
    }
    if (!subscriptionFound) {
        if (logNoSubscriberMessages) {
            Log.d(TAG, "No subscribers registered for event " + eventClass);
        }
        if (sendNoSubscriberEvent && eventClass != NoSubscriberEvent.class &&
                eventClass != SubscriberExceptionEvent.class) {
            post(new NoSubscriberEvent(this, event));
        }
    }
}

private boolean postSingleEventForEventType(Object event, PostingThreadState postingState, Class<?> eventClass) {
    CopyOnWriteArrayList<Subscription> subscriptions;
    synchronized (this) {
        //获取注册 Event.class 的所有订阅者列表
        subscriptions = subscriptionsByEventType.get(eventClass);
    }
    if (subscriptions != null && !subscriptions.isEmpty()) {
        for (Subscription subscription : subscriptions) {
            postingState.event = event;
            postingState.subscription = subscription;
            boolean aborted = false;
            try {
                //真正的发送处理Event
                postToSubscription(subscription, event, postingState.isMainThread);
                aborted = postingState.canceled;
            } finally {
                postingState.event = null;
                postingState.subscription = null;
                postingState.canceled = false;
            }
            if (aborted) {
                break;
            }
        }
        return true;
    }
    return false;
}


//依据各种 订阅类型处理Event逻辑
private void postToSubscription(Subscription subscription, Object event, boolean isMainThread) {
     switch (subscription.subscriberMethod.threadMode) {
         case POSTING:
             invokeSubscriber(subscription, event);
             break;
         case MAIN:
             if (isMainThread) {
                 invokeSubscriber(subscription, event);
             } else {
                 mainThreadPoster.enqueue(subscription, event);
             }
             break;
         case BACKGROUND:
             if (isMainThread) {
                 backgroundPoster.enqueue(subscription, event);
             } else {
                 invokeSubscriber(subscription, event);
             }
             break;
         case ASYNC:
             asyncPoster.enqueue(subscription, event);
             break;
         default:
             throw new IllegalStateException("Unknown thread mode: " + subscription.subscriberMethod.threadMode);
     }
 }

 void invokeSubscriber(Subscription subscription, Object event) {
    try {
        subscription.subscriberMethod.method.invoke(subscription.subscriber, event);
    } catch (InvocationTargetException e) {
        handleSubscriberException(subscription, event, e.getCause());
    } catch (IllegalAccessException e) {
        throw new IllegalStateException("Unexpected exception", e);
    }
}


{% endhighlight %}

反射与注解的组合灵活的构建了整个 EventBus框架；


####  AsyncExecutor 与 RunnableEx：

EventBus 核心类，属于附属提供的一个异步线程工具类，内部封装了 自定义Builder线程池，以及Runnable与Exception异常处理的抽象接口  RunnableEx；其源码是比较简单的，但是其封装思想确实简洁，精炼；


{% highlight java  %}

/** Posts an failure event if the given {@link RunnableEx} throws an Exception. */
public void execute(final RunnableEx runnable) {
    threadPool.execute(new Runnable() {
        @Override
        public void run() {
            try {
                runnable.run();
            } catch (Exception e) {
                Object event;
                try {
                    event = failureEventConstructor.newInstance(e);
                } catch (Exception e1) {
                    Log.e(EventBus.TAG, "Original exception:", e);
                    throw new RuntimeException("Could not create failure event", e1);
                }
                if (event instanceof HasExecutionScope) {
                    ((HasExecutionScope) event).setExecutionScope(scope);
                }
                eventBus.post(event);
            }
        }
    });
}

{% endhighlight %}  

根据源码可以看到，我们可以通过自定义 Exception 且将 CustomException 实现 HasExecutionScope 接口，通过这一方式进而指定异常捕获事件的  scope 执行范围 ,确定 failure event 的 post 环境定位； Subscribe 就可以在自己的执行环境下，获取到 执行失败事件，进而做出对应的业务逻辑处理，其考虑确实相当完善；



---

Quote:

[EventBus Documentation](http://greenrobot.org/eventbus/documentation/)

[EventBus使用详解](http://liuling123.com/2016/01/EventBus-explain.html)

[EventBus 源码解析](http://codekk.com/blogs/detail/54cfab086c4761e5001b2538)

[公共技术点之 Java 注解 Annotation](http://a.codekk.com/detail/Android/Trinea/%E5%85%AC%E5%85%B1%E6%8A%80%E6%9C%AF%E7%82%B9%E4%B9%8B%20Java%20%E6%B3%A8%E8%A7%A3%20Annotation)

[Android注解与反射机制](http://efany.github.io/2016/04/02/Android%E6%B3%A8%E8%A7%A3%E4%B8%8E%E5%8F%8D%E5%B0%84%E6%9C%BA%E5%88%B6/)
