declare module 'your-module-name' {
  type ActionFunction = (context: any) => Promise<any>;

  interface Step {
    action: string;
    transitions: {
      true?: string;
      false?: string;
      next?: string;
    };
    conditions?: Condition | ConditionGroup;
  }

  interface Condition {
    key: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equals' | 'lesser_than' | 'lesser_than_or_equals' | 'in' | 'not_in' | 'range' | 'range_not_in';
    value: any;
  }

  interface ConditionGroup {
    operator: 'AND' | 'OR';
    conditions: (Condition | ConditionGroup)[];
  }

  interface Blueprint {
    start: string;
    steps: Record<string, Step>;
  }

  interface Logger {
    log: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  }

  interface WorkflowExecutorOptions {
    rethrowErrors?: boolean;
    loggingEnabled?: boolean;
    logger?: Logger;
  }

  class WorkflowExecutor {
    constructor(blueprint: Blueprint, actions: Record<string, ActionFunction>, options?: WorkflowExecutorOptions);

    execute(context?: any, currentStep?: string): Promise<void>;
    saveState(context: any, currentStep: string): string;
    loadState(state: string): { context: any; currentStep: string };
    getMetrics(): { stepsExecuted: number; errors: number; executionTimes: Record<string, string> };
  }

  export = WorkflowExecutor;
} 