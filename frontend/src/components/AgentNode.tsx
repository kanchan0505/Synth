"use client";

export type AgentState = "waiting" | "active" | "done";

interface Props {
  icon: string;
  name: string;
  state: AgentState;
  status: string;
}

export default function AgentNode({ icon, name, state, status }: Props) {
  return (
    <div className={`agent-node ${state}`}>
      <div className="agent-node-icon">{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
        <div className="agent-node-status">{status}</div>
      </div>
      <div className={`status-dot ${state}`} />
    </div>
  );
}
