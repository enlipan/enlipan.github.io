---
layout: post
title: Python Virtualevn
category: python
---
Python虚拟环境使用：

Virtualevn的安装相关很简单利用`Scripts`文件夹下`Easy_install`工具

* python  ez_setup.py
* easy_install virtualevn

安装完成，在相应文件夹下创建虚拟环境，每个文件夹可以创建对应环境

>virtualenv   envname
>
>>此处可选择相应参数指定python环境，windows下使用`virtualenv  --python="path\python.exe" envname`
>>
>>使用双引号隔离`path`可以处理路径中的空格，如我系统下2.7路径安装时不注意使用了默认安装路径`E:\Portable Python 2.7.5.1`就需要使用双引号处理
>
>虚拟环境创建完毕，启动虚拟环境:`evnname\Script\activate`
>
>退出虚拟环境:`deactivate`


---

更多参考参数：

[virtualenv中文文档](http://virtualenv-chinese-docs.readthedocs.org/en/latest/#id29)

[How to use Python virtualenv](http://www.pythonforbeginners.com/basics/how-to-use-python-virtualenv)

[stackoverflow:use-different-python-version-with-virtualenv ](http://stackoverflow.com/questions/1534210/use-different-python-version-with-virtualenv)
