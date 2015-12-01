---
layout: post
title: Java UDP
category: java
---

端口号：用于区分同一主机中的不同应用程序

TCP协议与UDP协议被称为端对端协议，IP协议则是主机协议，将数据从一个主机传送到另一个;


DatagramSocket：用于在程序之间建立传送数据的通信连接，创建连接时若指定端口已经被占用，则会产生异常，同时导致程序Crash；

DatagramPacket：用于包装需要传输的数据，表示一个存放数据的数据报；一个 DatagramPacket 实例中所运行传输的最大数据量为 65507 个字节，即 UDP 数据报文所能负载的最多数据；


注意UDP 数据丢失造成的阻塞问题的处理：

UDP协议的不可靠导致数据在传输过程中是可能造成丢失的，而DatagramSocket.receive()函数又是阻塞的，这样客户端将永远无法接受到传送过来的数据，同时没有任何提示，一直阻塞在此处。利用DatagramSocket 类的 setSoTimeout()方法来制定 receive()方法的最长阻塞时间同时指定数据丢失后的重发数据报次数，如果每次阻塞都超时，同时重发次数到了限定上限，则关闭客户端。



Demo（未启用多线程模式）：

客户端：

{% highlight java %}

public class UdpSend {

    public static void main(String[] args) throws IOException {
        InetAddress address = InetAddress.getLocalHost();
        int port = 8080;
        byte [] buffer = "Client: xxxxx    PassWord: ooooooo".getBytes();
        //此处 socket不能再次绑定该端口，一个端口只能被一个Socket绑定，一般是服务器端监听端口
        //数据的发送 一般由DatagramPacket 数据报指定地址与端口
        DatagramSocket socket = new DatagramSocket();
        DatagramPacket  packet = new DatagramPacket(buffer,buffer.length,address,port);

        socket.send(packet);


        byte[] dataIn = new byte[1024];
        DatagramPacket packetIn =  new DatagramPacket(dataIn,dataIn.length);
        socket.receive(packetIn);
        String reply = new String(dataIn,0,packetIn.getLength());
        System.out.println("%%%%%%%%%%%%%%" + reply);
        socket.close();
    }

}




{% endhighlight %}     、


服务器端：

{% highlight java %}

public class UdpServer {

    public static void main(String[] args) throws IOException {
        //监听端口
        //另一个构造函数： DatagramSocket(port,address)
        DatagramSocket socket = new DatagramSocket(8080);

        byte[] dataIn = new byte[1024];
        DatagramPacket packet = new DatagramPacket(dataIn,dataIn.length);
        System.out.println("******服务器正常启动，等待客户端发送数据******");
        socket.receive(packet);
        String info = new String(dataIn,0,packet.getLength());

        System.out.println("###############  "+ info);


        byte[] dataOut = "$$$$$$$$$$$$ 服务器返回".getBytes();
        InetAddress address = packet.getAddress();
        int port = packet.getPort();
        DatagramPacket packetOut = new DatagramPacket(dataOut,dataOut.length,address,port);
        socket.send(packetOut);


        socket.close();

    }
}

{% endhighlight %}     


当单线程转换到多线程时，则一般利用传递与绑定Socket到Thread，即每个线程接受一个Socket 监听端口下的所有消息。

---

Quote：

[极客学院-Socket文档-udp](http://wiki.jikexueyuan.com/project/java-socket/udp.html)