---
layout: post
title:  Python Scrapt
category: python
keywords: [improvement,python]
---

Python 的作为一门工具语言确实是非常好用的,极易上手;找到目标,理清思路,从系统到细节,逐个细节各个击破快速实现,非常有效;

最近在学习 TensorFlow, 这里想通过一些小的 Demo 实战来回顾 python 的一些特性:

*  python oop

class 相关内容,主要注意与 java 动态特性如多继承等

* thread || multiprocessing

GIL 的存在导致 python 多线程的鸡肋性存在;通常我们较多的使用 multiprocessing 多进程实践;

* zipfile

处理 zip 压缩文件相关

* webbrowser

利用系统浏览器打开网页

* request

* beatifulSoup

* selenuim

* phantomJS  

以上四个常用框架见 demo: 

[Demos](https://github.com/itlipan/Py3Scrapt/tree/master/actions)


* scrapy

高效爬虫框架,理清框架构成: 

* Scrapy Engine          
* Scheduler               
* Downloader              
* Pipeline            
* Middlewares          




关于环境: 

在自己构建 python 环境,以及组合 pythonenv 心累之后,最后还是果断上船 conda :

[anaconda pkg](https://anaconda.org/search?q=selenium&sort=ndownloads&sort_order=-1&reverse=true)

链接组合 alfred 自定义搜索 `https://anaconda.org/search?q=platform%3Aosx-64+{query}` 对于pkg 的安装的确是一站式服务;