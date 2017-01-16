---
layout: post
title:  理解Rxjava lift 的链式过程
category: java
keywords: [improvement,java]
---

首先要理清核心概念Observable/OnSubscribe/Observer(Subscriber)

### lift










### SubscribeOn 、ObserveOn

SubscribeOn 转移 调用 subscribe()函数的副作用消耗在其他线程中，而不阻塞主线程；如数据库查询，网络请求都可乐那个导致线程阻塞；





### Lambda

Rx的优秀范例大多使用了lambda expressions,不能一直期待他人将其翻译为通用代码，要掌握第一手资料就要学习其规则，事实上对于Lambda表达式一直没有正视，但当真正开始了解之后发现其确实非常强大，可以借助其写出非常简洁的实现，尤其是其函数接口的实现方式，可以更好的面向接口编程；这就像不理解泛型不理解其重要性而无法正确使用泛型，而当真正理解泛型，知道其对于对象类型安全检查，对于烦人的显式强转问题，消除类型转换，精简代码，以及在编译阶段进行强类型检查(针对多态问题，编译器可以在编译器精确知道其类型)，排除可能的类型转换异常，而为针对父子类层次的问题，又引入了泛型有界类型指定上下边界问题，同样Lambda表达式也需要理解。

函数式接口：接口中只有一个抽象方法；

Lambda表达式语法：(int x,int y) -> {x + y},也就是定义形参 -> 实现的语法；

Lambda 表达式的使用可以从更加抽象的层面去考虑实现，而不同于过去的面向过程实现，简单的Demo，筛选List以及对Item的操作：

{% highlight java %}

@Test
 public void  testPrintFilterPerson(){
     List<Person> personList = Person.createShortList();
     personList = filterPerson(personList,person -> person.getAge() > 25);
     personList.forEach(person -> System.out.println(person.getAge()));
 }

 List<Person> filterPerson(List<Person> personList,FilterAction<Person> filter){
     List<Person>  newPersonArray = new ArrayList<>();
     for (Person person : personList) {
         if (filter.filter(person)) newPersonArray.add(person);
     }
     return newPersonArray;
 }


{% endhighlight %}

以上，通过行为参数化，抽象行为可以实现行为传递，通过实现不同的行为逻辑进而实现不同的业务处理方式；

**行为参数化是一种针对变更的业务逻辑处理更加灵活的处理方式，相较于为解决变更的需求而增加参数而言是一种更加高阶的抽象手段，行为的参数化意味着行为的模块化，行为的可传递性以及行为执行的推迟化（推迟化意味着行为被传递到其他部门进而再执行）**

**在我学习Lambda表达式过程中的最大好处就是进一步明白了面向接口而非面向具体实现编程的优势所在，进一步理解了函数作为一等公民之后的强大之处**

事实上，以上Demo中的 FilterAction 接口在Java8中提供了通用 test 函数接口；

*  Predicate: A property of the object passed as argument —— 接受泛型对象，执行逻辑，返回boolean值    
*  Consumer: An action to be performed with the object passed as argument —— 访问某个对象并对其执行某些操作      
*  Function: Transform a T to a U  —— 可以通过构建 Function Lambda 表达式，将输入对象信息映射到输出，类似于Rx中的 Map        
*  Supplier、BinaryOperator...

除此之外针对 泛型的自动装箱所带来的损耗问题，针对 Predicate 这一系列函数接口，引入了 原始类型函数接口 IntPreDicate...等；

* Lambda 表达式的类型检查与推断：由于Lambda表达式的行为抽象化，Java编译器对于其类型检查根据其上下文环境去Check具体类型是否符合上下文环境，同时根据上下文环境进一步推断Lambda的参数类型，对于参数类型可以在参数列表中显示声明类型，也可以隐藏而触发编译器的上下文参数类型推断   

*  Lambda 表达式引用 实例变量与final 局部变量问题，源于实例变量存放于堆中，而局部变量存放于栈中，若不是final类型的局部变量，如果 Lambda表达式在某一线程中使用，则使用Lambda表达式的线程可能在使用完成之后内存回收而回收该存在在线程栈空间中的局部变量，这时 Lambda表达式中访问的局部变量则不再是原局部变量，而是局部变量副本，若非final类型则可能造成线程不安全；    

看起来与Rx中的操作符非常相似，像一对孪生兄弟；

Android中对于 lambda表达式，函数式接口匿名类实现可直接使用，但对于高级流Stream等实现需要使用retrolambda进行支持

>   https://github.com/evant/gradle-retrolambda               
>   https://github.com/aNNiMON/Lightweight-Stream-API         

Java8 新特性之接口函数的默认实现-default关键字，解决接口与实现之间的耦合，接口每一个新增函数，其所有实现都必须强制实现；

虽然增加了该特性，看起来接口与抽象类似乎更像了，但是依旧还是有本质区别，接口无构造函数，无this指针，无实例字段，无对象状态，而抽象类有这些，同时抽象类无法配合Lambda表达式使用；

**针对接口默认实现可能造成的与抽象类的函数冲突性问题，其准则为类实现优先级高于接口默认实现**


---

Quote:

[给 Android 开发者的 RxJava 详解](https://gank.io/post/560e15be2dca930e00da1083#toc_19)

[RxJava基本流程和lift源码分析](http://blog.csdn.net/lzyzsd/article/details/50110355)

[自己动手实现 RxJava 理解其调用链](https://www.diycode.cc/topics/355)

[理解RxJava线程模型](https://blog.saymagic.tech/2016/08/20/understand-rxjava-threading-model.html)

[SubscribeOn 和 ObserveOn](http://blog.piasy.com/AdvancedRxJava/2016/09/16/subscribeon-and-observeon/)

[拆轮子系列：拆 RxJava](http://blog.piasy.com/2016/09/15/Understand-RxJava/)

[Operators Introduction](http://reactivex.io/documentation/operators.html)

[lambda expressions](http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/Lambda-QuickStart/index.html)

[Java8 lambda表达式10个示例](http://www.importnew.com/16436.html)

[深入浅出 Java 8 Lambda 表达式](http://blog.oneapm.com/apm-tech/226.html)
