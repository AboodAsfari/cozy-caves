# Dungeon Generation

## Binary space partitioning (BSP) Algorithm
Recursively divides the bounding space into smaller and smaller regions until the termination criteria is met. A hierarchical binary tree structure is formed which allows for easy manipulation of the space in order to create coherent and interesting map layouts. Post processing done on the basic map structure that the BSP algorithm provides include Room Generation through communication with other modules, as well as randomized room culling to introduce increased map complexity. 

## BSP Input Parameters

**Height/Width** - Determines overall map dimensions in terms of number of cells.

**minGap** - Determines the minimum number of cells between 2 partitions. Is used to ensure rooms are not too small due to partitions being too close. Is used in calculations determining random partition placement as well as in termination criteria. This value is a factor in contributing to the average room sizes as well as contributing to the overall number of parititons/rooms in the final map, a larger minimum gap leads to larger rooms.

**maxDepth** - Determines maximum number of recursions. Is used for termination critera. This value is a factor in contributing to the overall number of partitions/rooms in the final map, higher maximum depth results in more partitions/rooms. Due to termination criteria and calculations for random partition placement, the 'minGap' has more influence over final map layout as a partition is only placed if it meets the 'minGap' criteria even if we have not reached the maximum depth.

## Integration with other modules
TBD

## Notes on algorithm behaviour
    
- Due to the current calculations for termination criteria as well as partition placement, layouts often end up with a few "long rectangle" room spaces. While maximum depth may be used to increase number of rooms as more partitions will be considered for placement, there is a limit to this as even past a certain point the "long rectangles" remain unaffected by any further increases to maximum depth. As the spaces created through the BSP algorithm are just dimensions for us to provide to the Room Generation Module and not the final rooms themselves we may consider experimenting how we choose to handle these spaces once implementing room culling or further review of our termination criteria/partition placement calculations.

- While minimum gap can still be adjusted to suit the needs of the user, values lower than 5 tend towards being unusable as room spaces to provide to the Room Generation module become too small.

- In smaller maps (75x75 and smaller), a maximum depth of 5-7 typically provides map layouts with a balance of multiple smaller rooms and 1-2 larger rooms. This combination works well to provide maps that require a form of "narrative" such as a dungeon leading to a boss room. 

- Suitable maximum depth for medium sized maps (100x100 - 150x150) ranges from 10-12. Lower end provides more narrative suitable layouts while higher end leads to more complex room layouts.

- Suitable maximum depth for larger rooms (175x175 and bigger) begins at 13 and from there further customization will be available to the user as the number of recursions to properly partition larger and larger maps will slowly increase. The "soft cap" on maximum depth discussed earlier also increases relative to the dimensions of the map. 

- Customizability offered to the user will begin with different preset values for small, medium, and large maps. This can then be further modified to slightly alter individual parameters to a certain degree. Allowing the user complete control over the input parameters may be implemented but with the understanding that "nonsense values" could cause unpredictable behaviour.