'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import BuilderFlow from '@/components/BuilderFlow';
import { Node, Edge } from 'reactflow';

interface WorkflowSummary {
  totalNodes: number;
  totalEdges: number;
  hasStartNode: boolean;
  hasEndNode: boolean;
  validationErrors: string[];
}

export default function BuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved');
  const [workflowSummary, setWorkflowSummary] = useState<WorkflowSummary>({
    totalNodes: 0,
    totalEdges: 0,
    hasStartNode: false,
    hasEndNode: false,
    validationErrors: []
  });

  // Load saved workflow from localStorage
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('civic-workflow');
    if (savedWorkflow) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedWorkflow);
        setNodes(savedNodes || []);
        setEdges(savedEdges || []);
        setSavedStatus('saved');
      } catch (error) {
        console.error('Error loading saved workflow:', error);
      }
    }
  }, []);

  // Auto-save workflow
  const saveWorkflow = useCallback(() => {
    setSavedStatus('saving');
    const workflowData = {
      nodes,
      edges,
      savedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('civic-workflow', JSON.stringify(workflowData));
      setTimeout(() => setSavedStatus('saved'), 500);
    } catch (error) {
      console.error('Error saving workflow:', error);
      setSavedStatus('unsaved');
    }
  }, [nodes, edges]);

  // Auto-save when nodes or edges change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWorkflow();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [nodes, edges, saveWorkflow]);

  // Validate workflow
  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];
    
    // Check for exactly 1 start node
    const startNodes = nodes.filter(node => node.type === 'input');
    if (startNodes.length === 0) {
      errors.push('Workflow must have exactly 1 Start node');
    } else if (startNodes.length > 1) {
      errors.push('Workflow can only have 1 Start node');
    }
    
    // Check for at least 1 end node
    const endNodes = nodes.filter(node => node.type === 'output');
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least 1 Resolution/End node');
    }
    
    // Check for disconnected nodes (except start node)
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    const disconnectedNodes = nodes.filter(node => 
      node.type !== 'input' && !connectedNodeIds.has(node.id)
    );
    
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are disconnected from the workflow`);
    }
    
    // Check for nodes without outgoing connections (except end nodes)
    const nodesWithoutOutgoing = nodes.filter(node => 
      node.type !== 'output' && !edges.some(edge => edge.source === node.id)
    );
    
    if (nodesWithoutOutgoing.length > 0) {
      errors.push(`${nodesWithoutOutgoing.length} node(s) have no outgoing connections`);
    }
    
    return errors;
  }, [nodes, edges]);

  // Update workflow summary
  useEffect(() => {
    const validationErrors = validateWorkflow();
    const hasStartNode = nodes.some(node => node.type === 'input');
    const hasEndNode = nodes.some(node => node.type === 'output');
    
    setWorkflowSummary({
      totalNodes: nodes.length,
      totalEdges: edges.length,
      hasStartNode,
      hasEndNode,
      validationErrors
    });
  }, [nodes, edges, validateWorkflow]);

  // Export workflow as JSON
  const exportWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      metadata: {
        name: 'Civic Issue Resolution Workflow',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        summary: workflowSummary
      }
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'civic-workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export as PNG (simplified version)
  const exportAsPNG = () => {
    // This would require additional implementation with html2canvas or similar
    alert('PNG export requires additional setup. JSON export is available.');
  };

  // Generate workflow preview steps
  const generateWorkflowPreview = () => {
    const steps: string[] = [];
    
    // Find start node
    const startNode = nodes.find(node => node.type === 'input');
    if (startNode) {
      steps.push('Start → ' + (startNode.data.label as string));
      
      // Follow the path
      let currentNodeId = startNode.id;
      const visited = new Set<string>();
      
      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const nextEdge = edges.find(edge => edge.source === currentNodeId);
        
        if (nextEdge) {
          const nextNode = nodes.find(node => node.id === nextEdge.target);
          if (nextNode) {
            steps.push('→ ' + (nextNode.data.label as string));
            currentNodeId = nextNode.id;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
    
    return steps;
  };

  const workflowPreview = generateWorkflowPreview();

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Civic Workflow Builder</h1>
              <p className="text-gray-600 mt-2">Design automated civic issue resolution processes</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showPreview 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showPreview ? 'Edit Mode' : 'Preview Workflow'}
              </button>
              
              <button
                onClick={exportWorkflow}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Export JSON
              </button>
              
              <button
                onClick={exportAsPNG}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Export PNG
              </button>
            </div>
          </div>
          
          {/* Save Status */}
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              savedStatus === 'saved' ? 'bg-green-500' :
              savedStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {savedStatus === 'saved' ? 'All changes saved' :
               savedStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Builder Area */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              {showPreview ? (
                /* Preview Mode */
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Workflow Preview</h2>
                  
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="font-semibold text-emerald-800 mb-3">Process Flow</h3>
                    <div className="space-y-2">
                      {workflowPreview.length > 0 ? (
                        workflowPreview.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-gray-800">{step}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No workflow defined. Add nodes to create a workflow.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Workflow Statistics</h3>
                      <div className="space-y-1 text-sm">
                        <p>Total Steps: {workflowSummary.totalNodes}</p>
                        <p>Total Connections: {workflowSummary.totalEdges}</p>
                        <p>Start Node: {workflowSummary.hasStartNode ? '✅ Yes' : '❌ No'}</p>
                        <p>End Node: {workflowSummary.hasEndNode ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Validation Status</h3>
                      <div className="space-y-1 text-sm">
                        {workflowSummary.validationErrors.length === 0 ? (
                          <p className="text-green-600">✅ Workflow is valid</p>
                        ) : (
                          <div className="text-red-600">
                            <p>❌ {workflowSummary.validationErrors.length} error(s)</p>
                            <ul className="mt-1 space-y-1">
                              {workflowSummary.validationErrors.map((error, index) => (
                                <li key={index} className="text-xs">• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Interactive Workflow Designer</h2>
                    <p className="text-gray-600">
                      Drag nodes to rearrange. Connect nodes to create the civic issue resolution workflow.
                    </p>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                    <BuilderFlow 
                      nodes={nodes}
                      edges={edges}
                      setNodes={setNodes}
                      setEdges={setEdges}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflow Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nodes</span>
                  <span className="font-semibold">{workflowSummary.totalNodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Connections</span>
                  <span className="font-semibold">{workflowSummary.totalEdges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Node</span>
                  <span className={`font-semibold ${workflowSummary.hasStartNode ? 'text-green-600' : 'text-red-600'}`}>
                    {workflowSummary.hasStartNode ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolution Node</span>
                  <span className={`font-semibold ${workflowSummary.hasEndNode ? 'text-green-600' : 'text-red-600'}`}>
                    {workflowSummary.hasEndNode ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              {/* Validation Errors */}
              {workflowSummary.validationErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Validation Errors</h4>
                  <ul className="space-y-1 text-sm text-red-600">
                    {workflowSummary.validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setNodes([]);
                    setEdges([]);
                    setSavedStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Clear Workflow
                </button>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('civic-workflow');
                    setSavedStatus('unsaved');
                  }}
                  className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Delete Saved
                </button>
                
                <button
                  onClick={saveWorkflow}
                  className="w-full px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                >
                  Save Now
                </button>
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Drag nodes from the panel to add them</p>
                <p>• Connect nodes by dragging from connection points</p>
                <p>• Must have exactly 1 Start node</p>
                <p>• Must have at least 1 Resolution node</p>
                <p>• All nodes should be connected</p>
                <p>• Workflow auto-saves every change</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
