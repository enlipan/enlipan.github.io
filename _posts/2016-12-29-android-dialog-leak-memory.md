---
layout: post
title:  Dialog 特殊处理
category: android
keywords: [improvement,java]
---

*  [Activity has leaked window that was originally added](http://stackoverflow.com/questions/2850573/activity-has-leaked-window-that-was-originally-added?page=1&tab=votes#tab-top)

问题来自于 Window或者Dialog需要在离开(onDestroy)Activity之前被关闭,否者会报该内存泄漏Error；


*  setOnDismissListener(@Nullable OnDismissListener listener)

该函数也可能引起的NPE问题，先看源码：

{% highlight java %}

public void setOnDismissListener(@Nullable OnDismissListener listener) {
        if (mCancelAndDismissTaken != null) {
            throw new IllegalStateException(
                    "OnDismissListener is already taken by "
                    + mCancelAndDismissTaken + " and can not be replaced.");
        }
        if (listener != null) {
            mDismissMessage = mListenersHandler.obtainMessage(DISMISS, listener);
        } else {
            mDismissMessage = null;
        }
    }

    private static final class ListenersHandler extends Handler {
            private final WeakReference<DialogInterface> mDialog;

            public ListenersHandler(Dialog dialog) {
                mDialog = new WeakReference<>(dialog);
            }

            @Override
            public void handleMessage(Message msg) {
                switch (msg.what) {
                    case DISMISS:
                        ((OnDismissListener) msg.obj).onDismiss(mDialog.get());
                        break;
                    case CANCEL:
                        ((OnCancelListener) msg.obj).onCancel(mDialog.get());
                        break;
                    case SHOW:
                        ((OnShowListener) msg.obj).onShow(mDialog.get());
                        break;
                }
            }
        }
{% endhighlight %}

可以看到 mdialog.get()是可能为null的，由于dialog销毁后，该listener msg才会被发送，在msg队列处理之时是任何可能都可能发生的，鉴于该 WeakReference<DialogInterface>弱引用的存在消除了内存泄漏的问题，但是null的问题是可能存在的；



*  Message

Message 本质是一个链表，每一个回收的 Message 会被回收放置在表头，并利用 sPool静态变量保存链表表头；

{% highlight java %}

/**
     * Return a new Message instance from the global pool. Allows us to
     * avoid allocating new objects in many cases.
     */
    public static Message obtain() {
        synchronized (sPoolSync) {
            if (sPool != null) {
                Message m = sPool;
                sPool = m.next;
                m.next = null;
                m.flags = 0; // clear in-use flag
                sPoolSize--;
                return m;
            }
        }
        return new Message();
    }

    /**
         * Recycles a Message that may be in-use.
         * Used internally by the MessageQueue and Looper when disposing of queued Messages.
         */
        void recycleUnchecked() {
            // Mark the message as in use while it remains in the recycled object pool.
            // Clear out all other details.
            flags = FLAG_IN_USE;
            what = 0;
            arg1 = 0;
            arg2 = 0;
            obj = null;
            replyTo = null;
            sendingUid = -1;
            when = 0;
            target = null;
            callback = null;
            data = null;

            synchronized (sPoolSync) {
                if (sPoolSize < MAX_POOL_SIZE) {
                    next = sPool;
                    sPool = this;
                    sPoolSize++;
                }
            }
        }

/**
 * Callback interface for discovering when a thread is going to block
 * waiting for more messages.
 */
public static interface IdleHandler {
    /**
     * Called when the message queue has run out of messages and will now
     * wait for more.  Return true to keep your idle handler active, false
     * to have it removed.  This may be called if there are still messages
     * pending in the queue, but they are all scheduled to be dispatched
     * after the current time.
     */
    boolean queueIdle();
}

Looper.myQueue().addIdleHandler(new MessageQueue.IdleHandler() {
            @Override
            public boolean queueIdle() {
                return false;
            }
        });

{% endhighlight %}

该dialog内存泄漏问题在ART虚拟机未出现，而5.0以下出现，源于垃圾回收机制的保守性， 5.0以下虚拟机不会自动将未显示设置为null的对象回收：

{% highlight java %}

while (true) {
    Message msg = queue.take();
    msg.target.dispatchMessage(msg);
    msg.recycleUnchecked();
  }

{% endhighlight %}

在以上Message处理过程中，get到的msg对象在处理过程之后进行了回收，msg对象中的内容均赋值null被清空，但是msg对象本身源于queue.take()函数的阻塞一直被泄漏着；

此时，AlertDialog从内存池中取出 spool表头msg，该msg对象恰好就是已经泄漏的msg对象，而该泄漏的msg对象又被重新赋予了OnLickListener等对象重用，msg一直未被发送则一直未被处理，所以等于OnclickListener对象被泄漏；

完整的泄漏过程如上，针对以上问题引用文章给出了解决思路：

*  方案一：重新包装AlertDialog的 ClickListener，在dettachFromWindow时设置为null；

*  方案二：不停的刷新null Msg对象；减少queue.take()的阻塞时间，一旦msg重新被赋值前一个泄漏的msg对象在GC时就会被回收，也就是减少了泄漏的时间；

---

Quote:

[Android中导致内存泄漏的竟然是它----Dialog](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=516)

[避免Dialog内存泄露](https://www.zybuluo.com/SmartDengg/note/251076)

---

[A small leak will sink a great ship](https://medium.com/square-corner-blog/a-small-leak-will-sink-a-great-ship-efbae00f9a0f#.ysphcj4ws)

针对上面的文章的翻译文（略看，翻译略差）

[一个内存泄漏引发的血案-Square](https://github.com/hehonghui/android-tech-frontier/blob/master/issue-25/%E4%B8%80%E4%B8%AA%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E5%BC%95%E5%8F%91%E7%9A%84%E8%A1%80%E6%A1%88-Square.md)

---
[Android 内存泄漏总结](https://yq.aliyun.com/articles/3009)

[]()
