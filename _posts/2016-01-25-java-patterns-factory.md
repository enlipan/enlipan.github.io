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



可扩展情景下，对象创建与对象分离解耦；

对于复杂的业务逻辑，父类无法得知究竟是何种情况，应该创建哪种对应的业务逻辑对象，对于这类父类知晓行为，但无法得知具体行为如何实现的，我们选择推迟实例化的工厂模式，由继承子类决定如何实例化具体对象；

工厂模式定义了对象创建接口，并推迟了对象实例化时间点，让子类依照情形决定具体对象的创建；

工厂中定义的对象创建方法返回的对象交给客户端调用，完成具体的业务逻辑；


{:.center}
![foctorymethod pattern](http://img.oncelee.com/assets%2Fimg%2F20160126%2Ffoctorymethod.PNG)

工厂方法模式针对接口编程，同时与接口的具体实现解耦，让实现创建工厂的子类去创建具体对象，依照其业务逻辑完成对象创建；可以看出，针对每一种情况都会需要创建两个类，一个具体的工厂创建类，一个实现产品功能逻辑的产品，类个数膨胀还是比较厉害的；


{% highlight java%}

public class FactoryMethod {


    public static void main(String[] args) {
        new ConcreteCreator().createProduct().doSomeThing();
    }


    abstract static class Creator {

        void doSomeThing() {
            createProduct().doSomeThing();
        }

        abstract Product createProduct();

    }


    interface Product {

        void doSomeThing();

    }

    static class LightProduct implements Product {

        @Override
        public void doSomeThing() {
            System.out.printf("light");
        }
    }


    static class ConcreteCreator extends Creator {

        @Override
        Product createProduct() {
            return new LightProduct();
        }
    }
}

{% endhighlight %}

为什么这种模式叫工厂方法模式呢？因为实际上类的创建并没有交给客户端也就是调用者，对象的创建大部分情况还是在具体的工厂子类中完成具体实例的创建，也就是类的创建方法还是给自己写的，而不交给外部控制，通过自身的一个方法完成了具体实例对象的选择与创建


工厂方法模式在本质上依旧与简单工厂一样是选择了已经设定好的具体的 实例对象创建，与之不同的是 简单工厂全部耦合在一起，而工厂方法模式却将抽象与具体分离开了，进一步提升了灵活性；

其实可以看出，如果把创建的子类合并成一个创建类，根据创建参数去创建对象实例，工厂方法就退化成了简单工厂；


**事实上，工厂模式的参数控制可以利用枚举来限制，但是考虑到枚举的浪费，在Android编程中需要慎重使用，用静态变量代替枚举节约内存；** 


IOC依赖注入：完成属性注入，从直接主动的创建对象，变为了由容器创建对象之后，将属性注入到所需要的对象之中，解除了二者的耦合；也就是要依赖抽象，而不针对具体，进一步表诉就是说，高层次抽象组件不能反过来依赖底层对象实例；



### 抽象工厂

针对抽象的抽象

解决多个对象或者说是一系列相关对象创建时，如果依赖多个工厂，每个工厂创建对应的对象后，对象间依赖关系的保留的问题，源于每个简单工厂都只关心对应的产品的创建；

抽象工厂定义虚拟的一系列对象的创建函数，也就是抽象方法，进而交给具体实例化子类去实现；

抽象工厂中的对象创建并不是简单的堆砌而成，其对象创建往往是一系列产品组，彼此之间有着一些交互或联系，通过组合完成协同业务；


{% highlight java%}

public abstract class AbstractFactory {

    interface ProductA{
        void doActionA();
    }

    interface ProductB{
        void doActionB();
    }

    abstract ProductA createA();

    abstract ProductB createB();

}

{% endhighlight %}

通过一个抽象工厂同时可以获取两个对象，完成对象交互；

---

Quote：

《研磨设计模式》

《HeadFirst 设计模式》