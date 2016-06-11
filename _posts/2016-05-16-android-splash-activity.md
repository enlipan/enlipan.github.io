---
layout: post
title:  About Splash Activity
category: android
keywords: [android, launch]
---

目前主流的闪屏页都是利用一个单独的Activity完成功能，利用闪屏页完成广告等展示，有的应用甚至固定展示5秒，用起来其实蛮干着急的，有的应用甚至在闪屏页加载大图同时没有正确设定主题，导致的情形是闪屏之前有白屏显示，完整的情形是白屏然后闪屏N秒，最后进入应用主界面，用户体验极其糟糕，至少我个人强迫症看着郁闷；

AndroidDeveloper 对于这种情况已经给出了更好的实践方式，利用 ActivityTheme 设定，也就是基于Activity的onCreate创建展示在主题展示之后的原理，通过设定主题而达到闪屏页资源的加载问题；


设定  android:windowBackground 属性为需要展示的 Splash 图片，Activity在Oncreate之前会优先展示，需要注意的一个问题是，如果直接设定背景显示为 ImageSrc 由于图片在不同显示设备不同分辨率情形上的问题，会导致图片加载无法确定的不完全显示等等问题，因而我们可以利用 Layer属性创建自定义的 Layer，同时在Layer中设置图片的展示配置，具体配置如同Google示例所展示；

{% highlight xml %}

<layer-list xmlns:android="http://schemas.android.com/apk/res/android" android:opacity="opaque">
  <!-- The background color, preferably the same as your normal theme -->
  <item android:drawable="@android:color/white"/>
  <!-- Your product logo - 144dp color version of your app icon -->
  <item>
    <bitmap
      android:src="@drawable/product_logo_144dp"
      android:gravity="center"/>
  </item>
</layer-list>

{% endhighlight %}  

android:opacity="opaque" 用于防止在主题切换时背景的黑色闪烁问题，对于展示体验的完整性尤其重要；

同时可以通过利用 setTheme() 进行主题的正常切换，需要注意的是主题的设置要在 super.onCreate()之前设置完成,由于 超类中 onCreate()会进行主题资源的加载设置；

{% highlight java %}

public class MyMainActivity extends AppCompatActivity {
 @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Make sure this is before calling super.onCreate
    setTheme(R.style.Theme_MyApp);
    super.onCreate(savedInstanceState);
    // ...
  }
}

{% endhighlight %}  

---


[Use cold start time effectively with a branded launch theme](https://plus.google.com/+AndroidDevelopers/posts/Z1Wwainpjhd)


[Android 应用启动界面自定义](http://blog.chengyunfeng.com/?p=741)
