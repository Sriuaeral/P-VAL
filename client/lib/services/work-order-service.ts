import { BaseService } from './base-service';

// Work Order Service - SaaS-focused work order management
export class WorkOrderService extends BaseService {
  private static instance: WorkOrderService;

  constructor() {
    super('WorkOrderService');
  }

  public static getInstance(): WorkOrderService {
    if (!WorkOrderService.instance) {
      WorkOrderService.instance = new WorkOrderService();
    }
    return WorkOrderService.instance;
  }

  // Work order operations
  public async completeWorkOrder(
    workOrderId: string, 
    completionData?: {
      completedBy?: string;
      completionNotes?: string;
      completionDate?: Date;
    }
  ): Promise<any> {
    const endpoint = `/workorders/${workOrderId}/complete`;
    const data = {
      completedBy: completionData?.completedBy || "Current User",
      completionNotes: completionData?.completionNotes || "",
      completionDate: completionData?.completionDate || new Date().toISOString(),
      status: "Completed"
    };

    try {
      const result = await this.post(endpoint, data);
      
      // Clear work order cache
      this.clearCache('workorders');
      
      return result;
    } catch (error) {
      console.error(`Error completing work order ${workOrderId}:`, error);
      throw this.handleError(error, 'POST', endpoint);
    }
  }

  public async updateWorkOrder(workOrderId: string, updateData: any): Promise<any> {
    const endpoint = `/workorders/${workOrderId}`;
    
    try {
      const result = await this.put(endpoint, updateData);
      
      // Clear work order cache
      this.clearCache('workorders');
      
      return result;
    } catch (error) {
      console.error(`Error updating work order ${workOrderId}:`, error);
      throw this.handleError(error, 'PUT', endpoint);
    }
  }

  public async addComment(
    workOrderId: string, 
    commentData: {
      message: string;
      type?: "update" | "comment" | "escalation";
      author?: string;
      role?: string;
    }
  ): Promise<any> {
    const endpoint = `/workorders/${workOrderId}/comments`;
    const data = {
      message: commentData.message,
      type: commentData.type || "comment",
      author: commentData.author || "Current User",
      role: commentData.role || "Engineer",
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await this.post(endpoint, data);
      
      // Clear work order cache
      this.clearCache('workorders');
      
      return result;
    } catch (error) {
      console.error(`Error adding comment to work order ${workOrderId}:`, error);
      throw this.handleError(error, 'POST', endpoint);
    }
  }

  public async getWorkOrders(plantId?: string): Promise<any[]> {
    const cacheKey = `workorders_${plantId || 'all'}`;
    const cached = this.getCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = plantId ? `/workorders?plantId=${plantId}` : '/workorders';
      const data = await this.get<any[]>(endpoint);
      
      this.setCache(cacheKey, data, 60000); // Cache for 1 minute
      return data;
    } catch (error) {
      console.warn('Work orders API failed, using mock data');
      const mockData = this.generateMockWorkOrders(plantId);
      this.setCache(cacheKey, mockData, 60000);
      return mockData;
    }
  }

  public async getWorkOrder(workOrderId: string): Promise<any> {
    const cacheKey = `workorder_${workOrderId}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.get<any>(`/workorders/${workOrderId}`);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Work order API failed, using mock data');
      const mockData = this.generateMockWorkOrder(workOrderId);
      this.setCache(cacheKey, mockData, 60000);
      return mockData;
    }
  }

  public async createWorkOrder(workOrderData: any): Promise<any> {
    try {
      const result = await this.post('/workorders', workOrderData);
      
      // Clear work orders cache
      this.clearCache('workorders');
      
      return result;
    } catch (error) {
      console.error('Error creating work order:', error);
      throw this.handleError(error, 'POST', '/workorders');
    }
  }

  public async deleteWorkOrder(workOrderId: string): Promise<void> {
    try {
      await this.delete(`/workorders/${workOrderId}`);
      
      // Clear work orders cache
      this.clearCache('workorders');
    } catch (error) {
      console.error(`Error deleting work order ${workOrderId}:`, error);
      throw this.handleError(error, 'DELETE', `/workorders/${workOrderId}`);
    }
  }

  // Force refresh work orders
  public async refreshWorkOrders(plantId?: string): Promise<void> {
    const pattern = plantId ? `workorders_${plantId}` : 'workorders';
    this.clearCache(pattern);
  }

  // Mock data generators
  private generateMockWorkOrders(plantId?: string): any[] {
    const mockWorkOrders = [
      {
        id: '1',
        title: 'Inverter Maintenance',
        description: 'Routine maintenance for inverter INV-001',
        status: 'In Progress',
        priority: 'Medium',
        plantId: plantId || 'plant-1',
        assignedTo: 'John Doe',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Panel Cleaning',
        description: 'Clean solar panels in section A',
        status: 'Pending',
        priority: 'Low',
        plantId: plantId || 'plant-1',
        assignedTo: 'Jane Smith',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return plantId ? mockWorkOrders.filter(wo => wo.plantId === plantId) : mockWorkOrders;
  }

  private generateMockWorkOrder(workOrderId: string): any {
    return {
      id: workOrderId,
      title: 'Sample Work Order',
      description: 'This is a sample work order for testing purposes',
      status: 'Pending',
      priority: 'Medium',
      plantId: 'plant-1',
      assignedTo: 'John Doe',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      comments: [
        {
          id: '1',
          message: 'Work order created',
          author: 'System',
          timestamp: new Date().toISOString(),
          type: 'update'
        }
      ]
    };
  }
}

// Export singleton instance
export const workOrderService = WorkOrderService.getInstance();
