---
layout: post
title:  RN 之 坑记录
category: android
keywords: [improvement,android,css]
---

#### Applicaction RNDemo has not been registered

问题描述：

Invariant Violation:Applicaction 项目名 has not been registered.This is either due to a require() error during initialization or failure to call AppRegistry.registerCommponent.

Fixed：

针对不同的Case有不同解决方案：

1. 针对运行多个Rn项目引起的问题关闭Node，重新运行当前要运行的项目即可解决     
2. 针对 js中注册的项目名称与 src 代码中项目名称不一致的问题则需要修改统一即可 —— [React-Native坑1](http://www.jianshu.com/p/82a09063e61c)             


####  Conflict with dependency 'com.google.code.findbugs:jsr305'.

> Resolved versions for app (3.0.0) and test app (2.0.1) differ. See http://g.co/androidstudio/app-test-app-conflict for details.

原生Android应用嵌入Rn模块，映入配置后的异常问题：

Fixed：

{% highlight xml %}

androidTestCompile('com.android.support.test.espresso:espresso-core:2.2.2') {
  exclude group: 'com.google.code.findbugs'
}

{% endhighlight  %}

#### java.lang.IllegalAccessError:

>  Method 'void android.support.v4.net.ConnectivityManagerCompat.()' is inaccessible to class 'com.facebook.react.modules.netinfo.NetInfoModule' (declaration of 'com.facebook.react.modules.netinfo.NetInfoModule' appears in /data/app/package.name-2/base.apk)


[Android java.lang.IllegalAccessError Method void android.support.v4.net.ConnectivityManagerCompat](https://github.com/facebook/react-native/issues/6152#issuecomment-200759453)

这个问题属于一个奇怪的问题，需要改动对应的SDK编译版本23，support-23.0.1；

####  Got JS Exception: ReferenceError: Can't find variable: \_\_fbBatchedBridge

>  java.lang.RuntimeException: java.util.concurrent.ExecutionException: com.facebook.react.bridge.JSExecutionException: ReferenceError: Can't find variable: \_\_fbBatchedBridge (<unknown file>:1)

[Can't find variable: __fbBatchedBridge (line 1 in the generated bundle)](https://github.com/facebook/react-native/issues/4881)

`adb shell input keyevent 82` —— 打开RN DevSetting菜单

`db reverse tcp:8081 tcp:8081` —— 反向socket绑定

[Android adb 命令](http://www.cnblogs.com/pixy/p/4739040.html)

Fixed:
{% highlight xml %}

react-native bundle \
   --assets-dest ./android/app/src/main/res/ \
   --entry-file ./index.android.js \
   --bundle-output ./android/app/src/main/assets/index.android.bundle \
   --platform android \
   --dev true

{% endhighlight  %}

React应用Bundle生成以及打包，输出到对应位置；

#### Got JS Exception: TypeError: undefined is not a function (evaluating '(bridgeConfig.remoteModuleConfig||[]).forEach')


Fixed:

{% highlight xml %}

allprojects {
    repositories {
        jcenter()
        maven {
          // All of React Native (JS, Android binaries) is installed from npm
          url "$rootDir/node_modules/react-native/android"
        }
    }
}

{% endhighlight  %}

该url路径配置错误导致的问题，注意该路径位置的匹配，该路径可以加载 node_modules 文件夹中 react-native本地最新版本库；

#### sdk版本覆盖

<uses-sdk tools:overrideLibrary="com.facebook.react"/>

React-Native对编译版本和最小编译版本都有要求，它需要app的build.gradle文件的minSdkVersion为16，Demo项目创建时最低版本为15甚至更低，这里需要在app的AndroidManifest.xml加入该声明；


####  flowconfig 文件

flowconfig属于 flow的配置文件，flow是facebook推出的js静态类型检查工具，.flowconfig文件的存在告诉Flow从该目录下开始检测；

[flow的使用](http://www.weidu8.net/wx/1009148309482813)

### 解决上诉问题的终极方案

最初自己根据创建Demo后实现将RN嵌入到原声Demo应用中时将上面的坑逐一踩了遍，再其后二次创建时采用了一个issue中的方案，更换移动目录的形式竟然避开了所有的问题直接嵌入成功；

原始目录结构：

> ReactNativeHybride                
> >  app      
> >  build            
> >  gradle            
> >  .......(其他原生应用文件)

在根目录下创建 android 文件夹目录，将原生应用文件均移动置 android 文件夹中，退出应用重新选择下层android 目录导入项目，之后再在根目录下进行 npm 初始化：

> ReactNativeHybride            
> android          
> > app            
> > ...               
> node_modules          
> index.android.js     
> package.json  


#### Package的注册问题

Package的注册一般有两种方式，一种是通过自定义Application，一种则是Activity级别的ReactInstanceManager实例；

{% highlight java %}

private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
        return true;
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new ToastExamplePackage());
    }
};

/////////////////////////////////////////////////////
public class ReactActivity extends AppCompatActivity implements DefaultHardwareBackBtnHandler {
    private static final int OVERLAY_PERMISSION_REQ_CODE = 0x11;
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModuleName("index.android")
                .addPackage(new MainReactPackage())
                .addPackage(new ToastExamplePackage())
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        mReactRootView.startReactApplication(mReactInstanceManager, "androidrn", null);

        setContentView(mReactRootView);

        getOverlayPermission();
    }
  ...
}

{% endhighlight  %}

以上两种方式，在我所写的Demo中，由于在已有原生应用中嵌入ReactActivity，所以使用到了 mReactInstanceManager构建ReactRootView，在该ReactActivity 再调用了原生Module，而在Demo文档中的Package信息时直接利用Application注入，**遗忘了
mReactInstanceManager** 才是真正的manager，总是找不到自定义的Model；

所以这里的关键在于找到整整的PackageManager，更好的方式是单例🌰ReactInstanceManager，而这也是官方推荐的；


### 首页白屏优化

[ReactNative安卓首屏白屏优化](https://github.com/cnsnake11/blog/blob/master/ReactNative%E5%BC%80%E5%8F%91%E6%8C%87%E5%AF%BC/ReactNative%E5%AE%89%E5%8D%93%E9%A6%96%E5%B1%8F%E7%99%BD%E5%B1%8F%E4%BC%98%E5%8C%96.md)

---

Quote：

[React Native移植原生Android项目](http://www.lcode.org/react-native%E7%A7%BB%E6%A4%8D%E5%8E%9F%E7%94%9Fandroid%E9%A1%B9%E7%9B%AE-%E5%B7%B2%E6%9B%B4%E6%96%B0%E7%89%88%E6%9C%AC/)

[learning-react-native](https://trello.com/b/Lbq1o6L9/learning-react-native)
