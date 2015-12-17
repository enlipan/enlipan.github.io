---
layout: post
title: 嵌套Fragment.OnActivityResult Tip-1
category: android
---
StartActivityForResult作为Android中最常用的界面交互函数，其实并没有所想的那么简单，简单的说就是稍不注意就会自己给自己挖坑，后期填坑时还很恶心。

在多层次Fragment嵌套时稍不注意，造成的问题是底层Fragment无法获取到返回Activity分发的处理结果。

Fragment：

{% highlight java %}

       /**
     * Modifies the standard behavior to allow results to be delivered to fragments.
     * This imposes a restriction that requestCode be <= 0xffff.
     */
    @Override
    public void startActivityForResult(Intent intent, int requestCode) {
        if (requestCode != -1 && (requestCode&0xffff0000) != 0) {
            throw new IllegalArgumentException("Can only use lower 16 bits for requestCode");
        }
        super.startActivityForResult(intent, requestCode);
    }


{% endhighlight %}

FragmentActivity：

{% highlight java %}

     /**
     * Called by Fragment.startActivityForResult() to implement its behavior.
     */
    public void startActivityFromFragment(Fragment fragment, Intent intent,
            int requestCode) {
        if (requestCode == -1) {
            super.startActivityForResult(intent, -1);
            return;
        }
        if ((requestCode&0xffff0000) != 0) {
            throw new IllegalArgumentException("Can only use lower 16 bits for requestCode");
        }
        super.startActivityForResult(intent, ((fragment.mIndex+1)<<16) + (requestCode&0xffff));
    }


    /**
     * Same as calling {@link #startActivityForResult(Intent, int, Bundle)}
     * with no options.
     *
     * @param intent The intent to start.
     * @param requestCode If >= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     *
     * @throws android.content.ActivityNotFoundException
     *
     * @see #startActivity
     */
    public void startActivityForResult(Intent intent, int requestCode) {
        startActivityForResult(intent, requestCode, null);
    }

    /**
     * Launch an activity for which you would like a result when it finished.
     * When this activity exits, your
     * onActivityResult() method will be called with the given requestCode.
     * Using a negative requestCode is the same as calling
     * {@link #startActivity} (the activity is not launched as a sub-activity).
     *
     * <p>Note that this method should only be used with Intent protocols
     * that are defined to return a result.  In other protocols (such as
     * {@link Intent#ACTION_MAIN} or {@link Intent#ACTION_VIEW}), you may
     * not get the result when you expect.  For example, if the activity you
     * are launching uses the singleTask launch mode, it will not run in your
     * task and thus you will immediately receive a cancel result.
     *
     * <p>As a special case, if you call startActivityForResult() with a requestCode
     * >= 0 during the initial onCreate(Bundle savedInstanceState)/onResume() of your
     * activity, then your window will not be displayed until a result is
     * returned back from the started activity.  This is to avoid visible
     * flickering when redirecting to another activity.
     *
     * <p>This method throws {@link android.content.ActivityNotFoundException}
     * if there was no Activity found to run the given Intent.
     *
     * @param intent The intent to start.
     * @param requestCode If >= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     * @param options Additional options for how the Activity should be started.
     * See {@link android.content.Context#startActivity(Intent, Bundle)
     * Context.startActivity(Intent, Bundle)} for more details.
     *
     * @throws android.content.ActivityNotFoundException
     *
     * @see #startActivity
     */
    public void startActivityForResult(Intent intent, int requestCode, @Nullable Bundle options) {
        if (mParent == null) {
            Instrumentation.ActivityResult ar =
                mInstrumentation.execStartActivity(
                    this, mMainThread.getApplicationThread(), mToken, this,
                    intent, requestCode, options);
            if (ar != null) {
                mMainThread.sendActivityResult(
                    mToken, mEmbeddedID, requestCode, ar.getResultCode(),
                    ar.getResultData());
            }
            if (requestCode >= 0) {
                // If this start is requesting a result, we can avoid making
                // the activity visible until the result is received.  Setting
                // this code during onCreate(Bundle savedInstanceState) or onResume() will keep the
                // activity hidden during this time, to avoid flickering.
                // This can only be done when a result is requested because
                // that guarantees we will get information back when the
                // activity is finished, no matter what happens to it.
                mStartedActivity = true;
            }

            cancelInputsAndStartExitTransition(options);
            // TODO Consider clearing/flushing other event sources and events for child windows.
        } else {
            if (options != null) {
                mParent.startActivityFromChild(this, intent, requestCode, options);
            } else {
                // Note we want to go through this method for compatibility with
                // existing applications that may have overridden it.
                mParent.startActivityFromChild(this, intent, requestCode);
            }
        }
    }


