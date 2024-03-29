---
layout: post
title: 解决Git每次Push需用户名登录问题
category: network
---

最近突然发现Push要登录用户名与密码，操作体验下降得很厉害，Google之发现是Git采用了Https的方式登录了，应该是自己把原来的项目删除了然后采用了`git clone https`在直接在克隆文件下操作提交，导致原先的SSH失效了，遂在此更改回SSH验证方式：

主要操作指令：

>git remote


{% highlight Bash %}

$ git remote -help
usage: git remote [-v | --verbose]
   or: git remote add [-t <branch>] [-m <master>] [-f] [--tags|--no-tags] [--mir
ror=<fetch|push>] <name> <url>
   or: git remote rename <old> <new>
   or: git remote remove <name>
   or: git remote set-head <name> (-a | --auto | -d | --delete |<branch>)
   or: git remote [-v | --verbose] show [-n] <name>
   or: git remote prune [-n | --dry-run] <name>
   or: git remote [-v | --verbose] update [-p | --prune] [(<group> | <remote>)..
.]
   or: git remote set-branches [--add] <name> <branch>...
   or: git remote set-url [--push] <name> <newurl> [<oldurl>]
   or: git remote set-url --add <name> <newurl>
   or: git remote set-url --delete <name> <url>

    -v, --verbose         be verbose; must be placed before a subcommand

{% endhighlight %}

>$ git remote rm origin
>
>$ git remote   add  origin git@github.com:englipan/englipan.github.com
>
>$ git push origin

{% highlight Bash %}

$ git remote  -v
origin  git@github.com:englipan/englipan.github.com (fetch)
origin  git@github.com:englipan/englipan.github.com (push)

{% endhighlight %}

更改完毕，再次Push测试，无需再次输入用户名密码

