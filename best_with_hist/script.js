let friction = -1;
let molecules = [];
let brownianMotionPath = [];
let class_columns = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];
let columns = [];

for (let i = 0; i < class_columns.length; i++) {
  columns[i] = { x: i*10, width: 10, height: 50, color: '#' +Math.floor(Math.random()*16777215).toString(16) };
}
const M = 2.989 * Math.pow(10, -26);
const J2eV = 6.24150907 * Math.pow(10, 21);
const B = 7 * Math.pow(10, -29);
let V = 0;
const Vh2O = 2.99 * Math.pow(10, -32); // in cubic m
let P = 0; // uklad's pressure value

function setup() {
  createCanvas(min(1000, windowWidth), min(1000, windowWidth));

  canvas = document.getElementById("myCanvas");
  context = canvas.getContext("2d");

  // Drawing instructions
  context.fillStyle = "rgb(0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  molecule_count_slider = document.getElementById("slider-molecules");
  molecule_count_slider_val = document.getElementById("slider-molecules-value");

  speed_slider = document.getElementById("slider-speed");
  speed_slider_val = document.getElementById("slider-speed-value");

  gravity_slider = document.getElementById("slider-gravity");
  gravity_slider_val = document.getElementById("slider-gravity-value");

  path_checkbox = document.getElementById("path-checkbox");

  stop_checkbox = document.getElementById("stop-checkbox");

  kT_val = document.getElementById("kT-value");
  pvnkt_val = document.getElementById("pvnkt-value");
  pvpnb_val = document.getElementById("pv-pnb-value");
  nb_val = document.getElementById("nb-value");

  acc_button = document.getElementById("acc-button");

  acc_button.addEventListener("click", () => {
    console.log("Particle Accelerated!");
    molecules[0].velocity = molecules[0].velocity.mult(1.2);
  });

  molecules[0] = new Molecule(
    random(width),
    random(height),
    20,
    0,
    molecules,
    (acceleration = 7)
  );

  V =
    (min(1000, windowWidth) / 8) * (min(1000, windowWidth) / 8) * 1 * Vh2O; // V in cubic m for whole canvas

  check_molecules();
  noStroke();
  fill(255, 204);
}

function draw() {
  background(0);
  check_molecules();
  molecules.forEach((molecule) => {
    if (!stop_checkbox.checked) {
      molecule.collide();
      molecule.move();
    }
    molecule.display();
  });
  fill(255, 255, 255);

  molecule_count_slider_val.textContent =
    "Molecule Count: " + molecule_count_slider.value;
  speed_slider_val.textContent = "Speed: " + speed_slider.value;
  gravity_slider_val.textContent = "Gravity: " + gravity_slider.value;

  if (path_checkbox.checked) {
    brownianMotionPath.push(molecules[0].position.copy());
    stroke(255, 255, 255);

    for (let i = 1; i < brownianMotionPath.length; i++) {
      line(
        brownianMotionPath[i - 1].x,
        brownianMotionPath[i - 1].y,
        brownianMotionPath[i].x,
        brownianMotionPath[i].y
      );
    }
  } else {
    brownianMotionPath = [];
  }
  noStroke();
  fill('#white')
  text('Molecule Count: ', 30, min(1000, windowWidth)+400);
  

  // Writing Maxwell's histogram
  classify_molecules();
  draw_columns();

  // Calculating perfect gas parameters
  let n = parseInt(molecule_count_slider.value);
  let kT = calculate_kT();
  let kT_eval = kT * J2eV; // kT value shown in meV
  kT_val.textContent = "kT = " + kT_eval.toFixed(3) + " meV";
  P = calculate_P(n, kT);
  pvnkt_val.textContent = "PV/NkT = " + calculate_PVNKT(P, n, kT).toFixed(3);
  pvpnb_val.textContent =
    "P(V-Nb)/NkT = " + calculate_PVPNB(P, n, kT).toFixed(3);
  nb_val.textContent = "Nb = " + parseInt(molecule_count_slider.value) * B;
}

