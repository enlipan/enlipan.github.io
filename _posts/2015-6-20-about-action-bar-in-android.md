---
layout: post
title: ActionBar  Support
category: android
---
####设置添加操作栏



####异常问题

{% highlight java %}

getActionBar Return NUll

Solution:

((ActionBarActivity)getActivity()).getSupportActionBar();


{% endhighlight %}

---

[Adding the Action Bar](http://developer.android.com/training/basics/actionbar/index.html)