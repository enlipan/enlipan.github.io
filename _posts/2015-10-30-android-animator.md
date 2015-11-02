---
layout: post
title: Android 属性动画应用
category: android
---

ValueAnimator:对某个值进行动画过度



ObjectAnimator:对任意对象的任意属性进行属性动画操作

{%  highlight java  %}


    private void startObjAnimator(View view){
        ObjectAnimator animator = ObjectAnimator.ofFloat(view, "rotation", 0f, 360f);
        animator.setDuration(5000);
        animator.start();
    }


{%  endhighlight  %}


属性动画针对对象的某个属性进行赋值，对象根据属性值的更改自行决定该属性的展示。上面的核心代码:`ObjectAnimator animator = ObjectAnimator.ofFloat(view, "rotation", 0f, 360f);`

{%  highlight java  %}

    /**
     * Constructs and returns an ObjectAnimator that animates between float values. A single
     * value implies that that value is the one being animated to. Two values imply starting
     * and ending values. More than two values imply a starting value, values to animate through
     * along the way, and an ending value (these values will be distributed evenly across
     * the duration of the animation).
     *
     * @param target The object whose property is to be animated. This object should
     * have a public method on it called <code>setName()</code>, where <code>name</code> is
     * the value of the <code>propertyName</code> parameter.
     * @param propertyName The name of the property being animated.
     * @param values A set of values that the animation will animate between over time.
     * @return An ObjectAnimator object that is set up to animate between the given values.
     */
    public static ObjectAnimator ofFloat(Object target, String propertyName, float... values) {
        ObjectAnimator anim = new ObjectAnimator(target, propertyName);
        anim.setFloatValues(values);
        return anim;
    }


{%  highlight  %}

该函数帮我们沿着一定的轨迹改变View(Target)的rotation属性值，View根据属性的更改刷新界面的显示，进而展示出动画效果。

ObjectAnimator内部对于Target的操作都是基于属性值的读取与赋值完成，也就是该Target必须具有该属性值的Getter与Setter函数，其中getter函数完成属性值的获取，setter完成属性值的赋值状态改变。此处对应的就是`setRotation()、getRotation()`。

如果该Target不具备该属性的getter或者setter函数会发生什么呢？属性对象将无法对于该目标对象的制定属性赋值，程序将Crash。

我们可以利用相应的封装完成该属性对象的完成。、

AnimatorSet 组合动画：

利用组合动画将多个ObjectAnimator组合拼装，按照一定的出现顺序完成复杂的动画效果。

* after(Animator anim)   将现有动画插入到传入的动画之后执行               
* after(long delay)   将现有动画延迟指定毫秒后执行             
* before(Animator anim)   将现有动画插入到传入的动画之前执行              
* with(Animator anim)   将现有动画和传入的动画同时执行        


Animator监听器:用于监听动画的执行过程。


动画Xml加载：`AnimatorInflater.loadAnimator`


TypeEvaluator接口的evaluate()函数：完成值的动画变更，其中fraction为动画完成度，通过与初值、结束值的结合运算
构造完成当前动画的该动画属性值


ObjectAnimator的高级用法：通过构造对象的特定属性的Getter与Setter封装完成当前动画值的获取与值的更新。


---

Quote：

[Android属性动画--Property Animation（一）](http://www.jcodecraeer.com/a/anzhuokaifa/developer/2013/0312/1006.html)

[ Android属性动画完全解析(上)，初识属性动画的基本用法](http://blog.csdn.net/guolin_blog/article/details/43816093)

[Android 属性动画（Property Animation） 完全解析 （上）](http://blog.csdn.net/lmj623565791/article/details/38067475)