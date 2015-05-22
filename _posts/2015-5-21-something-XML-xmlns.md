---
layout: post
title: XML xmlns知识整理
category: java
---
今天在仔细学习Android的过程中，注意到了xmlns标签，遂对之展开了一些了解，一了解又觉得越看越不是很明白，虽然最后发现是钻进了一点小胡同中，但是在探索胡同的过程中就顺便对XML进行了一点深入的了解。

####XML基础知识

在基础知识这一块主要是了解XML是干嘛的，用来解决什么问题的，如何解决这些问题的。在这一块学习到一个新的数据丢失理念，在以前，我所理解的数据只要存入了保存介质中，数据信息就应该算是保存下来了，但是如果这种介质完好，但是没有软件利用数据保存的那种语言将数据对应读取，数据依旧不能重新有效利用，可以理解为用某种语言写的书，但是这种语言却是几乎灭绝或是没有会这种语言的人翻译传播，最后这本书中的知识也只能认为是数据丢失的，在这种环境下，通用型的XML用于保存数据是极为有效的。

*XML语法*这一块比较基础，需要注意的是XML是严格语法，XML标记区分大小写也必须要结束标记，同时XML元素不能重叠，属性值必须使用引号。
关于CDATA用于解决处理忽略大量需要实体引用转义的文本串，XML用“<\![CDATA [”和“]]>”进行定界。

XML文档语法

1.  XML声明——XML文档的版本信息，编码方式等信息
2.  XML处理指令——处理指令以“<?”开始，以“>”结束。
3.  XML元素——分为根元素和元素
4.  属性——用来为元素附加一些额外信息
5.  实体引用与CDATA标记
6.  XML注释

XML命名空间：xmlns

解决同一元素多次出现在同一文档或者同时出现在程序要读取的不同文档中引起的冲突问题。      
我所陷入的思维胡同是直接对号入座，将DOM解析对象想到了应用这种情况，读取时建立相应的DOM对象，各自对应各自的上层节点。诚然这样的文档在DOM对象建立是不会出现问题，DOM解析并不能完美的解决所有情况，典型的SAX解析就会出现冲突。

其他相关：DTD、Schema、解析——SAX/DOM

DTD用于定义XML文档合法性规格的文档。利用DTD验证XML文档的合法性可以减轻应用程序的负担，不需要在读取的时候同时读取数据和验证合法性，进而提升性能。

DTD确定XML文档的基本逻辑结构，同时必须对文档中可能出现的元素和元素类型，子元素以及元素出现的顺序等进行定义。

<ELEMENT Element\_Name  Element\_Defination>

Schema如同DTD一样是负责定义和描述XML文档的结构和内容模式。它可以定义XML文档中存在哪些元素和元素之间的关系，并且可以定义元素和属性的数据类型。

1. 一个XML Schema自身就是一个XML文档
2. 命名空间的使用——noNamespaceSchemaLocation/targetNamespace



--- 

参考链接：

[XML基础](http://210.34.136.253:8488/WebProg/webchpt20.htm)

[Oracle XML 模式：了解命名空间 (http://www.oracle.com/technetwork/cn/articles/srivastava-namespaces-098626-zhs.html)

[XML 命名空间以及它们如何影响 XPath 和 XSLT (Extreme XML)](https://msdn.microsoft.com/zh-cn/library/ms950779.aspx)

[IBM XML](http://www.ibm.com/developerworks/cn/offers/lp/x/xmlcert/)

[XML](http://www.w3cschool.cc/xml/xml-tutorial.html)
