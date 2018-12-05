---
layout: post
title:  Read Pocket Best Article(1)
category: others
keywords: [improvement]
---

### 拒绝当一名平庸的程序员   

* 多写代码实践,编程范式的实践,设计范式的实践,编程是大脑的体力锻炼,一定要实践中思考,思考中学习.     
* 从不同的角度看待实践的代码, 测试驱动, 写测试用例.多角度考量, 代码的可测试.     
* 直面不足           
* 利用开源知识学习,拓宽自己的视野.          
* 做一些个人项目        
* 为什么先生? 带着问题思考,刨根问底的探索       
* 专业. 细节上的偷懒会让你显得很不专业.                
* 不要吝啬你的赞扬          
* 挑战复杂                             

### 处理复杂度 

团队应该能够分辨什么样的烂代码是真正的烂代码, 什么样的烂代码是业务复杂. 如果分辨不出,就不要去修改老逻辑.   

不要停止对于好的探索: 如果业务复杂,就考虑能不能简化?多一些抽象?  如果是烂,那么考虑能否在有限的成本下,提升一些? 
 

### 依赖注入 

Guice / Dagger 基于注解的依赖注入.   


模块开发: 

> 系统模块   : 系统平台建设中需要的功能组织模块,如 平台日志模块.        
> 领域模块   : 某个领域的功能组件.            
> 业务模块   : 业务方业务功能的实现模块.        


1. 剥离对象的直接依赖, 对象关联中的 new 操作符.
2. 利用构造函数亦或是 setter 注入,注入的好处是解除了直接依赖,可以利用接口进行弱耦合,利用 Mock 可以轻易的进行 TDD 驱动.    
3. 解除了直接 new  引入的强依赖后是否真的需要不停的进行代码注入? 对象的注入大多为重复无意义的代码,可以配置化管理,将工厂抽象为元数据进行数据配置化.  


### 异常与错误处理   

从错误类型码处理, 也就是 success 0 / error 用其他错误码返回, 这样所有函数都可能为错, 所有函数都需要关注错误的情况, 错误处理与实际逻辑糅合在一起,陷入错误地狱. 

独立的异常处理: 面向对象语言的开端.     

异常处理的优雅性: 什么时候才应该真正抛出异常让使用者关注? 异常处理的昂贵开销: 在 throw 时的开销非常大.    

失败/错误/异常  的差异

失败: 违反约束契约的情况. 函数期望字符串, 传入了数字这类违反了约定的情况. 

错误: 意料中出现的问题.访问不存在的文件这类开发者可处理情况.   

异常: 不可预料中的问题,数组越界这类不可处理的情况.    

如 Java 中的 : Error 和 Throwable .    


### Docker    

* DevOps 一次创建/配置, 任意地方正常运行.   

* Docker 命令: 

docker commit 构建新的镜像: commit 构建的镜像,使用者无法知道其构建过程,属于黑盒封装,黑盒镜像不利于维护.

Docker Layer 除当前层,之前的层都是不会发生改变的,即任何修改结果都会在当前层进行标记添加修改,而不会改动上一层.  利用Docker commit 制作的镜像以及后期修改都会不停的使镜像更加臃肿.

* Dockerfile   

FROM 

RUN  

注意 Docker 中的每一个操作都会新建立一层,每一个 RUN 都会在执行完毕之后 commit 本层修改,构成新的镜像. 

UnionFS 有最大层数限制.

利用 RUN 命令与 && 将各个操作命令串联起来,简化为Docker层级.  Dockerfile 支持 shell 指令行尾添加 \ 换行进一步优化格式化显示.

docker build ; 

docker 引擎提供了 docker remote api 支撑 docker client 的调用,表面的操作是直接操作 dockerclient 实际都是远程调用了 docker 引擎提供的挨批服务, C/S 设计.

docker build 上下文.

* AUFS   

将不同物理位置的目录合并mount 挂载到同一目录中. UnionFS 可将 CD 与硬盘联合 Mount, 进而可对于只读 UnionFS 进行修改.

Docker 利用 UnionFS 搭建分层镜像,构建 Layer.

```
sudo mount -t aufs -o dirs=./fruits:./vegetables none ./mnt

```

默认指定的坐标文件具有读写权限, 即fruits目录具有读写权限, 而右边的文件夹只有只读权限.   

* OverLayFS  

* Docker 挂载主机目录    

—mount 

https://yeasy.gitbooks.io/docker_practice/data_management/bind-mounts.html


### 计算机硬件 - CPU/ 硬盘/网络速度 

CPU 的高速执行频率, 0.3ns 级别.

CPU 缓存分级:  分支预测的耗时以及代码优化.   


分支预测问题: 

> If you guess right every time, the execution will never have to stop.
> If you guess wrong too often, you spend a lot of time stalling, rolling back, and restarting.

https://stackoverflow.com/questions/11227809/why-is-it-faster-to-process-a-sorted-array-than-an-unsorted-array

CPU 加锁耗时 25ns.

内存的寻址: 每次 100ns.


https://zhuanlan.zhihu.com/p/24726196



