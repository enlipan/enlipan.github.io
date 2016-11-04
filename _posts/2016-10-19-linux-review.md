---
layout: post
title:  常见 Linux 命令回顾
category: android
keywords: [linux]
---

### 文件目录相关

####  ls

*  -a      
*  -l            

ls 配合管道命令 |  完成高级组合命令

stat 命令：加强版ls

####  危险的删除  rm

一般rm用于删除文件和目录，而空目录通常用 rmdir命令删除，当然也能用  -r 模式的 rm去删除


#### mkdir、touch 创建

`mkdir -p dir-{00{1..9},0{10..99},100}`  

利用表达式创建001 - 100 个文件夹

#### mv 移动或重命名文件

#### less

less is more

配合其他命令以及管道命令|可以做linux标准文件查看方式

#### 管道线 |

该命令从标准输入读取数据，然后再把数据输送到标准输出 ： `command1 | command2`


### 查找

#### which

* 定位执行文件位置  PATH 搜寻

#### whereis

*  搜寻源码等二进制文件

#### locate  -- 简单查找

*  搜寻文件索引数据库快速定位文件,并且输出每个与给定字符串相匹配的文件名

*  可能因为文件新增不久而未被扫描录入数据库导致无法定位的情况

> locate 数据库由另一个叫做 updatedb 的程序创建。通常，这个程序作为一个 cron 工作例程周期性运转；也就是说，一个任务 在特定的时间间隔内被 cron 守护进程执行。大多数装有 locate 的系统会每隔一天运行一回 updatedb 程序。因为数据库不能被持续地更新，所以当使用 locate 时，你会发现 目前最新的文件不会出现。为了克服这个问题，可以手动运行 updatedb 程序， 更改为超级用户身份，在提示符下运行 updatedb 命令。

####  核心 find 命令 - 高级查找

通过 man 命令可以查看到其文档内容，主要组合命令用法：

 -type   d/f   文件夹和文件筛选

 -name   

 -size    c/k/M  字节/K字节/兆字节

 -and  -a /  -or  -o / -not !  组合逻辑运算符

 find 组合预定义操作：

 *  对find后的结果集进行操作：

 -print  默认衔接操作——打印输出
 -ls     同ls，无特殊
 -delete delete前最好先打印输出确认，防止误操作删除
 -quite  一旦找到第一条结果立即退出

*  对结果集进行自定义行为  exec

-exec command {} ;  注意 {} 以及 ； 符号在shell中的特殊意义，在此处使用需要转义
eg:

`find . -type f  -name '*.png'  -and  -size +1000k  -exec ls -l '{}' ';'`

*  将find结果集集合，一次批量执行命令（而非原有对每条结果执行指令） :  

1.  改-exec command {} +   ——  + 结尾                
2. 使用 xargs —— 注意 xargs 命令参数个数的限制          


####  xargs 辅助命令




[查找文件](https://billie66.github.io/TLCL/book/zh/chap18.html)

### 打包

#### 强大的tar命令



### 权限命令

* chmod


### 性能监控命令


#### top

#### free


### 高级表达式

#### grep 命令

grep 输出匹配行





































---

Quote:

[TLCL-Ebook](https://billie66.github.io/TLCL/book/zh/index.html)

[LINUX命令五分钟](http://roclinux.cn/?cat=3)

[每天一个linux命令目录](http://www.cnblogs.com/peida/archive/2012/12/05/2803591.html)
