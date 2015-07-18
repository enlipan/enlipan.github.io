---
layout: post
title: Fragment 小结
category: android
---
###Fragment是什么？

根据Google开发文档的定义：

> A Fragment represents a behavior or a portion of user interface in an Activity. You can combine multiple fragments in a single activity to build a multi-pane UI and reuse a fragment in multiple activities. You can think of a fragment as a modular section of an activity, which has its own lifecycle, receives its own input events, and which you can add or remove while the activity is running (sort of like a "sub activity" that you can reuse in different activities).

Fragment必须依赖于Activity这一宿主去生存，同时其状态受其宿主状态影响，当Activity 暂停，这一Activity中的Fragment也都会暂停(Paused).当Activity活动状态时，也就是Fragment威力显现的时候，其灵活性充分发挥，可以随意把某个Fragment当作独立个体去操纵，增加到Activity或者删除以及获取其中事件。同时将Layout从Activity中分离到Fragment中有利于动态管理视图显示。

关于Inflate()方法的第三个参数attachToRoot的官方解释：

> The inflate() method takes three arguments:
> 
> The resource ID of the layout you want to inflate.
> 
> The ViewGroup to be the parent of the inflated layout. Passing the container is important in order for the system to apply layout parameters to the root view of the inflated layout, specified by the parent view in which it's going.
> 
> A boolean indicating whether the inflated layout should be attached to the ViewGroup (the second parameter) during inflation. (In this case, this is false because the system is already inserting the inflated layout into the container—passing true would create a redundant view group in the final layout.)
> 

###Fragment的使用：

Fragment建立的初始原则就是：建立对于Activity的可重用视图模块组件，每一个Fragment都有其独立的对应layout视图xml文件，更有着自己独立的生命管理周期。

Fragment的使用主要有动、静两种方式：

* 一是通过Activity的layout文件写入固定的Fragment，利用android:name属性，这是**静**的使用类型，应用简便         

> 静态的应用流程是：Activity layout视图文件中显示配置android:name属性，指定对应的Fragment类，那么在该Activity启动加载时就会调用到setContentView加载layout视图，进而去调用到Fragment.java，进一步去使用Inflater装载写好的Fragment layout视图文件，进而达到完整的显示。
> 
>  Fragment的使用不是由Android系统调用的，其生命周期由其托管的Activity管理。 

*  二是通过Java代码写入逻辑，运行时动态选择添加Fragment视图文件，这代表着**动**，灵活性强

>利用FragmentManager去管理Fragment的装载，初期在Activity中只是简单的设定了Container容器，后期填入哪一个Fragment由自己灵活运行时设定。由于Container设定了id属性，所以可以很轻易的指定Fragment填入到哪里的容器。这样一来，填入什么，填入到哪里都是灵活动态装载的。
> 
> 需要再次额外提的`inflate(Rid,parent,attachtoroot)`方法的几个参数问题。我们在静态使用的时候是指定了填入哪个Fragment到哪个Activity中，所以无需再次绑定，防止多次绑定返回多余的ViewGroup。同样动态的时候也会自己手动后续绑定，所以基本上我们的attachtoroot都是填入的false，也就是将Fragment作为独立的view返回。


###Fragment间的通信：

*  由于Fragment是依存于Activity，可以利用`getActivity()`去获取顶层Activity上下文环境，进而获取到其他依存于该Activity的Fragment中的子类参数，也就达到了Fragment之间的数据传递。

*  Fregment通过定义内部回调接口，而容器Activity实现该回调接口方法。同样可以完成行为交互，以保证Fragment的独立性，把操作都丢给Activity。

*  设置Bundle——args绑定

---

总结一下：Fragment的控制方式主要包含动态与静态使用；

###静态使用

静态使用其完整流程如下:

{% highlight Java %}

Activity
setContentView(R.layout.activity)
layout.activity.xml文件中指定了Fragment实例
Fragment类利用LayoutInflater装载
Inflater.inflate(fragment.xml)

{% endhighlight%}



###动态替换Fragment

动态方法核心是利用`FragmentManager`,开启事务管理，增添或者替换fragment实例到相应的activity容器中。

