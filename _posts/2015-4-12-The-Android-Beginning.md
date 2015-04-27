---
layout: post
title: My Android Beginning (1)
category: android
---

不久就要去上海入职了，虽说入职的是`Android`开发，但是自己对于`Andriod`并没有入门，当初拿到Offer也是凭着比较过硬的`Java`基础以及`Java Web`开发的经验成功转行到移动开发的，对于自己的成功转移动开发也比较满意，转眼硕士论文也基本完工，只等待答辩。在这个时间节点，很有必要把自己的理论知识补充起来，知识的补充选择网络`MOOC`辅助结合`Android编程权威指南`，两线并发利用这20天左右的时间完成课程。

看的过程中用记录本，随想随记记录了主要的学习要点，在这里整理下这些要点知识，顺便做知识的回顾

##Developing Android Apps——UDACITY课程学习记录

1. Android Studio安装与使用，尽量强迫自己适应快捷键的使用，使用熟练可加快自己思维的连贯性以及开发效率。
        
> 主要利用tips，以及Google去集中查看使用常用快捷键。
> 
> > 目前主要使用的是：代码提示补全CTRL+ALT+SPACE（利用setting-key修改为ALT+;），代码整理CTRL+ALT+L，接口实现，方法重载CTRL+O，方法查找CTRL+F，代码重命名（SHIFT+F6）,源码跳转(CTRL+B)，以及相关GIT版本管理
> 

2. SDK下载与设定，下载SDK可以利用GOAGENT科学上网去代理下载，相关文件可以下载得很大全。

> 关于项目创建之初Select SDK Target，minSdk是属于低通滤波器形式，只针对该版本以上开发。而TargetSdk却并不是高通形式，仅仅代表该SDK是开发测试运行主要运行平台。。考虑到Android平台的发展，一般我们选择最新版本去作为TargetSdk，去利用新特性版本开发，覆盖最大的用户群。
> 
> 包名设定：应该具有全球唯一性，防止冲突。一般可以利用互联网域名倒如我的个人域名倒置——com.info.itlipan，符合Java命名规范。

3. Activity/Fragment、Gradle、Android

> Android是一个完整的架构，其架构图不再赘述，网上很多，底层是Linux核心，师兄曾经建议好好学学Linux内核对于Android开发是有用的，后期是**知识补习点**，核心之上是C++ Lib以及Android Runtime，谈到C++，顺带指出高级的NDK开发相关知识，后期是**知识必学点**，再上层是Application Framework以及应用层。
> 
> Gradle 是完整的项目构建工具

![Android Gradle](/assets/img/20150418/android_gradle.jpg)

### Activity相关知识

MainActivity是App启动展示界面——在AndroidManifest文件中由<Intent-filter>指定,当然也可以不使用该Activity命名，只要知道其核心是由Manifest中指定的就OK。而Fragment是模块化显示，像箱子一样可以自由组合适配。

Android屏幕适配：

> 早起HVGA低分辨率屏幕适配，主要利用绝对布局框架
> 
> 当前屏幕分辨率的多样化，要创建弹性式布局，，主要去利用调整比例去适配，Linear、Relative、GridLayout是比较合适的布局方式。

ScrollView滚动，在屏幕滚动过程中如何平衡性能与展示效果，一般情况下在单屏幕无法显示完的情况下，我们设定**屏幕上下方各多准备好一个显示Item**，一方面滚动视图闪烁，显示效果好。同时为处理性能过度消耗问题，设定视图的循环更新处理。

![ScrollView](/assets/img/20150418/listviewscroll.png)

视图的创建流程一般是先前端界面XML文件处理，在完成数据的处理问题，向前端View控件填充数据，而数据的填充要尤其注意擅用Adapter去完成ListView数据填充问题。**Adapter与ListView**关联，互相之间请求反馈。

![AdapterDataUpdate](/assets/img/20150418/AdapterDataupdate.jpg)

另一个重要方法是`FindViewById()`,需要注意的是在视图Layout嵌套中，不要时时每次都去遍历整个XML文件构建资源树去获取View，我们知道XML的文件读取树的构建是非常消耗资源的。

