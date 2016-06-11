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



####  ButterKnife：  




---

Quote:

[ButterKnife框架原理](https://bxbxbai.github.io/2016/03/12/how-butterknife-works/)
-
