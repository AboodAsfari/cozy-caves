# Dungeon Generation

## Binary space partitioning (BSP) Algorithm
Recursively divides the bounding space into smaller and smaller regions until the termination criteria is met. A hierarchical binary tree structure is formed which allows for easy manipulation of the space in order to create coherent and interesting map layouts. Post processing done on the basic map structure that the BSP algorithm provides include Room Generation through communication with other modules, as well as randomized room culling to introduce increased map complexity. 

## BSP Input Parameters

**height/width** - Determines overall map dimensions in terms of number of cells.

**minGap** - Determines the minimum number of cells between 2 partitions. Is used to ensure rooms are not too small due to partitions being too close. Is used in calculations determining random partition placement as well as in termination criteria. This value is a factor in contributing to the average room sizes as well as contributing to the overall number of parititons/rooms in the final map, a larger minimum gap leads to larger rooms. 

**maxDepth** - Determines maximum number of recursions. Is used for termination critera. This value is a factor in contributing to the overall number of partitions/rooms in the final map, higher maximum depth results in more partitions/rooms. Due to termination criteria and calculations for random partition placement, the 'minGap' has more influence over final map layout as a partition is only placed if it meets the 'minGap' criteria even if we have not reached the maximum depth.

**seed** - Determines the sequence of randomly generated numbers throughout the algorithm, by default will be a purely randomly generated number but setting to a particular value allows for reproducible results. Current testing setup shows a sequence of maps being generated all through the same seed, new executions with the same seed will produce the same sequence of maps - Once integration with other modules is done and testing setup is no longer needed then a single reproducible map should be generated.

**totalCoverage** - Determines the desired amount of the overall map area that should be covered by rooms. 

## Integration with other modules
TBD

## Notes on algorithm behaviour

- While minimum gap can still be adjusted to suit the needs of the user, values lower than 5 tend towards being unusable as room spaces to provide to the Room Generation module become too small. After some discussion, integration with Room Module may require the minGap value to be slightly bigger than the minimum room size to allow for some leniency in room generation to allow for a chance of more different layouts as well as hallways. This means that in the future minimum room size may be kept as a separate variable than minimum gap to futher help distinguish between the two.

- In smaller maps (75x75 and smaller), a maximum depth of 5-7 typically provides map layouts with a balance of multiple smaller rooms and 1-2 larger rooms. This combination works well to provide maps that require a form of "narrative" such as a dungeon leading to a boss room. 

- Suitable maximum depth for medium sized maps (100x100 - 150x150) ranges from 10-12. Lower end provides more narrative suitable layouts while higher end leads to more complex room layouts.

- Suitable maximum depth for larger rooms (175x175 and bigger) begins at 13 and from there further customization will be available to the user as the number of recursions to properly partition larger and larger maps will slowly increase. The "soft cap" on maximum depth discussed earlier also increases relative to the dimensions of the map. 

- Customizability offered to the user will begin with different preset values for small, medium, and large maps. This can then be further modified to slightly alter individual parameters to a certain degree. Allowing the user complete control over the input parameters may be implemented but with the understanding that "nonsense values" could cause unpredictable behaviour. In the future this map be limited to avoid unpredictable behaviour.