---
layout: post
title:  Android Tips part (20)
category: android
keywords: [improvement,android,java,js]
---


#### ReactNative 加载覆盖 Fresco 初始化参数

ReactNative 加载 RN 模块时会默认初始化 Fresco 图片加载引擎,而此处坑在于: 如果系统初始化过 Fresco 模块,自定义的加载配置会被此处的加载配置覆盖.

修复方式? 

{% highlight java %} 

/**
 * Configuration for {@link MainReactPackage}
 */
public class MainPackageConfig {

  private ImagePipelineConfig mFrescoConfig;

  private MainPackageConfig(Builder builder) {
    mFrescoConfig = builder.mFrescoConfig;
  }

  public ImagePipelineConfig getFrescoConfig() {
    return mFrescoConfig;
  }

  public static class Builder {

    private ImagePipelineConfig mFrescoConfig;

    public Builder setFrescoConfig(ImagePipelineConfig frescoConfig) {
      mFrescoConfig = frescoConfig;
      return this;
    }

    public MainPackageConfig build() {
      return new MainPackageConfig(this);
    }
  }
}

{% endhighlight %}

根据 ReactNative 源码可以看出,通过 MainPackageConfig 可以指定 FrescoConfig,也就不会覆盖 Config 参数了.

#### Android 属性中的 ? 与 @ 符号

总结:  
? 为动态属性跟随系统或应用主题设置变化,值从 Theme 中查找引用的资源名称,即预定义样式随着主题变化而变化. ? 通常需要搭配 attr 使用.

而与之相对的 @ 为固定属性,不随着 Theme 改变. 

而针对 ?与@的使用又有差别, 是使用系统中的还是应用中自定义的,如果使用系统的在不同的系统版本可能表现不一致,具体引用的区分: 

引用系统自带style/attr   :

@android:style/name  ==  @style/android:name   
?android:attr/name   ==  ?attr/android:name 

#### Android  悬浮窗权限开启  

{% highlight java %} 

<uses-permission android:name="android.permission.ACTION_MANAGE_OVERLAY_PERMISSION" /> 
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" /> 

@RequiresApi(api = Build.VERSION_CODES.M)
public void checkDrawOverlayPermission() {
   Log.v("App", "Package Name: " + getApplicationContext().getPackageName());

   // check if we already  have permission to draw over other apps
   if (!Settings.canDrawOverlays(context)) {
    Log.v("App", "Requesting Permission" + Settings.canDrawOverlays(context));
    // if not construct intent to request permission
    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
     Uri.parse("package:" + getApplicationContext().getPackageName()));
    / request permission via start activity for result
    startActivityForResult(intent, REQUEST_CODE);
   } else {
    Log.v("App", "We already have permission for it.");
    disablePullNotificationTouch();
   }
  }


{% endhighlight %}


[overlay-permission-on-my-activity](https://stackoverflow.com/questions/40437721/how-to-give-screen-overlay-permission-on-my-activity)



### 如何成为一个优秀的工程师  

https://www.quora.com/How-did-Evan-Priestley-learn-to-program


广度比深度更重要,广泛的学习能够让你触类旁通,加深相关领域知识的把控能力.但知识的深度却只能让你进一步了解某一块局部知识.

一定要清楚你是真正的喜欢编程.  

系统的设计与实现应该选择越简单越好的方案.这个很难通过纸上的学习,最好的学习形式还是实践. 

成为优秀的工程师需要积累大量的经验,这没有捷径,唯有不停的尝试与积累.  

学习复杂系统的最好方式是建立一个如何在最大规模范围工作的可伸缩模型,然后对其进行改进. 了解其交互形式,而不是过早的陷入细节中去.这也是为什么拓宽知识面比专注某一块知识更加有用的原因.  

永远保持好奇心,追求理解为什么,打破砂锅问到底. 怎么了? 为什么会这样?


### 如何构建解决问题的方法论?  

https://medium.freecodecamp.org/how-to-think-like-a-programmer-lessons-in-problem-solving-d1d8bf1de7d2

问题来源于理想与现实的差距

* 理解问题,准确的理解问题是什么,如果你不能简单的总结出事情是什么,你就是没有准确理解其本质                    
* 对于问题解决的计划,将你的解决方案计划出来,梳理出方案的准确计划再去动手         
* 分治.不要尝试一次性解决超大型问题,将问题分割成各个子问题,如果分割之后你还是不知道则一直分割,知道最终你知道每个问题的解决方案,各个击破,各子问题解合并成原始问题的最终解.           
* Stuck(被问题卡住).被卡住是正常的,深呼吸正常的去看待卡住的问题.一逐步调试,深入细节,明白程序究竟在做什么.二,重新从头看待问题. 三利用搜索引擎,但不要浪费时间去检测超大系统性问题,应该搜索被分割之后的具体的子问题答案.
* 实践.不停的实践,总结实践的经验



