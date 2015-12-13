---
layout: post
title: AndroidStudio Gradle Tips (1)
category: android
---

* set minSdk in build.gradle (★★★)              
android {
  productFlavors {
    dev {
        minSdkVersion 21
    }
    prod {
        minSdkVersion 14
    }
  }
}
Packaging process is two step. one is class to dex. other is merging dex. but after api 21 (Lollipop) is based on ART. so It doesn’t do merging dex. It is keypoint to save building time.
but Be careful. after changing minsdk value, AS wouldn’t warn api level.

* Update Gradle              
更新Gradle版本，在AS中指定自定义新版本；

* add gradle.properties      
           
org.gradle.daemon=true

org.gradle.parallel=true

org.gradle.jvmargs=-Xmx768m

* 尽可能使用Gradle offline work
   1) setting->gradle-> offlinework
   2) use 
  
  compile files('libs/signpost-core-1.2.1.1.jar')
  compile 'com.android.support:multidex:1.0.1@aar'

compile 'com.android.support:multidex:1.0.1'

PS：很多时候我们发现版本号后面带 + 号，表示自动引用新版本，在国内网络环境下很不适用，同时由于没有指定具体版本号，我们自己有时候都无法定位使用的具体版本，遇到坑也无从着手是Lib中的坑还是自己的坑，自己给自己找了很多麻烦，所以还是建议使用具体的版本号指定版本；