---
layout: post
title:  Dagger2
category: android
---

为什么要使用Dagger2？同样是依赖注入框架，Dagger2针对其前辈们（Spring，Guice，Dagger1）有什么优势？

{:.center}
![Dagger2](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160816/Dagger2.JPG)

Dagger2 没有了烦人的xml配置文件管理，不再依赖运行时反射检验机制，提升性能，这点针对移动设备尤其重要，利用编译时完全校验机制，编译时更加产生优雅的生成代码，可调试性增强等等优势。

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

### Dagger使用Inject注入方式：

*  构造函数

*  类非私有属性（not final ,not private）

*  函数Injection—— 方法参数依赖注入，注入发生在对象被完全加载完成时；（补充构造函数的设定，将方法参数注入到对象）


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

>  Note that the provided keyword refers to dependencies that are only needed at compilation. The Dagger compiler generates code that is used to create the dependency graph of the classes defined in your source code. These classes are added to the IDE class path during compilation. The apt keyword, which is provided with the android-apt plugin, does not add these classes to the class path, they are used only for annotation processing, which prevents accidentally referencing them.



#### About Scope ：

Scope 并没有神奇的特效，并非限定了某个Scope就制定了一个对象的生命周期规则，其生命周期规则需要执行结合Component以及实际的注入去限定；

>  A scoped provider creates one instance for that given scope for each component. Meaning a component keeps track of its own instances, but other components don't have a shared scope pool or some magic. To have one instance in a given scope, you need one instance of the component. This is why you must provide the ApplicationComponent to access its own scoped dependencies.

Scope的约定是针对于Coponent域，也就是与其对应Coponent管理对应，如Singleton单例，是在对应Component管理下提供的依赖下是单例的，如果另外构建了一个Component，也会同时构建另一个Component对应下的单例对象，对象的生命依附于Component实例；

介于上述对象生命类型依附于Component，我们可以通过控制Component的构建注入范围来控制对象，定义了Scope的Module在对应的范围下只有一个对象实例，而这个Component注入的范围是我们自行控制的，可以通过自定义合适名称的Scope结合Component的注入对象，控制依赖的Scope；

如：

{% highlight java %}

@PerFragment
component.inject(someFragment fragment);

{% endhighlight %}

这里再次说明了，对象的生命存在不是由 Scope 范围保证了，是我们自行定义的，Singleton究竟是应用中单例还是Activity范围内单例都是自行控制的，这与Component相关；如果应用生命周期内一个Component，如果所有使用对象的依赖是这个应用App中的Component提供，则该依赖注入对象应用全局单例；

**单例的有效范围随着其依附的Component**


#### Module 命名的一些约定：

@Modules（Provider） 与 @Inject(构造函数)  共同构建一副借助其依赖而链接起来的对象图，借助component（Interface）作为对象图的节点，连接各个Module；


> By convention, @Provides methods are named with a provide prefix and module classes are named with a Module suffix.

####  Component：

>  Any module with an accessible default constructor can be elided as the builder will construct an instance automatically if none is set. And for any module whose @Provides methods are all static, the implementation doesn’t need an instance at all. If all dependencies can be constructed without the user creating a dependency instance, then the generated implementation will also have a create() method that can be used to get a new instance without having to deal with the builder.


Component构建的构建规则由以下这些依赖共同构建形成：

> Those declared by @Provides methods within a @Module referenced directly by @Component.modules or transitively via @Module.includes
Any type with an @Inject constructor that is unscoped or has a @Scope annotation that matches one of the component’s scopes
The component provision methods of the component dependencies
The component itself
Unqualified builders for any included subcomponent
Provider or Lazy wrappers for any of the above bindings
A Provider of a Lazy of any of the above bindings (e.g., Provider<Lazy<CoffeeMaker>>)
A MembersInjector for any type

component 之间的依赖关系：当利用Component之间存在的依赖关系构建对象图时，被依赖Component需要提供对应对象的返回函数帮助构建对象图，也就是Module的传递；
Component 依赖时二者不能有相同Scope，有对应Cope时，二者要求一个独立的对象，但是对象明明在对应范围只应该存在一份实例，这就产生了对象生命范围冲突；

