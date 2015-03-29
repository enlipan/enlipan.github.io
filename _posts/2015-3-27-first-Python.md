---
layout: post
title: First Python Programme
category: python
---
###第一个Python试炼小代码

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
    #pathName = u'%s'% raw_input("input path:").decode('utf-8')#use unicode() 
    function to handle chinese path
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

乱码参考

[Solving Unicode Problems in Python 2.7](http://www.azavea.com/blogs/labs/2014/03/solving-unicode-problems-in-python-2-7/   "Solving Unicode Problems in Python 2.7")

[提问的Stackoverflow](http://stackoverflow.com/questions/29306869/encoding-and-decoding-in-python-2-7-5-1-on-windows-cmd-and-pycharm-get-diffrent/29320806#29320806)

