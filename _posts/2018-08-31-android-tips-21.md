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

