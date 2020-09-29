// https://github.com/tsuyopon-xyz/drawing_app_part1/blob/master/main.js
// 上記のコードを元に以下の追加機能を追加します。
// - 線の色を変更する機能
// - 消しゴム機能
//
// 元々書かれてた説明のコメントは削除しました。理由は次のとおりです。
// - 今回の変更差分の説明コメントのみにすることで、どの部分で変更があったかわかりやすくするため
window.addEventListener('load', () => {
  const canvas = document.querySelector('#draw-area');
  const context = canvas.getContext('2d');
  const lastPosition = { x: null, y: null };
  let isDrag = false;

  context.fillStyle = "#000000"; //筆に白い絵の具をつけて
  context.fillRect(0, 0, canvas.width, canvas.height); //四角を描く

  // 現在の線の色を保持する変数(デフォルトは黒(#000000)とする)
  let currentColor = '#ffffff';

  // color pallete
  const joe = colorjoe.rgb('color-palette', currentColor);

  // 現在の線の太さを記憶する変数
  // <input id="range-selector" type="range"> の値と連動する
  let currentLineWidth = 0.5;

  function draw(x, y) {
    if(!isDrag) {
      return;
    }
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = currentLineWidth;
    context.strokeStyle = currentColor;
    if (lastPosition.x === null || lastPosition.y === null) {
      context.moveTo(x, y);
    } else {
      context.moveTo(lastPosition.x, lastPosition.y);
    }
    context.lineTo(x, y);
    context.stroke();

    lastPosition.x = x;
    lastPosition.y = y;
  }

  // <canvas　id="line-width-indicator"> 上で現在のマウスの位置を中心に
  // 線の太さを表現するための「○」を描画する。
  function showLineWidthIndicator(x, y) {
    contextForWidthIndicator.lineCap = 'round';
    contextForWidthIndicator.lineJoin = 'round';
    contextForWidthIndicator.strokeStyle = currentColor;
 
    // 「○」の線の太さは細くて良いので1で固定
    contextForWidthIndicator.lineWidth = currentLineWidth;
 
    // 過去に描画「○」を削除する。過去の「○」を削除しなかった場合は
    // 過去の「○」が残り続けてします。(以下の画像URLを参照)
    // https://tsuyopon.xyz/wp-content/uploads/2018/09/line-width-indicator-with-bug.gif
    contextForWidthIndicator.clearRect(0, 0, canvasForWidthIndicator.width, canvasForWidthIndicator.height);
 
    contextForWidthIndicator.beginPath();
 
    // x, y座標を中心とした円(「○」)を描画する。
    // 第3引数の「currentLineWidth / 2」で、実際に描画する線の太さと同じ大きさになる。
    // ドキュメント: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    contextForWidthIndicator.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);
 
    contextForWidthIndicator.stroke();
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function dragStart(event) {
    context.beginPath();

    isDrag = true;
  }

  function dragEnd(event) {
    context.closePath();
    isDrag = false;
    lastPosition.x = null;
    lastPosition.y = null;
  }

  function initEventHandler() {
    const clearButton = document.querySelector('#clear-btn');
    clearButton.addEventListener('click', () => {
      context.fillStyle = "#000000"; //筆に白い絵の具をつけて
      context.fillRect(0, 0, canvas.width, canvas.height); //四角を描く
      clear;
    });

    // 消しゴムモードを選択したときの挙動
    const eraserButton = document.querySelector('#eraser-btn');
    eraserButton.addEventListener('click', () => {
      // 消しゴムと同等の機能を実装したい場合は現在選択している線の色を
      // 白(#FFFFFF)に変更するだけでよい
      currentColor = '#000000';
      joe.set(currentColor);
      document.getElementById("pen-display").style.backgroundColor = currentColor;
    });

    const blackButton = document.querySelector('#pen-btn');
    blackButton.addEventListener('click', () => {
      currentColor = '#ffffff';
      joe.set(currentColor);
      document.getElementById("pen-display").style.backgroundColor = currentColor;
    });

    canvas.addEventListener('mousedown', dragStart);
    canvas.addEventListener('mouseup', dragEnd);
    canvas.addEventListener('mouseout', dragEnd);
    canvas.addEventListener('mousemove', (event) => {
      draw(event.layerX, event.layerY);
    });
  }

  // カラーパレットの設置を行う
  function initColorPalette() {
    // 'done'イベントは、カラーパレットから色を選択した時に呼ばれるイベント
    // ドキュメント: https://github.com/bebraw/colorjoe#event-handling
    joe.on('done', color => {
      // コールバック関数の引数からcolorオブジェクトを受け取り、
      // このcolorオブジェクト経由で選択した色情報を取得する

      // color.hex()を実行すると '#FF0000' のような形式で色情報を16進数の形式で受け取れる
      // draw関数の手前で定義されている、線の色を保持する変数に代入して色情報を変更する
      currentColor = color.hex();
      document.getElementById("pen-display").style.backgroundColor = currentColor;
    });
  }

  // 文字の太さの設定・更新を行う機能
  function initConfigOfLineWidth() {
    const textForCurrentSize = document.querySelector('#line-width');
    const rangeSelector = document.querySelector('#range-selector');
 
    // 線の太さを記憶している変数の値を更新する
    currentLineWidth = rangeSelector.value;
 
    // "input"イベントをセットすることでスライド中の値も取得できるようになる。
    // ドキュメント: https://developer.mozilla.org/ja/docs/Web/HTML/Element/Input/range
    rangeSelector.addEventListener('input', event => {
      const width = event.target.value;
 
      // 線の太さを記憶している変数の値を更新する
      currentLineWidth = width;
 
      // 更新した線の太さ値(数値)を<input id="range-selector" type="range">の右側に表示する
      textForCurrentSize.innerText = width;

      document.getElementById("pen-display").style.width = width * 2 + "px";
      document.getElementById("pen-display").style.height = width * 2 + "px";
      document.getElementById("pen-display").style.marginTop = (20 - width) + "px";
      document.getElementById("pen-display").style.marginLeft = (10 - width) + "px";
    });
  }

  initEventHandler();

  // カラーパレット情報を初期化する
  initColorPalette();

  // 文字の太さの設定を行う機能を有効にする
  initConfigOfLineWidth();

  const dl_button = document.getElementById("download");
  dl_button.onclick = function() {
    let canvas = document.getElementById("result-img");
    console.dir(canvas)
    let base64 = canvas.toDataURL("image/png");

    document.getElementById("download").href = base64;
  };
});



function sample_read(x) {
  var canvas = document.getElementById('draw-area');
  if (canvas.getContext) {
    
    var context = canvas.getContext('2d');
    var img = new Image();
    img.src = "./assets/sample_input" + x + ".png";
    // canvas.height = 256;
    // canvas.width = 256;
    // canvas.width = image.width;
    // canvas.height = image.height;
    console.log(img);
    context.drawImage(img, 0, 0);
    console.log("sample read " + x);
  }
}