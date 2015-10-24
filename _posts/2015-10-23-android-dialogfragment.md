---
layout: post
title: DialogFragment 应用
category: android
---

DialogFragment的使用：

DialogFragment可以自动管理因为屏幕旋转绘制导致的Dialog失去Activity-Contex而自动消失的问题。

两种创建方式：以系统Dialog形式OnCreateDialog弹出，或自定义View形式OnCreateView加载Layout文件。

由于DialogFragment本质是Fragment，所以其参数的获取依旧利用Bundle键值对传递，Fragment.setArguments(args);同时在其创建Create之时获取到传入参数，更新DialogFragment参数，进而灵活关联管理相关UI显示联动。

onCreateDialog():

借助AlertDialog.Builder方式构造：


{% highlight Java %}

    @Override 
    public Dialog onCreateDialog(Bundle savedInstanceState) { 
        Dialog dialog = super.onCreateDialog(savedInstanceState);
        // request a window without the title 
         dialog.getWindow().requestFeature(Window.FEATURE_NO_TITLE);        
         AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getActivity());      
         ...
         return alertDialogBuilder.create();
    } 

{%  endhighlight %}

onCreateView():

getDialog().requestWindowFeature(Window.FEATURE_NO_TITLE);
移除Dialog Title


onCreateView()完成Layout加载

onViewCreated完成View绘制

View的绘制过程如何改变Dialog弹框大小,好像是个比较麻烦的问题，View无论如何设定Layout布局参数，最后都会变成自适应Wrap。

目前发现两种方式改变其大小：

一：

> 设定layout xml文件的 android:miniWidth 可以强行拉大控制其大小

二： 

> 设定其根节点Root布局参数为match_parent;    
> 
> Dialog onResume()生命周期方法中设定合适的宽高:
> 
> getDialog().getWindow().setAttributes((android.view.WindowManager.LayoutParams) params);设定了宽高之后调用super.onResume();




---

[Using DialogFragment](https://github.com/codepath/android_guides/wiki/Using-DialogFragment)


[详细解读DialogFragment](http://www.cnblogs.com/tianzhijiexian/p/4161811.html)