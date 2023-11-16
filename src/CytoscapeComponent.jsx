import React, { useEffect, useState, useRef } from "react";
import cytoscape from "cytoscape";
import compoundDragAndDrop from "cytoscape-compound-drag-and-drop";
import fcose from 'cytoscape-fcose';
import gridGuide from 'cytoscape-grid-guide';
import cola from "cytoscape-cola";


try {
  cytoscape.use(compoundDragAndDrop);
  cytoscape.use( fcose );
  cytoscape.use( gridGuide );
  cytoscape.use( cola );
} catch (e) {}

const CytoscapeComponent = () => {
    const [newNodeLabel, setNewNodeLabel] = useState(""); // State variable for the new node label
    const [newParentLabel, setNewParentLabel] = useState(""); // State variable for the new node label
    const cyRef = useRef(); // Reference to the Cytoscape instance

    // Function to add a new node
    const addNode = (label, nodeType) => {
        if (cyRef.current) {
            console.log(label, nodeType);
            cyRef.current.add({
                data: { id: label, type: nodeType, label: label },
                position: { x: 500, y: 300 },
            });
        }
    };

    // Event handler for adding a node
    const handleAddNode = () => {
        if (newNodeLabel) {
            console.log("handleAddNode Node");
            addNode(newNodeLabel, "function");
            setNewNodeLabel(""); // Clear the input field
        }
        else if (newParentLabel) {
            console.log("handleAddNode Parent", newParentLabel);
            addNode(newParentLabel, "system");
            setNewParentLabel(""); // Clear the input field
        }
    };

    useEffect(() => {
        const cy = cytoscape({
            container: document.getElementById("cy"),
            ready: function () {
                this.compoundDragAndDrop({
                    dropTarget: (dropTarget, grabbedNode) => {
                        if (grabbedNode.data('type') === 'function') {
                            if (dropTarget.data('type') === 'system') {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                    },
                    newParentNode: (grabbedNode, dropSibling) => {
                        console.log('newparentnode')
                        return dropSibling;
                    }
                });
                this.gridGuide({
                    snapToGridOnRelease: true, // Snap to grid on release
                    snapToGridDuringDrag: false, // Snap to grid during drag
                    snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
                    snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
                    distributionGuidelines: false, // Distribution guidelines
                    geometricGuideline: false, // Geometric guidelines
                    initPosAlignment: false, // Guideline to initial mouse position
                    centerToEdgeAlignment: false, // Center to edge alignment
                    resize: false, // Adjust node sizes to cell sizes
                    parentPadding: false, // Adjust parent sizes to cell sizes by padding
                    drawGrid: true, // Draw grid background

                    // General
                    gridSpacing: 20, // Distance between the lines of the grid.
                    snapToGridCenter: false, // Snaps nodes to center of gridlines. When false, snaps to gridlines themselves. Note that either snapToGridOnRelease or snapToGridDuringDrag must be true.

                    // Draw Grid
                    zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
                    panGrid: false, // Determines whether the grid should move then the user moves the graph if grid is drawn.
                    gridStackOrder: -1, // Namely z-index
                    gridColor: '#dedede', // Color of grid lines
                    lineWidth: 1.0, // Width of grid lines

                    // Guidelines
                    guidelinesStackOrder: 4, // z-index of guidelines
                    guidelinesTolerance: 2.00, // Tolerance distance for rendered positions of nodes' interaction.
                    guidelinesStyle: { // Set ctx properties of line. Properties are here:
                        strokeStyle: "#8b7d6b", // color of geometric guidelines
                        geometricGuidelineRange: 400, // range of geometric guidelines
                        range: 100, // max range of distribution guidelines
                        minDistRange: 10, // min range for distribution guidelines
                        distGuidelineOffset: 10, // shift amount of distribution guidelines
                        horizontalDistColor: "#ff0000", // color of horizontal distribution alignment
                        verticalDistColor: "#00ff00", // color of vertical distribution alignment
                        initPosAlignmentColor: "#0000ff", // color of alignment to initial mouse location
                        lineDash: [0, 0], // line style of geometric guidelines
                        horizontalDistLine: [0, 0], // line style of horizontal distribution guidelines
                        verticalDistLine: [0, 0], // line style of vertical distribution guidelines
                        initPosAlignmentLine: [0, 0], // line style of alignment to initial mouse position
                    },
                    // Parent Padding
                    parentSpacing: -1 // -1 to set paddings of parents to gridSpacing
                });
            },
            layout: {
                name: 'grid'       
            },
            elements: {
                nodes: [
                    { data: { id: "a" , label: "Test", type: "function" } },
                    { data: { id: "b", type: "function", label: 'b' } },
                    { data: { id: "c", type: "function", label: 'c'  } },
                    { data: { id: "d", parent: "p", type: "function", label: 'd' } },
                    { data: { id: "p", label: 'IT System', type: "system"} }
                ],
                edges: []
            },
            style: [
                {
                    selector: "node[type='function']",
                    style: {
                        label: "data(label)",
                        shape: "round-rectangle",
                        backgroundColor: "blue"
                        //textValign : "center",
                        //textHalign : "center"
                    }
                },
                {
                    selector: "node[type='system']",
                    style: {
                        label: "data(label)",
                        shape: "rectangle",
                        backgroundColor: "red"
                    }
                }
            ]
        });
        
        // Store the Cytoscape instance in the ref
        cyRef.current = cy;

        cy.on('cdndout', (event, dropTarget) => {
            console.log('out',event);
            console.log('out',event.target.data());
            console.log('out',dropTarget.data());
        })

        // cy.on('cdndover', (event, dropTarget) => {
        //     console.log(event.target.data());
        //     // if (event.target.data('type') === 'function') {

        //     // }
        //     console.log(dropTarget.data());
        //     //console.log('Node dragged over another node:', grabbedNode.data(), event, dropTarget.data(), dropSibling.data());
        //   });

        // Add a click event listener to log selected nodes to the console
        cy.on('boxend', function(evt) {
            
            // Use setTimeout to delay the retrieval of selected nodes
            setTimeout(function() {
                // Get the selected nodes directly
                const selectedNodes = cy.nodes(':selected');
                
                console.log('Selected nodes:', selectedNodes.size());
                
                selectedNodes.forEach((node) => {
                    console.log('Selected node id:', node.id());
                    console.log(newParentLabel)
                    node.move({parent: newParentLabel});
                    console.log(node);
                    })
                });

            // Create a new compound node and add the selected nodes to it
            cy.add({
                data: {
                id: newParentLabel,
                label: newParentLabel,
                }
            });

            // 

            // Remove the selected nodes from the Cytoscape graph
            // selectedNodes.remove();

            // Add the new compound node to the Cytoscape graph
            // compoundNode.add(cy);
            cy.layout({name: 'grid'}).run();
            console.log(cy.nodes());
        }, []);
    
    }, []); // Empty dependency array ensures the effect runs once after the initial render

    return (
        <>
            <input
                type="text"
                placeholder="Funktion-Label"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
            />
            <button onClick={handleAddNode}>Funktion hinzufügen</button>
            <input
                type="text"
                placeholder="IT System-Label"
                value={newParentLabel}
                onChange={(e) => setNewParentLabel(e.target.value)}
            />
            <button onClick={handleAddNode}>IT System hinzufügen</button>
            <div 
                id="cy" 
                style={{ width: "100%", height: "1000px"}}
            />
        </>
    );
};

export default CytoscapeComponent;
