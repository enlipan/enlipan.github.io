---
layout: post
title: Git 记录
category: network
keywords: [GitHub]
---

Git 属于分布式版本控制系统，无中央服务器概念，个人电脑上有完整版本记录，而SVN仅仅中央服务器有完整版本记录。

Git对比SVN的核心优势在于强大的分支管理；

Git  对于文本文件的追踪非常强大，但是对于音频图片等以二进制直接存储的文件无法定位修改，曾经想用git管理Word资料，由于Word资料是二进制格式内容，也无法追踪文件改动；

学习Git 其核心要落脚于两块：

*  一是版本管理      
*  二是分支管理     

### 版本管理

*   git status 仓库当前状态     
*   git diff  显示当前文件修改内容;当 git status 显示文件已修改时，可以利用diff 查看具体修改部分
*   git log 显示历史记录，git log加自动补全tab 可以显示log摘要，而 git log 输出全部信息时往往较为杂乱，可以利用--pretty=oneline输出单行信息（其 CommitId 是由SHA1计算所得数字版本号）      
*   git reset 版本回退命令,一个问题是 当本地文件被修改却未提交时,自己不想提交想回退到编辑之前，运行reset 显示git unstaged changes after reset，我们可以放弃本次的编辑，利用如下命令：      

>   git stash        
>         
>   git stash drop  

*  git reset 后面即可以利用 HEAD ^ 符号向上回退，每一个^ 代表一个版本，也可以利用 git log 输出的版本号，回退到指定版本     
*  git reset  --hard 命令中，--hard 表示：        
*  要理解 git 中工作区，暂存区，以及本地仓库分支，其中尤其是暂存区的思想        

*  撤销修改         

>  修改仅仅处于 工作区，直接利用  git checkout --file 命令 放弃工作区内容              
>               
>  修改不仅仅位于工作区，同时已经添加到了暂存区，这时需要先清除暂存区的内容利用  git reset HEAD file  命令回退暂存区内容 —— 将暂存区的修改回退到工作区，也就是工作区有修改，但是还没有添加到暂存区的状态，再次利用 checkout --file 放弃工作区内容       

有问题找 help ，Git的说明在help中有详细说明    

### 分支管理

事实上这个分类并不恰当，分支也属于版本管理一部分，上述的版本管理更多的是指的是文件管理：

* git checkout -b  创建并且切换分支    
* git  branch  创建分支  git branch -d 删除分支
*  知道 rebase 以及 merge 合并分支的差异，rebase成为衍合，衍合即在当前分支上依次重演另一分支提交历史，其合并是线性记录

**stash**

*  git stash 应用于紧急切换分支，中途切换分支，本来所处的分支上开发了一半内容，无法确定是否需要提交或者提交后无法运行构建，利用git stash 保存现场内容快照，当然我们可以利用 stash drop 放弃改内容，这与上面修改文件一半到回退之前版本是一样      
*  如果要恢复 stash 可以利用 git stash apply 或者 stash pop 差异在于前者不删除 stash；    

---

Quote:
