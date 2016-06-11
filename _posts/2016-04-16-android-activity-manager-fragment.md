---
layout: post
title: Android FragmentActivity 源码分析
category: android
---

Fragment 有着复杂而难以管理的生命周期，很多人不喜欢，但是Fragment在UI模块化方面依旧有较多的可取之处，其灵活性，以及可重用性都较好，Fragment生命周期依附于其宿主Activity，所以要理清其生命周期依旧需要从源码着手；

### 从Fragment的使用说起

*  layout 中显示指定 fragment tag;

{% highlight xml %}

<fragment
    android:tag="********"
    android:id = "**********"
    android:name="com.lee.ShowCardFragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>

{% endhighlight %}  

>   When using the <fragment> tag, this implementation can not use the parent view's ID as the new fragment's ID. You must explicitly specify an ID (or tag) in the <fragment>.



*  FragmentManager动态管理

   ·add() 以及  replace()`;

{% highlight java %}

  getSupportFragmentManager().beginTransaction().add(R.id.container, cardFragment, "cardFragmentTag").commit();

{% endhighlight %}


### Fragment 管理相关源码



FragmentActivity 类结构图：

![FragmentActivity-UML](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160416/Fragment-souce-uml.JPG)


{% highlight java %}

final FragmentController mFragments = FragmentController.createController(new HostCallbacks());

{% endhighlight %}


FragmentController 为 Fragment宿主FragmentActivity封装FragmentNamager用于管理 Fragment生命周期；FragmentHostCallback 则统一封装了Fragment的管理宿主，持有了FragmentActivity以及Manager引用，提供了管理Fragment的宿主Activity的回调函数，事实上通过实现 FragmentHostCallback 模板可以简单的实现Fragment的管理机制；本质上 Controller依旧是利用 HostCallBack管理Fragment，更多的是提供了一层外部封装,类似Proxy机制；

####  FragmentManagerImp

首先来看我们熟悉的 FragmentTransaction事务管理：

{% highlight java %}

public FragmentTransaction beginTransaction() {
    return new BackStackRecord(this);
}

final class BackStackRecord extends FragmentTransaction implements  FragmentManager.BackStackEntry, Runnable

static final class Op {
    Op next;
    Op prev;
    int cmd;
    Fragment fragment;
    int enterAnim;
    int exitAnim;
    int popEnterAnim;
    int popExitAnim;
    ArrayList<Fragment> removed;
}

{% endhighlight %}

Fragment的事务式管理的真正实现是 BackStackRecord实例，同时利用 BackStackRecord.Op 静态内部类封装事务操作， 从Op属性可以看出其结构属于链表结构；


{% highlight java %}


public FragmentTransaction add(Fragment fragment, String tag) {
    doAddOp(0, fragment, tag, OP_ADD);
    return this;
}

private void doAddOp(int containerViewId, Fragment fragment, String tag, int opcmd) {
       fragment.mFragmentManager = mManager;

       if (tag != null) {
           if (fragment.mTag != null && !tag.equals(fragment.mTag)) {
               throw new IllegalStateException("Can't change tag of fragment "
                       + fragment + ": was " + fragment.mTag
                       + " now " + tag);
           }
           fragment.mTag = tag;
       }

       if (containerViewId != 0) {
           if (fragment.mFragmentId != 0 && fragment.mFragmentId != containerViewId) {
               throw new IllegalStateException("Can't change container ID of fragment "
                       + fragment + ": was " + fragment.mFragmentId
                       + " now " + containerViewId);
           }
           fragment.mContainerId = fragment.mFragmentId = containerViewId;
       }

       Op op = new Op();
       op.cmd = opcmd;
       op.fragment = fragment;
       addOp(op);
   }



{% endhighlight %}

此处 fragmentId 检查与 tag检查，回应了前面使用的Tip,layout 中 <fragment> 需要设定tag或者 id；



{% highlight java %}

//Commit ，Transation对象FragmentManagerImp 实例的enqueueAction()函数；
int commitInternal(boolean allowStateLoss) {
    if (mCommitted) throw new IllegalStateException("commit already called");
    if (FragmentManagerImpl.DEBUG) {
        Log.v(TAG, "Commit: " + this);
        LogWriter logw = new LogWriter(TAG);
        PrintWriter pw = new PrintWriter(logw);
        dump("  ", null, pw, null);
    }
    mCommitted = true;
    if (mAddToBackStack) {
        mIndex = mManager.allocBackStackIndex(this);
    } else {
        mIndex = -1;
    }
    mManager.enqueueAction(this, allowStateLoss);
    return mIndex;
}

///////////////////////////////////////////////////////

public void enqueueAction(Runnable action, boolean allowStateLoss) {
    if (!allowStateLoss) {
        checkStateLoss();
    }
    synchronized (this) {
        if (mDestroyed || mHost == null) {
            throw new IllegalStateException("Activity has been destroyed");
        }
        if (mPendingActions == null) {
            mPendingActions = new ArrayList<Runnable>();
        }
        mPendingActions.add(action);
        if (mPendingActions.size() == 1) {
            mHost.getHandler().removeCallbacks(mExecCommit);
            mHost.getHandler().post(mExecCommit);
        }
    }
}

Runnable mExecCommit = new Runnable() {
    @Override
    public void run() {
        execPendingActions();
    }
};


{% endhighlight %}

Fragment 利用 Runnable ActionList 结合 Handler 管理  BackStackRecord, 而 BackStackRecord 又封装了 Op管理 Fragment事务处理；Fragment的状态以下几种：

{% highlight java %}

//Fragment States
static final int INITIALIZING = 0;     // Not yet created.
static final int CREATED = 1;          // Created.
static final int ACTIVITY_CREATED = 2; // The activity has finished its creation.
static final int STOPPED = 3;          // Fully created, not started.
static final int STARTED = 4;          // Created and started, not resumed.
static final int RESUMED = 5;          // Created started and resumed.

{% endhighlight %}

同时如果常用Fragment 会遇到常见的两个错误问题，也就是事务提交时的 Fragment状态审查异常；其具体原因在 Quote引用文章《Fragment Transactions & Activity State Loss》，表诉非常清楚，需要注意的是Fragment版本区别，这一版本差异所直接导致的影响在于，如果利用 Surpport V4 包 其Fragment的状态保存时间点与 官方 Fragment是有差异的，源于 onSaveInstanceState()，函数的调用时间，以及Activity可能被系统回收销毁的时间点差异：

**pre-Honeycomb　 之前 Activity 在 onPause 之后就可能被系统回收，而  post-Honeycomb 之后在 onStop 之前是不会被回收，所以 这一差异导致 onSaveInstanceState()  函数调用的时间点是不同的，** 这一差异是非常重要的； 版本的差异导致的问题，往往在兼容性处理上有较多问题，Java的向前支持就导致自身日渐臃肿，虽然机制是日渐完善；很多人笼统的认为 Activity 的回收就是在 onStop() 或者 onPause之后，导致代码的Bug调试出现难以自圆其说的点， 最终问题只能靠猜，一点题外话，自己引以为戒；

所以在使用兼容包 Fragment时， 如果事务的提交在 onPause() and onStop() 之间是会有状态审查异常问题发生的，这一问题的根源就在于 onPause()前，Fragment 状态被保存了；状态被保存后，其恢复的时间点也是需要注意的，这个问题，导致我们在 Activity 生命周期中去处理 Fragment 事务要格外小心，例如 ：  onActivityResult(), onStart(), 以及看起来没啥问题的onResume()，而应该使用 Fragment 状态已经确保恢复的 FragmentActivity#onResumeFragments() 或者 Activity#onPostResume()去处理事务；

{% highlight java %}

private void checkStateLoss() {
    if (mStateSaved) {
        throw new IllegalStateException(
                "Can not perform this action after onSaveInstanceState");
    }
    if (mNoTransactionsBecause != null) {
        throw new IllegalStateException(
                "Can not perform this action inside of " + mNoTransactionsBecause);
    }
}

{% endhighlight %}


Fragment 状态管理


{% highlight java %}

//mFragmentController  >>>  class HostCallbacks extends FragmentHostCallback<FragmentActivity>;

void moveToState(Fragment f, int newState, int transit, int transitionStyle,
        boolean keepActive) {
        ......
        switch (f.mState) {
                case Fragment.INITIALIZING:
                  if (f.mParentFragment == null) {
                      mHost.onAttachFragment(f);
                  }

                  if (!f.mRetaining) {
                      f.performCreate(f.mSavedFragmentState);
                  }
                  ......
                case Fragment.CREATED:
                  f.mView = f.performCreateView(f.getLayoutInflater(
                    f.mSavedFragmentState), container, f.mSavedFragmentState);
                    ......
                  if (f.mHidden) f.mView.setVisibility(View.GONE);
                  f.onViewCreated(f.mView, f.mSavedFragmentState);
                  ......

{% endhighlight %}

Fragment 的状态变化中，我们仔细查看会发现 Fragment的生命周期管理都在这里进行了统一的管理处理，有些疑惑都可以通过这里来逐一解决 如： onHiddenChangde()等函数的调用时机等；

更加关键的是，通过这里可以了解到：其实Fragment的本质是 将Fragment中的View 动态的在合适的时间点Add到 Activity所在的ViewGroup中管理，并没有本质的区别；



最后是嵌套 Fragment StartActivityForResult问题，这一问题在其他文章已经表达过，这里不再赘述，注意嵌套Fragment 位置管理的移位处理：


{% highlight java %}

int mNextCandidateRequestIndex;
SparseArrayCompat<String> mPendingFragmentActivityResults;
private int allocateRequestIndex(Fragment fragment);
startActivityFromFragment();
onActivityResult();

{% endhighlight %}

Fragment有着复杂而又完善的生命周期管理机制，确实有人喜欢有人讨厌；

---


Quote:

[Fragment Transactions & Activity State Loss](http://www.androiddesignpatterns.com/2013/08/fragment-transaction-commit-state-loss.html)

[你可能漏掉的知识点: onResumeFragments](http://www.devtf.cn/?p=698)

[Fragment源码阅读笔记](http://www.jianshu.com/p/bd4a8be309c8)

[从源码角度剖析Fragment核心知识点](http://www.jianshu.com/p/180d2cc0feb5)

[Android实战技巧：Fragment的那些坑](http://toughcoder.net/blog/2015/04/30/android-fragment-the-bad-parts/)
