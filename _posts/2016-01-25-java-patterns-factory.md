---
layout: post
title: Java 模式- 工厂
category: java
---

### 简单工厂

单纯的将多类型对象的创建分离出来，独立创建新的简单工厂类；将对象创建与对象相关业务逻辑分离；对象创建分离之后，明显的优势是一是逻辑更加清晰，同时更加有利于重用，当然，对象创建的混乱问题依旧存在；

所以这种方式并不能根本上解决问题；










### 静态方法 Builder 


Buidler构造器，适用于`大量可选参数`的对象创建问题；常规情况下，如有大量参数需要在对象创建时完成赋值，往往是使用带参构造函数完成，而当参数过多时，构造函数将变得杂乱不堪，构造器就是为了这个情景优化而产生的；


{% highlight java%}

public class PersonBuilder {

    private int id;   //not null
    private String name;  //not null
    private int age;
    private String birthday;//option
    private String birthPlace;//option
    private String education;//option

    PersonBuilder(int id,String name,int age,String birthday,String birthPlace,String education){
        this.id = id;
        this.name = name;
        this.age = age;
        this.birthday = birthday;
        this.birthPlace = birthPlace;
        this.education = education;
    }


    public static class Builder{
        private int id;   //not null
        private String name;  //not null
        private int age;
        private String birthday;//option
        private String birthPlace;//option
        private String education;//option

        Builder(int id,String name){
            this.id = id;
            this.name = name;
        }

        Builder setAge(int age){
            this.age = age;
            return this;
        }

        Builder setBirthDay(String birthDay){
            this.birthday = birthday;
            return this;
        }

        Builder setBirthPlace(String birthPlace){
            this.birthPlace = birthPlace;
            return this;
        }

        Builder seteducation(String education){
            this.education = education;
            return this;
        }


        PersonBuilder build(){
            return new PersonBuilder(this);
        }
    }

    PersonBuilder(Builder builder){
        this.id = builder.id;
        this.name = builder.name;
        this.age = builder.age;
        this.birthday = builder.birthday;
        this.birthPlace = builder.birthPlace;
        this.education = builder.education;
    }


    public static void main(String[] args) {

        //use constructor
        PersonBuilder person = new PersonBuilder(001,"person",9,null,null,null);


        //use Builder
        Builder personBuilder = new Builder(001,"person").setAge(9);
        PersonBuilder personb = personBuilder.build();
    }
}

{% endhighlight %}

Builder构造器的使用，改善了程序对象创建的灵活性；当然一者带来了性能上的些许开销，同时造成了类结构膨胀；

### 工厂模式

可扩展情景下，对象创建与对象分离解耦；工厂模式定义了对象创建接口，并推迟了对象实例化时间点，让子类依照情形决定具体对象的创建；



工厂模式混合枚举类使用：

