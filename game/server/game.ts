import * as BABYLON from  '@babylonjs/core';
import Player from './player.js';
import {TANK_POS_HEIGHT} from './tank';
import Tank from './tank.js';
import Arena from './arena/arena';
export class Game {
  private players: Array<Player>;
  private scene: BABYLON.Scene;
  private fieldItems: any;
  private sockets: Array<any>;
  private arena: any;
  

  constructor(scene: BABYLON.Scene, sockets: Array<any>) {
    this.scene = scene;
    this.players = [];
    this.fieldItems = [];
  }

  async setup(){
    return new Promise((resolve, reject)=>{
      const loader = new BABYLON.AssetsManager(this.scene);
      const tankTask = loader.addMeshTask(
        "tankTask",
        "tank_body",
        "models/tanks/sand_tank/",
        "sand_tank.babylon"
      );
      this.arena = new Arena(this.scene);
      tankTask.onSuccess = task =>{
        const tankTransforms = this.getTankTransforms(task.loadedMeshes[0] as BABYLON.Mesh);
        task.loadedMeshes[0].dispose(true, true); 
        let tank;
        for(let i  = 0; i < this.sockets.length; ++i){
          tank = new Tank({...tankTransforms, scene: this.scene})
          this.players.push(new Player({socket: this.sockets[i], tank}));
        }
        this.positionPlayers();
        resolve();
      }

      tankTask.onError = (task,message,exception) => reject(exception);

      loader.load();
    });
  }

  getTankTransforms(mesh: BABYLON.Mesh) :
  {
    aimXPosition: BABYLON.Vector3,
    aimXRotation: BABYLON.Quaternion,
    aimYPosition: BABYLON.Vector3,
    aimYRotation: BABYLON.Quaternion}{
    const childMeshes = mesh.getChildMeshes();
    let rotX : BABYLON.Matrix = null;
    let rotY : BABYLON.Matrix = null;
    let name;
    for (let i = 0; i < childMeshes.length; ++i) {
      name = childMeshes[i].name;
      name = name.split(".");
      name = name[name.length - 1];
      if (name === "tank_rot_x") {
        rotX = childMeshes[i].getWorldMatrix();
      } else if (name === "tank_rot_y") {
        rotY = childMeshes[i].getWorldMatrix();
      }
    }
    let aimXPosition = new BABYLON.Vector3();
    let aimYPosition = new BABYLON.Vector3();
    let aimYRotation = new BABYLON.Quaternion();
    let aimXRotation = new BABYLON.Quaternion();
    rotX.decompose(aimXPosition, aimXRotation);
    rotY.decompose(aimYPosition, aimYRotation);
    return {
      aimXPosition,
      aimXRotation,
      aimYPosition,
      aimYRotation

    }
  }
  
  positionPlayers(){

    // const midX = Math.floor(this.arena.ground.cellCount / 2);
    // const midZ = Math.floor(this.arena.ground.cellCount / 4);
    const midX = 0; ///TODO: fix this
    const midZ = 0;

    //position the first player
    const homePosition = new BABYLON.Vector3(midX,TANK_POS_HEIGHT, midZ);
    this.players[0].tank.transform.position = homePosition;

    //postion the second player
    const reflectionMatrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI);
    this.players[1].tank.transform.position = BABYLON.Vector3.TransformCoordinates(
      homePosition,
      reflectionMatrix
    );

    //fix both players height/ rotation
    for(let i = 0; i < 2; ++i){
      this.players[i].tank.setUpright();
      this.players[i].tank.resetCannon();
    }
  }
}
