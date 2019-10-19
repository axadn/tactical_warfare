import * as BABYLON from  '@babylonjs/core';
export const TANK_POS_HEIGHT = 2;
export default class Tank{
  transform: BABYLON.TransformNode;
  private aimY: BABYLON.TransformNode;
  private aimX: BABYLON.TransformNode;
  private physicsImpostor: BABYLON.PhysicsImpostor;
  private steerInput: BABYLON.Vector3;
  private steerForce: BABYLON.Vector3;

  constructor({scene, aimXPosition, aimXRotation, aimYPosition, aimYRotation} :
              {
              scene: BABYLON.Scene,
              aimXPosition: BABYLON.Vector3,
              aimXRotation: BABYLON.Quaternion,
              aimYPosition: BABYLON.Vector3,
              aimYRotation: BABYLON.Quaternion}){

    this.update = this.update.bind(this);
    this.transform = new BABYLON.TransformNode('tank');

    this.aimY = new BABYLON.TransformNode('aimY');
    this.aimX = new BABYLON.TransformNode('aimX');

    this.aimY.setAbsolutePosition(aimYPosition);
    this.aimY.rotationQuaternion = aimYRotation;

    this.aimX.setAbsolutePosition(aimXPosition);
    this.aimX.rotationQuaternion = aimXRotation;

    this.aimY.setParent(this.aimX);
    this.aimX.setParent(this.transform);

    this.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.transform as BABYLON.Mesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 2, restitution: 0 },
      scene
    );

    this.steerInput = new BABYLON.Vector3(0,0,0);
  }
  update(){
    if(this.steerInput.x !== 0 || this.steerInput.z !== 0){
      this.steerInput.normalize();
      BABYLON.Vector3.TransformNormalToRef(
        this.steerInput,
        this.transform.getWorldMatrix(),
        this.steerForce);
      this.physicsImpostor.applyImpulse(this.steerForce, this.transform.position);
    }
  }
  setUpright(){
    BABYLON.Quaternion.RotationAxisToRef(BABYLON.Vector3.Up(),
        Math.PI, this.transform.rotationQuaternion);
  }
  receiveAimingCoordinates(coords: BABYLON.Vector2){
    this.aimY.rotation.y = coords.y;
    this.aimX.rotation.x = coords.x;
  }
  receiveSteeringCoordinates(vector: BABYLON.Vector2){
    this.steerInput.x = vector.x;
    this.steerInput.y = 0;
    this.steerInput.z = vector.y;
  }
  getState(){
    return {
      position: this.transform.getAbsolutePosition() ,
      rotation: this.transform.rotationQuaternion,
      aimX: this.aimX.rotation.x,
      aimY : this.aimY.rotation.y
      };
  }
  setState(state){
    this.transform.position = state.position;
    this.transform.rotationQuaternion = state.rotation;
    this.aimX.rotation.x = state.aimX;
    this.aimY.rotation.y = state.aimY;
  }
  resetCannon() {
    this.aimX.rotation.x = 0;
    this.aimY.rotation.y = 0;
  }
}