替换fragment的过程类似于添加过程，只需要将add()方法替换为 replace()方法。
记住在执行fragment事务时，如移除或者替换，我们经常要适当地让用户可以向后导航与"撤销"这次改变。为了让用户向后导航fragment事务，我们必须在FragmentTransaction提交前调用addToBackStack()方法。

> Note：当移除或者替换一个fragment并把它放入返回栈中时，被移除的fragment的生命周期是stopped(不是destoryed).当用户返回重新恢复这个fragment,它的生命周期是restarts。如果没有把fragment放入返回栈中，那么当它被移除或者替换时，其生命周期是destoryed。
> 

###Fragment消息交互

为了让fragment与activity交互，一般是在Fragment 类中定义一个接口Callback，并在activity中予以实现。Fragment在生命周期的`onAttach(Activity activity)`方法中获取接口的实现，然后调用接口的方法来与Activity交互。

{% highlight Java %}

//Fragment onAttach
public void onAttach(Activity activity) {
        super.onAttach(activity);
        // This makes sure that the container activity has implemented
        // the callback interface. If not, it throws an exception
        try {
            mCallback = (OnHeadlineSelectedListener) activity;
        } catch (ClassCastException e) {
            throw new ClassCastException(activity.toString()
                    + " must implement OnHeadlineSelectedListener");
        }
    }

{% endhighlight %}

只要管理Fragment的Activity实现了相关的接口，同时借由了Attach生命周期方法，可以在Fragment中回调相应的Callback接口中的事件方法，保证了Fragment的独立性，委托Activity其托管Fragment任务，Fragment的独立性得以体现

那么Activity如何传递消息给Fragment？

其托管Activity通过findFragmentById()方法获取fragment的实例，然后直接调用Fragment的public方法来向fragment传递消息。同时也可以在Fragment开启实例之初绑定Bundle参数，然后再Fragment生命周期方法中获取绑定传输的数据。

{% highlight Java %}

ArticleFragment articleFrag = (ArticleFragment)
                getSupportFragmentManager().findFragmentById(R.id.article_fragment);

        if (articleFrag != null) {
            // If article frag is available, we're in two-pane layout...

            // Call a method in the ArticleFragment to update its content
            articleFrag.updateArticleView(position);
        } else {
            // Otherwise, we're in the one-pane layout and must swap frags...

            // Create fragment and give it an argument for the selected article
            ArticleFragment newFragment = new ArticleFragment();
            Bundle args = new Bundle();
            args.putInt(ArticleFragment.ARG_POSITION, position);
            newFragment.setArguments(args);

            FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

            // Replace whatever is in the fragment_container view with this fragment,
            // and add the transaction to the back stack so the user can navigate back
            transaction.replace(R.id.fragment_container, newFragment);
            transaction.addToBackStack(null);

            // Commit the transaction
            transaction.commit();
        }

{% endhighlight %}

###大屏Fragment灵活适配

核心是利用对Layout资源文件起别名的方式：思想是利用系统的大小屏适配查找，对不同资源layout文件其同一别名，在代码中加载别名，完成系统的适配。

{% highlight XML %}

res/values/refs.xml    
<item name="activity_masterdetail"  type ="layout" >@layout/activity_fragment</itme>

res/values/refs-xlarge.xml   OR   res/values/refs-sw800dp.xml 
<item name="activity_masterdetail"  type ="layout" >@layout/activity_twofragment</itme>

{% endhighlight %}

资源别名文件的type属性决定了资源ID属于什么内部类，即使存放在values文件中也依然属于R.layout内部类

系统根据大小屏幕自动映射到相应的@layout/activity\_fragmen 或者  @layout/activity\_twofragment,但是系统加载统一加载R.layout.activity\_masterdetail.



---

[使用Fragment建立动态UI](http://hukai.me/android-training-course-in-chinese/basics/fragments/index.html)

[Fragment-Google](http://developer.android.com/guide/components/fragments.html)

[Fragment交互](http://hukai.me/android-training-course-in-chinese/basics/fragments/communicating.html)