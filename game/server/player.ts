import Inventory from './inventory';
import Tank from './tank';
import { int, IOctreeContainer } from '@babylonjs/core';
import coolDowns from '../shared/inventory/cooldowns.json';
export default class Player{
    tank: Tank;
    private health: int;
    private funding: int;
    private inventory: Inventory;
    private socket: any;

    constructor({socket, tank}:{socket: any, tank: Tank}){
        this.tank = tank;
        this.health = 100;
        this.funding = 500;
        this.socket = socket;
        this.inventory = new Inventory(
            new Map<string,number>(Object.entries(coolDowns)));
    }

    assignSocket(socket){
        this.socket = socket;
    }
}