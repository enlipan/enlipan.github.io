---
layout: post
title: 指定规则字符串排序
category: algorithm
---
#指定规则字符串排序
问题详细描述：将输入的两个字符串合并。      
对合并后的字符串进行排序，要求为：下标为奇数的字符和下标为偶数的字符分别从小到大排序。这里的下标意思是字符在字符串中的位置。      
对排训后的字符串进行操作，如果字符为‘0’——‘9’或者‘A’——‘F’或者‘a’——‘f’，则对他们所代表的16进制的数进行BIT倒序的操作，并转换为相应的大写字符。如字符为‘4’，为0100b，则翻转后为0010b，也就是2。转换后的字符为‘2’；如字符为‘7’，为0111b，则翻转后为1110b，也就是e。转换后的字符为大写‘E’。      

举例：输入str1为"dec"，str2为"fab"，合并为“decfab”，分别对“dca”和“efb”进行排序，排序后为“abcedf”，转换后为“5D37BF”    
            *  接口设计及说明：     
            *  功能:字符串处理
            *  输入:两个字符串,需要异常处理
            *  输出:合并处理后的字符串，具体要求参考文档
            *  返回:无        
          

｛% highlight   java  %｝

public class ProcessString {    
    public static void main(String[] args) {        
        // TODO, add your application code
        String  strout="";
        processString("cad","bef",strout);
        //System.out.println(reverseBinary("1011")); 
    }
    static void  processString(String str1,String str2,String strOutput)    {
        String  strs=str1+str2;
        char [] chs=strs.toCharArray();    
        int  len1=(chs.length%2==0)?(chs.length/2):(chs.length/2+1);
        int len2=chs.length-len1;
        char  [] ch1=new char[len1];
        char[] ch2=new char[len2];        
        for(int i=0,n=0,m=0;i<chs.length;i++){                
            if(i%2==0){
                    ch1[m++]=chs[i];
            }else{
                ch2[n++]=chs[i];
            }                
        }            
        //分别对ch1，ch2中的字符排序
        quikSort(ch1,0,len1-1);
        quikSort(ch2,0,len2-1);
        //合并两个字符数组
        for (int i = 0,m=0,n=0; i<chs.length; i++){
                if(i%2==0){
                    chs[i]=ch1[m];
                    m++;
                    }else if(n<len2&&i%2!=0){
                        chs[i]=ch2[n];
                        n++;
                        }else if(m<len1){
                                chs[i]=ch1[m];
                                m++;
                            }
            }
        Map<String,String >  numorchar=new HashMap<String,String>();
        numorchar.put("A","1010");numorchar.put("B","1011");
        numorchar.put("C","1100");numorchar.put("D","1101");
        numorchar.put("E","1110");numorchar.put("F","1111");
        numorchar.put("1010","A");numorchar.put("1011","B");
        numorchar.put("1100","C");numorchar.put("1101","D");
        numorchar.put("1110","E");numorchar.put("1111","F");

        //进制变换        
        for (int i = 0; i<chs.length; i++){
            if((chs[i]>='0'&&chs[i]<='9')||    (chs[i]>='A'&&chs[i]<='F')||(chs[i]>='a'&&chs[i]<='f')){
                    if(chs[i]>='0'&&chs[i]<='9'){
                        String s= Integer.toBinaryString(Integer.parseInt(String.valueOf(chs[i])));
                        String s_rev=reverseBinary(s);
                        int num=Integer.parseInt(s_rev,2);
                        if(num>9){
                            chs[i]=numorchar.get(s_rev).charAt(0);
                        }else{
                        chs[i]=(num+"").charAt(0);
                        }                        
                    }else  if(chs[i]>='a'&&chs[i]<='f'){
                    String s=chs[i]+"";
                    String s_rev=reverseBinary(numorchar.get(s.toUpperCase()));
                        int num=Integer.parseInt(s_rev,2);
                        if(num>9){
                            chs[i]=numorchar.get(s_rev).charAt(0);
                        }else{
                        chs[i]=(num+"").charAt(0);
                        }    
                    
                    }else{
                    String s_rev=reverseBinary(numorchar.get(chs[i]+""));
                        int num=Integer.parseInt(s_rev,2);
                        if(num>9){
                            chs[i]=numorchar.get(s_rev).charAt(0);
                        }else{
                        chs[i]=(num+"").charAt(0);
                        }    
                    }
                
                }
                
        }        
        strOutput=new String(chs);
        System.out.println(strOutput);        
    }
    static String reverseBinary(String  s){    
        String str="";
        for (int i = 0; i < s.length(); i++) {
            str=""+str+s.charAt(s.length()-i-1);
        }
        return str;
    }  　　　　　　    
    static void quikSort(char k[],int low,int high){
            int point;
            if(low<high){
                point=patitionNumber(k,low,high);
            quikSort(k,low,point-1);
            quikSort(k,point+1,high);
            }
            }
        static    int  patitionNumber(char k[],int low,int high){
            char key=k[low];
            while(low<high){
                while((low<high)&&k[high]>=key)
                    --high;
    
            char temp=k[high];                
            k[high]=k[low];
            k[low]=temp;
        while((low<high)&&k[low]<=key)
                ++low;
        
            temp=k[low];
            k[low]=k[high];
            k[high]=temp;
            }
            return low;
            }
    
    //打印输出字符数组            
     static void printChar(char [] ch){
    int len=ch.length;
    for(int i=0;i<len;i++){
        System.out.print(ch[i]);
        }
        System.out.println();
    }
}
{%  endhighlight  %｝     
    
暂时先就这么实现吧，应该有更好的办法，进制变换没有琢磨到好的办法
