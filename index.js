// based on https://github.com/Etam1ne/bin-packing-3d
// MIT License
// Copyright (C) 2023 etamine <etam1ne@icloud.com>

const rotationType = {
    RT_WHD: 0,
    RT_HWD: 1,
    RT_HDW: 2,
    RT_DHW: 3,
    RT_DWH: 4,
    RT_WDH: 5,
}
rotationType.ALL = [
    rotationType.RT_WHD, 
    rotationType.RT_HWD, 
    rotationType.RT_HDW, 
    rotationType.RT_DHW, 
    rotationType.RT_DWH, 
    rotationType.RT_WDH
]

const axis = {
    WIDTH: 0,
    HEIGHT: 1,
    DEPTH: 2,

}
axis.ALL = [axis.WIDTH, axis.HEIGHT, axis.DEPTH]

const START_POSITION = [0, 0, 0];

function rect_intersect(item1, item2, x, y) {
    let d1 = item1.getDimensions()
    let d2 = item2.getDimensions()

    let cx1 = item1.position[x] + d1[x]/2
    let cy1 = item1.position[y] + d1[y]/2
    let cx2 = item2.position[x] + d2[x]/2
    let cy2 = item2.position[y] + d2[y]/2

    let ix = Math.max(cx1, cx2) - Math.min(cx1, cx2)
    let iy = Math.max(cy1, cy2) - Math.min(cy1, cy2)

    return ix < (d1[x]+d2[x])/2 && iy < (d1[y]+d2[y])/2
}

function intersect(item1, item2) {
    return (
        rect_intersect(item1, item2, axis.WIDTH, axis.HEIGHT) &&
        rect_intersect(item1, item2, axis.HEIGHT, axis.DEPTH) &&
        rect_intersect(item1, item2, axis.WIDTH, axis.DEPTH)
    )
}

const shuffleArray = array => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray
}


class Item {
    name;
    width;
    height;
    depth;
    weight;
    rotation_type;
    position;
    constructor(name, width, height, depth, weight) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.weight = weight;
        this.rotation_type = 0;
        this.position = START_POSITION;
    }

    getVolume() {
        return this.width * this.height * this.depth
    }

    getDimensions() {
        switch (this.rotation_type) {
            case rotationType.RT_WHD:
                return [this.width, this.height, this.depth]
            
            case rotationType.RT_HWD:
                return [this.height, this.width, this.depth]
            
            case rotationType.RT_HDW:
                return [this.height, this.depth, this.width]

            case rotationType.RT_DHW:
                return [this.depth, this.height, this.width]
            
            case rotationType.RT_DWH:
                return [this.depth, this.width, this.height]
            
            case rotationType.RT_WDH:
                return [this.width, this.depth, this.height]
            
            default:
                return []
        }
    }
}

class Bin {
    name;
    width;
    height;
    depth;
    max_weight;
    constructor(name, width, height, depth, max_weight) {
        this.name = name
        this.width = width
        this.height = height
        this.depth = depth
        this.max_weight = max_weight
        this.items = []
        this.unfitted_items = []
    }

    getVolume() {
        return this.width * this.height * this.depth
    }

    // not used currently
    getTotalWeight() {
        let total_weight = 0

        for (let i = 0; i < this.items.length; i++) {
            total_weight += this.items[i].weight
        }

        return total_weight
    }

    binVolume() {
        return this.width * this.height * this.depth
    }

    putItem(item, pivot) {
        let fit = false
        let valid_item_position = item.position
        item.position = pivot

        const shuffeledRotationTypes = shuffleArray(rotationType.ALL)

        for (let i = 0; i < shuffeledRotationTypes.length; i++) {
            item.rotation_type = shuffeledRotationTypes[i]
            let dimension = item.getDimensions()
            // checks if one side of the current item is bigger than one side of the bin
            // rotates trough all possible rotations of the item and checks again
            if (
                this.width < pivot[0] + dimension[0] ||
                this.height < pivot[1] + dimension[1] ||
                this.depth < pivot[2] + dimension[2]
            ) {
                continue // if one side is bigger, skips rest of for loop and goes back to next iteration (rotationType.All)
            }

            fit = true

            for (let j = 0; j < this.items.length; j++) {
                if (intersect(this.items[j], item)) {
                    fit = false
                    break
                }
            }

            if (fit) {
                // don't need weight right now
                // if (this.getTotalWeight() + item.weight > this.max_weight) {
                //     fit = false
                //     return fit
                // }
                this.items.push(item)
            }
            else { // if no fit
                item.position = valid_item_position
            }

            return fit
        }
        
        // why is this necessary?
        if (fit !== true) {
            item.position = valid_item_position
        }

        return fit
    }
}

