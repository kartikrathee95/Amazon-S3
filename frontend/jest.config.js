module.exports = {
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!axios)/',
    ],
  };
  
  module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
  };module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };