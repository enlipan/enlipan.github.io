---
layout: post
title:  Android Tips part (16)
category: android
keywords: [improvement,android,java]
---

### 代码规范

目前 Java 有两份代码规范,一是早先一直广为流传的 Google 规范,去年Ali 也推出了 Java 规范完美版,二者有同有异,可以比较来看;

一些值得注意的点: 

#### 命名: 

* 命名禁止使用中英文混合         
* 抽象类,异常类,测试类都应该有对应标识: 如  Abstract 头, Exception 尾, Test 尾等作为类名实际标识            
* 模块,以及类等使用设计模式相关,应该在类名有所体现,如 Factory,Observer,Adapter 等;    

#### 文件  

* 使用统一 UTF-8 编码文件         
* 禁用 tab 符              

#### 代码块  

* 适当的使用空行进行代码分块,逻辑分块           

#### 接口定义    
* 遵守接口契约,外部正在使用的二方接口签名禁止随意更改,可以使用废弃Deprecated 标识,并在注释中使用 {@link} 指向新的实现说明;(非常重要,谁也不希望更新的 SDK 版本发现代码到处都是错误)                

* 接口中的方法与常量声明应该简洁,不应该加上 public 等前缀头;(less is more),注意 Java8 中的接口方法默认实现非常灵活可以优雅的实现;

#### 类文件

* 类的实现应该遵循最小权限原则,注意何时该 public 何时不该,对于 public private 等函数在类中的排序应该有所约束;方法的排版应该有秩序,以便使用 IDE 进行方法查找时查看方法排列;

>   类内方法定义顺序依次是：共有方法或保护方法 > 私有方法 > getter/setter方法。但有个规则特例：[A,G]当一个类有多个构造方法，或者多个同名方法，这些方法应该按顺序放置在一起。即重载永不分离。 说明：共有方法是类的调用者和维护者最关系的方法，首屏展示最好；保护方法虽然只是子类关心，也可能是“模板设计模式”下的核心方法；而私有方法外部一般不需要特别关心，是一个黑盒实现；因为承载的信息价值较低，所有Service和DAO的getter/setter方法放在类的最后。  

* 过多层次的 if else 非常影响阅读性,通常应该借助 **卫语句(为复杂的状态构建出口)**,策略模式,状态模式等来进行精简

#### 多线程  

* 线程池的构建不应简单使用 Executors构建,屏蔽过多细节,使用ThreadPoolExecutor 可以让程序员知道更多所关心的细节;    
* 加锁同步应该注意考量其性能影响,能不加锁尽量不加锁(如常用的单例模式,使用静态内部类的 Holder 就比Double Check 更好,借助 JVM 的 loader 机制);即使加锁区域越精细化越好,而不是简单使用同步关键字处理;(Lock)
* 多对象加锁注意死锁的产生,注意从死锁的条件出发来避免死锁: 线程一需要对表A、B、C依次全部加锁后才可以进行更新操作，那么线程二的加锁顺序也必须是A、B、C，否则可能出现死锁。  
* 避免Random实例被多线程使用，虽然共享该实例是线程安全的，但会因竞争同一seed导致的性能下降。 在JDK7之后，可以直接使用API ThreadLocalRandom;       
* volatile关键字解决多线程内存不可见问题。对于一写多读，是可以解决变量同步问题，但是无法解决多写时的并发问题;

#### 注释

* 注释应该同步维护!!!   
* 谨慎的注释代码,不需要的代码不应该简单注释,使用好版本管理工具来清理你的代码;

PS: 事实上这些东西无论是在重构,还是代码风格,代码大全中都被反复的提及,读起来更是换汤不换药,而且书中说的更加详细,读起来更有知其然知其所以然之感,这里也仅仅是有个总结;

### 备忘拾遗 

#### 展开收起 View 实现

* 展开收起点击 View另起一行 

常见如微信的文章展开收起
          
* 展开收起在 TextView 末尾行,不另起行

如: 

{:.center}
![ExpandExample](http://7xqncp.com1.z0.glb.clouddn.com/ExpandExample.png)

其核心可以利用 TouchableSpan 的构建实现;

#### ListView/ScrollView/RecyclerView 滚动条自定义

{% highlight xml %} 

<!-- 垂直滚动条-->
android:scrollbarTrackVertical="@drawable/xxx_vertical_track"
android:scrollbarThumbVertical="@drawable/xxx_vertical_thumb"
<!-- 情况B ：水平滚动条-->
android:scrollbarTrackHorizontal="@drawable/xxx_horizontal_track"
android:scrollbarThumbHorizontal="@drawable/xxx_horizontal_thumb"

<!-- scrollbar 宽度(垂直 Bar) | 高度(水平 Bar) >
scrollbarSize="dp"
<!--Thumb 短条  Track 长条-->

{% endhighlight %}

* 自定义 Shape (最常用)
* .9 Patch 文件      
* @color/red 形式


#### RecyclerView 的拖拽实现

借助来自Google 的 Helper 封装实现,我们只需要定义实现对应的 ItemTouchHelper 就可以完成复杂的拖拽操作,具体的使用并不复杂: 

拖拽Helper 的暴露 api 中都有对应的文档说明,在对应的时机实现拖拽进而变更 Adapter 中的 Item 位置完成更新;

#### 工具强化

* SublimeText SnippetMaker 插件创建快捷 Snippet,定义一些特定的代码段   

#### adb shell dumpsys


打印出当前系统相关service信息: 

获取设备电池信息：adb shell dumpsys battery

获取cpu信息：adb shell dumpsys cpuinfo

获取内存信息：adb shell dumpsys meminfo

获取Activity信息：adb shell dumpsys activity

获取package信息：adb shell dumpsys package;加上-h可以获取帮助信息,获取某个包的信息：adb shell dumpsys package  PACKAGE_NAME

获取通知信息：adb shell dumpsys notification

获取wifi信息：adb shell dumpsys wifi

获取电源管理信息：adb shell dumpsys power,可以获取到是否处于锁屏状态：mWakefulness=Asleep或者mScreenOn=false

获取当前在栈顶Activity包名：adb shell dumpsys activity top
