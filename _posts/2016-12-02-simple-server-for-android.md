---
layout: post
title:  SimpleServer For Android
category: python
keywords: [improvement,android]
---

开发Android在开发过程中,一直有个比较坑的部门，涉及到UI的调试时如果没有后台数据需要自己去SetterGetter注入数据，如果是List则更加麻烦，需要自己手写构建诸多对象Setter从而构建List，实在有点不爽，所以想着自己实现个简单的restful后台读取本地Json文件返回到手机，一方面Retrofit的配置接口可以直接使用，而不用在自行构造数据时绕过接口的问题，二来数据也可以通过编写Json文件直接快速配置；

实现主要是几部分：          

* io读取Json文件                      
* 响应Get/Post请求                  
* 返回Json（application/json）                   

Python确实非常好用，内置的功能齐全，基本需要实现的都能快速找到对应的内置函数模块快速构建完成核心源码如下：

{% highlight python %}

#coding=utf-8

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import cgi
import json
import io
import os
import re


PORT_NUMBER = 8989

class JsonHandler(BaseHTTPRequestHandler):

    MESSAGE = ""

    """Json Handler"""
    def do_GET(self):
        # 对应的restApi
        if None != re.search('/api/search/viewTrack/*',self.path):
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            if (self.MESSAGE == ""):
                self.MESSAGE = getJsonStr()
            self.wfile.write(self.MESSAGE)
            return
        else:
            self.send_response(404)
            self.send_header('Content-type','application/json')
            self.end_headers()

def getNetworkIp():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("gmail.com",80))
    s_name = s.getsockname()[0]
    s.close()
    return s_name

def getJsonStr():
    try:
        with open(os.path.join(os.path.dirname(__file__) + '/../file/content_file.json'), 'r') as open_file:
            message = open_file.read()
            # json.dumps()
            # json.loads()
            return message
    except IOError:
        pass

if __name__ == '__main__':
    from BaseHTTPServer import HTTPServer
    server = HTTPServer(('',PORT_NUMBER),JsonHandler)
    try:
        print 'started http server on --> %s:%s' % (getNetworkIp(), PORT_NUMBER)
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down the web server'
        server.socket.close()

{% endhighlight %}

寥寥几行代码实现了一个自定义的服务器，Python作为工具语言确实上手极为快捷，功能丰富。

事实上，这里也对于如何抽象化计算机思维应用实践，本质上是将问题分解为一系列简单机械步骤，进而推演至完整的解决方案，逐步推进的过程—— 化繁为简，这些思想也在实践之时逐步明晰；无论语言上的实现如何，但万变不离其宗，其实践思维却相同；


---

Quote:

[Basic HTTP server](https://docs.python.org/2/library/basehttpserver.html)

[Python BaseHTTPServer 介绍](http://cizixs.com/2016/05/20/python-httpserver)

[How to Use Python ‘SimpleHTTPServer’ to Create Webserver or Serve Files Instantly](http://www.tecmint.com/python-simplehttpserver-to-create-webserver-or-serve-files-instantly/)
