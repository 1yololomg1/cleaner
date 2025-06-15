/**
 * POLISH Processing Algorithms
 * 
 * This module contains the core signal processing algorithms used in POLISH
 * for petrophysical data cleaning and enhancement.
 */

import { logger } from './logger';

export interface DenoiseOptions {
  method: 'savitzky_golay' | 'wavelet' | 'moving_average' | 'gaussian';
  windowSize: number;
  polynomialOrder?: number;
  strength: number;
  preserveSpikes: boolean;
}

export interface DespikeOptions {
  method: 'hampel' | 'modified_zscore' | 'iqr' | 'manual';
  threshold: number;
  windowSize: number;
  replacementMethod: 'pchip' | 'linear' | 'median' | 'null';
}

export class ProcessingAlgorithms {
  
  /**
   * Savitzky-Golay Filter Implementation
   * 
   * The Savitzky-Golay filter is a digital filter that can be applied to a set of 
   * digital data points for the purpose of smoothing the data, that is, to increase 
   * the precision of the data without distorting the signal tendency.
   * 
   * @param data - Input data array
   * @param windowSize - Size of the smoothing window (must be odd)
   * @param polynomialOrder - Order of the polynomial (typically 2-4)
   * @returns Smoothed data array
   */
  private savitzkyGolay(data: number[], windowSize: number, polynomialOrder: number): number[] {
    if (windowSize % 2 === 0) {
      throw new Error('Window size must be odd');
    }
    
    const halfWindow = Math.floor(windowSize / 2);
    const result = new Array(data.length);
    
    // Generate Savitzky-Golay coefficients
    const coefficients = this.generateSGCoefficients(windowSize, polynomialOrder);
    
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let j = -halfWindow; j <= halfWindow; j++) {
        const index = i + j;
        if (index >= 0 && index < data.length && !isNaN(data[index])) {
          sum += data[index] * coefficients[j + halfWindow];
          weightSum += coefficients[j + halfWindow];
        }
      }
      
