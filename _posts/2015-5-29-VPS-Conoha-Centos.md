---
layout: post
title: VPS Conoha Centos
category: others
---

昨晚本来是想用Centos加锐速的组合套装去完成这个Vps的第一个翻阅长城的任务，结果Centos7在防火墙一块狠狠坑了我一晚上，没搞明白，又累又困就不了了之，选了个Ubuntu，结果Ubuntu又没有对应的锐速版本。今天想了想还是不甘心，继续折腾Centos，大概的流程是由于Centos7防火墙改版，主要开启端口的方法如下：

{% highlight Bash %}

//列出所有端口情况 
netstat -ntlp

//CentOS 7.0默认使用的是firewall作为防火墙，改为iptables防火墙
systemctl stop firewalld.service      //停止
systemctl disable firewalld.service    //禁止开机启动
yum install iptables-services    //安装iptables防火墙

//编辑防火墙配置文件打开指定的端口号
vi /etc/sysconfig/iptables 

-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT   #允许80端口通过防火墙
-A INPUT -m state --state NEW -m tcp -p tcp --dport 3306 -j ACCEPT   #允许3306端口通过防火墙
//备注：很多网友把这两条规则添加到防火墙配置的最后一行，导致防火墙启动失败，正确的应该是添加到默认的22端口这条规则的下面
//保存退出
:wq
//最后重启防火墙使配置生效
systemctl restart iptables.service 
//设置防火墙开机启动
systemctl enable iptables.service 
//关闭防火墙
//重启后永久性生效：
开启：chkconfig iptables on
关闭：chkconfig iptables off
//即时生效，重启后失效：
开启：service iptables start
关闭：service iptables stop
{% endhighlight %}

至此防火墙端口问题解决，下面安装锐速Tcp优化：

{% highlight Bash %}

wget http://my.serverspeeder.com/d/ls/serverSpeederInstaller.tar.gz
tar xzvf serverSpeederInstaller.tar.gz
bash serverSpeederInstaller.sh 

{% endhighlight %}

锐速相关优化设置：

{% highlight Bash %}

vi /serverspeeder/etc/config
rsc="1"，RSC网卡驱动模式
advinacc="1"  流量方向加速
maxmode="1"  最大传输模式
然后退出保存
下面重新启动锐速的服务
停止
/serverspeeder/bin/serverSpeeder.sh stop
启动
/serverspeeder/bin/serverSpeeder.sh start

{% endhighlight %}

---

[CentOS关闭Linux防火墙(iptables) ](http://www.centoscn.com/CentOS/help/2014/1030/4021.html)

[Centos查看端口占用情况和开启端口命令](http://www.centoscn.com/CentOS/help/2013/0725/558.html)