>  Two components with the same scope can break scoping.
From your example:
Component1 c1 = Dagger_Component1.create();
Component2 c2_a = Dagger_Component2.builder().component1(c1).build();
Component2 c2_b = Dagger_Component2.builder().component1(c1).build();
c1 has singletons which are used across c2_a and c2_b but the singletons from Component2 get separate instances in c2_a and c2_b.
—— By JakeWharton


Component如何解决多依赖（多级依赖）问题，如我们期望 Acomponent  依赖 Bcomponent ,而 Bcomponent 又依赖 CAppComponent进行一个依赖的传递，然而这样的使用这样是不允许的，我们可以通过继承完成多级依赖，也就是 Acomponent 依赖 Bcomponent,而Bcomponent extends CAppComponent,通过这样的形式解决多级依赖；

>  If you're going to do subcomponents in three levels, and you want to shuttle your singletons to the bottom layer, in the current code, just have your middle-tier component extend the application-level component. THis will expose those bindings to the lower-tier component without requring that you have your lower-tier depend on two scoped components.

{% highlight java %}

@dagger.Component(dependencies = ActivityComponent.class, modules = ScreenModule.class)
@PerScreenScope
interface ScreenComponent {}
//--
@dagger.Component(dependencies = AppComponent.class, modules = ActivityModule.class)
@PerActivityScope
interface ActivityComponent extends AppComponent {} // <---- note here, the pass-through contract.
//--
@dagger.Component(modules = AppModule.class)
@Singleton
interface AppComponent {}

{% endhighlight %}

>  if you do this, then all the contract of AppComponent is visible to ScreenComponent via ActivityComponent. then you don't have to do the multiple dependencies (which are disallowed)
That said, I think the forthcoming @SubComponent approach will make this a little cleaner, and with fewer methods, etc. But for now, the above should be a reasonable way to go.

>   Also, during migration, you can disable the "singleton can't depend on singleton" bit with an annotation processor flag -Adagger.disableInterComponentScopeValidation=warning (or none). It is intended as a migration aid from dagger 1 so please don't rely on it, as it may not be there forever. It doesn't disable all validations, but should at least permit you to do the singleton->singleton stuff while you migrate to separate meaningful scoping annotations.




---

Quote：

[Dagger 2 users-guide](http://google.github.io/dagger/users-guide)

[Dependency injection with Dagger 2](https://medium.com/@froger_mcs/dependency-injection-with-dagger-2-producers-c424ddc60ba3#.jv1zlbqbp)

[Dependency Injection with Dagger 2-codepath](https://github.com/codepath/android_guides/wiki/Dependency-Injection-with-Dagger-2)

[Dependency injection with Dagger 2 - the API](http://frogermcs.github.io/dependency-injection-with-dagger-2-the-api/)

[What determines the lifecycle of a component (object graph) in Dagger 2?](http://stackoverflow.com/questions/28411352/what-determines-the-lifecycle-of-a-component-object-graph-in-dagger-2)

[Snapshot release 13 breaks @Singleton #107](https://github.com/google/dagger/issues/107#issuecomment-71524636)

[Dagger 2 activity injection not working - Dagger2 inject BaseClass Not Working](http://stackoverflow.com/questions/29367921/dagger-2-activity-injection-not-working?rq=1)

[Tasting Dagger 2 on Android](http://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)

[Android：dagger2让你爱不释手](http://www.jianshu.com/p/cd2c1c9f68d4)

[Inject everything — ViewHolder and Dagger 2 (with Multibinding and AutoFactory example)](https://medium.com/@froger_mcs/inject-everything-viewholder-and-dagger-2-e1551a76a908#.z22tzr2cn)

[详解Dagger2](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0519/2892.html)

Youtube：

[DAGGER 2 - A New Type of dependency injection](https://www.youtube.com/watch?v=oK_XtfXPkqw)

[The Future of Dependency Injection with Dagger 2](https://www.youtube.com/watch?v=plK0zyRLIP8)
