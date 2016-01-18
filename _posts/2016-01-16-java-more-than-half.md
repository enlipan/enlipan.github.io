---
layout: post
title: 几种常见查找算法
category: algorithm
---

日常工作应用开发，算法的应用其实并不多，一些涉及到算法的工作，主要有几个方面需要注意：一是三思而后行，理清楚使用场景，二是选择好的数据结构，选择了合适的数据结构，算法查不到哪里去；

针对查找应该是工作中最常用的算法，这里稍作总结：

###题目：找出数组中出现次数超过数组长度一半的数字


这个问题一般我们最先想到是使用Hash结构，以数组中出现的 数为Key，次数为Value，遍历一次构建HashMap，再找出Value最大的数对应的Key即可，当然这样的算法清晰易懂，放到实际应用中也并没有什么问题；

但是上述算法并非属于极优算法，虽然通用，却没有对数据源做细致分析：

如果一个数字超过长度一半那么这个数字的次数将比其他全部加起来还要多，根据这个特征；利用两个变量 一个存储当前数字 mCurrentNum; 一个存储当前数字被抵消后的遗留次数 mHasLeftTimes;

{% highlight java%}

    int []  mMoreNums = {3,5,5,9,5,5,15,5,20,3};

    @Test
    public void moreThanHalfNumTest(){
        int num = SearchDemo.searchMoreThanHalfLengthNum(mMoreNums);
        System.out.println("num:" + num);
    }

/**
     *查找出现次数超过数组长度一半的数字
     * @param srcNums 目标数组
     * @return 目标数
     */
    public static int searchMoreThanHalfLengthNum(int [] srcNums){        
        //相同数 次数加 1  否则减一 || 同时次数为0时替换数字；
        int currentNum = srcNums[0];
        int currentNumLeftTimes = 1;
        int index = 1;
        int length = srcNums.length;
        while (index < length){
            if (currentNum != srcNums[index]){
                currentNumLeftTimes --;
                if (currentNumLeftTimes == 0){
                    currentNum = srcNums[index];
                    currentNumLeftTimes = 1;
                }
            }else {
                currentNumLeftTimes ++;
            }
            index ++ ;
        }
        return currentNum;
    }

{% endhighlight %}

###题目： 杨氏矩阵中的特定数值查找

杨氏矩阵：即行和列分别递增的矩阵，每行首元素最小，每列首元素最小是其特征；

{% highlight java%}
    int [] [] mMatrixNums = { {1,2,8,9} , {2,4,9,12} , {4,7,10,13} , {6,8,11,15} };

    @Test
    public void findMatrixNum(){
        SearchDemo.searchNumInMatrix(mMatrixNums,8);
    }
   /**
     *
     * @param nums 目标矩阵
     * @param dst  目标数
     */
     public static void searchNumInMatrix(int [][] nums,int dst){
         int rows = nums.length;//row nums   可以看出其本质是 每个元素都是一维数组的 一维数组
         int columns = nums[0].length;// column

         int r= 0,c = columns -1;
         while (r < rows && c < columns && c >= 0){
            if (dst > nums[r][c]){
                r++;
                continue;
            }else if (dst < nums[r][c]){
                c--;
                continue;
            }else {
                System.out.println("Rows:" + (r + 1));
                System.out.println("Columns:" + (c + 1));
                c --;
//                return;
            }
         }

{% endhighlight %}

若数组中数字单一，查找成功直接 return；但考虑到数组中数字有多个位置的情况，分析可以看出，若找到第一个之后，存在另一个的情况只可能在小于其的 列 大于其的行中；所以作出兼容；


###题目： 经典二分查找

{% highlight java%}

    int []  mSortedNums = {3,5,8,9,10,14,15,18,20,22};
    @Test
    public void halfSrearchTest(){
        int index = SearchDemo.halfSearch(mSortedNums,9,0,10);
        System.out.println("index: " + index);
    }

    /**
     *
     * @param srcNums 目标数组
     * @param dst  目标
     * @param start 起始位置
     * @param end 结束位置
     * @return index
     */
    public static int halfSearch(int [] srcNums,int dst,int start,int end){
        int length = srcNums.length;
        if (length < start ||length < end|| start > end) return -1;
        while (start <= end){
            int middle = start + ((end - start) >> 1);
            if (srcNums[middle] > dst){
                end = middle - 1;
            }else if (srcNums[middle] == dst){
                return middle ;
            }else {
                start = middle + 1;
            }
        }
        return  -1;
    }

{% endhighlight %}

需要注意的是：移位符优先级低于 + 

### 其他查找：

####二分查找树

关于BST,是有序数据的存储结构，一个节点的左子节点比其小或等，右子节点比其大或等；

二叉树的查找是典型的递归思想：

{% highlight java%}

 /**
     * 二叉树 节点数据结构
     */
    static class BSTNode{
        public int value;
        public BSTNode leftNode;
        public BSTNode rightNode;
    }

    /**
     *
     * @param root 传入的 节点 作为当前根节点
     * @param dst 目标数
     * @return 节点
     */
    BSTNode findNode(BSTNode root,int dst){
        if (root == null) return null;
        int currentValue = root.value;
        if (currentValue < dst){
            return findNode(root.rightNode,dst);
        }else if (currentValue > dst){
            return findNode(root.leftNode,dst);
        }else {
            return root;
        }
    }

{% endhighlight %}

一个很奇怪的事情，好像写习惯了Android 开始有点不习惯写Getter和Setter了；Getter与Setter的性能耗费在Android开发上确实不值当；


####哈希查找

Hash算法是典型的空间换时间的算法，好像也没什么好讲的，建立Hash类型数据结构后，直接get(),其get()函数 时间复杂度`常数阶 O(1)`;

