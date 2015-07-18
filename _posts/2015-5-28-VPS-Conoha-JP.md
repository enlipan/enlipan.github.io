---
layout: post
title: VPS Conoha
category: network
---

最近对VPS很有折腾的兴趣，一来是自己的用着放心，同时也是好奇心作祟，想学习学习。看了看形势研究了研究，就入手了Conoha的VPS，速度不是很满意，一来不稳定，而来问题有点多，但是方便的是，各种VPS管理工具。

这段时间之后，再转到oneasiahost，按照季度购买或者半年份购买。主要是目前自己的各方面情况还不是很稳定，下一步真正稳定之后一来.com域名要定下来，预计一次性购买3年或者5年，另外长期比较之后选择稳定以及价格合适的VPS将Blog迁移过去，省得Github抽风。言归正传，关于VPS的ShadowSocks部署方案，既有小巧的libev 版的 shadowsocks，也有Python以及go版本，鉴于想要使用多用户就选择了比较方便的Python版本，Centos折腾了一个通宵还是有些问题，最后用了这个Ubuntu，主要有方法如下：

{% highlight Bash %}

sudo apt-get update
sudo apt-get upgrade
//建议update防止依赖项出现问题
sudo apt-get install python-pip
pip install shadowsocks
sudo ssserver -p 443 -k password -m rc4-md5  -d start
//-p 指定端口  -k 指定密码 -m 加密方式 -d 后台运行
//直接运行，单用户OK

{% endhighlight %}


而关于多用户问题，可以通过配置/etc/shadowsocks.json文件完成

{% highlight Bash %}

vi  /etc/shadowsocks.json
{
    "server":"your_server_ip",
    "local_address": "127.0.0.1",
    "local_port":1080,
    "port_password":{
         "8989":"password0",
         "9001":"password1",
         "9002":"password2",
         "9003":"password3",
         "9004":"password4"
    },
    "timeout":300,
    "method":"rc4-md5",
    "fast_open": false
}
//"server"可以配置为本机地址：0.0.0.0
//If both of your server and client are deployed on Linux 3.7+, you can turn on fast_open for lower latency.

//To run in the foreground:
ssserver -c /etc/shadowsocks.json
//To run in the background:
ssserver -c /etc/shadowsocks.json -d start
ssserver -c /etc/shadowsocks.json -d stop

vi  /etc/rc.local
//添加开机启动脚本，将ssserver -c /etc/shadowsocks.json -d start加到exit 0之前

netstat   -anp
//检测端口使用开启情况

{% endhighlight %}

配置完成，测试Google成功

----

[github-Shadowsocks 使用说明](https://github.com/shadowsocks/shadowsocks/wiki/Shadowsocks-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

[github-Configuration via Config File](https://github.com/shadowsocks/shadowsocks/wiki/Configuration-via-Config-File)

