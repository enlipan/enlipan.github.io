---
layout: post
title:  Android 单元测试
category: android
keywords: [improvement,android,java]
---

TDD的优劣势这里不再赘述，一方面Android的单元测试自己了解并不多，虽然自己写测试函数会常用JUnit，但对于Android的各类Mock框架却并没有深入了解，再者前段时间刚刚看完的烂代码系列文章，对于单元测试描述较多，其关于模块构造如不能构建比较全面的单元测试，以及单元测试覆盖率直接反应模块的好坏的观点也很是经典，所以这里抽时间做专题研究；


### 单元测试

>  Unit tests are the fundamental tests in your app testing strategy. By creating and running unit tests against your code, you can easily verify that the logic of individual units is correct. Running unit tests after every build helps you to quickly catch and fix software regressions introduced by code changes to your app.


>  在计算机编程中，单元测试（英语：Unit Testing）又称为模块测试, 是针对程序模块（软件设计的最小单位）来进行正确性检验的测试工作。程序单元是应用的最小可测试部件。在过程化编程中，一个单元就是单个程序、函数、过程等；对于面向对象编程，最小单元就是方法，包括基类（超类）、抽象类、或者派生类（子类）中的方法。

即，单元测试是针对程序模块中目标函数输入与输出状态的检测从而确定函数逻辑的正确与否；单元测试可以为重构的代码质量提供质量支撑，为了构建单元测试可以降低模块间的代码网状耦合程度，提升代码可维护性；

开发人员构建单元测试的重要性在于：

>  编写单元测试的难易程度能够直接反应出代码的设计水平，能写出单元测试和写不出单元测试之间体现了编程能力上的巨大的鸿沟。无论是什么样的程序员，坚持编写一段时间的单元测试之后，都会明显感受到代码设计能力的巨大提升。

>  写单元测试的难易程度跟代码的质量关系最大，并且是决定性的。项目里无论用了哪个测试框架都不能解决代码本身难以测试的问题，所以如果你遇到的是“我的代码里依赖的东西太多了所以写不出来单测”这样的问题的话，需要去看的是如何设计和重构代码

> 单元测试的难度和代码设计的好坏息息相关，单元测试测的三分是代码，七分是设计。如果你觉得自己处于编码能力上升的瓶颈期，那么可以尝试一下为以前写的类编写“纯粹的”单元测试

