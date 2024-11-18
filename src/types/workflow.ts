export type WorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
export type ActionType = 
  | 'analysis' 
  | 'decision' 
  | 'automation' 
  | 'notification' 
  | 'integration' 
  | 'validation';

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  status: ActionStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  config: Record<string, any>;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  timeout?: number;
  result?: any;
  error?: Error;
  startedAt?: Date;
  completedAt?: Date;
}

export interface WorkflowState {
  id: string;
  name?: string;
  description?: string;
  actions: WorkflowAction[];
  status: WorkflowStatus;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: Error;
  metadata?: Record<string, any>;
  results?: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  condition: (workflow: WorkflowState) => boolean;
  action: (workflow: WorkflowState) => Promise<void>;
  priority: number;
  isEnabled: boolean;
}