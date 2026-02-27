export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  
  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: You do not have permission for the operation '${context.operation}' on path '${context.path}'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
  
  toObject() {
    return {
      message: this.message,
      name: this.name,
      context: this.context,
      stack: this.stack,
    };
  }
}