根据 [TestPyramid](http://martinfowler.com/bliki/TestPyramid.html) 所指，单元测试也是性价比最高的；

在Android中由于其运行环境与普通Java程序的差异，导致单元测试的构建也有所不同；

被测试目标函数Case：

*  函数有明确返回值则测试函数返回值是否符合预期值               
*  函数没有返回值，改变对象内部属性状态，则验证对象内部属性状态           
*  函数未改变对象状态且无返回值，函数仅有对应的行为，则验证行为的触发                
*  函数具有以上三种Case的混合，针对混合问题，一般需要对三种Case分离编写测试用例，逐一测试验证影响

前面说到Android运行环境的特殊性，除了需要JUnit的支持，还需要其他的支持，诸如AndroidTest与Robolectric，其中AndroidTest运行于Android环境上，而后者框架直接引入了android依赖环境，且可直接运行于JVM，相较于运行于真机效率更高；除此之外，我们还可以借助Mock用于解除依赖；除此之外还有Google御用Espresso框架，该框架同样功能强大，且有完善的Google文档；

Android Unit Test Type:

*  Local unit tests

{% highlight xml%}

Located at module-name/src/test/java/.

// Required for local unit tests (JUnit 4 framework)
testCompile 'junit:junit:4.12'

{% endhighlight %}

*  Instrumented tests

{% highlight xml%}

Located at module-name/src/androidTest/java/.

// Required for instrumented tests
androidTestCompile 'com.android.support:support-annotations:24.0.0'

{% endhighlight %}

构建单元测试时，其测试用例package与实际业务类的package应该对应，单元测试代码可以随业务代码共同维护；


#### 集成测试：

> 整合测试又称组装测试，即对程序模块采用一次性或增殖方式组装起来，对系统的接口进行正确性检验的测试工作。整合测试一般在单元测试之后、系统测试之前进行。实践表明，有时模块虽然可以单独工作，但是并不能保证组装起来也可以同时工作。


这里不要把集成测试与单元测试混为一谈，如典型的网络请求返回数据显示测试就属于集成测试；

关于单元测试这里主要使用通用型框架组合：**JUnit + Mockito** ,JUnit作为通用Javatest框架，属于基础，没什么好讲的，主要是其他的两个框架，同时通过构建一个MVP单元测试来实践；

### Mockito

依赖隔离——理想的测试案列应该独立于其他测试Case，如为了验证A模块a函数的正确性，但是a函数引入了B模块的b函数的依赖，这时候如果出现问题并不能确认是a还是b的问题，也就是变量不确定化，所以为测试时隔离模块，也就引入了Mock等测试马甲程序,利用马甲替身可以用于消除测试单元与其他系统间的关系，进而保证外部依赖的干扰，测试变量的单一性；

事实上在这点上我想起了科学实验中的单一变量原则：控制唯一变量而排除其他因素的干扰从而验证唯一变量的作用.

*  Fake 实现：是接口抽象类的简单实现体，其为测试而存在，并不存在于实际产品中；

*  Stub 实现：依赖类的部分实现，这些实现方法在单元测试时会被调用，回应外部测试的调用；

*  Mock 实现：所需隔离的依赖类或接口的模拟实现，通过模拟实现自定义对象中方法的输出结果；

Mock实现只需要少量的代码配置可以快速完成模拟实现，Mockito框架就是为此而来；

#### How？—— Mockito 使用：

*  模拟替换外部依赖       
*  执行测试代码             
*  验证测试代码          

{% highlight java%}

import static org.mockito.Mockito.* ;
/**
 * Mock 注解初始化   must public
 *
 * MockitoAnnotations.initMocks(target);
 */
@Rule
public MockitoRule mMockitoRule = MockitoJUnit.rule();

@Mock
MockAction mMockAction;

/**
 *   利用 InjectMocks 注入 Mock对象 -- 有构造顺序的问题 --Constructor Injection > Property Setter Injection > Field Injection
 */

public int addNum(int a, int b) {
    return  a + b;
}

@Test
public void testAddFunc(){
    Assert.assertEquals(3,addNum(1,2));
}

@Test
public void testAddFuncVerify(){
    List list = mock(ArrayList.class);
    list.add(1);
    //验证函数调用 -- 验证函数以及函数参数
    verify(list).addAll(new ArrayList());
    //验证函数调用次数
    //Mockito.verify(list,Mockito.times(2)).add(1);

}

@Test
public void testMockAction(){
    // MockAction action = mock(MockAct);

    when(mMockAction.addNum(1,2)).thenReturn(2);

    System.out.printf("out:" + mMockAction.addNum(1,2));
    Assert.assertEquals(mMockAction.addNum(1,2),3);
}

@Test
public void testAnyInputAction(){
    Comparable c = mock(Comparable.class);

    when(c.compareTo(isA(TestBean.class))).thenThrow(new IllegalArgumentException());

    TestBean testBean = new TestBean();
    //c.compareTo(testBean);

    when(c.compareTo(anyInt())).thenReturn(0);
    Assert.assertEquals(c.compareTo(9),0);

}

@Test(expected = IOException.class)
public void testDoAction() throws IOException {
    OutputStream outputStream = mock(OutputStream.class);
    doThrow(new IllegalStateException()).when(outputStream).close();

    OutputStreamWriter writer = new OutputStreamWriter(outputStream);
    writer.close();
}

/**
 * 默认Case下对于 Mock 对象的所有非 void 方法都将返回默认值 int，long 类型方法将返回0，boolean 方法将返回 false，对象方法将返回 null；而 void 方法将什么都不做
 *
 * spy函数（注解）用于改变其默认行为
 * spy 与 mock 的唯一区别就是默认行为不一样： spy 对象的方法默认调用真实的逻辑，mock 对象的方法默认什么都不做，或直接返回默认值。
 */
@Test
public void testSpy(){
    //MockActionImp actionImp = mock(MockActionImp.class);
    MockActionImp actionImp = spy(MockActionImp.class);
    when(actionImp.compareTestBean()).thenReturn(null);
    Assert.assertEquals(null,actionImp.compareTestBean());

}

{% endhighlight %}

### Robolectric

Robolectric 解决JVM环境下Android相关类的依赖问题，测试用例可以无需再真机环境下低效的进行apk打包安装运行测试用例的过程，进而高效的进行单元测试；

>  Running Android tests on the JVM usually fails because the Android core libraries included with the SDK, specifically the android.jar file, only contain stub implementations of the Android classes. The actual implementations of the core libraries are built directly on the device or emulator, so running tests usually requires one to be active in order to execute.






---

Quote：

[android-testing codelabs](https://codelabs.developers.google.com/codelabs/android-testing/#0)

[Test your app](https://developer.android.com/studio/test/index.html#add_a_new_test)

[Building Effective Unit Tests](https://developer.android.com/training/testing/unit-testing/index.html)

[使用Spock框架进行单元测试](http://blog.2baxb.me/archives/1398)

[基于 Appium 的 Android UI 自动化测试](https://zhuanlan.zhihu.com/p/24177554?refer=c_63840855)

[Android单元测试 - 如何开始？](http://www.jianshu.com/p/bc99678b1d6e)

[Android单元测试研究与实践](http://tech.meituan.com/Android_unit_test.html)

[蘑菇街支付金融Android单元测试实践](http://www.infoq.com/cn/articles/mogujie-android-unit-testing)

[Why Android Unit Testing is so Hard (Pt 1)](http://www.philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/)

[Unit Testing with Robolectric](https://guides.codepath.com/android/Unit-Testing-with-Robolectric)

[Developing Android unit and instrumentation tests - Tutorial](http://www.vogella.com/tutorials/AndroidTesting/article.html)

[使用强大的 Mockito 测试框架来测试你的代码](https://gold.xitu.io/entry/578f11aec4c971005e0caf82)

[用Robolectric来做Android unit testing](http://chriszou.com/2015/06/15/android-unit-testing-with-robolectric.html)

[安卓单元测试（九）：使用Mockito Annotation快速创建Mock](http://chriszou.com/2016/07/16/mockito-annotation.html)
