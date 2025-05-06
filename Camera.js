class Camera {
    constructor() {
        this.eye = new Vector3([4, 2, 9]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);

        this.fov = 50;
        this.stepSize = 0.1;

        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();

        this.canvas = document.getElementById("webgl");

        this.updateMatrices();
    }
  
    forward() {
        let f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize();
        f.mul(this.stepSize);
        this.eye.add(f);
        this.at.add(f);
        this.updateMatrices();
    }
  
    back() {
        let f = new Vector3(this.eye.elements);
        f.sub(this.at).normalize();
        f.mul(this.stepSize);
        this.eye.add(f);
        this.at.add(f);
        this.updateMatrices();
    }
  
    left() {
        let f = new Vector3(this.eye.elements);
        f.sub(this.at).normalize();
        let s = Vector3.cross(f, this.up).normalize();
        s.mul(this.stepSize);
        this.eye.add(s);
        this.at.add(s);
        this.updateMatrices();
    }
  
    right() {
        let f = new Vector3(this.eye.elements);
        f.sub(this.at).normalize();
        let s = Vector3.cross(this.up, f).normalize();
        s.mul(this.stepSize);
        this.eye.add(s);
        this.at.add(s);
        this.updateMatrices();
    }
  
    pan(alpha) {
        let radians = (alpha * Math.PI) / 180;
        let f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize();

        // Camera pan calculations derived with the help of ChatGPT

        let cosA = Math.cos(radians);
        let sinA = Math.sin(radians);
        let ux = this.up.elements[0],
            uy = this.up.elements[1],
            uz = this.up.elements[2];
  
        let rotationMatrix = [
            [
            cosA + ux * ux * (1 - cosA),
            ux * uy * (1 - cosA) - uz * sinA,
            ux * uz * (1 - cosA) + uy * sinA,
            ],
            [
            uy * ux * (1 - cosA) + uz * sinA,
            cosA + uy * uy * (1 - cosA),
            uy * uz * (1 - cosA) - ux * sinA,
            ],
            [
            uz * ux * (1 - cosA) - uy * sinA,
            uz * uy * (1 - cosA) + ux * sinA,
            cosA + uz * uz * (1 - cosA),
            ],
        ];
    
        let f_prime = new Vector3([
            rotationMatrix[0][0] * f.elements[0] +
            rotationMatrix[0][1] * f.elements[1] +
            rotationMatrix[0][2] * f.elements[2],
            rotationMatrix[1][0] * f.elements[0] +
            rotationMatrix[1][1] * f.elements[1] +
            rotationMatrix[1][2] * f.elements[2],
            rotationMatrix[2][0] * f.elements[0] +
            rotationMatrix[2][1] * f.elements[1] +
            rotationMatrix[2][2] * f.elements[2],
        ]);
  
        this.at.set(this.eye).add(f_prime);
  
        this.updateMatrices();
    }
  
    tilt(angle) {
        let radians = (angle * Math.PI) / 180;
        let f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize();
    
        let s = Vector3.cross(new Vector3([0, 1, 0]), f).normalize();
    
        // Camera tilt calculations derived with the help of ChatGPT
    
        let cosA = Math.cos(radians);
        let sinA = Math.sin(radians);
        let sx = s.elements[0],
            sy = s.elements[1],
            sz = s.elements[2];
  
        let rotationMatrix = [
            [
            cosA + sx * sx * (1 - cosA),
            sx * sy * (1 - cosA) - sz * sinA,
            sx * sz * (1 - cosA) + sy * sinA,
            ],
            [
            sy * sx * (1 - cosA) + sz * sinA,
            cosA + sy * sy * (1 - cosA),
            sy * sz * (1 - cosA) - sx * sinA,
            ],
            [
            sz * sx * (1 - cosA) - sy * sinA,
            sz * sy * (1 - cosA) + sx * sinA,
            cosA + sz * sz * (1 - cosA),
            ],
        ];
  
        let f_prime = new Vector3([
            rotationMatrix[0][0] * f.elements[0] +
            rotationMatrix[0][1] * f.elements[1] +
            rotationMatrix[0][2] * f.elements[2],
            rotationMatrix[1][0] * f.elements[0] +
            rotationMatrix[1][1] * f.elements[1] +
            rotationMatrix[1][2] * f.elements[2],
            rotationMatrix[2][0] * f.elements[0] +
            rotationMatrix[2][1] * f.elements[1] +
            rotationMatrix[2][2] * f.elements[2],
        ]);
  
        this.at.set(this.eye).add(f_prime);
        this.up = new Vector3([0, 1, 0]);

        this.updateMatrices();
    }
  
    updateMatrices() {
        this.projMat.setPerspective(
            this.fov,
            this.canvas.width / this.canvas.height,
            0.1,
            100
        );

        this.viewMat.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],
            this.at.elements[0],
            this.at.elements[1],
            this.at.elements[2],
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
    }
}