---
layout: post
title: 最大子数组和
category: algorithm
keywords: [android, java]
---

求最大数组中的最大子数组和是一个经典面试题，最近在看《构建之法》，此题同样出现在课后习题之中，此处特别用以解决该练习题，练习编程，该解决主要的解决方案有多种，如利用分治法，亦或利用动态规划，还有较常见的利用分析输入规律得到解法：


以下是分析输入规律法，分析输入规律在开发上属于吃透需求，需求分析严密，也是非常有用的一种解决思路：

从数组首元素开始，是否加上次元素有两种情况，

*  一种是加上了该元素比该元素更小，则证明前面的元素为负数，可以抛弃；

*  否则则前面元素为正，可以继续向后加，同时完成更新数组，更新数组和，最大和比较；

具体实现如下


{% highlight java %}

/**
 * 查找最大和子数组
 * @param arrayNums
 */
public static void  searchMaxSumChildrenArray(int [] arrayNums){
    int currentSum = 0;
    int maxSum = 0;
    ArrayList<Integer>  resultArray = new ArrayList<>();
    HashMap<Integer,ArrayList> resultMap = new HashMap<>();

    maxSum = arrayNums[0];
    currentSum = maxSum;
    resultArray.add(arrayNums[0]);
    resultMap.put(maxSum,new ArrayList(resultArray));

    for (int i = 1; i < arrayNums.length; i++) {
        final int currentNum =  arrayNums[i];
        if ((currentSum + currentNum) >= currentNum){
            currentSum += currentNum;
            resultArray.add(currentNum);
            if (maxSum <= currentSum){
                maxSum = currentSum;
                resultMap.put(maxSum,new ArrayList(resultArray));
            }
        }else {
            currentSum = currentNum;
            resultArray.clear();
            resultArray.add(currentNum);
        }
    }
    System.out.printf("maxSum = " + maxSum);
    for (int num : resultArray) {
        System.out.printf(" num = " + num);
    }
}

{% endhighlight %}  
