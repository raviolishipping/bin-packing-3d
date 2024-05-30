3D bin packing (Ravioli Edition)
====

JavaScript solution for 3D bin packing problem adapted to our use case at Ravioli.

## Basics

All interactions happen with 3 main object types:

**Bin** - space (rectangular cuboid) which is being filled with Items. 

```js
let myBin = new Bin(name, width, height, depth, max_weight);
```

**Item** - box (also a rectangular cuboid) which is being placed in Bin.

```js
let myItem = new Item(name, width, height, depth, max_weight);
```

**Packer** - object through which packing is performed. Packer has three main methods:

```js
let packer = Packer();       // Packer definition

packer.addBin(myBin);       // Adding bin to packer
packer.addItem(myItem);     // Adding item to bin

packer.pack();               // Packing items to bins. Returns true if all items fit into the bins
```
`pack(bigger_first, distribute_items)` props:
- `bigger_first` *(boolean)* - By default all the bins and items are sorted from the smallest to the biggest.
- `distribute_items` *(boolean)*
    - *true* => From a list of bins and items, put the items in the bins that at least one item be in one bin that can be fitted. That is, distribute all the items in all the bins so that they can be contained.  
    - *false* (default) => From a list of bins and items, try to put all the items in each bin and in the end it show per bin all the items that was fitted and the items that was not.

## Example

```js
let packer = new Packer();

packer.addBin(new Bin('Big Box', 11.5, 6.125, 0.25, 10));

packer.addItem(new Item('Small Package of Ravioli', 10.2, 3, 15.8, 1));
packer.addItem(new Item('Big Package of Ravioli', 12, 6.2, 20.6, 2));

const packed = packer.pack();

console.log("All items fit into the bin: ${packed}");
```

## Credits
* https://github.com/Etam1ne/bin-packing-3d
* https://github.com/bom-d-van/binpacking
* https://github.com/gedex/bp3d
* https://github.com/enzoruiz/3dbinpacking
* [Optimizing three-dimensional bin packing through simulation](https://github.com/enzoruiz/3dbinpacking/blob/master/erick_dube_507-034.pdf)

## License

[MIT](./LICENCE)
