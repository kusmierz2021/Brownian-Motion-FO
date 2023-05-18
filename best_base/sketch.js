
let numBalls = 1000;
let spring = 0.05;
let friction = -0.9;
let molecules = [];
let molecule_count_slider;
let speed_slider;
let checkbox;
let gravity_slider;
let brownianMotionPath = [];

function setup() {
  createCanvas(windowWidth, windowWidth);
  
  molecule_count_slider = document.getElementById("slider-molecules");
  molecule_count_slider_val = document.getElementById("slider-molecules-value");
  
  speed_slider = document.getElementById("slider-speed");
  speed_slider_val = document.getElementById("slider-speed-value");
  
  gravity_slider = document.getElementById("slider-gravity");
  gravity_slider_val = document.getElementById("slider-gravity-value");
  
  path_checkbox = document.getElementById("path-checkbox");
  path_checkbox_text = document.getElementById("path-checkbox-text");
  
  molecules[0] = new Molecule(
      random(width),
      random(height),
      20,
      0,
      molecules
    );

  check_molecules();
  noStroke();
  fill(255, 204);
}

function draw() {
  background(0);
  check_molecules();
  molecules.forEach(molecule => {
    molecule.collide();
    molecule.move();
    molecule.display();
  });
  fill(255,255,255);
  
  molecule_count_slider_val.textContent = 'Molecule Count: ' + molecule_count_slider.value;
  speed_slider_val.textContent = 'Speed: ' + speed_slider.value;
  gravity_slider_val.textContent = 'Gravity: ' + gravity_slider.value;
  
  
  if (path_checkbox.checked) {
    brownianMotionPath.push(molecules[0].position.copy());
    stroke(255,255,255);
      
    for (let i = 1; i < brownianMotionPath.length; i++) {
      line(brownianMotionPath[i-1].x,brownianMotionPath[i-1].y,brownianMotionPath[i].x,brownianMotionPath[i].y);
          
      }
      
    }
    else {
      brownianMotionPath = [];
    }
    noStroke();
}


function check_molecules() {
  diff = molecules.length - parseInt(molecule_count_slider.value);
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      molecules.pop(); 
    }
  }
  if (diff < 0) {
    
    for (let i = 0; i < (-1 * diff); i++) {
      molecules.push(new Molecule(
      random(width),
      random(height),
      4,
      molecules.length + i,
      molecules
      ));
    }
    
  }  
}


class Molecule {
  constructor(x, y, r, idin, oin) {
    this.position = new p5.Vector(x, y);
    this.velocity = p5.Vector.random2D();
    this.r = r;
    this.id = idin;
    this.others = oin;
    this.m = 3.14 * r * r;
  }

  // collide() {
  //   for (let i = this.id + 1; i < molecules.length; i++) {
  //     // console.log(others[i]);
  //     let dx = this.others[i].position.x - this.position.x;
  //     let dy = this.others[i].position.y - this.position.y;
  //     let distance = sqrt(dx * dx + dy * dy);
  //     let minDist = this.others[i].r + this.r;
  //     //   console.log(distance);
  //     //console.log(minDist);
  //     if (distance < minDist) {
  //       //console.log("2");
  //       let angle = atan2(dy, dx);
  //       let targetX = this.position.x + cos(angle) * minDist;
  //       let targetY = this.position.y + sin(angle) * minDist;
  //       let ax = (targetX - this.others[i].position.x) * spring;
  //       let ay = (targetY - this.others[i].position.y) * spring;
  //       this.velocity.x -= ax;
  //       this.velocity.y -= ay;
  //       this.others[i].velocity.x += ax;
  //       this.others[i].velocity.y += ay;
  //     }
  //   }
  // }
  
    collide() {
    for (let i = this.id + 1; i < molecules.length; i++) {
      // console.log(others[i]);
      let distanceVect = p5.Vector.sub(molecules[i].position, this.position);
      let distanceVectMag = distanceVect.mag();
      let minDistance = this.others[i].r + this.r;
      //   console.log(distance);
      //console.log(minDist);
      if (distanceVectMag < minDistance) {
        //console.log("2");
        // get angle of distanceVect
        let theta = distanceVect.heading();
        // precalculate trig values
        let sine = sin(theta);
        let cosine = cos(theta);
        let bTemp = [new p5.Vector(), new p5.Vector()];
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;
        let vTemp = [new p5.Vector(), new p5.Vector()];

        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x = cosine * molecules[i].velocity.x + sine * molecules[i].velocity.y;
        vTemp[1].y = cosine * molecules[i].velocity.y - sine * molecules[i].velocity.x;
        let vFinal = [new p5.Vector(), new p5.Vector()];

      // final rotated this.velocity for b[0]
      vFinal[0].x =
        ((this.m - molecules[i].m) * vTemp[0].x + 2 * molecules[i].m * vTemp[1].x) /
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
        let distanceCorrection = (minDistance - distanceVectMag);
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
      fill(178, 190, 181,127);
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);

    }
    else {
      let e = this.velocity.mag() * parseInt(speed_slider.value);
      
      if (e < 4) {

        fill(0,0,153);  
      }
      else if (4 <= e && e < 8) {

        fill(0, 102, 255);  
      }
      if (8 <= e && e < 12) {

        fill(255, 255, 204);  
      }
      else if (12 <= e && e < 16) {

        fill(255, 153, 51);  
      }
      if (16 <= e) {

        fill(255,0,0);  
      }
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);  
    }
    
  
  }
}