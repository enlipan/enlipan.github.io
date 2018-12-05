---
layout: post
title:  Read Pocket Best Article(4)
category: others
keywords: [improvement]
---

关键词:  Complexity  

正如之前所看的"软件设计的哲学" 软件的核心词汇就是复杂度,如何有效的设计降低系统复杂度? 

## Do We Worship Complexity? 

系统的拆分, 一个的小开发 Group能够独立执行发展的小单元.

开发任务总会耗尽所有的额开发资源,直到没有资源可用.组织总会不停膨胀.

团体组织管理者崇尚复杂.   

针对伪需求的解决方案,过渡设计,解决了不是实际问题的问题,因而产生了过多的系统复杂性.   

如果我们一边无意识的崇尚复杂性,一边又只专注于技术,仅仅想做出尽可能的简单和优雅的系统设计是没有意义的.

意识到自己的这种无意识复杂性崇拜是非常重要的.

https://www.innoq.com/en/blog/do-we-worship-complexity/#complexityasanexcuse

### 康威定律  

> the architecture of a system represents the communication structures of the organization that implements the system.

>  If an organization wants to develop a big system, a lot of people will need to work on the project. Since communication in a large team is difficult, it collapses at a certain team size. Since communication and architecture influence each other, poor communication leads to chaotic architecture and additional complexity.



系统设计的解构必定 复制 **设计该系统的组织** 的 **沟通解构**   
> 设计系统的组织，其产生的设计和架构等价于组织间的沟通结构。

团队的组织架构与系统的设计架构直接关联.      


[微服务架构的理论基础 - 康威定律](https://yq.aliyun.com/articles/8611)


![每个架构师都应该研究下康威定律](https://www.infoq.cn/article/every-architect-should-study-conway-law)

系统是为了满足利益相关者的需求而构建.

架构由架构文档描述,架构文档描述一系列架构视角,每个视角都解决并对应到利益相关者的关注点.  


架构的核心之一: 找准需求, 平衡解决利益相关者的需求.  

利益相关者: 开发/产品, 技术/管理层, 业务方/技术方  

架构: 
> 架构表示对一个系统的成型起关键作用的设计决策，架构定系统基本就成型了，这里的关键性可以由变化的成本来决定。   
> 架构的目标是用于管理复杂性、易变性和不确定性，以确保在长期的系统演化过程中，一部分架构的变化不会对架构的其它部分产生不必要的负面影响。这样做可以确保业务和研发效率的敏捷，让应用的易变部分能够频繁地变化，对应用的其它部分的影响尽可能的小。

MVP: 最小可用产品,尽快交付用户.快速实验,快速迭代.  


DevOps: 

* 系统思维, 整个软件开发过程各环节参与者高度关联,居高临下审查价值交付链条.    
* 反馈环路搭建.系统的监控环节.   
> 没有测量就没有改进与提升      
> 你测量什么,就得到什么               


### 微服务架构的理论基础

弹性安全措施: 不追求完全避免错误,而是追求最高效的错误恢复机制. 

子系统: 独立自恰的子系统,微服务减少沟通成本.  —> 组织形态会通过系统设计表达出来即组织沟通方式决定了系统设计, 如: 跨地域团队之间更容易形成模块化系统.  


> 
了解了康威定律是什么，再来看看他如何在半个世纪前就奠定了微服务架构的理论基础。

人与人的沟通是非常复杂的，一个人的沟通精力是有限的，所以当问题太复杂需要很多人解决的时候，我们需要做拆分组织来达成对沟通效率的管理
组织内人与人的沟通方式决定了他们参与的系统设计，管理者可以通过不同的拆分方式带来不同的团队间沟通方式，从而影响系统设计
**如果子系统是内聚的，和外部的沟通边界是明确的，能降低沟通成本，对应的设计也会更合理高效**
**复杂的系统需要通过容错弹性的方式持续优化，不要指望一个大而全的设计或架构，好的架构和设计都是慢慢迭代出来的** 

带来的具体的实践建议是：

我们要用一切手段提升沟通效率，比如slack，github，wiki。能2个人讲清楚的事情，就不要拉更多人，每个人每个系统都有明确的分工，出了问题知道马上找谁，避免踢皮球的问题。
**通过MVP的方式来设计系统，通过不断的迭代来验证优化，系统应该是弹性设计的。** 
你想要什么样的系统设计，就架构什么样的团队，能扁平化就扁平化。最好按业务来划分团队，这样能让团队自然的自治内聚，明确的业务边界会减少和外部的沟通成本，每个小团队都对自己的模块的整个生命周期负责，没有边界不清，没有无效的扯皮，inter-operate, not integrate。
做小而美的团队，人多会带来沟通的成本，让效率下降。亚马逊的Bezos有个逗趣的比喻，如果2个披萨不够一个团队吃的，那么这个团队就太大了。事实上一般一个互联网公司小产品的团队差不多就是7，8人左右（包含前后端测试交互用研等，可能身兼数职）。
再对应下衡量微服务的标准，我们很容易会发现他们之间的密切关系：

分布式服务组成的系统
按照业务而不是技术来划分组织
做有生命的产品而不是项目
Smart endpoints and dumb pipes（我的理解是强服务个体和弱通信）
自动化运维（DevOps）
容错
快速演化

https://yq.aliyun.com/articles/8611


### DevOps 

自动化运维.

持续不断的寻找优化之路.不将缺陷带入下一层级环节.

持续不断的迭代,打通完善的反馈通道.

不断尝试,从失败中吸取经验,学习总结.

http://itrevolution.com/the-three-ways-principles-underpinning-devops/

