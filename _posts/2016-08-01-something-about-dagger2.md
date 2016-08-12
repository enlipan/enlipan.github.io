---
layout: post
title:  Dagger2
category: android
---

Dagger2 类似 ButterKnife（compile-time annotations，生成ViewBind代理） ，Dagger利用Annotation Processing，编译时分析校验机制，是一种非常高效的依赖注入(No New,Dependence come to you)方式；

对象的实例化往往容易引入其他依赖，依赖注入可以减少外部直接依赖，实现更加内聚模块化，提升模块复用性，当然也更加容易使用单元测试；
Dagger2与Spring框架同样完成对象的依赖注入，而Dagger通过在编译阶段的工作，而针对其他借助反射的依赖注入框架而言相对大大提升了运行时的性能，与Spring通过xml或注解并借助反射的形式完全不同；

依赖注入所解决的问题可以用以下代码示例：


{% highlight java %}

ThreadExecutor threadExecutor = JobExecutor.getInstance();
PostExecutionThread postExecutionThread = UIThread.getInstance();

JsonSerializer userCacheSerializer = new JsonSerializer();
UserCache userCache = UserCacheImpl.getInstance(getActivity(), userCacheSerializer,
    FileManager.getInstance(), threadExecutor);
UserDataStoreFactory userDataStoreFactory =
    new UserDataStoreFactory(this.getContext(), userCache);
UserEntityDataMapper userEntityDataMapper = new UserEntityDataMapper();
UserRepository userRepository = UserDataRepository.getInstance(userDataStoreFactory,
    userEntityDataMapper);

GetUserDetailsUseCase getUserDetailsUseCase = new GetUserDetailsUseCaseImpl(userRepository,
    threadExecutor, postExecutionThread);
UserModelDataMapper userModelDataMapper = new UserModelDataMapper();

this.userDetailsPresenter =
    new UserDetailsPresenter(this, getUserDetailsUseCase, userModelDataMapper);

{% endhighlight %}

可以看到当对象之间存在复杂的依赖关系时，我们需要不停的去New出自己需要的对象，自行set注入对应的依赖关系，代码繁琐，可读性差，事实上我们需要的是A对象完成某些逻辑，并不关心B，C对象，而这种方式却让我们无时无刻不留意其依赖对象，而且每次需要时都要完成整个注入链，实在痛苦；


>  Dagger 2 is the first to implement the full stack with generated code. The guiding principle is to generate code that mimics the code that a user might have hand-written to ensure that dependency injection is as simple, traceable and performant as it can be.


### Dagger中的几种注解：

*  @Inject:利用依赖构建对象，需要依赖注入的地方

*  @Module:提供Inject构建对象时，所寻找依赖的地方（工厂），提供上层所需的依赖，Modul的层次思想明显，上层代码在获取依赖时并不关心Module层的具体提供，也就是一旦依赖需要修改时也只需要更改Modeul层的提供而无需修改上层代码；   

*  @Provide:在Modeles用于定义函数，用以告诉Dagger我们希望用何种方式获取依赖，当某个对象需要注入时，框架通过Component桥梁，在Modeule中寻找用Provider标注的对应实例创建函数构建；

*  @Componet:提供Module与Inject的桥梁，连接二者，也就是提供依赖的底层与需要依赖注入的对象之间的映射关联关系，也就是需要依赖的对象将知道来源，提供依赖的对象明白注入去处;Componet 一般采用接口实现；Componet其Modules属性可以添加多个Module进行统一管理

*  @Scope:限定注解作用域

*  @Qualifier:当Class类型不足以区分类型时，用于强化鉴别机制，如指定Context类型，而ActivityContext与ApplicationContext都属于Context，或者当有多种实例对象可以产生时：如带参数构造函数与不带参数构造函数都可以生产对象，Qualifier注解用于解决这类依赖指定不清晰的问题；

总结：Dagger依赖注入的核心是Inject，Component，Module，以及Provider，各自分工组合完成；

### Dagger注入方式：

*  构造函数

*  类非私有属性

*  函数


> @Inject doesn’t work everywhere:             
Interfaces can’t be constructed.                
Third-party classes can’t be annotated.              
Configurable objects must be configured!      

###  Dagger依赖级别：

Module级别高于Inject构造函数，所以其流程如下：

* 针对某个注入目标对象，查看Component说依赖的Module是否提供该对象Provider

*  Provider函数中有无参数，若有参数，则检查该参数对应的Provider初始化

*  若对应Module无对应Provider，则检查Inject构造函数的情况，参数情况与以上类似的过程

### 依赖的组合形式：

既然有分层的形式，Inject属于应用层，并不Care谁提供的，而Module也并不Care谁来使用，那么核心就在Component的组合形式，试想如果整个应用所有的Module都由一个Component管理，这个Component必将成为脏代码，代码将不易于维护管理；

所以Component的划分如何合理需要按情况去定义，即不能跨度过大导致无法维护管理，也不能粒度过细导致过多的Component，管理困难，比较推荐的形式是针对MVP架构而言，每一套MVP（Activity）一个Component，这样在细分时管理粒度适中，结构更加清晰（很多人喜欢一个MVP单独划分一个子Package,如userinfo下userInfoActivity,userinfoPresenter,userinfoM,以及接口，这样在这个包下新增一个类同样清晰）。

### Dagger2使用：

Gradle依赖：

{% highlight groovy %}

// Root build.gradle:

dependencies {
     // other classpath definitions here
     classpath 'com.neenbedankt.gradle.plugins:android-apt:1.8'
 }


//  app/build.gradle:

// add after applying plugin: 'com.android.application'  
apply plugin: 'com.neenbedankt.android-apt'

dependencies {
    // apt command comes from the android-apt plugin
    apt 'com.google.dagger:dagger-compiler:2.2'
    compile 'com.google.dagger:dagger:2.2'
    provided 'javax.annotation:jsr250-api:1.0'
}


{% endhighlight %}

> By convention, @Provides methods are named with a provide prefix and module classes are named with a Module suffix.




---

Quote：

[Dagger 2 users-guide](http://google.github.io/dagger/users-guide)

[Dependency injection with Dagger 2](https://medium.com/@froger_mcs/dependency-injection-with-dagger-2-producers-c424ddc60ba3#.jv1zlbqbp)

[Dependency Injection with Dagger 2](https://github.com/codepath/android_guides/wiki/Dependency-Injection-with-Dagger-2)

[Tasting Dagger 2 on Android](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)

[Android：dagger2让你爱不释手](http://www.jianshu.com/p/cd2c1c9f68d4)

[Inject everything — ViewHolder and Dagger 2 (with Multibinding and AutoFactory example)](https://medium.com/@froger_mcs/inject-everything-viewholder-and-dagger-2-e1551a76a908#.z22tzr2cn)

[详解Dagger2](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0519/2892.html)
