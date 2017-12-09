---
layout: post
title:  ReactNative 与Native UI 之间交互
category: android
keywords: [improvement,android,ui,reactnative]
---

这里讲讲如何在ReactNative容器,一个 Rn页面中嵌入原生 UI 组件使用,重点讲讲二者的交互与通信:

* 原生 View 如何在原生事件发生结果推送到 js 层?                
* js 层如何主动调用原生 View 执行事件?           

### View 

定义NativeView, 映射显示到 RN 容器


### View 属性

通过 ReactProp 注解导出原生 View 属性,进而在 ReactNative 中声明,进而使用,结合 MobX 可以完成View 的刷新;

以上并非复杂点,见官方文档;

### View 事件

#### CallBack From Java To Js

当 Native View 的事件发生时执行 JavaScript (ReactNative)回调,形成 NativeView 与 Js 的互通,就正如日历,在日历中点击某一天直接反应到 ReactNative 不同的 UI 更新;

在 Native View 事件发生时,利用事件发生接口将事件发布到 Js 中, Js 检测到事件属性被执行,触发自身的事件回调;

如何发布事件到 js 中,我们利用 `reactContext.getJSModule(RCTEventEmitter.class)`的`receiveEvent`函数进行事件的发布工作,该函数接受三个参数: 

* View 事件发生的 View     
* 事件名称: 注意此处有坑,原生事件名称与Js 事件名称并不是等同对应的,有一定的映射关系,其名称映射见`UIManagerModuleConstants.java` 源码          
* 要传递到 js 中的 NativeEvent 参数(Arguments.createMap())

{% highlight java  %}  

 // 事件传递方式 1
  // viewID
  // eventName  Native 事件与 Js 事件名称映射关系  UIManagerModuleConstants.java 文件
  // event value send to Js
  // 使用 receiveEvent 将事件公布到 Js
  reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(calendarView.getId(),"topChange",eventMap);

  //事件传递方式 2
  reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher().dispatchEvent(new TopChangeEvent(calendarView.getId(),calendarDay));

{% endhighlight %}

以上是 js 端作为接受方被动接受 原生View 所发生的事件流程;

#### NativeView 接受 JS 传递的事件

进一步看看如果在 js 中触发原生 View 中所定义的事件?  

如何在 ReactNative 触发 js 事件时,触发原生 View 的事件执行,并将函数执行结果返回;

注意到 Native ViewManager 中有两个函数可以被复写 `getCommandsMap` 与 `receiveCommand`;

{% highlight java  %}  

@Override
 public Map<String,Integer> getCommandsMap() {
  Log.d("React"," View manager getCommandsMap:");
  return MapBuilder.of(
    "clickView",
    1);
 }


 @Override
 public void receiveCommand(
   View view,
   int commandType,
   @Nullable ReadableArray args) {
  Assertions.assertNotNull(view);
  Assertions.assertNotNull(args);
  switch (commandType) {
   case 1: {
    view.clickView();
    return;
   }
   default:
    throw new IllegalArgumentException(String.format(
      "Unsupported command %d received by %s.",
      commandType,
      getClass().getSimpleName()));
  }
 }
}

{% endhighlight %}

来看看 js 端如何发送事件:

{% highlight javascript %}

 UIManager.dispatchViewManagerCommand(
        React.findNodeHandle(this),
        UIManager.ViewName.Commands.methodName,//对应的 nativeMethod 名称,名称与getCommandsMap 中的 key 对应
        [],// NativeMethod 参数数组  在原生 View 中以ReadableArray的形式接收
    );

{% endhighlight %}


等等? 
我们好像没有看到怎么将 js 触发的原生事件发生后的执行结果返回给 js? 想想上一小节? 那不就是 js 被动接受事件?


其他注意:  

PropTypes 依赖方式的更改: 

`import PropTypes from 'prop-types';`


---  

Quote: 

[Communicating To and From Native UI Components in React Native Android](https://medium.com/@john1jan/communicating-to-and-from-native-ui-components-in-react-native-android-b8abcfb2f9c8)

[Java UI Component on React Native](https://x-team.com/blog/java-ui-component-on-react-native/)

[React-Native 渲染实现分析](http://www.cnblogs.com/zhang740/p/5978323.html)

[Writing an Android component for React Native
](https://guillermoorellana.es/react-native/2016/06/12/writing-android-component-for-react-native.html)