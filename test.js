const WorkflowExecutor = require('./index');

// Define a sample workflow blueprint with real-world conditions
const workflow = {
  start: 'checkAge',
  steps: {
    checkAge: {
      action: 'checkAgeAction',
      transitions: {
        true: 'checkPlanLevel',
        false: 'ageRestricted'
      },
      conditions: {
        key: 'age',
        operator: 'greater_than_or_equals',
        value: 18
      }
    },
    checkPlanLevel: {
      action: 'checkPlanLevelAction',
      transitions: {
        true: 'premiumContent',
        false: 'basicContent'
      },
      conditions: {
        key: 'planLevel',
        operator: 'equals',
        value: 'premium'
      }
    },
    ageRestricted: {
      action: 'ageRestrictedAction',
      transitions: {
        next: null
      }
    },
    premiumContent: {
      action: 'premiumContentAction',
      transitions: {
        next: null
      }
    },
    basicContent: {
      action: 'basicContentAction',
      transitions: {
        next: null
      }
    }
  }
};

// Define actions as methods
const actions = {
  async checkAgeAction(context) {
    console.log("Checking age");
    // Logic to check age
    return context;
  },
  async checkPlanLevelAction(context) {
    console.log("Checking plan level");
    // Logic to check plan level
    return context;
  },
  async ageRestrictedAction(context) {
    console.log("Access denied: Age restriction");
    // Logic for age-restricted access
    return context;
  },
  async premiumContentAction(context) {
    console.log("Accessing premium content");
    // Logic for accessing premium content
    return context;
  },
  async basicContentAction(context) {
    console.log("Accessing basic content");
    // Logic for accessing basic content
    return context;
  }
};

// Create a context for the workflow
const context = {
  age: 20, // User's age
  planLevel: 'premium' // User's plan level
};

// Initialize the WorkflowExecutor with the sample workflow and actions
const executor = new WorkflowExecutor(workflow, actions, { loggingEnabled: true });

// Execute the workflow
executor.execute(context).then(() => {
  console.log('Workflow execution completed.');
  console.log('Metrics:', executor.getMetrics());
}).catch(error => {
  console.error('Workflow execution failed:', error);
});

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
    // Simulate inventory check
    context.inventoryAvailable = true; // Example result
    return context;
  },
  async processPaymentAction(context) {
    console.log("Processing payment");
    // Simulate payment processing
    context.paymentSuccessful = true; // Example result
    return context;
  },
  async outOfStockAction(context) {
    console.log("Order cannot be processed: Out of stock");
    // Logic for handling out of stock
    return context;
  },
  async paymentFailedAction(context) {
    console.log("Payment failed");
    // Logic for handling payment failure
    return context;
  },
  async shipOrderAction(context) {
    console.log("Shipping order");
    // Logic for shipping the order
    return context;
  }
};

// Create a context for the order workflow
const orderContext = {
  inventoryAvailable: false, // Initial state
  paymentSuccessful: false // Initial state
};

// Initialize the WorkflowExecutor with the order workflow and actions
const orderExecutor = new WorkflowExecutor(orderWorkflow, orderActions, { loggingEnabled: true });

// Execute the order workflow
orderExecutor.execute(orderContext).then(() => {
  console.log('Order workflow execution completed.');
  console.log('Order Metrics:', orderExecutor.getMetrics());
}).catch(error => {
  console.error('Order workflow execution failed:', error);
}); 