---
layout: post
title: 解决GitPush用户名登录问题
category: python
---

最近突然发现Push要登录用户名与密码，操作体验下降得很厉害，Google之发现是Git采用了Https的方式登录了，原先的SSH也不知道哪里去了，遂在此更改回SSH验证方式：

主要操作指令：

>git remote


{% highlight  %}

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
