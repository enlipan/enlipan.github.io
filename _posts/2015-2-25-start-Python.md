---
layout: post
title: 我的Python开端
category: python
---
### Python初识
利用2月过年休息的一段时间，啃完了英文版Python Hard Way，下一步继续啃Dive into Python，进一步fork 源码阅读，学习框架、爬虫等知识区域，活学活用。

Python属于动态语言、强类型语言。 

其中动态语言即是在以第一次赋值时确认类型，而与Java等需要预先指定类型的编译型语言相对。而强类型是指变量类型。   

语言的学习主要包含以下几块：

>数据类型
>
>运算符
>
>语言关键字与语法
>
>流程控制
>
>数据传输（IO）  

Python中数据类型分为两类：

>标量数据类型（Scalar）
>
>>Int
>>
>>Float
>>
>>Bool
>
>非标量数据(No Scalar)
>
>>Strings
>>
>>>Index   取子串，可正数可负数，正从左到右，左边第一个是0，负数从右到左，右边第一个是-1
>>>
>>>Slice 切片，取子串，指定索引，注意边界情况以及步长问题
>>>
>>>>'helloworld'[::-1]   实际就是逆序输出，从基准（负数的步长代表了基准是右边开始计数）开始每次读取下一个-1个字符
>>
>>List:列表用[ ]标识,从左到右索引默认0开始的，从右到左索引默认-1开始
>>
>>Tuple:元组用"()"标识。内部元素用逗号隔开。但是元素不能二次赋值，相当于只读列表。
>>
>>dictionary：key:value键值对，字典用"{ }"标识。
>
>数据类型转换 :Operator（value）

表达式（Expressions）：\<Object\> \<Operator\> \<Object\>

操作符（Operator）：操作符优先级与操作符重载（Overload）

>成员运算符in  和 not in  
>
>身份运算符is  和 not is   ; 考虑结合Type()函数.

语言关键字与语法：主要指函数以及对象定义和Python代码块利用“:”缩进的语法，以及保留字符

流程控制：顺序执行，循环执行，选择执行

数据传输（IO 、File）：

>raw_input函数与input函数
>
>open函数打开文件-open(file_name [, access_mode][, buffering])
>
>File对象
>
>Python中的目录
>
>>mkdir()方法
>>
>>chdir()方法与getcwd()方法：
>>
>>rmdir()方法

Python模块：Import语句自动搜索“当前搜索路径”的该模块，如果该模块不在搜索路径中需要指定PYTHONPATH；可以使用dir()查詢模組中的屬性，這邊先介紹一下__name__屬性。如果你使用python指令直接執行某個.py檔案，則__name__屬性會被設定為"__main__"名稱，如果是import語句匯入模組，則__name__會被設定為模組名稱。

>作为环境变量，PYTHONPATH由装在一个列表里的许多目录组成。
>
>>例如：set PYTHONPATH=c:\python20\lib;
>
>包的概念：__init__.py文件的添加，建包

---

**待更新**