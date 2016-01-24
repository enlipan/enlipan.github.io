---
layout: post
title: Java 模式- 工厂
category: java
---

### 简单工厂

将多类型对象的创建分离出来，独立创建新的简单工厂类；将对象创建与对象相关业务逻辑分离；对象创建分离之后，明显的优势是一是逻辑更加清晰，同时更加有利于重用；

在接口编程中简单工厂被用于，分离接口与接口实现，也就是**提供一个具有弹性的对象创建功能，对象在创建时，无需关注其创建的实例类型**；
工厂类；简单工厂的存在解决了 接口编程中，客户端 与接口实现无法解除依赖的问题，使客户端不再知道实例对象的实现类型，增加系统灵活性；

{% highlight java%}

public class SimpleFactory {

    interface  Api{
        void optionNetWork();
    }

    static class ImplApi implements Api{

        @Override
        public void optionNetWork() {

        }
    }


    public static void main(String[] args) {
        //before
        Api api = new ImplApi();

        //after
        Api apiF = Factory.createApi(0x1);

    }

    static class Factory{

        static final int TYPE_A = 0X1;
        static final int TYPE_B = 0X2;

        static Api createApi(int type){
            if (type == TYPE_B){
                return null;
            }else if (type == TYPE_A){
                return new ImplApi();
            }
            return  new ImplApi();
        }

    }
}

{% endhighlight %}

可以看出，简单工厂让接口实现脱离了客户端，这就使得当有**多个不同的业务逻辑子类实现接口时**，客户端的调用逻辑更加精简，灵活；所以虽然看起来只是简单的将类的实例化移到工厂中，但却完成了真正意义上的接口编程的核心，封装行为隔离实现；客户端与具体实现脱离；

简单工厂的本质是，根据业务逻辑需求选择实现合适的 实例对象；

简单工厂非常常见，其隔离意义需要理解；


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


### 框架

框架是完成一定功能的半成品的软件，为什么要用框架呢？因为这已经实现的部分功能很有用，往往是解决了经典的程序结构问题，让后续的开发扩展工作变得更加便捷，能够提升开发效率；

基于框架开发不应该仅仅会用，而应该追本溯源知晓框架的原理，明白框架在干什么，才能够进一步把控自己所进行的开发的全局，否则程序中将存在大片黑盒区域，无法掌控；


### 工厂方法



可扩展情景下，对象创建与对象分离解耦；工厂模式定义了对象创建接口，并推迟了对象实例化时间点，让子类依照情形决定具体对象的创建；



工厂模式混合枚举类使用：




### 抽象工厂

针对抽象的抽象