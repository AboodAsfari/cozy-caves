# Dungeon Generation

## Binary space partitioning (BSP) Algorithm
Recursively divides the bounding space into smaller and smaller regions until the termination criteria is met. A hierarchical binary tree structure is formed which allows for easy manipulation of the space in order to create coherent and interesting map layouts. Post processing done on the basic map structure that the BSP algorithm provides include Room Generation through communication with other modules, as well as randomized room culling to introduce increased map complexity. 

## Input Parameters

**height/width** - Determines overall map dimensions in terms of number of cells.

**minRoomSize** - Determines the minimum height and width of a generated room, this is used to ensure partitions placed by BSP are not too close. 

**seed** - Determines the sequence of randomly generated numbers throughout the algorithm, by default will be a purely randomly generated number but setting to a particular value allows for reproducible results. Current testing setup shows a sequence of maps being generated all through the same seed, new executions with the same seed will produce the same sequence of maps - Once integration with other modules is done and testing setup is no longer needed then a single reproducible map should be generated.

**totalCoverage** - Determines the desired percentage of the overall map area that should be covered by rooms. 

## Integration with other modules
After generating a map layout through BSP, random regions are selected to be kept until the desired total coverage is met. Regions that are kept are then used to calculate random dimensions to pass onto the Room Generation module to create Room objects which are then stored in a list. This is then passed onto the Hallway Generation module to create connections between rooms and returned back containing all Rooms and Hallways, this is finally returned to the Rendering Module.   


