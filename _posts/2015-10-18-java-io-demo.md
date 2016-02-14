---
layout: post
title: Java IO Demo
category: java
---

最近IO接触挺多，但是感觉以前学习的很多东西开始模糊，所以特意重新回顾了一点IO方面的基础知识，写了点基础Demo；


### 文件的创建Demo


需要保证指定的File路径是存在的，若parent文件下不能确定是否存在需要验证，若不存在需要创建，文件夹的创建有mkdir以及mkdirs，后者可以指定深层次目录一次性创建多重目录：

{% highlight Java %}

/**
 * Created by Lee on 2015/10/18.
 */
public class FileDemoOne {

    public static void main(String [] args) {
        File fileName = new File("d:\\aa\\aa.txt");
        if (!fileName.exists()){
            try {
                fileName.createNewFile();
                System.out.println("File create success by one");
            } catch (IOException e) {
                //创建失败，创建文件夹，不规范，但是利用了Catch语句
               File file = new File("d:\\aa");
                if (!file.isDirectory()){
                    file.mkdir();
                }
                try {//再次创建文件
                    fileName.createNewFile();
                    System.out.println("File create success by two");
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            }
        }
        File fileDir = new File("d:\\aa");
        if (fileDir.isDirectory()){
            for(File f:fileDir.listFiles()){//获取文件夹下所有文件列表
                System.out.println("fileDir :"+f.getName());
            }
        }
        System.out.println("getAbsolutePath :"+fileName.getAbsolutePath());
        System.out.println("length :"+fileName.length());
        System.out.println("canRead :"+fileName.canRead());
        System.out.println("canWrite :"+fileName.canWrite());
    }
}

{%  endhighlight %}


### 二进制文件的另存为

准确的说字节流可以处理所有文本，单一般字符流尤其是缓存字符流可以更加高效的处理字符流，所以所有不能确定是字符文本的文件都必须用字节流处理，此处实现图片的输入以及重新输出：

{% highlight Java %}

public class CopyByteFileDemo {
    public static void main(String [] args)  {
        File oldFile = new File("d:\\Git-branching-model.jpeg");
        //首先要保证该输出路径正确性，文件夹存在
        File fileDir = new File("d:\\bb");
        if (!fileDir.isDirectory()){
            fileDir.mkdir();
        }
        File newFile = new File("d:\\bb\\Git-branching-model.jpeg");
        FileInputStream fis = null;
        FileOutputStream fos = null;
        try {
            fis = new FileInputStream(oldFile);
            fos = new FileOutputStream(newFile);
            byte [] buffer = new byte[1024];  //1024代表整K，对于减少内存碎片有好处
            int readLength = 0;//记录实际读取字节数
            while((readLength = fis.read(buffer)) != -1){//读入到内存中
                //从内存（缓存）输出
                fos.write(buffer,0,readLength);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            try {
                if (fis != null) {
                    fis.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

{%  endhighlight %}


###带编码格式的字符流的正确编解码

对于一个数据源文件要正确映射到内存中去，一定要正确对应完成该数据源文件的解码工作，也就是该数据源文件以何种方式编码，就必须指定对应的字符集解码才能正确将文件内容读取成功。

至于如何将解码到内存中的数据再重新编码，以何种方式编码，都可以按照需求来操作，正确格式的内存中数据，就如同最常态的String对象一样，一切按需处理。

{% highlight Java %}

/**
 * Created by Lee on 2015/10/18.
 */
public class CopyTxtFileDemo {

    public static void main(String [] args)  {
        FileReader fr = null;
        FileWriter fw = null;
        InputStreamReader isr = null;
        OutputStreamWriter osw = null;

        File dir = new File("d:\\aa\\aa");
        if (!dir.isDirectory()){
            dir.mkdirs();
        }
        try {
            File oldFile = new File("d:\\aa\\aa\\aa.txt");
            if (!oldFile.exists()){
                oldFile.createNewFile();
            }
//            fr = new FileReader(oldFile);
            /**
             * 如果文件保存时的编码设定为UTF-8，那么在中文操作系统中使用FileReader就会产生乱码。因为中文操作系统平台的默认字符集为GBK.
             * 解决该问题的方法是放弃使用FileReader，选用InputStreamReader，
             * 在获取InputStreamReader对象时，显示指定合适的字符集编码。
             */
            //编解码一致性，此处编码是系统编辑，系统记事本编码是GBK保存，所以解码必须为GBK
            isr = new InputStreamReader(new FileInputStream(oldFile),"GBK");//保证文件已正确字符集格式读入到内存中,正确完成解码过程

            //上面完成解码之后读取到内存中的数据已经是正确无乱码字符。
            // 事实上，此处重新编码可以按照自己的需求选择，
            // 只是要注意的是，当被另外的流读取该文件时，需要根据此处编码指定的字符集进行解码
            //在finally 中读取此编码文本时，得到验证
            //单此处指定UTF-8，FileWriter可以正确读取，而指定GBK，则无法正确读取
            osw  = new OutputStreamWriter(new FileOutputStream("d:\\aa\\aa\\ab.txt"),"UTF-8");

            fw = new FileWriter("d:\\aa\\aa\\ab.txt");
            char[] buffer = new char[1024];
            int readLength = 0;

            while ((readLength = isr.read(buffer)) != -1){
                osw.write(buffer,0,readLength);
                System.out.println(fw.getEncoding());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            try {
                if (fw != null) {
                    fw.close();
                }
                if (isr != null) {
                    isr.close();
                }
                if (osw != null) {
                    osw.close();
                }
                //只有当OSW关闭之后，才能正确读取到文件中内容
                fr = new FileReader(new File("d:\\aa\\aa\\ab.txt"));//输入字符集为UTF-8,而默认文件来源为GBK
                char []  frbuffer = new char [1024];
                int readLength = 0;
                while ((readLength =fr.read(frbuffer)) != -1){
                    System.out.println(new String(frbuffer,0,readLength));
                }
                if (fr != null) {
                    fr.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}


{%  endhighlight %}

InputStreamReader 的优势在于能够 指定合适的字符集编码，如果不指定编码将使用平台默认编码，GBK中文等；InputStreamReader 将字节流转换为字符流，属于桥梁类，同时其也是Java中装饰器模式的典型使用；

