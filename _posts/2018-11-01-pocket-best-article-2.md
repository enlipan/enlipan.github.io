---
layout: post
title:  Read Pocket Best Article(2)
category: others
keywords: [improvement]
---

开放的知识世界,理解从 PDF 的诞生原因理解 PDF 的特性.进一步看看思考的本质.


### PDF  

PDF 的构建是一种虚拟打印机制,是实体文档在数字世界中的影像 — 其本质就是数字化纸张.

PDF 的编辑实际是一种文档的涂改, 会生成新的 PDF.

结构化标记语言的数据标识: world 更加高级上层, 可理解更高,而与之相对应 PDF 则更加偏向底层的机器语言,更加固化.

更加高级的东西可变性更强,易于发挥的余地更大,因而 world 的兼容性往往没有 PDF 好.相较而言, PDF 的死板却更加容易被固定的规则所描述.
此外, PDF 会将引用的外部资源内嵌,形成编号,进而在 PDF 描述语言内部引用.    
基于以上两个原因,PDF 在多平台上看起来都会有较高的保真性.

PDF 保真性问题, 很多基于其他文件进行语言转换得到的 PDF 文件可能存在的问题,由于并非一手打印导出的数字文档,转换而来的文件经常由于缺乏引用资源而导致保真性问题, 这中资源的缺少给不同的阅读软件带来了不同的发挥理解机制,友好的阅读器会进行资源猜测与类似的平滑降级渲染,而有些则更加简单粗暴,还原至系统默认. 

PDF 文字的选中复制, 扫描版的 PDF 本质是一张张图片,一些软件的复制本质是对于图片进行 OCR 识别后的文字选中.

复制过程中的码表 CMAP 映射. PDF 并非是所见即所得, 看到的和复制输出的并不一定是同一字符.   

PDF 难以编辑? 请时刻提醒自己 PDF 是数字化纸张.

**与之对比 World 描述语言内容与格式的抽象分离,内容的编辑与格式的独立编辑都更加友好.**

**不同的出发点得到不同的结果, PDF作为一种电子化打印输出的文件格式,意味着此时编辑工作已经到达终点.**


https://sspai.com/post/47092


### How to think like a programmer — lessons in problem solving


像程序员一样思考如何高效的解决问题? 

解决问题是一项”核心技能”. 

常见的解决方案: 
> 尝试方案 A   
> 如果不生效,尝试方案 B             
> 如果再不生效,重复以上步骤,直到生效         

这是人们最常见,也是最低效糟糕的解决问题的办法. 

一个好的解决方案应该是: 
> 构建一个自有解决问题的系统框架        
> 不断尝试,完善解决问题的系统        

解决问题是雇佣者最看重的核心的技能,甚至优先于编程语言,调试,系统设计等.  

**演示计算思维与分解大型复杂问题的能力** 对于一项工作而言是与技术基础技能同样有价值的.

> The biggest mistake I see new programmers make is focusing on learning syntax instead of learning how to solve problems.



如何解决问题? 
* 理解问题,用自己的话描述问题,清楚的定义问题.如果你能够用自己的话向其他人清楚的描述这个问题,你才真正的理解了问题.    
* 计划问题的解决方案.清晰的写下你问题解决步骤.清晰的描述每一个步骤的输入时什么? 输出时什么?             
> 分割问题.不要尝试去解决一个巨大的问题.分割问题成为一个个独立的子问题,然后一个个解决这些子问题.   

* 被问题卡住之后? 调试> 放松 > 重新开始
> The art of debugging is figuring out what you really told your program to do rather than what you thought you told it to do.

* 练习

https://medium.freecodecamp.org/how-to-think-like-a-programmer-lessons-in-problem-solving-d1d8bf1de7d2


### Learning How to Think: The Skill No One Taught You

思考是什么? 思考是持续专注于问题, 耐心的调动大脑所有的思想,最终产生的原创想法.通过给大脑机会去建立事物间的联系,产生联想, 最终诞生让自己精细的 idea.


> “It’s only by concentrating, sticking to the question, being patient, letting all the parts of my mind come into play, that I arrive at an original idea. By giving my brain a chance to make associations, draw connections, take me by surprise”
    — William Deresiewicz


**大脑需要专注**

大脑并不善于并行多任务处理,大脑处理问题需要专注,思考需要专注.

认知能力的增强根本不会带来多线并行处理问题能力的增强. 

一心多用不是一件好事:任务之间的切换本身会消耗过多精力,一心多用同时还会损害你的思考能力.

> Thinking means concentrating on one thing long enough to develop an idea about it

思考就是充分的让大脑沉浸在问题之中,屏蔽外界的干扰,调动大脑所有的积极性,发挥知识的关联,大脑的联想能力,直到大脑产生关于问题的一些想法.

有时候慢就是快,少就是多.盲目的追求快和多没有意义.

https://fs.blog/2015/08/william-deresiewicz-learn-how-to-think/


### 如何成为一个优秀的工程师  

https://www.quora.com/How-did-Evan-Priestley-learn-to-program


广度比深度更重要,广泛的学习能够让你触类旁通,加深相关领域知识的把控能力.但知识的深度却只能让你进一步了解某一块局部知识.

一定要清楚你是真正的喜欢编程.  

系统的设计与实现应该选择越简单越好的方案.这个很难通过纸上的学习,最好的学习形式还是实践. 

成为优秀的工程师需要积累大量的经验,这没有捷径,唯有不停的尝试与积累.  

学习复杂系统的最好方式是建立一个如何在最大规模范围工作的可伸缩模型,然后对其进行改进. 了解其交互形式,而不是过早的陷入细节中去.这也是为什么拓宽知识面比专注某一块知识更加有用的原因.  

永远保持好奇心,追求理解为什么,打破砂锅问到底. 怎么了? 为什么会这样?




### 如何构建解决问题的方法论?  

https://medium.freecodecamp.org/how-to-think-like-a-programmer-lessons-in-problem-solving-d1d8bf1de7d2

问题来源于理想与现实的差距

* 理解问题,准确的理解问题是什么,如果你不能简单的总结出事情是什么,你就是没有准确理解其本质                    
* 对于问题解决的计划,将你的解决方案计划出来,梳理出方案的准确计划再去动手         
* 分治.不要尝试一次性解决超大型问题,将问题分割成各个子问题,如果分割之后你还是不知道则一直分割,知道最终你知道每个问题的解决方案,各个击破,各子问题解合并成原始问题的最终解.           
* Stuck(被问题卡住).被卡住是正常的,深呼吸正常的去看待卡住的问题.一逐步调试,深入细节,明白程序究竟在做什么.二,重新从头看待问题. 三利用搜索引擎,但不要浪费时间去检测超大系统性问题,应该搜索被分割之后的具体的子问题答案.
* 实践.不停的实践,总结实践的经验


