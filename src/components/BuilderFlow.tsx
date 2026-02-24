'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface BuilderFlowProps {
  nodes?: Node[];
  edges?: Edge[];
  setNodes?: (nodes: Node[]) => void;
  setEdges?: (edges: Edge[]) => void;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Report Issue\nUser uploads image\n& location' },
    position: { x: 250, y: 0 },
    style: {
      background: '#10B981',
      color: 'white',
      border: '2px solid #059669',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
  {
    id: '2',
    data: { label: 'AI Detection\nPlate recognition\n& authenticity check' },
    position: { x: 250, y: 150 },
    style: {
      background: '#3B82F6',
      color: 'white',
      border: '2px solid #2563EB',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
  {
    id: '3',
    data: { label: 'Verification\nManual review\n& priority assessment' },
    position: { x: 250, y: 300 },
    style: {
      background: '#8B5CF6',
      color: 'white',
      border: '2px solid #7C3AED',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
  {
    id: '4',
    data: { label: 'Notify Authorities\nSend alerts to\nrelevant departments' },
    position: { x: 100, y: 450 },
    style: {
      background: '#F59E0B',
      color: 'white',
      border: '2px solid #D97706',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
  {
    id: '5',
    data: { label: 'Self-Correction\nSend notice to\nvehicle owner' },
    position: { x: 400, y: 450 },
    style: {
      background: '#EF4444',
      color: 'white',
      border: '2px solid #DC2626',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
  {
    id: '6',
    type: 'output',
    data: { label: 'Resolution\nIssue fixed\n& case closed' },
    position: { x: 250, y: 600 },
    style: {
      background: '#22C55E',
      color: 'white',
      border: '2px solid #16A34A',
      borderRadius: '8px',
      padding: '20px',
      width: 200,
      fontSize: '14px',
      textAlign: 'center',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
];

export default function BuilderFlow({ nodes: externalNodes, edges: externalEdges, setNodes: externalSetNodes, setEdges: externalSetEdges }: BuilderFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(externalNodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(externalEdges || initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      externalSetEdges?.(newEdges);
    },
    [edges, setEdges, externalSetEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      externalSetNodes?.(newNodes);
    },
    [nodes, setNodes, externalSetNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      externalSetEdges?.(newEdges);
    },
    [edges, setEdges, externalSetEdges]
  );

  const nodeTypes = useMemo(() => ({}), []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '700px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          style={{
            height: 120,
            backgroundColor: '#f8f9fa',
          }}
          zoomable
          pannable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
