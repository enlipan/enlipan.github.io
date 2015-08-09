---
layout: post
title: 序列化Serializable、Parcelable小结
category: android
---
**前言：对于细节的掌控程度代表着专业与否。**

####Serializable：

对象序列化机制，用于将对象写入流中，并能在之后从流中读回。

序列号：适用于对象网络保存，在流中，对于多个对象互相引用的对象网络，对象之间当然无法保存对象的地址，所以采用每个对象在流中所独有的序列号引用机制。

注意：声明为static和transient类型的成员数据不能被序列化。因为static代表类的状态， transient代表对象的临时数据。transient机制的产生是由于有些数据在重新加载对象或将其传送到其他机器上是无用的，瞬时的域在对象序列化时是跳过的。

同时可以利用序列化UID更新序列化类版本号，当提供了静态UID指纹码之后，序列化时将不再自行计算UID，可以更好的做到远程多级传输后的反序列化。

另一种方式是为序列化类添加具有以下方法签名的自定义定义方法（实现Externalizable）：


{%  highlight java %}

private void readObject(ObjectInputStream in) throws IOException,ClassNotFoundException;

private void writeObject(ObjectOutputStream out)throws IOException,ClassNotFoundException;

{%    endhighlight  %}

数据域在序列化时将不再自动序列化，转而会通过调用自定义方法实现对象到数据流，以及流到对象的序列化过程，进而实现自定义序列化过程。

####Parcelable：

可用于进程间通信（IPC）以及Activity之间对象信息传输交互。

Parcelable在使用时借助于Parcel对象，Parcel对象类似于容器对象。包括Intent以及Bundle在内的多个类都实现了该接口去传递数据。

Parcle除了可以放入基本数据类型外，还能放入实现了Parclable接口的对象，并在传输完成之后恢复状态。

需要注意的是：实现Parcelable接口需要实现Parcelable.Creator<Person> CREATOR 用于恢复对象状态，以及writeToParcel(Parcel dest, int flags)方法用于传输对象。

同时在写入以及恢复对象属性时，均需要按照统一的顺序一一封装属性数据负责将不能正确的获取或者恢复对象。也就是怎么设定顺序封装进入，就设定什么顺序读取出来。

####Parcle：

首先引用Google文档：

> Container for a message (data and object references) that can be sent through an IBinder. A Parcel can contain both flattened data that will be unflattened on the other side of the IPC (using the various methods here for writing specific types, or the general Parcelable interface), and references to live IBinder objects that will result in the other side receiving a proxy IBinder connected with the original IBinder in the Parcel.

>Parcel is not a general-purpose serialization mechanism. This class (and the corresponding Parcelable API for placing arbitrary objects into a Parcel) is designed as a high-performance IPC transport. As such, it is not appropriate to place any Parcel data in to persistent storage: changes in the underlying implementation of any of the data in the Parcel can render older data unreadable.

Android借助于IBinder传递包含了数据或者对象引用的数据信息，也就是Parcle对象。Parcle对象包含了压缩的数据信息，同时在IPC的另一端（也就是接收端线程）进行解压缩恢复数据。也可以引用到未被回收的IBinder对象，最终使IPC另一端接收到链接着Parcle对象中的原始iBinder的代理IBinder对象。

Parcle对象主要适用于高性能的IPC数据传输，而不使用于数据持久化情形。

####IBinder与Parcle：

IBinder核心Api是transact()；而与此同时在IBinder中Google文档中指出：

> The data sent through transact() is a **`Parcel`**, a generic buffer of data that also maintains some meta-data about its contents. The meta data is used to manage IBinder object references in the buffer, so that those references can be maintained as the buffer moves across processes. This mechanism ensures that when an IBinder is written into a Parcel and sent to another process, if that other process sends a reference to that same IBinder back to the original process, then the original process will receive the same IBinder object back. These semantics allow IBinder/Binder objects to be used as a unique identity (to serve as a token or for other purposes) that can be managed across processes.