      result[i] = weightSum > 0 ? sum / weightSum : data[i];
    }
    
    return result;
  }

  /**
   * Generate Savitzky-Golay coefficients using least squares fitting
   */
  private generateSGCoefficients(windowSize: number, polynomialOrder: number): number[] {
    const halfWindow = Math.floor(windowSize / 2);
    const coefficients = new Array(windowSize);
    
    // Create Vandermonde matrix
    const matrix: number[][] = [];
    for (let i = -halfWindow; i <= halfWindow; i++) {
      const row: number[] = [];
      for (let j = 0; j <= polynomialOrder; j++) {
        row.push(Math.pow(i, j));
      }
      matrix.push(row);
    }
    
    // Solve for coefficients (simplified implementation)
    // In production, use a proper linear algebra library
    for (let i = 0; i < windowSize; i++) {
      coefficients[i] = 1 / windowSize; // Simplified - should use proper least squares
    }
    
    return coefficients;
  }

  /**
   * Hampel Filter for Spike Detection
   * 
   * The Hampel filter is a robust outlier detection method that uses the median
   * absolute deviation (MAD) to identify and replace outliers.
   * 
   * @param data - Input data array
   * @param windowSize - Size of the moving window
   * @param threshold - Threshold multiplier for MAD
   * @returns Object with cleaned data and spike indices
   */
  private hampelFilter(data: number[], windowSize: number, threshold: number): {
    cleanedData: number[];
    spikeIndices: number[];
  } {
    const halfWindow = Math.floor(windowSize / 2);
    const cleanedData = [...data];
    const spikeIndices: number[] = [];
    
    for (let i = halfWindow; i < data.length - halfWindow; i++) {
      const window = data.slice(i - halfWindow, i + halfWindow + 1)
        .filter(val => !isNaN(val));
      
      if (window.length === 0) continue;
      
      // Calculate median
      const sortedWindow = [...window].sort((a, b) => a - b);
      const median = sortedWindow[Math.floor(sortedWindow.length / 2)];
      
      // Calculate MAD (Median Absolute Deviation)
      const deviations = window.map(val => Math.abs(val - median));
      const sortedDeviations = deviations.sort((a, b) => a - b);
      const mad = sortedDeviations[Math.floor(sortedDeviations.length / 2)];
      
      // Check if current point is an outlier
      const deviation = Math.abs(data[i] - median);
      if (deviation > threshold * mad) {
        spikeIndices.push(i);
        cleanedData[i] = median; // Replace with median
      }
    }
    
    return { cleanedData, spikeIndices };
  }

  /**
   * PCHIP (Piecewise Cubic Hermite Interpolating Polynomial) Interpolation
   * 
   * PCHIP interpolation preserves monotonicity and is shape-preserving,
   * making it ideal for petrophysical data where physical relationships
   * must be maintained.
   */
  private pchipInterpolation(
    x: number[], 
    y: number[], 
    xi: number[]
  ): number[] {
    // Simplified PCHIP implementation
    // In production, use a specialized numerical library
    const result: number[] = [];
    
    for (const xVal of xi) {
      // Find surrounding points
      let i = 0;
      while (i < x.length - 1 && x[i + 1] < xVal) i++;
      
      if (i === x.length - 1) {
        result.push(y[i]);
        continue;
      }
      
      // Linear interpolation (simplified)
      const t = (xVal - x[i]) / (x[i + 1] - x[i]);
      const interpolatedValue = y[i] * (1 - t) + y[i + 1] * t;
      result.push(interpolatedValue);
    }
    
    return result;
  }

  /**
   * Main denoising function that applies the selected algorithm
   */
  async denoise(data: any, options: DenoiseOptions): Promise<{
    success: boolean;
    data: any;
    metrics: any;
  }> {
    try {
      const processedData = { ...data };
      const metrics: any = {};
      
      // Process each curve
      for (const curve of data.curves) {
        if (curve.dataType !== 'log') continue;
        
        const originalValues = data.data.map((d: any) => d[curve.mnemonic])
          .filter((v: any) => v !== null && v !== undefined && !isNaN(v));
        
        if (originalValues.length === 0) continue;
        
        let processedValues: number[];
        
        switch (options.method) {
          case 'savitzky_golay':
            processedValues = this.savitzkyGolay(
              originalValues,
              options.windowSize,
              options.polynomialOrder || 3
            );
            break;
            
          case 'moving_average':
            processedValues = this.movingAverage(originalValues, options.windowSize);
            break;
            
          case 'gaussian':
            processedValues = this.gaussianFilter(originalValues, options.windowSize);
            break;
            
          default:
            processedValues = originalValues;
        }
        
        // Apply strength parameter (blend original and processed)
        const blendedValues = originalValues.map((orig, idx) => 
          orig * (1 - options.strength) + processedValues[idx] * options.strength
        );
        
        // Update data
        let valueIndex = 0;
        processedData.data = processedData.data.map((d: any) => {
          if (d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined && !isNaN(d[curve.mnemonic])) {
            return { ...d, [curve.mnemonic]: blendedValues[valueIndex++] };
          }
          return d;
        });
        
        // Calculate metrics
        const noiseReduction = this.calculateNoiseReduction(originalValues, blendedValues);
        metrics[curve.mnemonic] = {
          noiseReduction,
          pointsProcessed: originalValues.length,
          method: options.method
        };
      }
      
      return { success: true, data: processedData, metrics };
      
    } catch (error) {
      logger.error('Denoising failed:', error);
      return { success: false, data, metrics: {} };
    }
  }

  /**
   * Main despiking function
   */
  async despike(data: any, options: DespikeOptions): Promise<{
    success: boolean;
    data: any;
    spikesDetected: number;
    spikesRemoved: number;
  }> {
    try {
      const processedData = { ...data };
      let totalSpikesDetected = 0;
      let totalSpikesRemoved = 0;
      
      for (const curve of data.curves) {
        if (curve.dataType !== 'log') continue;
        
        const values = data.data.map((d: any) => d[curve.mnemonic]);
        const validValues = values.filter((v: any) => v !== null && v !== undefined && !isNaN(v));
        
        if (validValues.length === 0) continue;
        
        let result: { cleanedData: number[]; spikeIndices: number[] };
        
        switch (options.method) {
          case 'hampel':
            result = this.hampelFilter(validValues, options.windowSize, options.threshold);
            break;
            
          case 'modified_zscore':
            result = this.modifiedZScore(validValues, options.threshold);
            break;
            
          case 'iqr':
            result = this.iqrMethod(validValues, options.threshold);
            break;
            
          default:
            result = { cleanedData: validValues, spikeIndices: [] };
        }
        
        totalSpikesDetected += result.spikeIndices.length;
        totalSpikesRemoved += result.spikeIndices.length;
        
        // Update data with cleaned values
        let valueIndex = 0;
        processedData.data = processedData.data.map((d: any) => {
          if (d[curve.mnemonic] !== null && d[curve.mnemonic] !== undefined && !isNaN(d[curve.mnemonic])) {
            return { ...d, [curve.mnemonic]: result.cleanedData[valueIndex++] };
          }
          return d;
        });
      }
      
      return {
        success: true,
        data: processedData,
        spikesDetected: totalSpikesDetected,
        spikesRemoved: totalSpikesRemoved
      };
      
    } catch (error) {
      logger.error('Despiking failed:', error);
      return {
        success: false,
        data,
        spikesDetected: 0,
        spikesRemoved: 0
      };
    }
  }

  // Helper methods
  private movingAverage(data: number[], windowSize: number): number[] {
    const result = new Array(data.length);
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
        if (!isNaN(data[j])) {
          sum += data[j];
          count++;
        }
      }
      
      result[i] = count > 0 ? sum / count : data[i];
    }
    
    return result;
  }

  private gaussianFilter(data: number[], windowSize: number): number[] {
    const sigma = windowSize / 6; // Standard deviation
    const halfWindow = Math.floor(windowSize / 2);
    const result = new Array(data.length);
    
    // Generate Gaussian kernel
    const kernel: number[] = [];
    let kernelSum = 0;
    
    for (let i = -halfWindow; i <= halfWindow; i++) {
      const weight = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel.push(weight);
      kernelSum += weight;
    }
    
    // Normalize kernel
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= kernelSum;
    }
    
    // Apply filter
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let j = -halfWindow; j <= halfWindow; j++) {
        const index = i + j;
        if (index >= 0 && index < data.length && !isNaN(data[index])) {
          sum += data[index] * kernel[j + halfWindow];
          weightSum += kernel[j + halfWindow];
        }
      }
      
      result[i] = weightSum > 0 ? sum / weightSum : data[i];
    }
    
    return result;
  }

  private modifiedZScore(data: number[], threshold: number): {
    cleanedData: number[];
    spikeIndices: number[];
  } {
    const median = this.calculateMedian(data);
    const mad = this.calculateMAD(data, median);
    const cleanedData = [...data];
    const spikeIndices: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const modifiedZScore = 0.6745 * (data[i] - median) / mad;
      if (Math.abs(modifiedZScore) > threshold) {
        spikeIndices.push(i);
        cleanedData[i] = median;
      }
    }
    
    return { cleanedData, spikeIndices };
  }

  private iqrMethod(data: number[], threshold: number): {
    cleanedData: number[];
    spikeIndices: number[];
  } {
    const sortedData = [...data].sort((a, b) => a - b);
    const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
    const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    const cleanedData = [...data];
    const spikeIndices: number[] = [];
    const median = this.calculateMedian(data);
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] < lowerBound || data[i] > upperBound) {
        spikeIndices.push(i);
        cleanedData[i] = median;
      }
    }
    
    return { cleanedData, spikeIndices };
  }

  private calculateMedian(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculateMAD(data: number[], median: number): number {
    const deviations = data.map(val => Math.abs(val - median));
    return this.calculateMedian(deviations);
  }

  private calculateNoiseReduction(original: number[], processed: number[]): number {
    const originalVariance = this.calculateVariance(original);
    const processedVariance = this.calculateVariance(processed);
    return ((originalVariance - processedVariance) / originalVariance) * 100;
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
  }
}