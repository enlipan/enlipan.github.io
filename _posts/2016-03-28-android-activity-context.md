---
layout: post
title: Android  Context 源码研究
category: android
---

### Context 是什么

如果查看Android 源码，会发现 Activity Service 以及ApplicationContext 都继承自Context，Context代表什么？其实做J2EE开发的会很熟悉这个Context，上下文环境，在程序的运行时构建完善的上下文资源环境，Android中有三种Context的实例，Activity Service 以及ApplicationContext，而BroadCast以及Provider虽然不属于Context实例，其运行却依然离不开Context，BroadCast在 onReceiver()是，会接受到系统传入的Context组件，用于获取上下文资源，进行完整的业务逻辑操作，而Provider 则在其创建时就会获取一个Context组件；


###  从Activity 相关Context：

{% highlight java %}

public class Activity extends ContextThemeWrapper
        implements LayoutInflater.Factory2,
        Window.Callback, KeyEvent.Callback,
        OnCreateContextMenuListener, ComponentCallbacks2,
        Window.OnWindowDismissedCallback {



  /**
   * A ContextWrapper that allows you to modify the theme from what is in the
   * wrapped context.
   */
  public class ContextThemeWrapper extends ContextWrapper {


{% endhighlight %}          


ContextThemeWrapper 在 ContextWrapper的基础上封装了一些主题相关的函数与属性，基于这一特性，LayoutInfater的获取时传入的Context不一样其主题属性会被附加的有些许差异；如源码所展示的,创建获取LayoutInflater并且浅克隆一个新的副本，并将克隆产生的LayoutInflater对象所关联的Context指向 this 对象；

{% highlight java %}

@Override public Object getSystemService(String name) {
    if (LAYOUT_INFLATER_SERVICE.equals(name)) {
        if (mInflater == null) {
            mInflater = LayoutInflater.from(getBaseContext()).cloneInContext(this);
        }
        return mInflater;
    }
    return getBaseContext().getSystemService(name);
}

/**
 * Create a copy of the existing LayoutInflater object, with the copy
 * pointing to a different Context than the original.  This is used by
 * {@link ContextThemeWrapper} to create a new LayoutInflater to go along
 * with the new Context theme.
 *
 * @param newContext The new Context to associate with the new LayoutInflater.
 * May be the same as the original Context if desired.
 *
 * @return Returns a brand spanking new LayoutInflater object associated with
 * the given Context.
 */
public abstract LayoutInflater cloneInContext(Context newContext);


{% endhighlight %}      


进一步看Activity的启动：

###  ApplicationContext 与 Context(Activity)

























---

Quote:

《Head First Android Develop》

[Context,What Context?](https://possiblemobile.com/2013/06/context/)

[What is Context in Android?--stackoverflow](http://stackoverflow.com/questions/3572463/what-is-context-in-android)

[Android应用Context详解及源码解析](http://blog.csdn.net/yanbober/article/details/45967639)


[从源码深入理解context](http://souly.cn/%E6%8A%80%E6%9C%AF%E5%8D%9A%E6%96%87/2015/08/19/%E4%BB%8E%E6%BA%90%E7%A0%81%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3context/)
