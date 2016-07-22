---
layout: post
title: Java Pass By Value
category: java
---

### 关于Java的值传递特性

写东西的时候利用橡皮鸭原理，自己对自己说话，梳理知识其实感觉也挺好的，其实是代码评审的一个借用：

>原理是“Once a problem is described in sufficient detail, its solution is obvious.”（一旦一个问题被充分地描述了他的细节，那么解决方法也是显而易见的。）

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
        man.setName("Paul");
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

{:.center}
![swap函数初始化](http://7xqncp.com1.z0.glb.clouddn.com/assets%2Fimg%2F20150322%2Fswap_begin.PNG)

o1与o2变量不过是Qi变量与Lee两个对象的指针变量的Copy副本，只是指向堆空间中同样的数据对象区域，两个地址指针的变量副本作出交换，并不会使内部对象交换，而只是指针变量副本的本身做出了交换，同时Qi与Lee两个变量也没有任何的变化，该指向哪里就指向哪里，依旧，所以这个交换与普通的数据变量交换无区别：

该swap()函数也明确表示了Java属于值传递类型语言，而非引用传递；

{:.center}
![swap函数交换完成](http://7xqncp.com1.z0.glb.clouddn.com/assets%2Fimg%2F20150322%2Fswap_over.PNG)

最终函数执行完毕，局部变量回收，对于两个对象本身以及传入的实参Qi与Lee没有做出任何更改

{:.center}
![swap函数执行完，栈区回收](http://7xqncp.com1.z0.glb.clouddn.com/assets%2Fimg%2F20150322%2Fswap_none.PNG)

回过头我们来看看foo函数的执行：

同样传入了一个变量值，通过这个变量值可以操作到堆空间中的对象，并对这个对象的名作了更改，修改为Jack；

{:.center}
![foo变量名修改](http://7xqncp.com1.z0.glb.clouddn.com/assets%2Fimg%2F20150322%2Ffoo_begin.PNG)

紧接着，新建了一个同样名称为Jack的Man对象存在于堆空间中，如图，虽然名一样但已经不是同一个对象了；也就是改变了最初指向 Lee 对象的指针变量Copy(形参)，转而指向了一个新的对象，但是这并不会改变原先的对象本身，也不会改变原有的指针变量的指向，改变的只是指针变量的副本的指向；

所以 Java 值传递，对象指针副本的传递就很好理解了；


> Java is always pass-by-value.when object is passed as a argument, be careful with that it is also the copy of reference






参考文章：

>[引用其它资源](http://jekyllcn.com/docs/posts/  "Jekyllcn")
>
>[Java is Pass by Value and Not Pass by Reference](http://www.journaldev.com/3884/java-is-pass-by-value-and-not-pass-by-reference )
