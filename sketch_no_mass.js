
let numBalls = 1000;
let spring = 0.05;
let gravity = 0.0;
let friction = -0.9;
let molecules = [];
let molecule_count_slider;

function setup() {
  createCanvas(720, 400);
  molecule_count_slider = createSlider(1, 1000, 2, 1);
  molecule_count_slider.position(20, 20);
  
  temperature_slider = createSlider(1, 15, 2, 1);
  temperature_slider.position(20, 50);

  molecules[0] = new Molecule(
      random(width),
      random(height),
      40,
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
  text('Molecule Count: ' + molecule_count_slider.value(), molecule_count_slider.x * 2 + molecule_count_slider.width, 35);
  text('Temperature: ' + temperature_slider.value(), temperature_slider.x * 2 + temperature_slider.width, 65);
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
      8,
      molecules.length + i,
      molecules
      ));
    }
    
  }  
}


class Molecule {
  constructor(xin, yin, din, idin, oin) {
    this.x = xin;
    this.y = yin;
    this.vx = random(10) - 5;
    this.vy = random(10) - 5;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
  }

  collide() {
    for (let i = this.id + 1; i < molecules.length; i++) {
      // console.log(others[i]);
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - this.others[i].x) * spring;
        let ay = (targetY - this.others[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        this.others[i].vx += ax;
        this.others[i].vy += ay;
      }
    }
  }

  move() {
    this.vy += gravity;
    this.x += this.vx * temperature_slider.value();
    this.y += this.vy * temperature_slider.value();
    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      this.vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      this.vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= friction;
    }
  }

  display() {
    if (this.id == 0) {
      fill(178, 190, 181,127);
      ellipse(this.x, this.y, this.diameter, this.diameter);  
    }
    else {
      fill(255,0,0);
      ellipse(this.x, this.y, this.diameter, this.diameter);  
    }
    
    
  }
}
