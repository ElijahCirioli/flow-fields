const canvas = document.getElementById("my-canvas");
const context = canvas.getContext("2d");

const field = [];
const radius = 10;
const forceStrength = 0.007;

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
}

class Particle {
	constructor(pos, vel) {
		this.pos = pos;
		this.vel = vel;
	}

	move() {
		this.pos.add(this.vel);
	}

	force(v) {
		this.vel.add(v);
		this.vel.normalize(0.5);
	}

	inBounds() {
		if (this.pos.x < 0 || this.pos.y < 0) {
			return false;
		}
		if (this.pos.x > canvas.width || this.pos.y > canvas.height) {
			return false;
		}
		return true;
	}
}

const setup = () => {
	noise.seed(Math.random());

	for (let y = 0; y < canvas.height; y += radius) {
		const row = [];
		for (let x = 0; x < canvas.width; x += radius) {
			const layer1 = noise.perlin3(x / 100, y / 100, 0);
			const layer2 = noise.perlin3(x / 75, y / 75, 0) * 0.75;
			const layer3 = noise.perlin3(x / 50, y / 50, 0) * 0.5;
			const layer4 = noise.perlin3(x / 25, y / 25, 0) * 0.25;
			const value = (layer1 + layer2 + layer3 + layer4) * Math.PI;

			row.push(value);
		}
		field.push(row);
	}

	requestAnimationFrame(simulate);
};

const drawField = () => {
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.strokeStyle = "black";
	context.lineWidth = 1;
	for (let x = 0; x < canvas.width / radius; x++) {
		for (let y = 0; y < canvas.height / radius; y++) {
			context.beginPath();
			context.arc(x * radius, y * radius, 2, 0, 7);
			context.fill();
			context.beginPath();
			context.moveTo(x * radius, y * radius);
			context.lineTo(x * radius + 8 * Math.cos(field[y][x]), y * radius + 8 * Math.sin(field[y][x]));
			context.stroke();
		}
	}
};

const simulateParticle = () => {
	let x, y, angle;
	if (Math.random() > 0.5) {
		x = canvas.width * Math.round(Math.random());
		y = canvas.height * Math.random();
		angle = Math.random() * Math.PI - Math.PI / 2;
	} else {
		x = canvas.width * Math.random();
		y = canvas.height * Math.round(Math.random());
		angle = Math.random() * Math.PI;
	}

	const p = new Particle(new Vec(x, y), new Vec(Math.cos(angle), Math.sin(angle)));

	context.strokeStyle = "rgba(0, 0, 0, 0.2)";
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(p.pos.x, p.pos.y);
	for (let t = 0; t < 2000; t++) {
		p.move();
		context.lineTo(p.pos.x, p.pos.y);
		if (p.inBounds()) {
			const dir = field[Math.floor(p.pos.y / radius)][Math.floor(p.pos.x / radius)];
			const slope = new Vec(Math.cos(dir) * forceStrength, Math.sin(dir) * forceStrength);
			p.force(slope);
		}
	}
	context.stroke();
};

const simulate = () => {
	simulateParticle();

	requestAnimationFrame(simulate);
};

document.onload = setup();
