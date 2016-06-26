---
layout: post
title:  Gradle BuildConfig 的一些注意
category: java
keywords: [gradle, android]
---

Copy一份自己定义的项目所用到的配置信息，需要注意的一点是： `IDKEY = '"c5bd9b0be39856cc78c3703b9e8ca568"'`并不是多加了一个 '' ,如果不加该单引号，则编译后引用 IDKEY的BuildConfig变量，会引用到 变量名为c5bd9b0be39856cc78c3703b9e8ca568的变量值，而非定义的常量字符串值：

{% highlight java %}

BuildConfig{

  IDKEY = "c5bd9b0be39856cc78c3703b9e8ca568"  


  IDKEY = c5bd9b0be39856cc78c3703b9e8ca568


}

{% endhighlight %}  

上述有明显差异，c5bd9b0be39856cc78c3703b9e8ca568是不存在的，所以出现编译失败；

{% highlight groovy %}

buildscript {
    repositories {
        jcenter()
        mavenCentral()
    }
    dependencies {
        classpath 'com.neenbedankt.gradle.plugins:android-apt:1.8'
    }
}

apply plugin: 'com.android.application'
apply plugin: 'com.neenbedankt.android-apt'



ext {
    ReleaseTag = "Release"
    DebugTag = "Debug"
    HANGZHOUWEATHERURL = "\"http://api.openweathermap.org/data/2.5/weather?q=hangzhou&APPID=c5bd9b0be39856cc78c3703b9e8ca568\""
    IDKEY = '"c5bd9b0be39856cc78c3703b9e8ca568"'

}

android {
    compileSdkVersion 23
    buildToolsVersion "23.0.3"

    //支持lint warning 检查机制
    lintOptions {
        disable 'InvalidPackage'
    }

    //防止冲突
    packagingOptions {
        exclude 'META-INF/services/javax.annotation.processing.Processor'
    }

    defaultConfig {
        applicationId "com.example.lee.butterknifedemo"
        minSdkVersion 15
        targetSdkVersion 23
        versionCode 1
        versionName "1.0"
        buildConfigField('String', 'TAG', '"Release"')
        buildConfigField('boolean', 'IS_LOG', 'false')
        buildConfigField "String", "WEATHERURL", HANGZHOUWEATHERURL
        buildConfigField "String", "IDKEY", IDKEY
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
//            buildConfigField('String','APPID','APPID')   result : APPID = APPID
//            buildConfigField('String','APPID',APPID) result : APPID = c5bd9b0be39856cc78c3703b9e8ca568 ;
        }
    }

    productFlavors {
        "fast" {
            minSdkVersion 21
        }
    }

    dependencies {
        compile fileTree(include: ['*.jar'], dir: 'libs')
        testCompile 'junit:junit:4.12'
        compile 'com.android.support:appcompat-v7:23.3.0'
        //butterknife
        compile 'com.jakewharton:butterknife:8.0.1'
        apt 'com.jakewharton:butterknife-compiler:8.0.1'
        //compile 'com.jakewharton:butterknife:7.0.1'
        compile 'com.google.code.gson:gson:2.7'
    }
}


{% endhighlight %}  




---

[安卓集成发布详解](http://frank-zhu.github.io/android/2015/06/15/android-release_app_build_gradle/)
