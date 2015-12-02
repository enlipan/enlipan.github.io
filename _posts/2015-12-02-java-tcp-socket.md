---
layout: post
title: Java Tcp
category: java
---

Udp协议为数据报套接字；Tcp协议用于Socket流套接字；

Tcp网络编程核心类为：

Socket与SocketServer；

一般一个服务器端 SocketServer可以对应多个 Socket客户端连接。
服务器端监听相应的IP地址与端口，每接受到对应一个连接就会同样在服务器产生一个对应的Socket实例对象，处理与对应客户端的通信。

Socket对象自动关联着对应的输入与输出流。

在关闭时，只需要将Socket对象关闭，对应的流也就自动关闭；

Demo：

服务器

{% highlight java %}
/**
 * Created by Lee on 2015/12/2.
 */
public class TcpSend {

    public static void main(String[] args) {

        try {
            Socket client = new Socket("127.0.0.1", 20000);
            //set timeout  --block time
            // InputStream associated with this Socket will block for only this amount of time.
            client.setSoTimeout(10000);
            //package system.in
            BufferedReader inr = new BufferedReader(new InputStreamReader(System.in));

            //package out  use to send msg to server
            PrintStream outs = new PrintStream(client.getOutputStream());

            //package in  --msg from server back
            BufferedReader reader = new BufferedReader(new InputStreamReader(client.getInputStream()));

            boolean flag = true;
            while (flag) {
                System.out.println("Enter Msg:");
                String msg = inr.readLine();
                outs.println(msg);
                //print() error---------Bug 1

                if (msg.equals("bye")) {
                    flag = false;
                } else {
                    //may be timeout  Exception
                    String echo = reader.readLine();
                    System.out.println(echo);
                }
            }
            inr.close();
            client.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}


{% endhighlight %}     

Thread：

{% highlight java %}

public class TcpServerThread extends Thread {
    private Socket socket;

    TcpServerThread(Socket socket) {
        this.socket = socket;
    }


    @Override
    public void run() {

        try {
            PrintStream out = new PrintStream(socket.getOutputStream());

            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            boolean flag = true;

            while (flag) {

                String msg = reader.readLine();
                if (msg == null || msg.equals("")) {
                    flag = false;
                } else {
                    if (msg.equals("bye")) {
                        flag = false;
                    } else {

                        out.println("echo: " + msg);
                    }
                }
            }
            out.close();
            socket.close();


        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}

{% endhighlight %}    


{% highlight java %}

public class TcpServerDemo {

    public static void main(String[] args) {

        try {
            //default bind to local ipAddress
            //Multi Ip Local can be use constructer ServerSocket(port,back,address); point which ip should to monitor
            ServerSocket server = new ServerSocket(20000);
            Socket client = null;
            boolean flage = true;
            while (flage){
                client = server.accept();

                System.out.println("  Accept  Success");

                new TcpServerThread(client).start();

            }
            server.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}

{% endhighlight %}    


值得指出的是：

在客户端获得服务器返回数据时，同样可以引起超时异常，一般需要捕获；
即：
 String echo = reader.readLine();

而在其中因为自己的粗心引起了一个异常：

java.net.SocketException: Connection reset 

经过查验：此异常产生于当一端Socket读取数据时，另一端Socket已经关闭的这种情形。

在Bug--1 处：

由于自己粗心：误将 `out.println()`  输入作 `out.print();`

引起的后果是：

由于客户端循环行输出：

print();

将 "\n"回车符号也输出了，造成服务器端读取到 空串，退出循环，关闭Socket；

此时客户端再读取数据时，由于服务器Socket连接已经关闭，就造成此异常 SocketException: Connection reset 的产生；