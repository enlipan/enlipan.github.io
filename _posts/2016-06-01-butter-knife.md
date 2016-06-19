---
layout: post
title:  Butter Knife
category: android
keywords: [android, ButterKnife, GitHub]
---

### ButterKnife 使用：

配置 ButterKnife 依赖以及 apt：

{% highlight groove %}

//project.gradle:
buildscript {
    repositories {
        jcenter()
        mavenCentral()
    }
    dependencies {
        classpath 'com.neenbedankt.gradle.plugins:android-apt:1.8'
    }
}

//app.gradle:
apply plugin: 'com.android.application'
apply plugin: 'com.neenbedankt.android-apt'

android {

    ......

    //支持lint warning 检查机制
    lintOptions {
        disable 'InvalidPackage'
    }
    //防止其他引用冲突
    packagingOptions {
        exclude 'META-INF/services/javax.annotation.processing.Processor'
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

}

{% endhighlight %}  

###  原理探究：

####  注解相关：

**Anotation**

注解—— 能够添加到Java源码的语法元数据；用于将信息元素据与程序元素进行关联；

注解的三种Case：      
> 标记        
>       
> 编译时动态处理      
>      
> 运行时动态处理       

利用 @interface 自定义注解：而在自定义注解时利用 @Retention 指定注解保留时间；一般保留时间在编译时情况下，需要自定义 apt((Annotation Processing Tool);


**apt**

> In other words, instead of manually maintaining consistency among the entire set of files, only the base file would need to be maintained since the derived files are generated. The apt tool is designed for creating the derived files.



####  ButterKnife：  

**编译阶段**

*  扫描Java源码寻找定义的ButterKnife注解；       
*  生成对应的类 className$$ViewBinder.java 类，该类中生成了所有省略掉的对应源码，如findViewById()等等，并在最终打包时将这些类同时打包进入；     
*  源码中利用 ButterKnife.bind()注入；          

**运行时期**

*  通过ButterKnife.bind(TargetActivity)，间接利用findViewBinderForClass(TargetActivity.class)找到生成的 ViewBinder类    
*  调用viewBinder类的findViewById等函数，为 源码Activity中对应的注解的public属性注入对象；       
*  将Onclick事件等封装赋予对应OnClickListener()事件     


---

Quote:

[ButterKnife框架原理](https://bxbxbai.github.io/2016/03/12/how-butterknife-works/)

[Java Annotation 及几个常用开源项目注解原理简析](http://www.trinea.cn/android/java-annotation-android-open-source-analysis/)

[Getting Started with the Annotation Processing Tool](http://docs.oracle.com/javase/6/docs/technotes/guides/apt/GettingStarted.html)
