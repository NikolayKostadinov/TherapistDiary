import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3
}

@Injectable({
    providedIn: 'root'
})
export class LoggingService {
    private readonly logLevel: LogLevel = environment.production ? LogLevel.Warn : LogLevel.Debug;

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.Debug)) {
            console.debug(`🐛 [DEBUG] ${this.formatMessage(message)}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.Info)) {
            console.info(`ℹ️ [INFO] ${this.formatMessage(message)}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.Warn)) {
            console.warn(`⚠️ [WARN] ${this.formatMessage(message)}`, ...args);
        }
    }

    error(message: string, error?: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.Error)) {
            console.error(`🚨 [ERROR] ${this.formatMessage(message)}`, error, ...args);

            // In production, you might want to send errors to a logging service
            if (environment.production) {
                this.sendToExternalLoggingService(message, error, args);
            }
        }
    }

    /**
     * Log HTTP errors with additional context
     */
    logHttpError(url: string, method: string, status: number, error: any): void {
        const message = `HTTP ${method} ${url} failed with status ${status}`;
        this.error(message, error);

        // Additional structured logging for HTTP errors
        if (this.shouldLog(LogLevel.Error)) {
            console.group(`🌐 HTTP Error Details`);
            console.log('URL:', url);
            console.log('Method:', method);
            console.log('Status:', status);
            console.log('Error:', error);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        }
    }

    /**
     * Log user actions for analytics
     */
    logUserAction(action: string, details?: any): void {
        if (this.shouldLog(LogLevel.Info)) {
            console.info(`👤 [USER ACTION] ${action}`, details);
        }

        // In production, send to analytics service
        if (environment.production) {
            this.sendToAnalyticsService(action, details);
        }
    }

    /**
     * Log performance metrics
     */
    logPerformance(operation: string, duration: number, details?: any): void {
        if (this.shouldLog(LogLevel.Info)) {
            console.info(`⏱️ [PERFORMANCE] ${operation} took ${duration}ms`, details);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel;
    }

    private formatMessage(message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] ${message}`;
    }

    private sendToExternalLoggingService(message: string, error: any, args: any[]): void {
        // TODO: Implement external logging service integration
        // For example, send to Sentry, LogRocket, or your custom logging endpoint
        try {
            // Example structure for external logging
            const logData = {
                message,
                error: error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                } : null,
                args,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // In a real implementation, you would send this to your logging service
            console.log('Would send to external logging service:', logData);
        } catch (loggingError) {
            console.error('Failed to send log to external service:', loggingError);
        }
    }

    private sendToAnalyticsService(action: string, details: any): void {
        // TODO: Implement analytics service integration
        try {
            const analyticsData = {
                action,
                details,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };

            // In a real implementation, you would send this to your analytics service
            console.log('Would send to analytics service:', analyticsData);
        } catch (analyticsError) {
            console.error('Failed to send analytics:', analyticsError);
        }
    }
}
