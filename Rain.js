class Raindrop {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.velocity = 0.1 + Math.random() * 0.1;
    }
  
    update() {
      this.y -= this.velocity;
      if (this.y < 0) {
        this.y = 20 + Math.random() * 5;
        this.x = Math.random() * 32;
        this.z = Math.random() * 32 - 25;
      }
    }
  
    render() {
      let drop = new Cube();
      drop.color = [0.6, 0.6, 1.0, 0.5];
      drop.matrix.translate(this.x, this.y, this.z);
      drop.matrix.scale(0.05, 0.2, 0.05);
      drop.renderfast();
    }
  }
  