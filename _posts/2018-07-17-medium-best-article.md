---
layout: post
title:  Medium 文章精选
category: others
keywords: [improvement,android,java,js]
---

[Understanding Compilers — For Humans](https://medium.com/@CanHasCommunism/understanding-compilers-for-humans-ba970e045877)


tokenization                   
grammars           
parsing        
and code generation


高级语言 -> (Intel)汇编 -> 机器语言(二进制代码)      
 
符号化处理 : 为了计算器能够理解程序,将程序中的符号分解为计算机自身的符号.源代码被计算机分割标记为符号并保持在计算机内存中.           
解释器: 构建抽象语法树         
代码生成: 在代码生成之前,通常会进行中间阶段处理以及最终优化获取最终的 AST.最后才利用解释器的结果AST构建汇编码 --> 为什么不直接生成机器码?为了不同CPU 体系的适配.汇编码比机器码的兼容性更强.


LLVM: 完整的编译系统中间层.-- 作为编译器的基础设施,为任意编程语言而写的程序.

---


[Good code vs bad code: why writing good code matters, and how to do it](https://medium.com/@navdeepsingh_2336/good-code-vs-bad-code-35624b4e91bc)

