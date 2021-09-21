const canvas = document.getElementById("my-canvas");
const context = canvas.getContext("2d");

const field = [];
const particles = [];
const orbs = [];
const numParticles = 2000;
const particleSpeed = 4;
const particleLife = 500;
const numOrbs = 4;
const forceStrength = 0.04;
const fieldOffset = 50;
const fieldRadius = 3;

class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
	}

	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	normalize(len) {
		const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		this.x *= len / magnitude;
		this.y *= len / magnitude;
	}

	clone() {
		return new Vec(this.x, this.y);
	}
}

class Particle {
	constructor(pos, vel) {
		this.pos = pos;
		this.vel = vel;
		this.life = 0;
	}

	simulate() {
		if (this.inBounds()) {
			const dir = field[Math.floor(p.pos.y / fieldRadius)][Math.floor((p.pos.x + fieldOffset) / fieldRadius)];
			const slope = new Vec(Math.cos(dir) * forceStrength, Math.sin(dir) * forceStrength);
			this.applyForce(slope);
		}
		const lastPos = this.pos.clone();
		this.move();
		for (const o of orbs) {
			if (o.collision(this.pos)) {
				this.pos = lastPos;
				this.bounceOffOrb(o);
			}
		}
		this.draw();
		this.life++;
	}

	move() {
		this.pos.add(this.vel);
	}

	applyForce(v) {
		this.vel.add(v);
		this.vel.normalize(particleSpeed);
	}

	draw() {
		context.fillStyle = "white";
		context.beginPath();
		context.arc(this.pos.x, this.pos.y, 2, 0, 7);
		context.fill();
	}

	isDead() {
		if (this.pos.y < 0) {
			return true;
		}
		if (this.pos.x > canvas.width || this.pos.y > canvas.height) {
			return true;
		}
		return this.life > particleLife;
	}

	inBounds() {
		if (this.pos.x < -fieldOffset || this.pos.y < 0) {
			return false;
		}
		if (this.pos.x > canvas.width || this.pos.y > canvas.height) {
			return false;
		}
		return true;
	}

	bounceOffOrb(o) {
		const normalVec = new Vec(this.pos.x - o.pos.x, this.pos.y - o.pos.y);
		normalVec.normalize(1);
		const angle = (this.vel.x * normalVec.x + this.vel.y * normalVec.y) / particleSpeed;
		normalVec.normalize(2 * angle);
		this.vel.subtract(normalVec);
		this.vel.normalize(particleSpeed);
		this.move();
	}
}

class Orb {
	constructor(pos, radius) {
		this.pos = pos;
		this.radius = radius;
		this.squaredRadius = Math.pow(radius, 2);
	}

	draw() {
		context.fillStyle = "black";
		context.beginPath();
		context.arc(this.pos.x, this.pos.y, this.radius, 0, 7);
		context.fill();
	}

	collision(v) {
		const squaredDist = Math.pow(v.x - this.pos.x, 2) + Math.pow(v.y - this.pos.y, 2);
		return squaredDist <= this.squaredRadius;
	}
}

const setup = () => {
	// generate the flow field
	noise.seed(Math.random());
	for (let y = 0; y < canvas.height; y += fieldRadius) {
		const row = [];
		for (let x = -fieldOffset; x < canvas.width; x += fieldRadius) {
			const layer1 = noise.perlin3(x / 250, y / 260, 0);
			const layer2 = noise.perlin3(x / 100, y / 100, 0) * 0.75;
			const layer3 = noise.perlin3(x / 50, y / 50, 0) * 0.5;
			const layer4 = noise.perlin3(x / 25, y / 25, 0) * 0.25;
			const value = ((layer1 + layer2 + layer3 + layer4) * Math.PI) / 2;
			row.push(value);
		}
		field.push(row);
	}

	// create the orbs
	for (let i = 0; i < numOrbs; i++) {
		const pos = new Vec(Math.random() * (canvas.width - 100) + 80, Math.random() * (canvas.height - 100) + 50);
		const radius = Math.floor(Math.random() * 60) + 30;
		orbs.push(new Orb(pos, radius));
	}

	// draw the background
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

	requestAnimationFrame(simulateAllParticles);
};

const drawField = () => {
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.strokeStyle = "black";
	context.lineWidth = 1;
	for (let x = 0; x < canvas.width / fieldRadius; x++) {
		for (let y = 0; y < canvas.height / fieldRadius; y++) {
			context.beginPath();
			context.arc(x * fieldRadius, y * fieldRadius, 2, 0, 7);
			context.fill();
			context.beginPath();
			context.moveTo(x * fieldRadius, y * fieldRadius);
			context.lineTo(x * fieldRadius + 8 * Math.cos(field[y][x]), y * fieldRadius + 8 * Math.sin(field[y][x]));
			context.stroke();
		}
	}
};

const createParticle = () => {
	const position = new Vec(-fieldOffset - Math.random() * 30, canvas.height * Math.random());
	const angle = (Math.random() - 0.5) * Math.PI;
	const velocity = new Vec(Math.cos(angle), Math.sin(angle));
	particles.push(new Particle(position, velocity));
};

const simulateAllParticles = () => {
	// draw the background
	context.fillStyle = "rgba(0, 0, 0, 0.8)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// add particles if there aren't enough
	while (particles.length < numParticles) {
		createParticle();
	}

	// update all the particles
	for (let i = 0; i < particles.length; i++) {
		p = particles[i];
		p.simulate();
		if (p.isDead()) {
			particles.splice(i, 1);
			i--;
		}
	}

	requestAnimationFrame(simulateAllParticles);
};

document.onload = setup();
