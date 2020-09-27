// class list
// const class_names = ["アカハライモリ" , "シリケンイモリ", "イボイモリ", "マダライモリ",
//                     "マーブルサラマンダー", "レッドサラマンダー", "ミナミイボイモリ", "ミナミクシイモリ", 
//                     "イベリアトゲイモリ", "ウーパールーパー", "ホライモリ", "アシナシイモリ"];

const class_names = ['アカハライモリ', 'アシナシイモリ', 'ブチイモリ', 'ファイアーサラマンダー', 'ホライモリ', 
                    'イベリアトゲイモリ', 'イボイモリ', 'マダライモリ', 'マーブルサラマンダー', 'メキシコサラマンダー',
                     'ミナミイボイモリ', 'ミナミクシイモリ', 'シリケンイモリ', 'タイガーサラマンダー']

const class_names_reverse = Array.from(class_names).reverse();

const class_num = class_names.length;

var model;

var predicted_flag = false;

const aryMax = function (a, b) {return Math.max(a, b);}

var predcount = 0;

//
// model load func
//
async function model_load() {
  console.log('Loading model..');

  // Load the model.
  //net = await mobilenet.load();
  model = await tf.loadLayersModel('edge2akahara/model.json');

  console.log('Successfully loaded model');

  document.getElementById("predict-btn").style.opacity = 1;
  document.getElementById("predict-btn").style.display = "block";

  model_loaded = true;
}

//
// predict func
//
async function prediction(){
  console.log("predict start");

  // if (predicted_flag){
  //   return ;
  // }

  // predicted_flag = true;

  // image from img tag
  let img_tensor = tf.browser.fromPixels(document.getElementById('draw-area'));
  
  console.log("load image");

  // val is in [0, 255] as int => [0, 1] as float32
  img_tensor = img_tensor.cast("float32").div(tf.scalar(255));

  // 3 channel > 1 channel
  //img_tensor = tf.unstack(img_tensor, 2); //[:, :, 0], [img_tensor.shape[0], img_tensor.shape[1]], 1);
  let r = img_tensor.slice([0,0,0], [256, 256, 1]); // red channel
  let g = img_tensor.slice([0,0,1], [256, 256, 1]); // green channel
  let b = img_tensor.slice([0,0,2], [256, 256, 1]); // blue channel
  img_tensor = r.add(g).add(b); // r + g + b
  img_tensor = tf.minimum(img_tensor, tf.onesLike(img_tensor)); // minimize(r + g+ b, 1);
  img_tensor = img_tensor.expandDims(0); // [H, W, C] > [Batch, H, W, C]

  // [H, W] => [B, H, W, C]
  //img_tensor = img_tensor[0].expandDims(0).expandDims(-1);

  console.log(img_tensor.dataSync());


  // predict
  const result = await model.predict(img_tensor);
  let pred_probs = result.dataSync();

  console.log("pred finished")

  console.log(pred_probs);

  let canv = document.getElementById("result-img");
  let ctx = canv.getContext("2d");
  let dst = ctx.createImageData(256, 256);


  for (let h = 0; h < 256; h++){
    for (let w = 0; w < 256; w++){
      let dst_ind = (h * 256 + w) * 4;
      dst.data[dst_ind] = parseInt((pred_probs[(h * 256 + w) * 3] + 1) * 127.5); //parseInt((pred_probs[0, h, w, 0] + 1) * 127.5);
      dst.data[dst_ind + 1] = parseInt((pred_probs[(h * 256 + w) * 3 + 1] + 1) * 127.5); //parseInt((pred_probs[0, h, w, 1] + 1) * 127.5);
      dst.data[dst_ind + 2] = parseInt((pred_probs[(h * 256 + w) * 3 + 2] + 1) * 127.5); //parseInt((pred_probs[0, h, w, 2] + 1) * 127.5);
      dst.data[dst_ind + 3] = 255;
      // console.log(dst.data.slice(dst_ind, dst_ind + 4));
    }
  }
  // for (let i = 0; i < 256 * 256 * 4; i+= 4){
  //   let h = parseInt(i / 4 / 256);
  //   let w = (i / 4) % 256;
  //   dst.data[i] = parseInt((pred_probs[0, h, w, 0] + 1) * 127.5);
  //   dst.data[i + 1] = parseInt((pred_probs[0, h, w, 1] + 1) * 127.5);
  //   dst.data[i + 2] = parseInt((pred_probs[0, h, w, 2] + 1) * 127.5);
  //   dst.data[i + 3] = 255;
  //   console.log(w);
  // }

  ctx.putImageData(dst, 0, 0);

  console.log("pred process finished")


  //document.getElementById("debug3").innerText = String(predcount);

  //console.log("predict completed");

  // document.getElementById("process_infer1").style.opacity = 1;
  // document.getElementById("process_infer2").style.opacity = 0;
  // document.getElementById("predict-btn").style.opacity = 0;
  // document.getElementById("predict-btn").style.display = "none";

  predcount += 1;
  // document.getElementById("debug4").innerText = String(predcount);
}

//
// image upload button
//
function previewImage(obj)
{
	var fileReader = new FileReader();
	fileReader.onload = (function() {
		document.getElementById('upload-img').src = fileReader.result;
	});
  fileReader.readAsDataURL(obj.files[0]);

  document.getElementById("read-img-name").text = obj.files[0]["name"];
  document.getElementById("process_infer1").style.opacity = 0;
  document.getElementById("process_infer2").style.opacity = 1;
  document.getElementById("predict-btn").style.opacity = 1;
  document.getElementById("predict-btn").style.display = "inline-block";

  predicted_flag = false;
  document.getElementById("debug1").innerText = String(predcount);
}



model_load();

