---
layout: post
title: Android Tips part (6)
category: android
---

#### TextView 属性，setEms():

> android:ems or setEms(n) sets the width of a TextView to fit a text of n 'M' letters regardless of the actual text extension and text size. See wikipedia Em unit but only when the layout_width is set to "wrap_content". Other layout_width values override the ems width setting. Adding an android:textSize attribute determines the physical width of the view to the textSize * length of a text of n 'M's set above.

有一个坑的地方是，在屏幕分辨率不一样的情况下，如果设定控件宽度为em数字，会造成不一样的显示字符数，其中em 代表 "等 'M'"字符宽度，随着我们设置的字体大小，是会有变化的，在1080p上，设置3em宽度，普通显示3个字符，但是显示中设置字体为小号，则又仅仅显示两个字符了，因为小号是中文字符与M字符变小的比例不一样，小号是能显示3个m，只能显示2个文字，所以该属性控制是不可控的；同样的情况会出现在2K屏幕上，在Nexus 6p上，设置ems=3，只会出现2个字符；


#### adjustviewbounds属性：

保持view 宽高比，配合 maxWidth 以及 maxHeight使用（宽高wrap_content），图片将配合view的maxsize进行适配，以保证其比例，即宽高等比适配，直到宽或高适配与maxsize，也可以指定宽或者高，对另一边使用wrap_content，进行等比例缩放；


#### LinkedHashMap 用于Lru缓存；

其实该问题之前分析缓存时已经提到过，这里再次整理：

*  hash结构的数据map之间，元素之间无关联，无法定位元素先后add的关系，LinkedHashMap含双链表结构解决此问题                      
*  可以迅速定位最初add进入的元素，并利用链表的节点结构快速删除             
*  缓存重新add时，也可以对重复元素进行迅速节点变换，重新构造，改变其位置

####  SingleTop 以及SingleTask模式下复用Activity，Intent数据的接受问题：

SingleTask Model 一旦Activity复用时，需要在OnNewIntent中接受Intent，并setIntent()更新在newIntent，以便在其他地方可以接受到新的Intent； 而与之相似的 singleTop 同理；

>  This is called for activities that set launchMode to "singleTop" in their package, or if a client used the FLAG_ACTIVITY_SINGLE_TOP flag when calling startActivity(Intent). In either case, when the activity is re-launched while at the top of the activity stack instead of a new instance of the activity being started, onNewIntent() will be called on the existing instance with the Intent that was used to re-launch it. An activity will always be paused before receiving a new intent, so you can count on onResume() being called after this method. Note that getIntent() still returns the original Intent. You can use setIntent(Intent) to update it to this new Intent.

#### Android File路径：


{% highlight java %}

//  /data/packagename/files
Context.getFilesDir();  
//  /sdcard/Android/data/packagename/files/exter/
Context.getExternalFilesDir("exter");
//  /sdcard/
Environment.getExternalStorageDirectory();
//  /sdcard/exter/
Environment.getExternalStoragePublicDirectory("exter");

{% endhighlight %}


---

Quote:

[Android存储使用参考](http://www.liaohuqiu.net/cn/posts/storage-in-android/)
