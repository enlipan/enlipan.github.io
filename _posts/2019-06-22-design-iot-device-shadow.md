---
layout: post
title:  Design IoT Device Shadow
category:  others
keywords: [improvement]
---

IoT 设备影子设计过程.

### 设备影子是什么? 解决什么问题?

设备影子本质是设备状态的云端缓存, 用于缓存设备状态, 设备离线时,上线后主动拉取云端指令, 设备在线时, 直接指令同步获取云端指令.


#### 场景:

1. 网络不稳定, 设备频繁上下线.    
2. 多程序同时请求获取设备状态.     
3. 设备离线, 设置设备启动运行状态.   

### 如何解决?

1. 隔离业务方对于设备上下线的变化感知, 业务方无感知的操纵云端设备影子. 

2. 设备在一定时间内同步运行状态给设备影子, 业务方可以通过设备影子获取设备运行状态, 减轻设备负担.   

3. 设备离线时, 修改设备云端状态, 设备上线后, 服务同步设备影子至设备. 

### 设计过程?

![](https://file.oncelee.com/20200118174014.png)

