---

# WorkflowExecutor

![WorkflowExecutor](https://img.shields.io/badge/Workflow-Executor-blue.svg)

WorkflowExecutor is a flexible and powerful workflow engine designed to automate complex processes with ease. Whether you're building a simple decision tree or a complex multi-step process, WorkflowExecutor provides the tools you need to get the job done.

## Features

- **Dynamic Execution**: Define workflows with conditional logic and transitions.
- **Custom Actions**: Pass in your own functions to handle each step of the workflow.
- **Error Handling**: Built-in support for error handling and logging.
- **State Persistence**: Save and resume workflows at any point.
- **Metrics and Monitoring**: Track execution metrics for performance insights.
- **Custom Logger Support**: Integrate with your preferred logging library.

## Installation

To install WorkflowExecutor, use npm:

```bash
npm install workflow-executor
```

## Usage

### Basic Example

```javascript
const WorkflowExecutor = require('workflow-executor');

const workflow = {
  start: 'step1',
  steps: {
    step1: {
      action: 'action1',
      transitions: {
        true: 'step2',
        false: 'step3'
      },
      conditions: {
        key: 'someKey',
        operator: 'equals',
        value: 'someValue'
      }
    },
    step2: {
      action: 'action2',
      transitions: {
        next: 'step4'
      }
    },
    step3: {
      action: 'action3',
      transitions: {
        next: 'step4'
      }
    },
    step4: {
      action: 'action4',
      transitions: {
        next: null
      }
    }
  }
};

const actions = {
  async action1(context) {
    console.log("Performing action1");
    return context;
  },
  async action2(context) {
    console.log("Performing action2");
    return context;
  },
  async action3(context) {
    console.log("Performing action3");
    return context;
  },
  async action4(context) {
    console.log("Performing action4");
    return context;
  }
};

const context = {
  someKey: 'someValue'
};

const executor = new WorkflowExecutor(workflow, actions, { loggingEnabled: true });

executor.execute(context).then(() => {
  console.log('Workflow execution completed.');
}).catch(error => {
  console.error('Workflow execution failed:', error);
});
```

### Real-World Example: E-commerce Order Process

```javascript
// Define a sample workflow blueprint for an e-commerce order process
const orderWorkflow = {
  start: 'checkInventory',
  steps: {
    checkInventory: {
      action: 'checkInventoryAction',
      transitions: {
        true: 'processPayment',
        false: 'outOfStock'
      },
      conditions: {
        key: 'inventoryAvailable',
        operator: 'equals',
        value: true
      }
    },
    processPayment: {
      action: 'processPaymentAction',
      transitions: {
        true: 'shipOrder',
        false: 'paymentFailed'
      },
      conditions: {
        key: 'paymentSuccessful',
        operator: 'equals',
        value: true
      }
    },
    outOfStock: {
      action: 'outOfStockAction',
      transitions: {
        next: null
      }
    },
    paymentFailed: {
      action: 'paymentFailedAction',
      transitions: {
        next: null
      }
    },
    shipOrder: {
      action: 'shipOrderAction',
      transitions: {
        next: null
      }
    }
  }
};

// Define actions as methods for the order workflow
const orderActions = {
  async checkInventoryAction(context) {
    console.log("Checking inventory");
    context.inventoryAvailable = true;
    return context;
  },
  async processPaymentAction(context) {
    console.log("Processing payment");
    context.paymentSuccessful = true;
    return context;
  },
  async outOfStockAction(context) {
    console.log("Order cannot be processed: Out of stock");
    return context;
  },
  async paymentFailedAction(context) {
    console.log("Payment failed");
    return context;
  },
  async shipOrderAction(context) {
    console.log("Shipping order");
    return context;
  }
};

const orderContext = {
  inventoryAvailable: false,
  paymentSuccessful: false
};

const orderExecutor = new WorkflowExecutor(orderWorkflow, orderActions, { loggingEnabled: true });

orderExecutor.execute(orderContext).then(() => {
  console.log('Order workflow execution completed.');
}).catch(error => {
  console.error('Order workflow execution failed:', error);
});
```

## Workflow Schema

The `WorkflowExecutor` uses a JSON-based schema to define workflows. This schema consists of several key components:

- **Start**: The initial step of the workflow. This is where execution begins.
  
- **Steps**: A collection of steps that define the actions and transitions within the workflow. Each step includes:
  - **Action**: The name of the function to execute for this step. This function should be defined in the actions object passed to the `WorkflowExecutor`.
  - **Transitions**: Defines the possible paths the workflow can take after this step. Transitions are based on the result of the step's conditions.
  - **Conditions**: Optional. A set of conditions that determine which transition to follow. Conditions can evaluate context values and support various operators.

### Example Schema

Here's an example of a simple workflow schema:

```json
{
  "start": "step1",
  "steps": {
    "step1": {
      "action": "action1",
      "transitions": {
        "value1": "step2",
        "value2": "step3"
      },
      "conditions": {
        "key": "someKey",
        "operator": "return_value"
      }
    },
    "step2": {
      "action": "action2",
      "transitions": {
        "next": null
      }
    },
    "step3": {
      "action": "action3",
      "transitions": {
        "next": null
      }
    }
  }
}
```

### Key Concepts

- **Actions**: Functions that perform tasks for each step. They receive the current context and can modify it.
- **Transitions**: Define the next step based on the result of conditions. Can be more than two paths if using operators like `return_value`.
- **Conditions**: Evaluate context values to determine the path. Supports operators like `equals`, `greater_than`, and `return_value`.

This schema allows for flexible and dynamic workflows, enabling complex decision-making processes to be automated efficiently.
