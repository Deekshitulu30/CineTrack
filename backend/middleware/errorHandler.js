function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  // Handle Ollama offline
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'AI service is offline. Please start Ollama and try again.',
      hint: 'Run: ollama pull llama3 && ollama serve'
    });
  }

  // Handle known HTTP errors
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
