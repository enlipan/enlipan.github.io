---
layout: post
title: Fragment.OnActivityResult 再补充
category: android
---

前些天考虑的 Fragment.OnActivityResult 发现一些漏洞，根本的点其实还是有所欠缺，并不清晰，今天再遇到之后，回过头来看，就觉得很明了了。

前些天我提到 fragment requstcode 移位，无法正确确定的问题。提到了利用`getParentFragment()`去减少Fragment层次，但是有些问题现在回过头来看当时自己也是比较模糊的。






{:.center}
![nestedmore4](\assets\img\20151218\levermore4.png)


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


{:.center}
![leverchange](\assets\img\20151218\leverchange.png)

{% endhighlight %}