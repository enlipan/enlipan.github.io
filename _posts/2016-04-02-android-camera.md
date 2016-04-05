---
layout: post
title: Android  Camera
category: android
---

### 硬件检测：

{% highlight java %}

/**
*Camera Check：
*FEATURE_CAMERA_FRONT (检查前置摄像头)
*FEATURE_CAMERA (检查后置摄像头)
*FEATURE_CAMERA_ANY (检查任意摄像头)
*/
context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)

{% endhighlight %}  


### 相机使用实例：

`Intent：MediaStore.ACTION_IMAGE_CAPTURE or MediaStore.ACTION_VIDEO_CAPTURE`

#### 使用内置相机：

{% highlight java %}

@Override
   protected void onActivityResult(int requestCode, int resultCode, Intent data) {
       if (resultCode == RESULT_OK){
           if (requestCode == REQUEST_EXISTING_CAMERA_APP){
               //data 在一些情况下返回 Null
               //data.getExtras().get("data");
               addPhotoToGallery(mFileUri.getPath());
               Toast.makeText(this,"Image saved to:\n" + mFileUri.getPath(), Toast.LENGTH_LONG).show();
               Intent showImageIntent = new Intent(this,ShowImageActivity.class);
               showImageIntent.setData(mFileUri);
               startActivity(showImageIntent);
           }
       }
       super.onActivityResult(requestCode, resultCode, data);
   }

   /**
    * 相机占用资源较多，可能导致 Task栈中Activity销毁，需要保存属性；
    * @param outState
    */
   @Override
   protected void onSaveInstanceState(Bundle outState) {
       if (mFileUri != null){
           outState.putString("nested_file_uri",mFileUri.toString());
       }
       super.onSaveInstanceState(outState);
   }

   @Override
   protected void onRestoreInstanceState(Bundle savedInstanceState) {
       if (savedInstanceState.containsKey("nested_file_uri")){
           mFileUri = Uri.parse(savedInstanceState.getString("nested_file_uri"));
       }
       super.onRestoreInstanceState(savedInstanceState);
   }

   private void handleExistingCameraApp() {
       if (getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)) {
           Intent takePicIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
           if (isIntentSafeUse(takePicIntent)){
               try {
                   mFileUri = getOutputMediaUri();
               } catch (IOException e) {
                   Log.e(TAG,"getOutputMediaUri >>>>>> ",e);
               }
               takePicIntent.putExtra(MediaStore.EXTRA_OUTPUT,mFileUri);
               startActivityForResult(takePicIntent, REQUEST_EXISTING_CAMERA_APP);
           }
       } else {
           Toast.makeText(this, "Camera Not Exist", Toast.LENGTH_LONG).show();
       }
   }

   /**
    * 安全检查
    * @param i
    * @return
    */
   private boolean isIntentSafeUse(Intent i) {
       PackageManager pm = getPackageManager();
       List<ResolveInfo> activities = pm.queryIntentActivities(i, 0);
       return activities.size() > 0;
   }

   public Uri getOutputMediaUri() throws IOException {
       String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
       String imageFileName = "JPEG_" + timeStamp + "_";
       File storageDir = Environment.getExternalStoragePublicDirectory(
               Environment.DIRECTORY_PICTURES);
       File image = File.createTempFile(
               imageFileName,  /* prefix */
               ".jpg",         /* suffix */
               storageDir      /* directory */
       );
       return Uri.fromFile(image);
   }

   //函数在某些情况下不可用，具体见 Quote：Scan Media Files in Android
   private void addPhotoToGallery(String imagePath) {
       Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
       File f = new File(imagePath);
       Uri contentUri = Uri.fromFile(f);
       mediaScanIntent.setData(contentUri);
       sendBroadcast(mediaScanIntent);
   }

{% endhighlight %}  

#### 使用自定义相机：

**引用GoogleDoc使用流程：**

> Detect and Access Camera - Create code to check for the existence of cameras and request access.
>
> Create a Preview Class - Create a camera preview class that extends SurfaceView and implements the SurfaceHolder interface. This class previews the live images from the camera.
>
> Build a Preview Layout - Once you have the camera preview class, create a view layout that incorporates the preview and the user interface controls you want.
>
> Setup Listeners for Capture - Connect listeners for your interface controls to start image or video capture in response to user actions, such as pressing a button.
>
> Capture and Save Files - Setup the code for capturing pictures or videos and saving the output.
>
> Release the Camera - After using the camera, your application must properly release it for use by other applications.