class Packer {
    bins
    items
    unfit_items
    total_items
    constructor() {
        this.bins = []
        this.items = []
        this.unfit_items = []
        this.total_items = 0
    }

    addBin(bin) {
        return this.bins.push(bin)
    }

    addItem(item) {
        this.total_items = this.items.length + 1

        return this.items.push(item)
    }

    totalItemsVolume() {
        return this.items.reduce((totalVolume, currentItem) => {
            return totalVolume + currentItem.width * currentItem.height * currentItem.depth
        }, 0)
    }

    packToBin(bin, item) {
        let fitted = false
        if (bin.items.length === 0) {
            // if no items are in bin yet
            let response = bin.putItem(item, START_POSITION)

            if (!response) {
                return false
            }

            return true
        }
        for (let i = 0; i < 3; i++) {
            // if there are already items in the bin, we need to find a good starting position for this item
            // TODO: rename "pivot" to "position" to make it clearer
            let items_in_bin = bin.items

            for (let j = 0; j < items_in_bin.length; j++) {
                let pivot = [0, 0, 0]
                let [ w, h, d ] = items_in_bin[j].getDimensions()
                let addToPivot;
                if (i == axis.WIDTH) {
                    addToPivot = w + items_in_bin[j].position[0]
                    pivot = [
                        addToPivot,
                        items_in_bin[j].position[1],
                        items_in_bin[j].position[2]
                    ]
                }
                else if (i == axis.HEIGHT) {
                    addToPivot = items_in_bin[j].position[1] + h
                    pivot = [
                        items_in_bin[j].position[0],
                        addToPivot,
                        items_in_bin[j].position[2]
                    ]
                }
                else if (i == axis.DEPTH) {
                    addToPivot = items_in_bin[j].position[2] + d
                    pivot = [
                        items_in_bin[j].position[0],
                        items_in_bin[j].position[1],
                        addToPivot
                    ]
                }

                if (bin.putItem(item, pivot)) {
                    fitted = true
                    return true
                    break
                }
            }
            if (fitted) break
        }
        if (fitted === false) {
            return false
        }
    }

    pack(
        bigger_first=false, distribute_items=false
    ) {
        // calculate total volume in function, if larger than volume of bin, return false
        for (let i = 0; i < this.bins.length; i++) {
            if (this.totalItemsVolume() > this.bins[i].binVolume()) {
                return false
            }
        }
        
        this.bins.sort((a, b) => {
            if (!bigger_first) {
                return a.getVolume() - b.getVolume();
            }
            else {
                return b.getVolume() - a.getVolume();
            }
        })
        this.items.sort((a, b) => {
            if (!bigger_first) {
                return a.getVolume() - b.getVolume();
            }
            else {
                return b.getVolume() - a.getVolume();
            }
        })

        var retryCounter = 0;

        for (let i = 0; i < this.bins.length; i++) {
            for (let j = 0; j < this.items.length; j++) {
                if (!this.packToBin(this.bins[i], this.items[j])) {
                    this.bins[i].items = []
                    this.bins[i].unfit_items = []
                    for (let k = 0; k < this.items.length; k++) {
                        this.items[k].rotation_type = 0;
                        this.items[k].position = START_POSITION;
                    }
                    j = -1
                    retryCounter++
                    if (retryCounter === 20) {
                        this.bins[i].unfitted_items.push(this.items[j + 1]);
                        return false;
                    }
                }
            }
            if (distribute_items) {
                for (let k = 0; k < this.bins[i].items.length; k++) {
                    this.items.slice(k, 1)
                }
            }
        }
        return true
    }
}
