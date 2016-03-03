---
layout: post
title: Android Tips part (6)
category: android
---




### LoaderManager initLoader VS  restartLoader

initLoader:

> Call to initialize a particular ID with a Loader. If this ID already has a Loader associated with it, it is left unchanged and any previous callbacks replaced with the newly provided ones. If there is not currently a Loader for the ID, a new one is created and started.

> This function should generally be used when a component is initializing, to ensure that a Loader it relies on is created. This allows it to re-use an existing Loader's data if there already is one, so that for example when an Activity is re-created after a configuration change it does not need to re-create its loaders.  




虽然Android Doc文档的描叙上二者很相似，但是其实还是有一些区别的：

* 当 loader 不存在时二者都会创建新的 Loader并激活其，处于active状态；       
* 当 ID 所对应标识的 loader存在时，initLoader 直接复用该 loader 更换其 loaderCallBack，可以用于当 Activity 配置变化，Activity重建但数据查找等不需要变化时重用 loader，更换其 callback更新UI；而 restartLoader 则更加激进，直接停止当前的loader，重新创建新的 loader，我们知道loader的加载是异步的，对象创建必然有开销,所以处处用restart是低效的；当我们明确数据比较陈旧，或者数据有变化时采用restartLoader确保数据及时展现出来；

> This decision is made solely based on the "need" for a new loader. If we want to run the same query we use initLoader, if we want to run a different query we use restartLoader.


> It's very important to understand the difference between the data that is loaded and the "query" to load that data. Let's assume we use a CursorLoader querying a table for orders. If a new order is added to that table the CursorLoader uses onContentChanged() to inform the ui to update and show the new order (no need to use restartLoader in this case). If we want to display only open orders we need a new query and we would use restartLoader to return a new CursorLoader reflecting the new query.



### ProgressDialog  show（）函数调用之后不显示问题

最近解同事的一个坑，将数据查找放在主线程中，结果当海量数据时出现了Dialog.show()函数调用后进度无法显示的问题；

结论：UI 线程阻塞引起；

Dialog.show()函数调用后，后续的UI线程中操作挤占了
界面的更改时间，造成界面卡顿，Dialog无法马上显示出来，严重者会出现ANR；

典型的重试可以尝试 ProgressDialog.Show() 之后 Thread.sleep(5000); 进度条不会里面显示出来就是这个原因；


### requestDisallowInterceptTouchEvent 解决事件的冲突问题

请求 ParentView 在touch事件的 拦截分发时，跳过 `onInterceptTouchEvent`，而直接分发事件交给 子View 处理事件：

典型处理事件：

 ScrollView 嵌套了 EditText，当EditText编辑文本较多时，需要可以Touch上下滚动查看，若不加以干涉，在滑动EditText 时，ScrollView会随之滚动，熟悉事件的传递机制就可以逐步分析解决：


{% highlight java %}

v.getParent().requestDisallowInterceptTouchEvent(true);
					switch (event.getAction() & MotionEvent.ACTION_MASK) {
						case MotionEvent.ACTION_UP:
							v.getParent().requestDisallowInterceptTouchEvent(false);
							break;
					}


{% endhighlight %}

需要注意的一点是： requestDisallowInterceptTouchEvent 设定的 View的标志位：FLAG_DISALLOW_INTERCEPT 不能对ViewGroup的 ACTION_DOWN 作用，也就是 ACTION_DOWN 事件触发时，父View总是会调用 onInterceptTouchEvent 确定是否需要拦截 Child View 事件，若ACTION_DOWN 确定不需要拦截，会重置 FLAG_DISALLOW_INTERCEPT 标志位，跳过后面的 onInterceptTouchEvent 验证；反过来说 一旦父ViewGroup 拦截了ACTION_DOWN ,那么即使设置了标志位也无法阻止事件拦截，因为后面的事件都无法传递到Child View中去了；

合理的利用该标志位，结合重写 View 的事件分发函数 dispatchTouchEvent() 可以优雅的解决滑动冲突问题；类似上述代码实例；

### 替换App 数据库

