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

##### MObX

* MobX 追踪函数: computed 表达式、observer 组件的 render() 方法和 when、reaction 和 autorun 的第一个入参函数;

* MobX 事务 API => Transaction 改变追踪函数追踪粒度,防止过多变化导致的性能等问题;

当前 Transaction已经被废弃,推荐使用 action构建事务处理:  

{% highlight  javaScript %}

@action updateTableData() {
        action(()=>{
           this.switchData = [];
        });
        this.switchData = this.switchData.concat(this.allTaskData.taskTypeList());
    }

{% endhighlight %}

针对非预期变化的调试可以使用: whyRun 追踪输出变化原因            

[使用mobx开发高性能react应用](https://foio.github.io/mobx-react/)

#####  DOM

* 列表中 item Key 的虚拟 DOM  diff            

虚拟 DOM 核心在于抽象了一种DOM 结构,用 js 对象表示,进一步利用 js 的对象计算做 diff, 取代直接的操作复杂 DOM文档元素, 提升渲染性能(只渲染需要渲染的元素),本质上时一种算法缓存思想;

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

[React](https://reactjs.org/tutorial/tutorial.html#keys)

> key is a special property that’s reserved by React (along with ref, a more advanced feature). When an element is created, React pulls off the key property and stores the key directly on the returned element. Even though it may look like it is part of props, it cannot be referenced with this.props.key. React uses the key automatically while deciding which children to update; there is no way for a component to inquire about its own key.

> When a list is rerendered, React takes each element in the new version and looks for one with a matching key in the previous list. When a key is added to the set, a component is created; when a key is removed, a component is destroyed. Keys tell React about the identity of each component, so that it can maintain the state across rerenders. If you change the key of a component, it will be completely destroyed and recreated with a new state.

> It’s strongly recommended that you assign proper keys whenever you build dynamic lists. If you don’t have an appropriate key handy, you may want to consider restructuring your data so that you do.

> If you don’t specify any key, React will warn you and fall back to using the array index as a key – which is not the correct choice if you ever reorder elements in the list or add/remove items anywhere but the bottom of the list. Explicitly passing key={i} silences the warning but has the same problem so isn’t recommended in most cases.

### onCreate 中 View.Post() 获取 View 宽高? 

onCreate 中 执行 View.Post() 为什么可以获取到 View 的宽高结果? 

并不是因为其延时效应,如果是延时效应应该会出现时而能获取时而不能获取的不稳定机制;其根本原因在于其 Handler 处理消息的 MessageQueue 消息队列机制;

从 View.Post 源码可以看到: View 没有 Attach 到 Window 时, View.Post 的 Runnable 消息被作为 Action缓存下来;

缓存消息执行: ViewRootImp.performTraversals() 中触发 View.dispatchAttachedToWindow() 进而将缓存的 Action 发送到 MessageQueue 中等待处理;(注意这里是等待处理,而不是此时执行)

下一步 ViewRootImp.performTraversals()继续向下执行,继续执行 performMeasure,performLayout,performDraw等 View 处理相关函数;当这些整个流程执行完毕后,消息队列处理后续消息时 最初 Post 的消息才得到执行的机会,也就是此时 View 已经执行过 mesure 等 View 绘制相关函数;

#### 其他

抓包: 抓住核心,万变不离其宗,变处理 DOM 元素为处理后台 json 处理;