function check_molecules() {
  diff = molecules.length - parseInt(molecule_count_slider.value);
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      molecules.pop();
    }
  }
  if (diff < 0) {
    for (let i = 0; i < -1 * diff; i++) {
      molecules.push(
        new Molecule(
          random(width),
          random(height),
          4,
          molecules.length + i,
          molecules
        )
      );
    }
  }
}

class Molecule {
  constructor(x, y, r, idin, oin, acceleration = 2) {
    this.position = new p5.Vector(x, y);
    this.velocity = p5.Vector.random2D().mult(acceleration);
    this.r = r;
    this.id = idin;
    this.others = oin;
    this.m = (r / 4 ) * M; //2.989×10−26
  }

  collide() {
    for (let i = this.id + 1; i < molecules.length; i++) {
      let distanceVect = p5.Vector.sub(molecules[i].position, this.position);
      let distanceVectMag = distanceVect.mag();
      let minDistance = this.others[i].r + this.r;
      if (distanceVectMag < minDistance) {
        let theta = distanceVect.heading();
        let sine = sin(theta);
        let cosine = cos(theta);
        let bTemp = [new p5.Vector(), new p5.Vector()];
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;
        let vTemp = [new p5.Vector(), new p5.Vector()];

        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x =
          cosine * molecules[i].velocity.x + sine * molecules[i].velocity.y;
        vTemp[1].y =
          cosine * molecules[i].velocity.y - sine * molecules[i].velocity.x;
        let vFinal = [new p5.Vector(), new p5.Vector()];

        // final rotated this.velocity for b[0]
        vFinal[0].x =
          ((this.m - molecules[i].m) * vTemp[0].x +
            2 * molecules[i].m * vTemp[1].x) /
          (this.m + molecules[i].m);
        vFinal[0].y = vTemp[0].y;

        // final rotated this.velocity for b[0]
        vFinal[1].x =
          ((molecules[i].m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
          (this.m + molecules[i].m);
        vFinal[1].y = vTemp[1].y;
        this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
        this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
        molecules[i].velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
        molecules[i].velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
      }
    }
  }

  move() {
    this.velocity.y += parseInt(gravity_slider.value) / 100;
    this.position.x += this.velocity.x * parseInt(speed_slider.value);
    this.position.y += this.velocity.y * parseInt(speed_slider.value);

    if (this.id != 0) {
      let distanceVect = p5.Vector.sub(molecules[0].position, this.position);
      let distanceVectMag = distanceVect.mag();
      let minDistance = this.r + molecules[0].r;
      if (distanceVectMag < minDistance) {
        let distanceCorrection = minDistance - distanceVectMag;
        let d = distanceVect.copy();
        let correctionVector = d.normalize().mult(distanceCorrection);
        this.position.sub(correctionVector);
      }
      for (let i = this.id + 1; i < molecules.length; i++) {
        let distanceVect = p5.Vector.sub(molecules[i].position, this.position);
        let distanceVectMag = distanceVect.mag();
        let minDistance = this.r + molecules[i].r;
        if (distanceVectMag < minDistance) {
          let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
          let d = distanceVect.copy();
          let correctionVector = d.normalize().mult(distanceCorrection);
          molecules[i].position.add(correctionVector);
          this.position.sub(correctionVector);
        }
      }
    }

    if (this.position.x + this.r > width) {
      this.position.x = width - this.r;
      this.velocity.x *= friction;
    } else if (this.position.x - this.r < 0) {
      this.position.x = this.r;
      this.velocity.x *= friction;
    }
    if (this.position.y + this.r > height) {
      this.position.y = height - this.r;
      this.velocity.y *= friction;
    } else if (this.position.y - this.r < 0) {
      this.position.y = this.r;
      this.velocity.y *= friction;
    }
  }

  display() {
    if (this.id == 0) {
      fill(178, 190, 181, 127);
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
    } else {
      let e = this.velocity.mag() * parseInt(speed_slider.value);

      if (e < 4) {
        fill(0, 0, 153);
      } else if (4 <= e && e < 8) {
        fill(0, 102, 255);
      }
      if (8 <= e && e < 12) {
        fill(255, 255, 204);
      } else if (12 <= e && e < 16) {
        fill(255, 153, 51);
      }
      if (16 <= e) {
        fill(255, 0, 0);
      }
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
    }
  }
}

function classify_molecules() {
  class_columns = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ];

  molecules.forEach((molecule) => {
    let v = molecule.velocity.mag();
    if (v <= 0.5) {
      class_columns[0] += 1;
    } else if (v > 0.5 && v <= 1) {
      class_columns[1] += 1;
    } else if (v > 1 && v <= 1.5) {
      class_columns[2] += 1;
    } else if (v > 1.5 && v <= 2) {
      class_columns[3] += 1;
    } else if (v > 2 && v <= 2.5) {
      class_columns[4] += 1;
    } else if (v > 2.5 && v <= 3) {
      class_columns[5] += 1;
    } else if (v > 3 && v <= 3.5) {
      class_columns[6] += 1;
    } else if (v > 3.5 && v <= 4) {
      class_columns[7] += 1;
    } else if (v > 4.5 && v <= 5) {
      class_columns[8] += 1;
    } else if (v > 5 && v <= 5.5) {
      class_columns[9] += 1;
    } else if (v > 6 && v <= 6.5) {
      class_columns[10] += 1;
    } else if (v > 6.5 && v <= 7) {
      class_columns[11] += 1;
    } else if (v > 7 && v <= 7.5) {
      class_columns[12] += 1;
    } else if (v > 7.5 && v <= 8) {
      class_columns[13] += 1;
    } else if (v > 8 && v <= 8.5) {
      class_columns[14] += 1;
    } else if (v > 8.5 && v <= 9) {
      class_columns[15] += 1;
    } else if (v > 9 && v <= 9.5) {
      class_columns[16] += 1;
    } else if (v > 9.5 && v <= 10) {
      class_columns[17] += 1;
    } else if (v > 10 && v <= 10.5) {
      class_columns[18] += 1;
    } else if (v > 10.5 && v <= 11) {
      class_columns[19] += 1;
    } else if (v > 11 && v <= 11.5) {
      class_columns[20] += 1;
    } else if (v > 11.5 && v <= 12) {
      class_columns[21] += 1;
    } else if (v > 12 && v <= 12.5) {
      class_columns[22] += 1;
    } else if (v > 12.5 && v <= 13) {
      class_columns[23] += 1;
    } else if (v > 13 && v <= 13.5) {
      class_columns[24] += 1;
    } else if (v > 13.5 && v <= 14) {
      class_columns[25] += 1;
    } else if (v > 14 && v <= 14.5) {
      class_columns[26] += 1;
    } else if (v > 14.5 && v <= 15) {
      class_columns[27] += 1;
    } else if (v > 15.5 && v <= 16) {
      class_columns[28] += 1;
    } else if (v > 16 && v <= 16.5) {
      class_columns[29] += 1;
    } else if (v > 16.5 && v <= 17) {
      class_columns[30] += 1;
    } else if (v > 17) {
      class_columns[31] += 1;
    }
  });
  // console.log(class_columns)
}

function draw_columns() {
  let i = 0;
  context.fillStyle = "rgb(0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const column of columns) {
    context.fillStyle = column.color;
    context.fillRect(
      column.x,
      canvas.height,
      column.width,
      -class_columns[i] * 2
    );
    i += 1;
  }
}

function calculate_kT() {
  let sum_of_energy = 0;
  let energy = 0;
  let v = 0;
  molecules.forEach((molecule) => {
    let v = molecule.velocity.mag();
    energy = (v * v * molecule.m) / 2;
    sum_of_energy += energy;
  });
  return sum_of_energy;
}

function calculate_P(n, kT) {
  console.log("n * kT = ", (n * kT))
  console.log("V - Nb: ", V - n * B)
  console.log("P = ", (n * kT) / V )
  return ((n * kT) / V );
}

function calculate_PVNKT(P, n, kT) {
  return (P * V) / (n * kT);
}

function calculate_PVPNB(P, n, kT) {
  // console.log("P(V - Nb): ",  P * (V - n * B))
  return P * (V - n * B) / (n * kT);
}
