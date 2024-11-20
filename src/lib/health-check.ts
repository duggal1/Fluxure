import axios from 'axios';

const PYTHON_SERVER_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function checkServerHealth(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Health check attempt ${attempt}/${MAX_RETRIES}`);
      
      const response = await axios.get(`${PYTHON_SERVER_URL}/health`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        },
        proxy: false,
        validateStatus: (status) => status === 200
      });

      const isHealthy = response.status === 200 && response.data?.models_initialized;
      
      if (isHealthy) {
        console.log('Python AI backend is healthy and ready');
        return true;
      }
      
      console.warn('Backend is running but models are not initialized');
      
    } catch (error: any) {
      console.error(`Health check attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
    }
  }

  console.error('All health check attempts failed');
  return false;
}

export async function waitForHealthyServer(timeoutMs: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const isHealthy = await checkServerHealth();
    if (isHealthy) return true;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return false;
}

export async function getServerStatus() {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/health`, {
      timeout: 5000,
      proxy: false
    });
    
    return {
      isHealthy: response.status === 200,
      modelsInitialized: response.data?.models_initialized || false,
      memoryUsage: response.data?.memory_usage || 'unknown',
      timestamp: response.data?.timestamp || new Date().toISOString()
    };
  } catch (error) {
    return {
      isHealthy: false,
      modelsInitialized: false,
      memoryUsage: 'unknown',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}