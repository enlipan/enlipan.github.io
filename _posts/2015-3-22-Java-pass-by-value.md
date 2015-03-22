---
layout: post
title: Java Pass By Value
category: java
---
###关于Java的值传递特性

突然回忆起这个点，就做个小的回顾，记录一下：

{% highlight java %}
class Man{
     private name;
     public Man(){}
         
     public Man(String n){
            this.name=n;
        }
    Setter and  Getter.......
}

public class Test {
    public static void main(String[] args) {
         
        Man Qi = new Man("Qi"); 
        Man Lee = new Man("Lee"); 
         
        swap(Qi, Lee);
        System.out.println("Qi name="+Qi.getName());
        System.out.println("Lee name="+Lee.getName());
         
        foo(Lee);
        System.out.println("Lee name="+Lee.getName());
         
    }
 
    private static void foo(Man man) { 
        man.setName("Jack"); 
        man = new Man("Jack"); 
        Man.setName("Paul"); 
    }
 
    //Generic swap method
    public static void swap(Object o1, Object o2){
        Object temp = o1;
        o1=o2;
        o2=temp;
    }
}

{% endhighlight %}

现在来解释两个测试方法：

Swap方法是检测值传递还是引用传递的终极利器，将Lee和Qi两个参数传入方法中，作交换，输出交换之后的对象：

{% highlight java %}
Qi name=  Qi
Lee name= Lee
Lee name= Jack

{% endhighlight %}
为什么是这个结果？当swap函数执行之时内存中数据如图所示：

![swap函数初始化](/assets/img/20150322/swap_begin.PNG)

o1与o2变量不过是Qi变量与Lee变量的Copy副本，只是指向同样的堆空间，两个变量作出交换，并不会使内部对象交换，而只是变量本身做出了交换与普通的变量交换无区别：

![swap函数交换完成](/assets/img/20150322/swap_over.PNG)

最终函数执行完毕，局部变量回收，对于两个对象做任何更改

![swap函数执行完，栈区回收](/assets/img/20150322/swap_none.PNG)

回过头我们来看看foo函数的执行：

同样传入了一个变量值，通过这个变量值可以操作到堆空间中的对象，并对这个对象的名作了更改，修改为Jack；

![foo变量名修改](/assets/img/20150322/foo_begin.PNG)

紧接着，新建了一个同样名称为Jack的Man对象存在于堆空间中，如图，虽然名一样但已经不是同一个对象了；

![foo对象更换](/assets/img/20150322/foo_over.PNG)





















参考文章：

>[Java is Pass by Value and Not Pass by Reference](http://www.journaldev.com/3884/java-is-pass-by-value-and-not-pass-by-reference )