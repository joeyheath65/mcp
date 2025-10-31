/**
 * Configuration Module
 * 
 * Central configuration management for environment variables.
 * Provides type-safe access to configuration values throughout the application.
 */

/**
 * Server configuration options
 */
export interface ServerConfig {
  transport: 'stdio' | 'http';
  port: number;
  host: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logFormat: 'json' | 'text';
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  apiKey?: string;
  jwtSecret?: string;
  allowedOrigins: string[];
}

/**
 * Feature flags configuration
 */
export interface FeatureConfig {
  enableTools: boolean;
  enableResources: boolean;
  enablePrompts: boolean;
}

/**
 * Tool execution configuration
 */
export interface ToolConfig {
  pythonPath: string;
  nodePath: string;
  maxExecutionTime: number;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  server: ServerConfig;
  security: SecurityConfig;
  features: FeatureConfig;
  tools: ToolConfig;
}

/**
 * Get configuration from environment variables
 * 
 * This function reads environment variables and creates a typed configuration object.
 * Default values are provided for optional settings.
 * 
 * @returns Complete application configuration
 */
export function getConfig(): AppConfig {
  // Reason: Centralized configuration with fallbacks for optional values
  return {
    server: {
      transport: (process.env.TRANSPORT as 'stdio' | 'http') || 'stdio',
      port: parseInt(process.env.PORT || '3001', 10),
      host: process.env.HOST || '0.0.0.0',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      logFormat: (process.env.LOG_FORMAT as 'json' | 'text') || 'text',
      nodeEnv: (process.env.NODE_ENV as any) || 'development',
    },
    security: {
      apiKey: process.env.API_KEY,
      jwtSecret: process.env.JWT_SECRET,
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    },
    features: {
      enableTools: process.env.ENABLE_TOOLS !== 'false',
      enableResources: process.env.ENABLE_RESOURCES !== 'false',
      enablePrompts: process.env.ENABLE_PROMPTS !== 'false',
    },
    tools: {
      pythonPath: process.env.PYTHON_PATH || 'python3',
      nodePath: process.env.NODE_PATH || 'node',
      maxExecutionTime: parseInt(process.env.MAX_TOOL_EXECUTION_TIME || '30000', 10),
    },
  };
}

/**
 * Validate required configuration
 * 
 * Checks that all required environment variables are set.
 * Throws an error if any required configuration is missing.
 * 
 * @param config The configuration to validate
 * @throws Error if required configuration is missing
 */
export function validateConfig(config: AppConfig): void {
  const errors: string[] = [];
  
  // Validate server configuration
  if (config.server.transport === 'http' && config.server.port <= 0) {
    errors.push('PORT must be a positive number when using HTTP transport');
  }
  
  // Add more validation as needed
  // Example: if (config.security.apiKey && config.security.apiKey.length < 32) {
  //   errors.push('API_KEY must be at least 32 characters');
  // }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get specific configuration value
 * 
 * Helper to retrieve a nested configuration value by path.
 * 
 * @example
 * getConfigValue('server.port') // returns port number
 * getConfigValue('security.apiKey') // returns API key
 */
export function getConfigValue(path: string): any {
  const config = getConfig();
  const parts = path.split('.');
  
  let value: any = config;
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      return undefined;
    }
  }
  
  return value;
}

