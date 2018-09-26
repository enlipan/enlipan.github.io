---
layout: post
title:   Jenkins Pipline CI/CD
category: android
keywords: [improvement,web,android]
---

随着公司开发团队的体系化以及规模化,可以说 CI/CD 肯定会被提上日程,而且是越早越好,但事实上在搭建推广过程中,很多人其实对这些理念并不理解,他们只知道自己的发布以及部署有很多痛点,每一次发布都如同打仗,他们也知道这是问题,但是却都只盯着部署,这一换, 殊不知持续集成-> 持续交付-> 持续部署 每一环都环环相扣,缺一不可.

在整套CI/CD体系的搭建中,绝大多数公司基于 Jenkins 和 GitlabCI,而国内则以 Jenkins 居多,尤其是来到 Jenkins2.0之后的 Pipline 体系之后.


#### docker Jenkins

利用 Docker 搭建 Jenkins, 顺便回忆下 Docker呗.

* jenkins docker 部署 

docker pull jenkins/jenkins:2.138

在此指定合适版本能省略很多事情,如果使用 latest 版本 jenkins, 由于镜像维护问题,还是用的老的版本甚至不支持 pipline, 为后续的 jenkins 升级带来很多麻烦.

jenkins docker 升级 

* jenkins stop

http://localhost:8080/exit

如果出现 403 问题, 可以尝试关闭”防止跨站点请求伪造”

* 重启服务

docker container start container_name

* 进入对应的 docker 服务
docker exec -it 3e2d6bd75f78 /bin/bash

* no tool named M3 found 问题
def mvnHome = tool 'M3' 如果出现问题可以首先查看
全局工具设置- Maven 配置是否是配置为 M3.


#### Pipline  

**Pipeline as Code**


> A Pipeline is another way of defining some Jenkins steps using code, and automate the process of deploying software.

Pipline 的脚本利用 Groovy 语言,对于 Android 开发者非常友好,上手极快.

在 引用文章 `Intro to Jenkins 2 and the Power of Pipelines` 中有这么一行脚本需要注意: 


`withEnv(['JENKINS_NODE_COOKIE=dontkill'])`


> using JENKINS_NODE_COOKIE to prevent immediate shut down of our application when the pipeline reaches the end.

其实是因为ProcessTreeKiller的存在, Jenkins构建过程中使用shell启动的进程在Jenkins 的整个Job(Pipline)完成时shell 进程也会被kill.



##### Pipline 概念

* Step : 基本运行单元.          
* Stage : 实际代表着 Step 的逻辑分组,通常一个 Stage 完成一个大的功能合集,而其中可以划分为多个 Step 组合.               
* Node : Jenkins 中的节点,代表着 Pipline 的运行环境          

* tool  : 对应 Global Tool Configuration 全局工具配置,进而可以在 Pipline 在使用对应的工具.

{% highlight java %} 


def gradleHome = tool 'gradle'
env.PATH = "${gradleHome}/bin:${env.PATH}"
def mvh = tool 'M3' // M3 是工具配置中指定的 Maven 插件


{% endhighlight %}


* agent : 用于指定 pipline 或 指定 Stage 的运行环境.


事实上了解了以上概念,对照 `Getting Started with Pipelines` 以及 `Pipeline Syntax 语法` 就可以直接开始进入 Pipline 的构建了.


值得一提的是 Jenkins 最新引入的 Blue Ocean 插件,全新的配置化 UI 风格.

—

[Getting Started with Pipelines](https://jenkins.io/pipeline/getting-started-pipelines/)

[Intro to Jenkins 2 and the Power of Pipelines](https://www.baeldung.com/jenkins-pipelines)

[Pipeline Syntax 语法](https://jenkins.io/doc/book/pipeline/syntax/)

[Jenkins 2 Pipleline的简单教程](https://blog.frognew.com/2018/03/jenkins-2.x-pipeline.html#1pipeline%E7%9A%84%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E5%92%8Cjenkinsfile)

[Jenkins持续集成 ](https://www.xncoding.com/2017/03/22/fullstack/jenkins02.html)

[Jenkins pipeline：pipeline 使用之语法详解](https://www.cnblogs.com/YatHo/p/7856556.html)
