let shapes = []; // 複数の形状を保存する配列
let numShapes = 20; // 形状の数
let sides = 18; // 多角形の辺の数（ここでは12角形）

let circles = []; // 円の配列
let waveSize = 100; // 波動の大きさ
let waveSpeed = 2; // 波動の速度
let waves = []; // 波動エフェクトを保存する配列

// 音声ファイルのリスト
const soundFiles = ['./sound/1.mp3', './sound/2.mp3', './sound/3.mp3', './sound/4.mp3'];
const sounds = []; // 音声オブジェクトを格納する配列

function preload() {
  // 音声ファイルを読み込む
  for (let i = 0; i < soundFiles.length; i++) {
    sounds[i] = loadSound(soundFiles[i]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight); // キャンバスのサイズをウィンドウサイズに合わせる

  // 複数の形状を生成し、配列に追加
  for (let i = 0; i < numShapes; i++) {
    let shape = {
      vertices: [], // 変形する形状の頂点座標を保存する配列
      angleOffsets: [], // 各角の変形度合いを保存する配列
      angleSpeed: 0.02, // 角度の変化速度
      x: random(width), // ランダムな位置
      y: random(height),
      xSpeed: random(-1, 1), // ランダムな速度
      ySpeed: random(-1, 1)
    };

    // 初期の形状の頂点座標を設定
    for (let j = 0; j < sides; j++) {
      let x = width / 2 + cos(TWO_PI / sides * j) * 100;
      let y = height / 2 + sin(TWO_PI / sides * j) * 100;
      shape.vertices.push(createVector(x, y));
      shape.angleOffsets.push(random(-PI / 4, PI / 4)); // ランダムな変形度合いを設定
    }

    shapes.push(shape); // 形状を配列に追加
  }

  // 各円の初期化時にcollisionTimeと元の速度を設定
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    circle.collisionTime = millis(); // 衝突時刻の初期化
    circle.originalXSpeed = circle.xSpeed; // 元のx速度の保存
    circle.originalYSpeed = circle.ySpeed; // 元のy速度の保存
  }
}

function draw() {
  background(255);

  // 各形状を描画
  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];

    // 形状を描画
    beginShape();
    noFill();
    stroke(0);
    strokeWeight(2);
    for (let j = 0; j < shape.vertices.length; j++) {
      vertex(shape.vertices[j].x, shape.vertices[j].y);
    }
    endShape(CLOSE);

    // 頂点の座標を変形
    for (let j = 0; j < shape.vertices.length; j++) {
      // 頂点をランダムな角度で変形
      let offset = sin(frameCount * shape.angleSpeed + shape.angleOffsets[j]) * 20; // 20は変形の大きさ
      shape.vertices[j].x = shape.x + cos(TWO_PI / sides * j) * (100 + offset);
      shape.vertices[j].y = shape.y + sin(TWO_PI / sides * j) * (100 + offset);
    }

    // 形状の位置を変更して漂わせる
    shape.x += shape.xSpeed;
    shape.y += shape.ySpeed;

    // 画面の端に達したら反対側に移動させる
    if (shape.x > width) {
      shape.x = 0;
    } else if (shape.x < 0) {
      shape.x = width;
    }
    if (shape.y > height) {
      shape.y = 0;
    } else if (shape.y < 0) {
      shape.y = height;
    }
  }

  // 各円を描画
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    let circleColor = color(random(255), random(255), random(255));
    fill(circleColor);
    noStroke();
    ellipse(circle.x, circle.y, circle.radius * 2);

    // 円の位置を変更して漂わせる
    circle.x += circle.xSpeed;
    circle.y += circle.ySpeed;

    // 画面の端に達したら反射する
    if (circle.x > width - circle.radius || circle.x < circle.radius) {
      circle.xSpeed *= -1;
    }
    if (circle.y > height - circle.radius || circle.y < circle.radius) {
      circle.ySpeed *= -1;
    }

    // 衝突からの経過時間を計算
    let elapsed = millis() - circle.collisionTime;

    // 3秒後には元の速度に戻る
    if (elapsed > 3000) {
      circle.xSpeed = circle.originalXSpeed;
      circle.ySpeed = circle.originalYSpeed;
    }
  }

  // 円と形状の衝突検出
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // 各形状との衝突を検出
    for (let j = 0; j < shapes.length; j++) {
      let shape = shapes[j];

      for (let k = 0; k < shape.vertices.length; k++) {
        let distance = dist(circle.x, circle.y, shape.vertices[k].x, shape.vertices[k].y);
        if (distance < circle.radius) {
          // 衝突した円に対して弾き飛ばす
          let angle = atan2(circle.y - shape.vertices[k].y, circle.x - shape.vertices[k].x);
          let force = createVector(cos(angle) * 1, sin(angle) * 1); // 弾き飛ばす力
          shape.xSpeed += force.x;
          shape.ySpeed += force.y;

          // 衝突からの経過時間と元の速度を記録
          circle.collisionTime = millis();
          circle.originalXSpeed = circle.xSpeed;
          circle.originalYSpeed = circle.ySpeed;

          let newWave = {
            x: circle.x,
            y: circle.y,
            size: 0,
            maxSize: waveSize,
            speed: waveSpeed
          };
          waves.push(newWave);

        // ランダムな音声ファイルを選択
        let randomIndex = floor(random(sounds.length));
        let randomSound = sounds[randomIndex];

        // 選択した音声ファイルを再生
        if (randomSound.isLoaded()) {
            randomSound.play();
        } else {
            console.log('音声ファイルがまだ読み込まれていません。');
        }

          // 円を削除
          circles.splice(i, 1);
          i--; // インデックスを調整
          break;
        }
      }
    }
  }

  // 波動エフェクトを描画
  for (let i = 0; i < waves.length; i++) {
    let wave = waves[i];

    noFill();
    stroke(0);
    ellipse(wave.x, wave.y, wave.size);

    // 波動のサイズを増加させてエフェクトを演出
    wave.size += wave.speed;

    // 波動のサイズが一定以上になったら削除
    if (wave.size > wave.maxSize) {
      waves.splice(i, 1);
      i--; // インデックスを調整
    }
  }
  
}

function touchStarted() {
  // クリック時に新しい円を追加
  let newCircle = {
    x: mouseX,
    y: mouseY,
    radius: 20,
    xSpeed: random(-1, 1),
    ySpeed: random(-1, 1)
  };
  circles.push(newCircle);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }