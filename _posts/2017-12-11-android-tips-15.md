---
layout: post
title:  Android Tips part (15)
category: android
keywords: [improvement,android,java]
---

### 反射的相关封装

反射的相关封装 Api:

* Hack.java

* Interception.java

针对一些对于原始反射使用不便利的api进行了进一步的封装,无论是动态代理还是构造对象更加便利,携程动态加载框架可以直接找到源码,拿出来可以直接使用;

{% highlight java %}

// 针对 接口的 动态代理,所代理接口的方法
// 获取 class 中指向对应 接口的 feild,进行拦截
hackStudent.field("mBehavior").hijack(student, new Interception.InterceptionHandler<Behavior>() {
    @Override
    public Object invoke(Object obj, Method method, Object[] objArr) throws Throwable {
        return super.invoke(obj, method, objArr);
    }
});

{% endhighlight %}

[反射还能这么玩？](http://blog.csdn.net/sbsujjbcy/article/details/51280274)


#### 修改 Java 编译字节码

利用 Javassist SDK 操控字节码:

* 读写字节码,更改字节码信息,如更改继承关系          
* 直接利用makeClass 定义新类           
* 新增的字节码信息存储在 CtClass 对象中,在整个程序运行生命周期内, ClassPool 保存着 CtClass 对象,以便编译器能正确识别修改后的类信息;
* Java类加载机制: 相同的类被不同的 ClassLoader 加载,就成为了不同的类,互相之间不可转化;

[jboss-javassist/javassist](https://github.com/jboss-javassist/javassist/wiki/Tutorial-1)


#### ReactNative 调试

虚拟 DOM 核心在于抽象了一种DOM 结构,用 js 对象表示,进一步利用 js 的对象计算做 diff, 取代直接的操作复杂 DOM文档元素, 提升渲染性能(只渲染需要渲染的元素),本质上时一种算法缓存思想;

* MobX 追踪函数: computed 表达式、observer 组件的 render() 方法和 when、reaction 和 autorun 的第一个入参函数;

* MobX 事务 API => Transaction 改变追踪函数追踪粒度,防止过多变化导致的性能等问题;

针对非预期变化的调试可以使用: whyRun 追踪输出变化原因            

[](https://foio.github.io/mobx-react/)

* 列表中 item Key 的虚拟 DOM  diff            

虚拟 DOM 的 diff 算法:  

* 不同节点类型的比较        
* 同类型节点比较: 属性重设实现节点转换                
* 逐层进行节点比较        
* 列表节点的比较: key 


[虚拟DOM Diff算法解析](http://www.infoq.com/cn/articles/react-dom-diff)


虚拟 DOM 树: 比较 js 构建的虚拟 Dom 对象,更新对象信息, 调用 Component 的render函数构建真实 DOM,更新真正需要更新的 Dom 节点及其子元素;

>  It will check if the previous and next rendered element are of same type and key, and then reconcile the component the type and key matches.

View 的 key 影响虚拟 DOM 对于重绘的识别,即使 View 是 dirtyView, 但是如果 key 相同依旧可能不会重绘,这由 diff 决定: 今天调试 RN 的 View 时遇到的问题,动态构建的 View 不更新,就是由于 key 恒定不变,导致虚拟 Dom 没有重新构建元素;


[How Virtual-DOM and diffing works in React][https://medium.com/@gethylgeorge/how-virtual-dom-and-diffing-works-in-react-6fc805f9f84e]

[深入理解react中的虚拟DOM、diff算法](http://www.cnblogs.com/zhuzhenwei918/p/7271305.html)

#### 其他

抓包: 抓住核心,万变不离其宗,变处理 DOM 元素为处理后台 json 处理;