注意Camera.Open()对于资源的占用，异步开启是比较合适的方式，否则可能造成明显的卡顿：

> On some devices, this method may take a long time to complete. It is best to call this method from a worker thread (possibly using AsyncTask) to avoid blocking the main application UI thread.

{% highlight java %}

private void handleCapture() {
        mCamera.takePicture(null, null, new Camera.PictureCallback() {
            @Override
            public void onPictureTaken(byte[] data, Camera camera) {
                File imageFile = null;
                try {
                    imageFile = FileUtil.getOutputMediaFile();
                } catch (IOException e) {
                    e.printStackTrace();
                    return;
                }
                if (imageFile != null) {
                    FileOutputStream fos = null;
                    try {
                        fos = new FileOutputStream(imageFile);
                        fos.write(data);
                        fos.flush();
                    }catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        if (fos != null) {
                            try {
                                fos.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            }
        });
    }

    private class CameraInitTask extends AsyncTask<Void,Void,Camera>{

        @Override
        protected void onPostExecute(Camera camera) {
            if (camera != null){
                initCameraUI(camera);
            }else {
                CameraActivity.this.finish();
            }
        }

        @Override
        protected Camera doInBackground(Void... params) {
            return getCameraInstance();
        }
    }

    private Camera getCameraInstance(){
        Camera c = null;
        try{
            c = Camera.open();
        }catch (Exception e){
            // Camera is not available (in use or does not exist)
        }
        return c;
    }

    private void initCameraUI(Camera camera) {
        mCamera = camera;
        Camera.Parameters parameters = mCamera.getParameters();
        if (parameters.getSupportedFocusModes().contains(Camera.Parameters.FOCUS_MODE_AUTO)){
            parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
            mCamera.setParameters(parameters);
        }
       /* parameters.isZoomSupported();
        parameters.getMaxZoom();*/

        mCameraPreView = new CameraPreView(mCamera,this);
        mFrameLayout.addView(mCameraPreView);

        mCaptureBtn.setOnClickListener(this);
    }

{% endhighlight %}  

一些需要注意的Case：

*  Home  键返回， 锁屏返回 以及相机资源的释放          

*　Camera.Open()的耗时性异步解决方案结合Activity生命周期        

*  相机预览图像 角度问题以及前置摄像头镜面问题          
  
*  连击拍照的 Crqsh 问题 



### 多媒体文件存储：

#### 通知系统扫描多媒体文件更新：

{% highlight java %}

public void mediaScan(File file) {
    MediaScannerConnection.scanFile(getActivity(),
            new String[] { file.getAbsolutePath() }, null,
            new OnScanCompletedListener() {
                @Override
                public void onScanCompleted(String path, Uri uri) {
                    Log.v("MediaScanWork", "file " + path
                            + " was scanned seccessfully: " + uri);
                }
            });
}

{% endhighlight %}  

---

Quote:

[Camera——Google Doc](http://developer.android.com/guide/topics/media/camera.html)

[Android相机开发那些坑-QZone](https://mp.weixin.qq.com/s?__biz=MzI1MTA1MzM2Nw==&mid=401454605&idx=1&sn=d5a16f6dc13e7581fec08a4e704cd5d0&scene=1&srcid=0129iGRJmL4TZH30OZ4D3Ih6&key=710a5d99946419d940adfc47e2f61666f462551073e0e78b456c1012285d18f5c9d16d017b7e46794a0f41a277424c16&ascene=0&uin=Mjc3OTU3Nzk1&devicetype=iMac+MacBookPro10%2C1+OSX+OSX+10.10.5+build%2814F27%29&version=11020201&pass_ticket=TbVqOqFm7Sb0QDBJ52ODh0eBxTApnoGWBuvVAl2hl4F0VrsgG2ZcLohvthzuwow0)

[玩转Android Camera开发(一)](http://blog.csdn.net/yanzi1225627/article/details/33028041)

[The Ultimate Android Camera Development Guide](https://www.airpair.com/android/android-camera-development)

[Android相机开发指南（一）](https://www.zybuluo.com/flyouting/note/6272)

[Scan Media Files in Android](http://droidyue.com/blog/2014/01/19/scan-media-files-in-android/index.html)

[How to get camera result as a uri in data folder? —— stackoverflow](http://stackoverflow.com/questions/10042695/how-to-get-camera-result-as-a-uri-in-data-folder/10229228#10229228)
