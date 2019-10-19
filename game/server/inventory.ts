export default class Inventory{
    coolDowns: Map<string, number>;
    unusableItems: Set<string>;

    constructor(coolDowns: Map<string, number>){
        this.coolDowns = coolDowns;
        this.unusableItems = new Set();
    }

    useItem(itemName: string){
        if(!this.coolDowns.has(itemName) || this.unusableItems.has(itemName)){
            return false;
        }
        else{   
            this.unusableItems.add(itemName);
            setTimeout(()=>
            {
                this.unusableItems.delete(itemName);
            }, this.coolDowns.get(itemName));
            return true;
        }
    }
}