const trywrap = require('trywrap');

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 14);
  return (timestamp + random).padEnd(24, '0');
}

class WorkflowExecutor {
    constructor(blueprint, actions, options = {}) {
      this.blueprint = blueprint;
      this.actions = actions;
      this.rethrowErrors = options.rethrowErrors || true;
      this.loggingEnabled = options.loggingEnabled || true;
      this.logger = options.logger || console; // Use custom logger or default to console
      this.instanceId = this.loggingEnabled ? generateObjectId() : null;
      this.metrics = {
        stepsExecuted: 0,
        errors: 0,
        executionTimes: {}
      };
      this._validateBlueprint();
    }
  
    _validateBlueprint() {
      const steps = this.blueprint.steps;
      for (const stepName in steps) {
        const actionName = steps[stepName].action;
        if (typeof this.actions[actionName] !== 'function') {
          throw new Error(`Action ${actionName} is not defined for step ${stepName}`);
        }
      }
    }

    loggerMethod(message, level = 'log') {
      if (this.loggingEnabled) {
        const logMethod = this.logger[level] || this.logger.log || (() => {});
        logMethod(`[Instance ${this.instanceId}] ${message}`);
      }
    }

    getMetrics() {
      return this.metrics;
    }

    saveState(context, currentStep) {
      return JSON.stringify({ context, currentStep });
    }

    loadState(state) {
      const { context, currentStep } = JSON.parse(state);
      return { context, currentStep };
    }
  
    async execute(context = {}, currentStep = this.blueprint.start) {
      if (!currentStep || !this.blueprint.steps[currentStep]) {
        this.loggerMethod(`Invalid step: ${currentStep}`, 'warn');
        return;
      }
  
      const step = this.blueprint.steps[currentStep];
      const actionName = step.action;

      this.loggerMethod(`Starting execution of step: ${currentStep} with action: ${actionName}`);
      
      const startTime = Date.now();
      const result = await trywrap(this.actions[actionName], [context], {
        onError: ({ error, methodName, args }) => {
          this.loggerMethod(`Error in step ${currentStep} during ${methodName}: ${error}`, 'error');
          this.metrics.errors += 1;
        },
        rethrow: this.rethrowErrors
      });
      const endTime = Date.now();

      if (result === null) {
        this.loggerMethod(`Execution of step ${currentStep} was halted due to an error.`, 'warn');
        return;
      }

      this.metrics.stepsExecuted += 1;
      this.metrics.executionTimes[currentStep] = (endTime - startTime) + 'ms';
      this.loggerMethod(`Completed execution of step: ${currentStep} in ${endTime - startTime}ms`);

      const transitions = step.transitions;
      if (step.conditions) {
        const conditionResult = await trywrap(this.evaluateConditions.bind(this), [step.conditions, context], {
          onError: ({ error }) => {
            this.loggerMethod(`Error evaluating conditions for step ${currentStep}: ${error}`, 'error');
            this.metrics.errors += 1;
          },
          rethrow: this.rethrowErrors
        });

        if (conditionResult === null) {
          this.loggerMethod(`Condition evaluation for step ${currentStep} failed.`, 'warn');
          return;
        }

        this.loggerMethod(`Conditions evaluated for step ${currentStep}: ${conditionResult}`);
        const next = transitions[conditionResult];
        if (next) {
          this.loggerMethod(`Transitioning from step ${currentStep} to step ${next}`);
          return this.execute(context, next);
        } else {
          this.loggerMethod(`No valid transition found for condition result: ${conditionResult}`, 'warn');
        }
      }

      if (transitions.next) {
        this.loggerMethod(`Transitioning from step ${currentStep} to step ${transitions.next}`);
        return this.execute(context, transitions.next);
      }
    }

    evaluateConditions(conditions, context) {
        if (Array.isArray(conditions)) {
            return conditions.every(condition => this.evaluateCondition(condition, context));
        } else if (conditions.operator === 'OR') {
            return conditions.conditions.some(condition => this.evaluateCondition(condition, context));
        } else if (conditions.operator === 'AND') {
            return conditions.conditions.every(condition => this.evaluateCondition(condition, context));
        } else {
            return this.evaluateCondition(conditions, context);
        }
    }

    evaluateCondition(condition, context) {
        const { key, operator, value } = condition;
        if (!context.hasOwnProperty(key)) {
            this.loggerMethod(`Condition failed: context does not have key ${key}`);
            return false;
        }

        const contextValue = context[key];
        let result;

        switch (operator) {
            case 'equals':
                result = contextValue == value;
                break;
            case 'not_equals':
                result = contextValue != value;
                break;
            case 'greater_than':
                result = contextValue > value;
                break;
            case 'greater_than_or_equals':
                result = contextValue >= value;
                break;
            case 'lesser_than':
                result = contextValue < value;
                break;
            case 'lesser_than_or_equals':
                result = contextValue <= value;
                break;
            case 'in':
                result = Array.isArray(value) && value.includes(contextValue);
                break;
            case 'not_in':
                result = Array.isArray(value) && !value.includes(contextValue);
                break;
            case 'range':
                if (Array.isArray(value) && value.length === 2) {
                    const [min, max] = value;
                    result = contextValue >= min && contextValue <= max;
                } else {
                    result = false;
                }
                break;
            case 'range_not_in':
                if (Array.isArray(value) && value.length === 2) {
                    const [min, max] = value;
                    result = !(contextValue >= min && contextValue <= max);
                } else {
                    result = false;
                }
                break;
            case 'return_value':
                result = contextValue; // Return the value from the context
                break;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }

        this.loggerMethod(`Condition evaluated: key=${key}, operator=${operator}, value=${value}, contextValue=${contextValue}, result=${result}`);
        return result;
    }
}
  
module.exports = WorkflowExecutor;
