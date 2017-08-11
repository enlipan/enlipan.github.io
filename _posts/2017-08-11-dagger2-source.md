---
layout: post
title:  Dagger2's Generate Code
category: android
keywords: [improvement,android]
---

Dagger2 依赖注入,类似 Spring 的Bean工厂,Dagger2 通过在编译期间生成代码,构建 Factory,提供依赖注入

就常规而言如果没有依赖注入,要么我们自己实现工厂去构建解耦,自行注入对象,大型应用中如果全手写解除依赖,会非常Boring,相似的代码无限重写,这就是 Spring 这类依赖注入框架大行其道的原因;要么就是使用时 New 构建对象,这样导致完全耦合,一个需要明确的概念是耦合不等于内聚!

依赖注入的好处不用多说,分层解耦是核心,结合 MVP 实现各层次的解耦,引入单测框架可以非常有效的对核心 P 层,进行很好的测试实践,非常值得一提的是 Dagger2的生成代码规范可读性非常强,由于生成代码一则可以很好的调试,二者将耗时产生在编译时,对运行时性能几无影响;与之对应的 Spring 则使用 XML config配置的方式构建依赖图,同时框架内部自行处理依赖的前后顺序;

注: 但有时 Dagger2 容易造成一些严重的性能问题, 比如在 onCreate 中注入对象,而对象在构建时如果有严重的性能影响将会导致主线程阻塞(所以有 Lazy, 以及多线程构建对象的实践),所以我们在使用 Dagger 时不能简单的配置了当,在复杂的依赖图构建时,我们需要清楚各个对象的构建时间,生命周期也就是对应着 Dagger 中的 Scope,否则会导致各类奇奇怪怪的问题,这也是我一直认为 Dagger 对新手并不友好的原因;


这里我们主要从生成的 SourceCode来着手主要的 Component Module 以及 @inject 注入:;我们知道 Component 是 Module 提供依赖的接口,实际的注入过程事实上是通过 Component 注入;

单例 Singleton:

{% highlight java %}

public final class DoubleCheck<T> implements Provider<T>, Lazy<T> {
  private static final Object UNINITIALIZED = new Object();

  private volatile Provider<T> provider;
  private volatile Object instance = UNINITIALIZED;

  private DoubleCheck(Provider<T> provider) {
    assert provider != null;
    this.provider = provider;
  }

  @SuppressWarnings("unchecked") // cast only happens when result comes from the provider
  @Override
  public T get() {
    Object result = instance;
    if (result == UNINITIALIZED) {
      synchronized (this) {
        result = instance;
        if (result == UNINITIALIZED) {
          result = provider.get();
          /* Get the current instance and test to see if the call to provider.get() has resulted
           * in a recursive call.  If it returns the same instance, we'll allow it, but if the
           * instances differ, throw. */
          Object currentInstance = instance;
          if (currentInstance != UNINITIALIZED && currentInstance != result) {
            throw new IllegalStateException("Scoped provider was invoked recursively returning "
                + "different results: " + currentInstance + " & " + result);
          }
          instance = result;
          /* Null out the reference to the provider. We are never going to need it again, so we
           * can make it eligible for GC. */
          provider = null;
        }
      }
    }
    return (T) result;
  }
    /** Returns a {@link Provider} that caches the value from the given delegate provider. */
  public static <T> Provider<T> provider(Provider<T> delegate) {
    checkNotNull(delegate);
    if (delegate instanceof DoubleCheck) {
      /* This should be a rare case, but if we have a scoped @Binds that delegates to a scoped
       * binding, we shouldn't cache the value again. */
      return delegate;
    }
    return new DoubleCheck<T>(delegate);
  }
  ...
  }

{% endhighlight %}

Module 中标注@Singleton的 Provider 利用 DoubleCheck 封装单例实现;当然这个单例是跟随 Component 的作用域的,这点从源码可以提现,其保证了在一个 Component 对象中的对应 Provider 构建单例对象;

{% highlight java %}

public final class DaggerAppComponent implements AppComponent {
  private Provider<PreferencesManager> provideSharedPreferencesProvider;
  private MembersInjector<PosApplication> posApplicationMembersInjector;

  @SuppressWarnings("unchecked")
  private void initialize(final Builder builder) {
    this.provideSharedPreferencesProvider =
        DoubleCheck.provider(AppModule_ProvideSharedPreferencesFactory.create(builder.appModule));
        this.posApplicationMembersInjector =
        PosApplication_MembersInjector.create(provideSharedPreferencesProvider);
        ...
    }

  @Override
  public void inject(PosApplication application) {
    posApplicationMembersInjector.injectMembers(application);
  }

}


{% endhighlight %}
而 Subcomponent 为什么能成为获取 Component 的依赖作用域,从 generate 的源码可以看到其实 Subcomponent 是作为其内部类存在的;同时从源码可以看到实际的注入通过 Injector 实现,需要注入的对象成为 Injector 中的成员变量,在 `Injector.inject(Activity)` 时完成对于对象的注入;

而对于自定义 Scope ,则跟随 inject(Activity) 生命周期;对于自定义的 ActivityScope 可以看到,其需要 Inject 的对象作为了 Injector 中的成员变量,在整个被注入的 Activity 中都使用该对象,也就造成了对象的范围限定;事实上其根本在此:

{% highlight java %}

  @Override
  public SplashComponent plus(SplashPresenterModule module) {
    return new SplashComponentImpl(module);
  }

  private final class SplashComponentImpl implements SplashComponent {
    private final SplashPresenterModule splashPresenterModule;

    @SuppressWarnings("rawtypes")
    private Provider provideSplashContractViewProvider;

    private Provider<SplashPresenter> provideSplashPresenterProvider;

    private MembersInjector<SplashActivity> splashActivityMembersInjector;

    private SplashComponentImpl(SplashPresenterModule splashPresenterModule) {
      this.splashPresenterModule = Preconditions.checkNotNull(splashPresenterModule);
      initialize();
    }

    @SuppressWarnings("unchecked")
    private void initialize() {

      this.provideSplashContractViewProvider =
          SplashPresenterModule_ProvideSplashContractViewFactory.create(splashPresenterModule);

      this.provideSplashPresenterProvider =
          SplashPresenterModule_ProvideSplashPresenterFactory.create(
              splashPresenterModule,
              provideSplashContractViewProvider,
              DaggerAppComponent.this.provideApiManagerProvider,
              DaggerAppComponent.this.provideSharedPreferencesProvider);

      this.splashActivityMembersInjector =
          SplashActivity_MembersInjector.create(provideSplashPresenterProvider);
    }

    @Override
    public void inject(SplashActivity activity) {
      splashActivityMembersInjector.injectMembers(activity);
    }
  }

{% endhighlight %}

Activity 跟随着 独立的 new SplashComponentImpl(),在 SplashComponent中保存着独立的 ActivityScope 注入对象;

这里可以得出几个结论:

下层 SubComponent 可以完全知悉上层 Component, 而上层 Component 却对于下层 Sub 不甚明了;

Component 的作用域划分非常重要,对合适作用域构建合适的 Module, 否则轻则结构混乱,杂乱不堪,重则内存泄漏;粒度的划分属于仁者见仁智者见智的问题,小个人项目中以页面为单位也并未有何不可,但是在大型应用中则偏重与功能 Module, 当页面膨胀后过多的 Module生成的代码使代码膨胀;