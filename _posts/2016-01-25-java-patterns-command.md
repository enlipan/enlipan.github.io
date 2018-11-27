---
layout: post
title: Java 模式- 命令模式
category: java
---

命令模式通过封装命令对象，完成将 命令请求者 与 命令执行者的解耦（依旧是解耦），从而实现 执行端无差别调用命令执行，通过不同客户端产生不同的命令对象统一传递给执行者执行，实现执行者执行逻辑的复用；

请求的发起者只关心请求的发起，而不关心具体的请求执行者以及请求逻辑实现；


{:.center}
![command](http://javaclee.com/assets%2Fimg%2F20160214%2FCommand.JPG)


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



### 命令模式之宏命令

宏命令即命令组合，也就是将多个命令封装，像执行独立命令一样统一执行命令组合；



##### 队列请求

将命令对象组合排队，组成工作队列，依次执行，然后从队列中依次取出封装的命令对象执行，一般用于多线程进行命令对象的任务处理，在此任务的执行者与任务队列之间完全解耦，也就是说 执行者不关心队列中的命令究竟是什么命令，只要是约定规范的可执行命令，它就会去取出一一执行；

Android 中 Loader 的构造思想可以借鉴于此；

{% highlight java %}

public class CommandsQueue implements Command{

    private CommandsQueue(){}

    public static CommandsQueue sCommandsQueue = new CommandsQueue();

    private ArrayList<Command> commands = new ArrayList<>();

    public void addCommand(Command c){
        commands.add(c);
    }

    public void removeCommand(Command c){
        commands.remove(c);
    }

    public void clearCommand(){
        commands.clear();
    }


    @Override
    public void excute() {
        for (Command c:commands){
            c.excute();
        }
    }
}


    @Test
    public void invokerCommandsQueue() {
        Command command = new ConcreteCommand(new ConcreteCommandReceiver());
        CommandsQueue.sCommandsQueue.addCommand(command);
        CommandsQueue.sCommandsQueue.excute();
        CommandsQueue.sCommandsQueue.clearCommand();
    }


{% endhighlight %}


进一步，如果需要扩展实现更加复杂的异步消息队列，那么可以在 CommandsQueue 中实现 生产消费者模型，实现多线程命令执行；

{% highlight java %}

    public volatile boolean mWorkAlive = true;
    private LinkedBlockingQueue<Command> mCommandsQueue = new LinkedBlockingQueue<>();
    private Thread worker = new Thread(){
        @Override
        public void run() {
            while (mWorkAlive){
                Command c;
                try {
                    c = mCommandsQueue.take();
                    c.excute();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }            
        }
    };

{% endhighlight %}

Loader 中更新UI 一般通过 传递 UI线程 Handler 利用Post消息机制去更新UI；

---

Quote：

《研磨设计模式》

《HeadFirst 设计模式》

[设计模式系列-命令模式](http://www.cnblogs.com/langtianya/archive/2013/02/28/2937778.html)