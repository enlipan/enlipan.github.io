---
layout: post
title: 正则表达式必知必会实践
category: others
keywords: [java, improvement]
---

强大的正则表达式镇题，有非常详细的匹配过程，经常使用可以加深对于正则的理解：

[regex101.comregex101.com](https://regex101.com/)

### 正则表达式必知必会

正则表达式是为解决特定领域某一类专门问题而发明的语言；正则是高度抽象精简的工程实践语言，用于解决字符串精准匹配相关的问题；

正则语言通常被内置于其他编程语言中使用，被其他语言所支持实现，从这里来看正则看起来有点不像一门语言，值得注意的是各个编程语言对于正则的支持却又看起来似乎有些不一样，典型的如 Python 和 Java中对于正则的转义字符的处理；另一方面也是由于正则表达式有多套标准；

Java ："\\."  —— Python "\."

{% highlight bash %}

eg:

匹配Car

scar car sscar ddCAR CAR Car 

”\b[Cc][Aa][Rr]“

{% endhighlight %}

通常为解决一个问题可能会出现多种正则表达式可以解决；

### 单字符匹配  

* \w  \d .  \\.

### 一组字符匹配   

字符集合： "[]"

字符分组： "()"

