---
layout: post
title:  Node JS 学习记录
category: js
keywords: [improvement,js]
---

NPM: npm 是 Node 中的自动包管理工具,类似 python 中的 pipe,全称: Node.js Package Manager

常用命令: 

npm init
npm list  
npm install 

#### express web 框架 

web 服务器监听对应的端口,PC 接受对应端口的网络消息被转发到对应的启动进程;因而通过采用端口区分,可以实现一条物理网络线路同时链接多个应用程序,而数据不混乱的问题;

#### package.json 文件

Package.json 文件定义了项目的各种元信息,以及项目依赖,以便在部署项目时服务器进行依赖的分析与依赖的安装; 

npm install 项目时, npm 自动读取 package.json 中的依赖并安装在项目的 node_modules 目录下;

npm install --save  安装依赖并写入 pkg.json 文件


#### async 使用 

利用 async 控制并发,优化函数调用流程,去除回调地狱;

#### benchmark  

测试函数的运行效率差异

#### 作用域/闭包

var 的作用域升级问题,以及未指定 var 而导致的全局变量问题;

this 函数中的 this 永远关联函数的调用者,也就是调用该函数的对象,因而也就是判断 this 所在的函数属于谁;


总结: 

* 学习了 Node 的管理方式以及一些常用命令,如 init, isntall ,以及 pkg.json文件作用;

---

quote: 

[node-lessons](https://github.com/alsotang/node-lessons/tree/master/lesson14)