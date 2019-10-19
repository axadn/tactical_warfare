export default class Ground {
    constructor(scene, cellSize, cellCount, wallThickness) {
      this.scene = scene;
      this.cellSize = cellSize;
      this.cellCount = cellCount;
      this.wallThickness = wallThickness;
      this.mesh = this._createGroundMesh();
    }
    _createGroundMesh() {
      return BABYLON.Mesh.CreateGround(
        "ground",
        this.cellSize * this.cellCount,
        this.cellSize * this.cellCount + this.wallThickness,
        2,
        this.scene
      );
    }
    cellIndicesToGlobalCoordinates(indices) {
      // let x =
      //   indices[0] * this.cellSize +
      //   this.cellSize / 2 -
      //   this.getGroundWidth() / 2;
      // let z =
      //   -1 *
      //   (indices[1] * this.cellSize + this.cellSize / 2 + this.wallThickness / 2);
      // return new BABYLON.Vector3(x, 0, z);
    }
  }
  