![FindViewById](/assets/img/20150418/Findviewbyid.jpg)

整个完整的树中嵌套了一个子树，当我们已经获取子树之后，可以使用`Contain.findviewbyid(R.id.imgview)`去完成View控件的获取，而无需每次使用`Root.findviewbyid()`每次遍历根资源树去获取。另外有一种方式是利用View Holder的模式，减少在Adapter中getView()方法中调用findViewById()次数。


{% highlight java %}

public View getView(int position, View convertView, ViewGroup parent) {
    ViewHolder holder;
    if (convertView == null) {
        convertView = mInflater.inflate(R.layout.your_layout, null);
        holder = new ViewHolder();
        holder.text = (TextView) convertView.findViewById(R.id.text);
        convertView.setTag(holder);
    } else {
        holder = convertView.getTag();
    }
    holder.text.setText("Position " + position);
    return convertView;
}
private static class ViewHolder {
    public TextView text;
}

{% endhighlight %}

---

### 补充说明

**Lession 1 ————Lauching on a Device**

Command Line Tool Commands

The usage of these commands is entirely optional. The result is that same as clicking the Run button in Android Studio.          
chmod +x gradlew - This command only needs to be run once and is used to give gradlew the correct execute permissions         
gradlew assembleDebug - This command will compile the code.      
adb install -r app/build/outputs/apk/app-debug-unaligned.apk - This command will install the APK. With the -r flag it will overwrite any prior installed versions.         
Note if you have more than one device, you will need to use the -s flag right after adb to specify the serial number of the intended device.            
adb shell am start -n com.example.android.sunshine.app/com.example.android.sunshine.app.MainActivity - This command will actually run the app.

**Lession 1 ————The Code And Videos**

Note that there are multiple ways to view your project in Android Studio 1.0. We’ll work with the Project view, but the default Android view is also useful.

* libs/ - This folder contains any private libraries you might choose to use. We will not be using it for Sunshine.         
* app/src/ - This folder contains all of your source code, which includes Java files and the various XML, image and other resource files you’ll be using. It has a main and androidTest folder. The main folder contains the code you’ll be working on for the course, while the androidTest folder contains the testing suite code which we’ll talk about in Lesson 4.    
*  app/src/main/java - This subfolder contains all of your java code.    
* app/src/main/res - This subfolder contains all of your resource files. This includes:      
* layout - XML files that define the layout for different screens.     
* menu - XML files that define the application menus.    
* drawable - Your images can be stored here, such as the weather icons.    
* values - XML files that store values, such as colors and strings.    
* xml - XML files meant to configure components; we’ll be working with this folder in lesson 6.    
* app/src/main/AndroidManifest.xml - This file contains the basic structure of your app, what classes are included and how they relate. The Manifest file also provides what permissions your application needs from the user.   


[Managing Projects Overview](https://developer.android.com/tools/projects/index.html)

**Lession1 ————Adapter**

Adapters are a little unusual compared to similar mechanisms in other frameworks, in that the Adapter itself is responsible for creating the Views that are displayed within the bound AdapterView (for example a ListView) - while the AdapterView is responsible for how those views are laid out. 

**MainThread vs. Background Thread**

In Android there is a concept of the Main Thread or UI Thread. If you’re not sure what a thread is in computer science, check out this wikipedia article. The main thread is responsible for keeping the UI running smoothly and responding to user input. It can only execute one task at a time. If you start a process on the Main Thread which is very long, such as a complex calculation or loading process, this process will try to complete. While it is completing, though, your UI and responsiveness to user input will hang.

[Performance Tips for Android’s ListView](http://lucasr.org/2012/04/05/performance-tips-for-androids-listview/   "提升Android ListView性能的几个技巧")

### 引用说明

文中截图均出自于UDAcity课程[Developing Android Apps-Android Fundamentals](https://www.udacity.com/course/developing-android-apps--ud853   "Developing Android Apps课程链接")的视频截图
