---
layout: post
title: Java 模式- 命令模式
category: java
---

命令模式通过封装命令对象，完成将 命令请求者 与 命令执行者的解耦（依旧是解耦），从而实现 执行端无差别调用命令执行，通过不同客户端产生不同的命令对象统一传递给执行者执行，实现执行者执行逻辑的复用；

请求的发起者只关心请求的发起，而不关心具体的请求执行者以及请求逻辑实现；


{:.center}
![command](http://7xqncp.com1.z0.glb.clouddn.com/assets%2Fimg%2F20160214%2FCommand.JPG)


{% highlight java %}


public class CommandInvoker {
    @Test
    public void inVolkerCommand() {
        CommandReceiver receiver = new ConcreteCommandReceiver();
        Command command = new ConcreteCommand(receiver);
        command.excute();
    }
}

/**
 * 命令接口封装约束命令对象行为
 */
public interface Command {

    void excute();
}

public class ConcreteCommand implements Command {

    CommandReceiver excuter;

    ConcreteCommand(CommandReceiver excuter){
        this.excuter = excuter;
    }

    @Override
    public void excute() {
        // Command 虚实现；由Command对象传递命令，进一步具体实现
        excuter.reallyExcute();
    }
}

/**
 * 命令的真正执行者
 */
public interface CommandReceiver {

    void reallyExcute();
}


public class ConcreteCommandReceiver implements CommandReceiver {
    @Override
    public void reallyExcute() {
        System.out.printf("really excute");
    }
}


{% endhighlight %}

可以看出，通过Command中间对象完成了 请求发起者 与 请求 执行者的解耦，Invoker 无需得知具体命令的具体实现，同时由于是针对接口编程，无论需要何种命令都可以通过实现接口扩展具体的命令实现；


### 命令模式之回滚

命令的回滚撤销顾名思义就是回到操作执行之前的状态，一般可以通过**执行反操作命令**或者**存储操作执行前状态实现状态回滚**；



### 命令模式之批量