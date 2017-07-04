---
layout: post
title:  替换Windows下丑陋的Terminal
category: others
keywords: [improvement]
---

### 反人类的Window CMD控制台



Windows下的Terminal实在是难堪大用，借助Terminal可以完成的东西太多了，很多时候想想如果有Linux的命令行加上Windows系统的易用性就完美了，早先尝试过 PowerShell，Cywin等命令行工具，可以用但总有些不好用的地方，尤其是结合JetBrains全系列软件的 Bottom Terminal使用，确实不好用，这不Google一番还是有所收获： Babun这一windows下的Zsh工具可以通过一些设定完美的配合到 JetBrains上使用；


具体的其实没有多少可以说的，都是外国友人的教程，这里搬运一下：

*  下载安装 Babun - Windows下会自动安装到 `User\username\.babun` 目录     
*  事实上在目录下可以发现对应的 babun.bat文件，但是就如同单独安装cywin一样，直接在JetBrains中打开terminal无法正确关联项目文件夹，这样命令行的便利性就消失了，以下要做的就是在对应的目录下打开指定terminal   

*  在`.\Babun`目录下创建用于打开Terminal的脚本 cygwin.bat文件      
*  打开脚本文件 cygwin.bat，输入以下 script：

{% highlight bash %}

@echo off
set currentdir=%cd:\=/%
@echo cd %currentdir% > "C:\Users\Lee\.babun\cygwin\home\Lee\.bashrc_cd"
call C:\Users\Lee\.babun\cygwin\bin\bash --login -i -ls

{% endhighlight %}

*  替换 JetBrains tools中的 Terminal为：打开./Babun/cygwin.bat      
*  最后关联文件夹：在`\.babun\cygwin\home\Lee\.bashrc` 文件中添加以下脚本：


{% highlight bash %}

if [ -f "${HOME}/.bashrc_cd" ];
  then
   source "${HOME}/.bashrc_cd"
   rm "${HOME}/.bashrc_cd"
fi

{%  endhighlight %}

PS:

*  以上 Lee是我的用户名，设置时需要对应设置，表述不清晰的地方可以查看引用文章对照；   

*  Balun 默认是UTF-8环境，直接运行对应cygwin.bat可以查看 properies 查看current Page


---

上面的这个配置在Webstorm下使用开发RN非常舒服，但是在AS下对于Gradle的命名行输出不友好，所以最後用下來在AS下还是有各种奇奇怪怪的问题，cywin的bash命令环境下的字符集存在问题，但是打开mitty又没问题，最后AS下还是换回了 git.bash；

---

Quote：

[Babun](http://babun.github.io/)

[Windows效率工具](https://liwei-box.github.io/2016/08/01/Windows%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7/)

[Change default code page of Windows console to UTF-8](https://superuser.com/questions/269818/change-default-code-page-of-windows-console-to-utf-8)

[Using Cygwin’s bash terminal in a JetBrains IDE](https://engineroom.teamwork.com/using-cygwins-bash-terminal-in-a-jetbrains-ide/)

[Configure Webstorm to Use Babun Shell](http://t-code.pl/blog/2016/02/webstorm-babun/)

[让Windows用上OMZ的神器Babun](http://www.10tiao.com/html/357/201605/2247483823/1.html)
