---
layout: post
title: 枚举再看
category: java
---

枚举：

enum 

####枚举常量简化冗余的static final 静态关键字：

{% highlight Java %}

enum  Number{
    ONE,TWO,THREE
}

{%  endhighlight %}

enum枚举类型也终归代表着一个类，其中ONE,TWO,THREE其实每个都是利用Number隐式无参数构造构造出来的Number对象，可以利用

{% highlight Java %}
enum  Number{
    ONE,TWO,THREE
    Number(){
    System.out.printf("Number");
}
}
{%  endhighlight %}

可以看到Number被打印出三遍。
枚举中每一个枚举值代表着枚举的一个实例对象。
若使用有参数构造函数则可以更加清晰的理解：

{% highlight Java %}
enum  Number{
     ONE(""),TWO(""),THREE("");
    Number(String str){
    System.out.printf("Number");
}
}
{%  endhighlight %}

枚举中构造函数必须为私有，一旦为公有则破坏了枚举的定义，能够从外部随意构建New新的任意对象，无法限制枚举的指定范围。


####利用枚举限定传参取值范围；

枚举与Switch的结合使用简化相关代码:

`switch (Number)`


####在枚举类中添加自定义方法

每个枚举常量都代表着一个实例对象，这代表着每个常量都将会具有该方法属性，可以对该枚举常量调用该方法属性。

{% highlight Java %}
enum GradeE{
        //    A,B,C,D,E   //这种类型相当于五个GradeE类的无参数构造对象
        A("100"),B("90"),C("80");//调用有参数构造函数
       
        private String value;
         //带有构造函数的枚举
        private GradeE(String value){
            this.value= value;
        }
        public String getValue(){
            return  this.value;
        }
}
{%  endhighlight %}

调用时：`GradeE.A.getValue()`，还是很方便的


枚举中还能实现接口，继承抽象类。

{% highlight Java %}

    //带抽象函数的枚举
    enum Number {
        //    A,B,C,D,E   //这种类型相当于五个Number类的无参数构造对象
        A("100") {
            @Override
            public String localValue() {
                return "优秀";
            }
        },B("90") {
            @Override
            public String localValue() {
                return "良好";
            }
        },C("80") {
            @Override
            public String localValue() {
                return "差";
            }
        };
        //带有构造函数的枚举
        private String value;
        private Number(String value){
            this.value= value;
        }
        public String getValue(){
            return  this.value;
        }
        //带有抽象函数的枚举
        public abstract String localValue();
    }
{%  endhighlight %}


枚举类实现接口

enmu Number Implement Callback{
    
}

只要理解每个枚举常量都是其实例就很好理解了。

####接口组织枚举类

{% highlight Java %}
public interface Foods {
        enum Tea implements Foods {
            BLACK\_Tea, RED\_Tea
        }
        enum Dessert implements Foods {
            FRUIT, CAKE
        }
    }
{%  endhighlight %}

####单枚举值得枚举类，可以当单例模式使用。