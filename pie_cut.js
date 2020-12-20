var canvas;
var ctx;
var x1, y1, x2, y2;
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
  ctx = canvas.getContext("2d");
  // Reset the width/height in case someone changed window size.
  ctx.canvas.width = WIDTH = window.innerWidth;
  ctx.canvas.height = HEIGHT = window.innerHeight;
  arc_x = WIDTH / 2;
  arc_y = HEIGHT / 2;
  arc_r = Math.min(WIDTH / 4, HEIGHT / 4);
  // Reset all parameters.
  x1 = y1 = x2 = y2 = 0;
  desired_percent = getRandomPercent(10, 90);
  previous_percent = null;
  setInterval(draw, 10);
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawText(text, color, x, y) {
  ctx.font = "10vw Helvetica";
  ctx.textAlign = "center";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 10;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawPrompts() {
  // fillText(text, x, y)
  drawText("Click and drag to", "white", arc_x, (HEIGHT / 4.5) * 0.5);
  drawText("cut a " + desired_percent + "% slice", "white", arc_x, HEIGHT / 4.5);
  if (previous_percent !== null) {
    var color = "#ff0000"; // Red
    if (Math.abs(desired_percent - previous_percent) <= success_percent_diff) {
      color = "#00ff00"; // Green
    }
    drawText("Cut " + previous_percent + "%", color, arc_x, (HEIGHT / 4.5) * 3.75);
    drawText("Click to restart", color, arc_x, (HEIGHT / 4.5) * 4.25);
  }
}

function drawCircle() {
  var img = document.getElementById("pie");
  ctx.drawImage(img, arc_x - arc_r, arc_y - arc_r, arc_r * 2, arc_r * 2);
}

function drawLine() {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function draw() {
  clear();
  drawPrompts();
  drawCircle();
  drawLine();
}

function mouseMove(e) {
  if (canvas.onmousemove !== null) {
    x2 = e.pageX - canvas.offsetLeft;
    y2 = e.pageY - canvas.offsetTop;
    // console.log(x2 + "," + y2);
  }
}

function mouseDown(e) {
  if (previous_percent !== null) {
    startGame(); // Restart game
    return;
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
    console.log("Missed pie");
    return;
  }
  // console.log(intersections);

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
  // console.log(percent);
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

function setupTouchControls() {
  // Source http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
  // Set up touch events for mobile, etc
  canvas.addEventListener(
    "touchstart",
    function (e) {
      mousePos = getTouchPos(canvas, e);
      e.preventDefault();
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    },
    false
  );
  canvas.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      var mouseEvent = new MouseEvent("mouseup", {});
      canvas.dispatchEvent(mouseEvent);
    },
    false
  );
  canvas.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    },
    false
  );

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top,
    };
  }
}
