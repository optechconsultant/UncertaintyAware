import { AuditEvent } from '../types/inference';

class AuditLoggerService {
  private logs: AuditEvent[] = [];

  constructor() {
    this.log('system', 'initialize_conformal_guard', 'SYS-MODULE-4', {
      status: 'initialized',
      environment: 'production'
    });
  }

  public log(actor: string, action: string, resource_id: string, details: Record<string, unknown>): AuditEvent {
    const event: AuditEvent = {
      timestamp: new Date().toISOString(),
      actor,
      action,
      resource_id,
      details
    };
    this.logs.unshift(event);
    return event;
  }

  public getLogs(): AuditEvent[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLoggerService();