

let spring = 0.5;
let gravity = 0.0;
let friction = -0.9;
let molecules = [];
let molecule_count_slider;
let temperature_slider;



function setup() {
  frameRate(30);
  createCanvas(1440, 800);
  
  noStroke();
  fill(255, 204);
  
  
  molecule_count_slider = createSlider(1, 1000, 2, 1);
  molecule_count_slider.position(20, 20);
  
  temperature_slider = createSlider(1, 15, 2, 1);
  temperature_slider.position(20, 50);
  
  molecules.push(new Molecule(
        random(width),
        random(height),
        20,
        0,
        molecules
      ));
  
  check_molecules();

}





function check_molecules() {
  diff = molecules.length - molecule_count_slider.value()
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
        (molecules.length + i),
        molecules
      ));
    }
    
  }
   
}
function draw() {
  
  background(0);
  check_molecules();
  molecules.forEach(molecule => {
    molecule.update();
    molecule.checkBoundaryCollision();
    molecule.collide();
  });
  molecules[0].check();
  molecules.forEach(molecule => {
    molecule.display();
  });
  
  text('Molecule Count: ' + molecule_count_slider.value(), molecule_count_slider.x * 2 + molecule_count_slider.width, 35);
  text('Temperature: ' + temperature_slider.value(), temperature_slider.x * 2 + temperature_slider.width, 65);
}

class Molecule {
  constructor(x, y, r, id, molecules) {
    this.position = new p5.Vector(x, y);
    this.velocity = p5.Vector.random2D();
    // this.velocity.mult(2);
    this.r = r;
    this.m = 3.14 *r * r;
    this.id = id;
    this.others = molecules;
  }
  
  update() {
    
    this.position.add(this.velocity.copy().mult(temperature_slider.value()));
  
  }
  
  checkBoundaryCollision() {
    if (this.position.x > width - this.r) {
      this.position.x = width - this.r;
      this.velocity.x *= -1;
    } else if (this.position.x < this.r) {
      this.position.x = this.r;
      this.velocity.x *= -1;
    } else if (this.position.y > height - this.r) {
      this.position.y = height - this.r;
      this.velocity.y *= -1;
    } else if (this.position.y < this.r) {
      this.position.y = this.r;
      this.velocity.y *= -1;
    }
  }
  
  checkCollision(other) {
    // Get distances between the balls components
    let distanceVect = p5.Vector.sub(other.position, this.position);

    // Calculate magnitude of the vector separating the balls
    let distanceVectMag = distanceVect.mag();

    // Minimum distance before they are touching
    let minDistance = this.r + other.r;

    if (distanceVectMag < minDistance) {
      let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
      let d = distanceVect.copy();
      let correctionVector = d.normalize().mult(distanceCorrection);
      other.position.add(correctionVector);
      this.position.sub(correctionVector);

      // get angle of distanceVect
      let theta = distanceVect.heading();
      // precalculate trig values
      let sine = sin(theta);
      let cosine = cos(theta);

      /* bTemp will hold rotated ball this.positions. You 
       just need to worry about bTemp[1] this.position*/
      let bTemp = [new p5.Vector(), new p5.Vector()];

      /* this ball's this.position is relative to the other
       so you can use the vector between them (bVect) as the 
       reference point in the rotation expressions.
       bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
       automatically to 0.0, which is what you want
       since b[1] will rotate around b[0] */
      bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
      bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

      // rotate Temporary velocities
      let vTemp = [new p5.Vector(), new p5.Vector()];

      vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
      vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
      vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
      vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

      /* Now that velocities are rotated, you can use 1D
       conservation of momentum equations to calculate 
       the final this.velocity along the x-axis. */
      let vFinal = [new p5.Vector(), new p5.Vector()];

      // final rotated this.velocity for b[0]
      vFinal[0].x =
        ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
        (this.m + other.m);
      vFinal[0].y = vTemp[0].y;

      // final rotated this.velocity for b[0]
      vFinal[1].x =
        ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
        (this.m + other.m);
      vFinal[1].y = vTemp[1].y;

      // hack to avoid clumping
      bTemp[0].x += vFinal[0].x;
      bTemp[1].x += vFinal[1].x;

      /* Rotate ball this.positions and velocities back
       Reverse signs in trig expressions to rotate 
       in the opposite direction */
      // rotate balls
      let bFinal = [new p5.Vector(), new p5.Vector()];

      bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
      bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
      bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
      bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

      // update balls to screen this.position
      other.position.x = this.position.x + bFinal[1].x;
      other.position.y = this.position.y + bFinal[1].y;

      this.position.add(bFinal[0]);

      // update velocities
      this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
      this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
      other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
      other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
    }
  }
  
  display() {
    noStroke();
    // fill(204);
    if (this.r == 20) {
      fill(178, 190, 181,127);
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);  
    }
    if (this.r != 20) {
      fill(255,0,0);
      ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);  
    }
    
  }

  collide() {
    for (let i = this.id + 1; i < molecules.length; i++) {
      // console.log(others[i]);
      this.checkCollision(this.others[i]);
    }
  }
  
  check() {
    for (let i = 1; i < molecules.length; i++) {
      let distanceVect = p5.Vector.sub(molecules[0].position, molecules[i].position);

    // Calculate magnitude of the vector separating the balls
    let distanceVectMag = distanceVect.mag();

    // Minimum distance before they are touching
    let minDistance = molecules[0].r + molecules[i].r;

    if (distanceVectMag < minDistance) {
      let distanceCorrection = (minDistance - distanceVectMag);
      let d = distanceVect.copy();
      let correctionVector = d.normalize().mult(distanceCorrection);
      molecules[i].position.add(correctionVector);
  
      
    }
    
  }

}
}
