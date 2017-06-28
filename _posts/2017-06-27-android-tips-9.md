---
layout: post
title:  Android Tips part (9)
category: android
keywords: [improvement,android,java]
---

## 脚本相关

### Bash  - bash: [: missing `]' 

[] 内部变量的空格问题

### Bash - 变量未定义   

bash中变量定义时=前后不能有空格

`a = value`  # 不合法

`a=value` # 合法


### bash 处理手动输入的问题

bash中利用 expect

{% highlight bash%}

#! /usr/bin/expect
spawn jarsigner ... # actual command here
expect "Enter Passphrase for keystore: "
send "jar_password\r"

{% endhighlight %}


python同样有类似模块 pexpect,需要注意的是 send与sendline的差异问题，send不带回车，而大多数交互输入是以回车换行为结束符

###  python 脚本 2.7中的各种中文编码问题

原则： unicode 与 utf-8 之间转换

在内存中使用unicode通用万国码，而在输出时使用变长码utf8：
 

[字符串和编码 - python2.7](http://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000/001386819196283586a37629844456ca7e5a7faa9b94ee8000)

[谈谈Unicode编码](http://www.pythonclub.org/python-basic/encode-detail)

[Python 编码转换](http://www.jianshu.com/p/53bb448fe85b)



## RN

### RN 0.43 Bug - evaluating 'props[registrationName]'

[issue](https://github.com/facebook/react-native/issues/12905)


### RN 0.43 Bug FlateList 以及SectionList滚动后点击事件Block

[issue](https://github.com/facebook/react-native/issues/12884)


### onEndReach 自动被触发

利用条件过滤，默认该触发条件为false，当首页数据下拉完成之后，根据数据状态开启该条件

[StackOverFlow](https://stackoverflow.com/questions/41178436/react-native-onendreached-always-fire-when-1st-row-is-rendered
)

### RN props VS state

[props vs state](https://github.com/uberVU/react-guide/blob/master/props-vs-state.md)

### RN iOS 图片展示问题

iOS中 img 中图片链接为 http时可能无法不展示

### React refs 属性

[组件的refs](https://react-cn.github.io/react/docs/more-about-refs.html)

### RN 首页白屏优化


[首页白屏优化](https://github.com/cnsnake11/blog/blob/master/ReactNative%E5%BC%80%E5%8F%91%E6%8C%87%E5%AF%BC/ReactNative%E5%AE%89%E5%8D%93%E9%A6%96%E5%B1%8F%E7%99%BD%E5%B1%8F%E4%BC%98%E5%8C%96.md)

[React Native 启动白屏问题解决教程](https://github.com/crazycodeboy/RNStudyNotes/blob/master/React%20Native%20%E9%97%AE%E9%A2%98%E5%8F%8A%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E5%90%88%E9%9B%86/React%20Native%20%E5%90%AF%E5%8A%A8%E7%99%BD%E5%B1%8F%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3%E6%95%99%E7%A8%8B/React%20Native%20%E5%90%AF%E5%8A%A8%E7%99%BD%E5%B1%8F%E9%97%AE%E9%A2%98%E8%A7%A3%E5%86%B3%E6%95%99%E7%A8%8B.md)

[去哪儿RN首页优化](http://ymfe.tech/blog/2017-01-17-QRN%E9%A6%96%E5%B1%8F%E5%8A%A0%E8%BD%BD%E9%80%9F%E5%BA%A6%E4%BC%98%E5%8C%96/)

## 开源库

* 对于开源库的应用需要有足够的重视，不可具有随意性，通常大公司会在确定需要的开源库基础上通过forck源码，独立演化分支，如大多数公司的RN框架演化

* 在开源库的使用过程中，通常我们需要使用桥接层，以便于落地项目使用，防止开源库的更改而导致项目代码的大片更改；

* 随意的使用三方库，导致项目代码被污染

## ADB

### 启动页面

`adb -s BH90 14JA09 shell am start -n com.reactnative/.MainActivity`

### RN 中的快捷键

`alias rnrefresh='adb shell input keyevent 82'`

`lsof -n -i4TCP:8081`

