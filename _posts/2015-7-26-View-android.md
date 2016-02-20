---
layout: post
title: View绘制与事件分发小结
category: android
---

### View 事件传递机制


事件传递的主线始于 Activity.dispatchTouchEvent() 终于 View.onTouchEvent()，若依旧未消费事件，则通过 onUnhandleEvent 向上级传递，最终至 Activity.onTouchEvent();

涉及：事件的传递 ，事件拦截，事件的响应；


* 事件起始永远是 Activity.dispatchTouchEvent(),进一步事件被传递到绑定到Window的rootView；


{% highlight java %}


    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            onUserInteraction();
        }
        if (getWindow().superDispatchTouchEvent(ev)) {
            return true;
        }
        return onTouchEvent(ev);
    }

{% endhighlight %}

Activity的 onUserInteraction()函数是一个空实现 可以通过复写该函数用于监听一些事件；

ViewGroup中事件的传递：

ViewGroup.dispatchTouchEvent():

首先校验 事件是否需要拦截 ：onInterceptTouchEvent()

若未拦截事件则根据 子View Add到ViewGroup的反序逐一遍历，同时检测事件的Action坐标点找到目标 TargetView 触发其 dispatchTouchEvent() 函数;

反序 这里需要注意，很多时候ListView中 Item中的时间冲突，为什么是上面的覆盖下面的，原因就在这里是坐标点都是满足的，但是由于是反序，后Add进来的View截获了事件；

若 目标View 处理消费了事件，则事件传递终止，否则 调用其 touchListener.onTouch()事件；若未设置 OnTouchListener ，则调用其 ViewGroup.onTouchEvent() 函数;



View 中事件的传递：

依旧始于 View.dispatchTouchEvent();

先触发 View.OnTouchListener.onTouch()事件，若Listener不存在，则触发 View.onTouchEvent() 事件；就到了我们熟悉的 DOWN MOVE  以及 UP 事件了；

{% highlight java %}

        case MotionEvent.ACTION_UP:
        ...

                    if (!post(mPerformClick)) {
                        performClick();
                    }
                }
            }


{% endhighlight %}

在 UP Action中 我们找到了 performClick() ,也就是 OnClick事件在此触发；

DOWN 事件中有一个需要注意的事项：

DOWN 事件必须返回 True 代表 该View 关心该事件，事件需要继续传递，否则 ACTION\_MOVE  以及 ACTION\_UP 不触发事件；而其他地方返回 true 则代表消费事件，是有差别的，需要注意；



### View 绘制







{:.center}
![view_mechanism_flow](/assets/img/20150726/view_mechanism_flow.png)

{:.center}
![view_draw_method_chain](/assets/img/20150726/view_draw_method_chain.png)

---

图片引用以及参考文章系列：

[Android View 自定义属性--作业部落系列](https://www.zybuluo.com/linux1s1s/note/104916)

[Android View绘制机制](http://blog.csdn.net/xushuaic/article/details/42638111)

[ Android LayoutInflater原理分析，带你一步步深入了解View(一)--guo神](http://blog.csdn.net/guolin_blog/article/details/12921889)

[How Android Draws Views](https://developer.android.com/intl/ja/guide/topics/ui/how-android-draws.html)


[浅析Android的窗口](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=555&fromuid=6)

---



[Android事件分发机制完全解析，带你从源码的角度彻底理解(上)--guo神](http://blog.csdn.net/guolin_blog/article/details/9097463)

[Android中的dispatchTouchEvent()、onInterceptTouchEvent()和onTouchEvent()](http://blog.csdn.net/xyz_lmn/article/details/12517911)

[Mastering the Android Touch System--PDF](http://wugengxin.cn/download/pdf/android/PRE_andevcon_mastering-the-android-touch-system.pdf)

[Mastering the Android Touch System--Youku](http://v.youku.com/v_show/id_XODQ1MjI2MDQ0.html)

[Tutorial Enhancing Android UI with Custom Views](http://v.youku.com/v_show/id_XODM4NzA3ODMy.html)

[View绘制与事件分发小结](http://stackvoid.com/details-dispatch-onTouch-Event-in-Android/)