很多时候，我们在调试时需要在已有账号上做分析处理，而直接从服务器同步下拉数据往往耗时很多，如何将一份 db数据库直接导入App做开发调试：


{% highlight bash %}


adb shell

run-as  com.lee.demo
chmod 666  /data/data/com.lee.demo/database/demo.db

cat /sdcard/demo.db -> /data/data/com.lee.demo/database/demo.db

{% endhighlight %}


### Android中的对象序列化

  对象序列化是Android文件缓存中常用的操作之一，一般我们实现序列化接口完成对象的 ObjectInput(Output)Stream 完成对象的缓存操作，那么对于耗时性是否真正的关注或者考虑过呢？看到一篇文章的思路很好，[关于Android开发中Java对象序列化的一次测试](http://bxbxbai.gitcafe.io/2015/05/05/a-serializable-test/),将对象自定义输出装置，抛弃序列化接口繁重的反射性操作，比如文章中就将对象利用GSON转换成String字符串，再将字符串序列化，虽然GSON依旧利用了反射，但是根据其测试效果可以明显看出性能还是有比较大的改进；

  推而广之，我么可以根据具体对象的特性自定义其序列化机制，进一步完成更高性能的对象序列化机制；

### match_parent 其他细节

* RelativeLayout 中 若两个View 关系，写在前面的视图若依赖写在后面的view的id，是会报错的

最近一直写业务逻辑，突然写UI发现自己对于这个 match_parent 这个细节模糊了，写出UI脑海中竟然不能完全确认UI应该会长什么样，所以仔细回顾了这一细节知识点：

{% highlight java %}

wrong   RelativeLayout

<TextView
    android:layout_above="@id/yellow"
    android:id="@+id/green"
    android:background="#005500"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>

<TextView
    android:id="@+id/yellow"
    android:background="#999900"
    android:layout_width="match_parent"
    android:layout_height="50dp"/>

right   RelativeLayout

<TextView
    android:id="@+id/yellow"
    android:background="#999900"
    android:layout_width="match_parent"
    android:layout_alignParentBottom="true"
    android:layout_height="50dp"/>


<TextView
    android:layout_above="@id/yellow"
    android:id="@+id/green"
    android:background="#005500"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>


right-2   LinearLayout

<TextView
    android:id="@+id/green"
    android:background="#005500"
    android:layout_width="match_parent"
    android:layout_height="0"
    android:layout_weight="1"/>

<TextView
    android:id="@+id/yellow"
    android:background="#999900"
    android:layout_width="match_parent"        
    android:layout_height="50dp"/>



{% endhighlight %}

View layout xml 解析

RelativeLayout 中第一个先用到的 id 找不到，看起来很奇怪，明明在下面定义了，就是找不到，其实想想XML的解析机制就可以理解了，从上到下遍历，解析该View时无法获取下一个View的ID，所以更换位置同样的就好了

match_parent  若不加其他细节约束，则子View 会与其父View同样大小，我们可以利用这一约束，同时混合其他约束去细节的使用 match_parent,改变其大小，其含义可以变为在满足其他约束条件的情况下，尽可能的想父View一样大；前提条件是满足其他约束条件，如在某个View之上，或者在某个View之左，这样之后View的match_parent，就不再占有全部空间，如上例；可以揣测，UI布局文件绘制的时候，如果只有 match_parent 而无其他约束条件，解析之后绘制时并不知道其他元素的存在，所以就布满了整个父View；

一个UI写出来应该还没运行脑海中就需要知道长成什么样


###  Thread.join() 函数

多线程运行是，一个线程等待另一个线程执行完之后，再继续执行，等待过程中，线程阻塞wait状态；



###  /proc文件夹下读取文件获取cpu、内存等信息

获取CPU GPU 等系统信息


---


Quote:



[Difference between `initLoader` and `restartLoader` in `LoaderManager`](http://stackoverflow.com/questions/14445070/difference-between-initloader-and-restartloader-in-loadermanager)


[cat 输出文件内容](http://www.lampweb.org/linux/3/21.html)
