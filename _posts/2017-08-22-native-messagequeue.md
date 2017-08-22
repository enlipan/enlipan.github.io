---
layout: post
title:  MessageQueue 
category: android
keywords: [improvement,android]
---

### pipe   

管道属于 Unix 概念, 典型应用:  | 过滤符号,就属于管道应用,管道本质是一个文件,管道的一侧以写方式打开文件,另一侧则以读形式打开文件;读写交互完成通信;

Linux 中管道是一个操作方式为文件的内存缓冲区;

管道中没有数据的 Case 下,管道的读操作会阻塞,知道管道内被写入数据位置;

[Linux的进程间通信 － 管道](https://liwei.life/2016/07/18/pipe/)

### epoll  

* epoll_create - 创建epoll对象
* epoll_wait - 

epoll 本质依旧是轮询(当同时产生大量 IO 事件时),与之对比的是 select/poll 的全量轮询机制,IO事件的通知机制是基于中断,进而对内核通知,进一步等待的epoll 得到 io 事件的通知

[epoll-wiki](https://zh.wikipedia.org/wiki/Epoll)

### Native

{% highlight cpp %}
//android_os_MessageQueue.cpp
void NativeMessageQueue::pollOnce(JNIEnv* env, jobject pollObj, int timeoutMillis) {
    mPollEnv = env;
    mPollObj = pollObj;
    mLooper->pollOnce(timeoutMillis);
    mPollObj = NULL;
    mPollEnv = NULL;

    if (mExceptionObj) {
        env->Throw(mExceptionObj);
        env->DeleteLocalRef(mExceptionObj);
        mExceptionObj = NULL;
    }
}
{% endhighlight %}





{% highlight cpp %}
//Looper.cpp
int Looper::pollOnce(int timeoutMillis, int* outFd, int* outEvents, void** outData) {
    int result = 0;
    for (;;) {
        while (mResponseIndex < mResponses.size()) {
            const Response& response = mResponses.itemAt(mResponseIndex++);
            int ident = response.request.ident;
            if (ident >= 0) {
                int fd = response.request.fd;
                int events = response.events;
                void* data = response.request.data;
#if DEBUG_POLL_AND_WAKE
                ALOGD("%p ~ pollOnce - returning signalled identifier %d: "
                        "fd=%d, events=0x%x, data=%p",
                        this, ident, fd, events, data);
#endif
                if (outFd != NULL) *outFd = fd;
                if (outEvents != NULL) *outEvents = events;
                if (outData != NULL) *outData = data;
                return ident;
            }
        }

        if (result != 0) {
#if DEBUG_POLL_AND_WAKE
            ALOGD("%p ~ pollOnce - returning result %d", this, result);
#endif
            if (outFd != NULL) *outFd = 0;
            if (outEvents != NULL) *outEvents = 0;
            if (outData != NULL) *outData = NULL;
            return result;
        }

        result = pollInner(timeoutMillis);
    }
}

{% endhighlight %}


---

Quote:

[Android消息机制2-Handler(Native层)](http://gityuan.com/2015/12/27/handler-message-native/)

[epoll 原理](https://www.zhihu.com/question/20122137)


[Android消息机制架构和源码解析](http://wangkuiwu.github.io/2014/08/26/MessageQueue/)