{% endhighlight %}

mParent 指代的 Activity的父组件，这种情况下Activity作为部分View显示时，一般当Activity处于 AvtivityGroup时不为null，其他情况下Activity一般就已经处于顶层了。AvtivityGroup在API13被弃用，转FragmentManager组合Fragment。

{% highlight java %}

 /**
     * Same as calling {@link #startActivityFromChild(Activity, Intent, int, Bundle)}
     * with no options.
     *
     * @param child The activity making the call.
     * @param intent The intent to start.
     * @param requestCode Reply request code.  < 0 if reply is not requested.
     *
     * @throws android.content.ActivityNotFoundException
     *
     * @see #startActivity
     * @see #startActivityForResult
     */
    public void startActivityFromChild(@NonNull Activity child, Intent intent,
            int requestCode) {
        startActivityFromChild(child, intent, requestCode, null);
    }

    /**
     * This is called when a child activity of this one calls its
     * {@link #startActivity} or {@link #startActivityForResult} method.
     *
     * <p>This method throws {@link android.content.ActivityNotFoundException}
     * if there was no Activity found to run the given Intent.
     *
     * @param child The activity making the call.
     * @param intent The intent to start.
     * @param requestCode Reply request code.  < 0 if reply is not requested.
     * @param options Additional options for how the Activity should be started.
     * See {@link android.content.Context#startActivity(Intent, Bundle)
     * Context.startActivity(Intent, Bundle)} for more details.
     *
     * @throws android.content.ActivityNotFoundException
     *
     * @see #startActivity
     * @see #startActivityForResult
     */
    public void startActivityFromChild(@NonNull Activity child, Intent intent,
            int requestCode, @Nullable Bundle options) {
        Instrumentation.ActivityResult ar =
            mInstrumentation.execStartActivity(
                this, mMainThread.getApplicationThread(), mToken, child,
                intent, requestCode, options);
        if (ar != null) {
            mMainThread.sendActivityResult(
                mToken, child.mEmbeddedID, requestCode,
                ar.getResultCode(), ar.getResultData());
        }
        cancelInputsAndStartExitTransition(options);
    }

{% endhighlight %}

Fragment实例化：

{% highlight java %}

public Fragment instantiate(FragmentHostCallback host, Fragment parent) {
        if (mInstance != null) {
            return mInstance;
        }

        final Context context = host.getContext();
        if (mArguments != null) {
            mArguments.setClassLoader(context.getClassLoader());
        }

        mInstance = Fragment.instantiate(context, mClassName, mArguments);

        if (mSavedFragmentState != null) {
            mSavedFragmentState.setClassLoader(context.getClassLoader());
            mInstance.mSavedFragmentState = mSavedFragmentState;
        }
        mInstance.setIndex(mIndex, parent);
        mInstance.mFromLayout = mFromLayout;
        mInstance.mRestored = true;
        mInstance.mFragmentId = mFragmentId;
        mInstance.mContainerId = mContainerId;
        mInstance.mTag = mTag;
        mInstance.mRetainInstance = mRetainInstance;
        mInstance.mDetached = mDetached;
        mInstance.mFragmentManager = host.mFragmentManager;

        if (FragmentManagerImpl.DEBUG) Log.v(FragmentManagerImpl.TAG,
                "Instantiated fragment " + mInstance);

        return mInstance;
    }

{% endhighlight %}


FragmentActivity--onActivityResult：

{% highlight java %}

/**
     * Dispatch incoming result to the correct fragment.
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        mFragments.noteStateNotSaved();
        int index = requestCode>>16;
        if (index != 0) {
            index--;
            final int activeFragmentsCount = mFragments.getActiveFragmentsCount();
            if (activeFragmentsCount == 0 || index < 0 || index >= activeFragmentsCount) {
                Log.w(TAG, "Activity result fragment index out of range: 0x"
                        + Integer.toHexString(requestCode));
                return;
            }
            final List<Fragment> activeFragments =
                    mFragments.getActiveFragments(new ArrayList<Fragment>(activeFragmentsCount));
            Fragment frag = activeFragments.get(index);
            if (frag == null) {
                Log.w(TAG, "Activity result no fragment exists for index: 0x"
                        + Integer.toHexString(requestCode));
            } else {
                frag.onActivityResult(requestCode&0xffff, resultCode, data);
            }
            return;
        }

        super.onActivityResult(requestCode, resultCode, data);
    }

{% endhighlight %}

Activity在管理Fragment时会为每一个属于该Activity对应下的Fragment给予对应的Index索引标记；但是在Fragment嵌套管理子Fragment时，其下级Index管理是无法正确识别的。也就是嵌套Fragment的Index被Activity弄错了，其导致问题是没有调用Fragment收到了返回结果，应该收到的Fragment却没有收到。OnActivityResult返回：

{% highlight java %}

Fragment frag = activeFragments.get(index);
frag.onActivityResult(requestCode&0xffff, resultCode, data);

{% endhighlight %}

针对这一问题有几种解决方案：

根本的解决方案都是针对这一机制，或不使用底层Fragment的StartActivityForResult，而利用上级Fragment或Activity请求，层层向上直到调用，在获取RequestCode之后自行处理，自己获取之后作自顶向下自行分发。


 

在GitHub上找到了一个比较优雅的解决方案，跟我最初的思路是匹配的，由于索引的问题，无法分发到合适的Fragment，那么就分发给所有Fragment，**这种情况需要注意的是，协调好各级Fragment的请求码**，若有相同请求码的情况下，都会被触发，引起一些其他的难以预料的调用情景。**尤其需要注意的是嵌套多级回调时更是稍微不注意就会出现**,(如一些客户端的某些引流注册或完善信息的操作往往需要多层嵌套),我习惯各级Fragment用不同请求码，一级一位数，二级Fragment用两位数，三级用三位数即可，也可以使用其他的分类情况，总之需要定义好这样的情况能够极大避免这类问题。


 [GitHub Solutions](https://gist.github.com/artem-zinnatullin/6916740)

{% highlight java %}

    /**
    *在嵌套Fragment的父级Fragment中重写onActivityResult();
    */
@Override 
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    // notifying nested fragments (support library bug fix) 
    final FragmentManager childFragmentManager = getChildFragmentManager(); 
    if (childFragmentManager != null) { 
        final List<Fragment> nestedFragments = childFragmentManager.getFragments();
        if (nestedFragments == null || nestedFragments.size() == 0) return; 
        for (Fragment childFragment : nestedFragments) { 
            if (childFragment != null && !childFragment.isDetached() && !childFragment.isRemoving()) { 
                childFragment.onActivityResult(requestCode, resultCode, data);
            } 
        } 
    } 

{% endhighlight %}

另一种解决方案是：

嵌套Fragment不应该简单的调用StartActivityForResult，而应该使用`getActivity().StartActivityForResult（）`或者`getParentFragment.startActivityForResult`;
这两种方式都需要手动分发，getActivity方式只有Activity能接受请求，需要从Activity层层自定义分发，而getParentFragment方式只有顶层Fragment能接受，如何取舍看个人喜好。我个人认为`getParentFragment.startActivityForResult`的方式结合`childFragmentManager`自定义分发的处理方式更加合适；



---

Quote:


[onActivityResult() not called in new nested fragment API](http://stackoverflow.com/questions/13580075/onactivityresult-not-called-in-new-nested-fragment-api)

[Nested fragments and startActivityForResult()](http://blog.shamanland.com/2014/01/nested-fragments-for-result.html)

[Nested Fragments and the Back Stack](http://curioustechizen.blogspot.com/2014/01/nested-fragments-and-back-stack.html)


[How to make onActivityResult get called on Nested Fragment](http://inthecheesefactory.com/blog/how-to-fix-nested-fragment-onactivityresult-issue/en)

