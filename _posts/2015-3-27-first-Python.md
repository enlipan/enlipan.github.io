---
layout: post
title: First Python Program
category: python
---
### 第一个Python试炼小代码

输入字符串，查找当前目录以及当前目录子目录下中所有文件名中含有该字符串的文件，打印输出；

1.确立解决方案：解决方案一定是递归方案，毋庸置疑

2.设计递归函数，递归函数的设计思路是假设存在一个这样的Search（）函数能递归完成函数查找输出打印功能，确定函数的输入输出

3.代码编写

{% highlight python %}

# -*- coding: utf-8 -*-
__author__ = 'Lee'
import  os
import  sys

def search( path,strInFilNname):
    parentpath = [x for x in os.listdir(path) if  os.path.isdir(os.path.join(path,x))]  # get all dirpath
    printfilepath(path,strInFilNname)
    for x in parentpath:
        inpath = unicode(os.path.join(path,x))
        search(os.path.abspath(inpath),strInFilNname)


def printfilepath(path,filename):
    filenames = [ x for x in os.listdir(path)  if filename in os.path.splitext(x)[0] ]
    for x in filenames:
        print os.path.join(path,x)

if __name__ == '__main__':
    print os.name
    #print os.environ
    #print os.getenv("PATH")
    print os.path.abspath('.')
    #strInFilNname = u'%s' % raw_input("input filename:").decode('utf-8')
    strInFilNname = raw_input("input filename:").decode(sys.stdin.encoding)
    print  type(strInFilNname)
    #pathName = u'%s'% raw_input("input path:").decode('utf-8')
    #use unicode() function to handle chinese path
    pathName = raw_input("input path:").decode(sys.stdin.encoding)
    #search(os.path.abspath('.'),strInFilNname)
    search(pathName,strInFilNname)

{% endhighlight %}

输出结果：

{% highlight Bash %}

"E:\Portable Python 2.7.5.1\App\python.exe" E:/Workspaces/PycharmProjects/Pythonexercise/GetAllFile.py
nt
E:\Workspaces\PycharmProjects\Pythonexercise
Please input stringInFilename:test
E:\Workspaces\PycharmProjects\Pythonexercise\test.txt
E:\Workspaces\PycharmProjects\Pythonexercise\a\test.txt
E:\Workspaces\PycharmProjects\Pythonexercise\a\b\test.txt
E:\Workspaces\PycharmProjects\Pythonexercise\a\b\a\test.txt
E:\Workspaces\PycharmProjects\Pythonexercise\a\b\a\b\test.txt

Process finished with exit code 0


{% endhighlight %}

---

**Binggo**


3.28  update 可指定路径   可匹配中文 可输出中文路径

3.30  update  CMD输出系统编码问题  

感觉代码的编写思维Python抽象思维还不够，代码还能够更精简，待续

---

Update 2016.12.11

字符编解码问题：

理解字符集（Unicode，ASCII）概念 与 字符编码方式概念之间的差异，字符表可以定义为对应字符环境下系统所支持的字符集合，而编码字符集则表示字符表中对应至于与计算机中二进制表示序列之间的映射关系，如A是65对应二进制数字，而相对的编码可以理解为计算机为更好的存储传输数据而定义实现的的一种字符集的编码实现，如Unicode的UTF（unicode 字符集的编码标准）实现utf8,utf16，utf32,而UTF-16、UTF-32均是多字节传输，存在字节顺序的问题，有大头还是小头之分，引入BOM（Byte Order Mark，字节序标记）解决该问题，而utf8由于是单字节传输无该问题；

>  字符编码的概念分为：有哪些字符、它们的编号、这些编号如何编码成一系列的“码元”（有限大小的数字）以及最后这些单元如何组成八位字节流。

关于具体环境下的编码之分：

1. OS操作系统默认编码方式     

2. 终端命令环境下的编码方式     

3. 文本文件中内容保存的编码方式      

4. 应用程序中对应语言环境中字符变量的编码方式，即变量再内存中的状态，encode() 可以指定特定编码环境将字符转换到Unicode/ decode() 可以实现将Unicode转换为特定其他编码方式下的str


---

Quote：

[Solving Unicode Problems in Python 2.7](http://www.azavea.com/blogs/labs/2014/03/solving-unicode-problems-in-python-2-7/   "Solving Unicode Problems in Python 2.7")

[提问的Stackoverflow](http://stackoverflow.com/questions/29306869/encoding-and-decoding-in-python-2-7-5-1-on-windows-cmd-and-pycharm-get-diffrent/29320806#29320806)

[字符集-WiKi](https://zh.wikipedia.org/wiki/%E5%AD%97%E7%AC%A6%E7%BC%96%E7%A0%81)
