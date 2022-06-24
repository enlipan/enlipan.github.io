---
layout: post
title: 嵌套Fragment Tip-2
category: android
---

前些天考虑的 Fragment.OnActivityResult 发现一些漏洞，根本的点其实还是有所欠缺，并不清晰，今天再遇到之后，回过头来看，就觉得很明了了。

前些天我提到 fragment requstcode 移位，无法正确确定的问题。提到了利用`getParentFragment()`去减少Fragment层次，但是有些问题现在回过头来看当时自己也是比较模糊的。


{:.center}
![nestedmore4](https://file.oncelee.com/assets%2Fimg%2F20151218%2Flevermore4.png)

多层次的Fragment嵌套问题中，如果Fragment层次超过三级，那么底层Fragment.getparentFragment().startActivityForResult(),依旧会产生RequestCode移位错乱问题。其实这类一般用的较少，一般底层Fragment被使用也是设计为DialogFragment。

经过验证在第二层也就是嵌套的Fragment中调用 startActivityForResult(),开始出现移位问题，一般这时我们使用getparentFragment启用startActivityForResult()；也就是从顶层Fragment启动，当然获取结果时onActivityResult（），也要从顶层Fragment进行分发；

而当层级超过三级时，我们应该层层向上，直到调用到顶层Fragment的startActivityForResult()；比较通用的写法应该是封装getParentFragment();

这样的处理方式使 Fragment层次依旧保持原有层级，也就是每个Fragment调用子Fragment依旧使用 getChildFragmentManager(),而不用笼统的使用FragmentManager();但是请求的发起却依旧是由FragmentManager()下的顶级Fragment发起；

**另一种方式**是 不使用getParentFragment(),而直接分发，在分发时对每个层级的requestCode都自己手动移位校验比较。这类方式也是可取的。


{% highlight java %}

    /**
     * get the Top Fragment which is contain by FragmentManager.
     * @param fragment
     * @return may be null,if the current Fragment is just under Activity
     */
    Fragment getTopParentFragment(Fragment fragment){
        Fragment topFragment = null;
        Fragment temp =  fragment.getParentFragment();
        while (temp != null){
            topFragment = temp;
            temp = temp.getParentFragment();
        }
        return topFragment;
    }

{% endhighlight %}



{:.center}
![leverchange](https://file.oncelee.com/assets%2Fimg%2F20151218%2Fleverchange.png)


当然在分发时依旧使用这种分发方式：

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

以上就是嵌套Fragment startActivityForResult()完整解决方案；

以上：需要知道的是利用getFragmentManager 与 getChildFragmentManager 启用Fragment是有严格的差异的：

FragmentManager是挂载在Activity index索引目录下，而后者则是挂载在Fragment子Fragment索引目录下；