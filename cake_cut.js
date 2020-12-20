var canvas;
var ctx;
var x1,
  y1,
  x2,
  y2 = 0;
var WIDTH;
var HEIGHT;
var arc_x;
var arc_y;
var arc_r;
var desired_percent = null;
var previous_percent = null;
var success_percent_diff = 5;

function getRandomPercent(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function startGame() {
  canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  WIDTH = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  HEIGHT = window.innerHeight;
  arc_x = WIDTH / 2;
  arc_y = HEIGHT / 2;
  arc_r = Math.min(WIDTH / 4, HEIGHT / 4);
  desired_percent = getRandomPercent(10, 90);
  previous_percent = null;
  setInterval(draw, 10);
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
}

function clear() {
  var c = document.getElementById("canvas");
  ctx = c.getContext("2d");
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawText() {
  var c = document.getElementById("canvas");
  ctx = c.getContext("2d");
  ctx.font = "5em Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  // fillText(text, x, y)
  ctx.fillText("Cut a " + desired_percent + "% slice", arc_x, HEIGHT / 8);
  if (previous_percent !== null) {
      if (Math.abs(desired_percent - previous_percent) <= success_percent_diff) {
        ctx.fillStyle = "#00ff00"; // Green
      } else {
        ctx.fillStyle = "#ff0000"; // Red
      }
    ctx.fillText("Cut " + previous_percent + "%", arc_x, (HEIGHT / 8) * 7);
  }
}

function drawCircle() {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  // arc(x,y,r,sAngle,eAngle,counterclockwise)
  ctx.arc(arc_x, arc_y, arc_r, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawLine() {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function draw() {
  clear();
  drawText();
  drawCircle();
  drawLine();
}

function mouseMove(e) {
  if (canvas.onmousemove !== null) {
    x2 = e.pageX - canvas.offsetLeft;
    y2 = e.pageY - canvas.offsetTop;
    console.log(x2 + "," + y2);
  }
}

function mouseDown(e) {
  if (previous_percent !== null) {
    startGame(); // Restart game
  }
  x1 = e.pageX - 6;
  x2 = x1;
  y1 = e.pageY - 6;
  y2 = y1;
  canvas.onmousemove = mouseMove;
}

function mouseUp() {
  canvas.onmousemove = null;
  var m = (y2 - y1) / (x2 - x1);
  var b = y2 - m * x2;
  if (m === Infinity) {
    m = 0;
    b = arc_y + (x2 - arc_x);
  }
  var intersections = findCircleLineIntersections(arc_r, arc_x, arc_y, m, b);
  if (intersections.length == 0) {
    console.log("Missed cake");
    return;
  }
  console.log(intersections);

  var iy1 = m * intersections[0] + b;
  var iy2 = m * intersections[1] + b;
  percentageOfArc(intersections[0], iy1, intersections[1], iy2);
}

function percentageOfArc(ix1, iy1, ix2, iy2) {
  var r = arc_r;
  var w = Math.sqrt(Math.pow(ix2 - ix1, 2) + Math.pow(iy2 - iy1, 2));
  var h = r - Math.sqrt(Math.pow(r, 2) - Math.pow(w / 2, 2));
  var total_area = r * r * Math.PI;
  var area =
    Math.pow(r, 2) * Math.acos((r - h) / r) -
    (r - h) * Math.sqrt(2 * r * h - Math.pow(h, 2));
  var percent = Math.round((area / total_area) * 100);
  var inverse_percent = 100 - percent;
  if (
    Math.abs(desired_percent - inverse_percent) <
    Math.abs(desired_percent - percent)
  ) {
    percent = inverse_percent;
  }
  console.log(percent);
  previous_percent = percent;
}

function findCircleLineIntersections(r, h, k, m, n) {
  // findCircleLineIntersections(radius, x, y, m, b)
  // Source: https://bit.ly/34uUJIK
  var a = 1 + Math.pow(m, 2);
  var b = -h * 2 + m * (n - k) * 2;
  var c = Math.pow(h, 2) + Math.pow(n - k, 2) - Math.pow(r, 2);
  var d = Math.pow(b, 2) - 4 * a * c;
  if (d >= 0) {
    var intersections = [
      (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a),
      (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a),
    ];
    if (d == 0) {
      // only 1 intersection
      return [intersections[0]];
    }
    return intersections;
  }
  // no intersection
  return [];
}
